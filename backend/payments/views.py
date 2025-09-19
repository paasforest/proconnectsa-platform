from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Transaction
# from .serializers import (
#     CreditTransactionSerializer, CreditTransactionCreateSerializer,
#     CreditPurchaseSerializer, CreditRefundSerializer, CreditBalanceSerializer,
#     CreditTransactionSearchSerializer, ManualDepositSerializer,
#     ManualDepositCreateSerializer, ManualDepositVerificationSerializer,
#     SubscriptionStartSerializer, SubscriptionCancelSerializer, SubscriptionStatusSerializer
# )
from backend.notifications.email_service import (
    send_credit_purchase_confirmation,
    send_manual_deposit_instructions
)
from django.utils import timezone
from datetime import timedelta


class CreditTransactionListView(generics.ListAPIView):
    """List credit transactions for provider"""
    serializer_class = CreditTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'status']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_provider:
            return CreditTransaction.objects.filter(provider=user)
        elif user.is_admin:
            return CreditTransaction.objects.all()
        else:
            return CreditTransaction.objects.none()


class CreditTransactionCreateView(generics.CreateAPIView):
    """Create credit transaction (admin only)"""
    serializer_class = CreditTransactionCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Only admins can create transactions
        if not request.user.is_admin:
            return Response(
                {'error': 'Only admins can create credit transactions'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction = serializer.save()
        
        return Response(
            CreditTransactionSerializer(transaction).data, 
            status=status.HTTP_201_CREATED
        )


class CreditPurchaseView(generics.GenericAPIView):
    """Handle credit purchases"""
    serializer_class = CreditPurchaseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def _validate_payment(self, payment_method, payment_reference, amount):
        """Validate payment with external service"""
        # For now, only allow manual payments with admin approval
        # In production, integrate with actual payment gateways
        
        if payment_method == 'manual':
            # Manual payments require admin approval
            # For demo purposes, we'll simulate validation
            return len(payment_reference) > 10  # Basic validation
        
        # For other methods, implement actual payment gateway validation
        # This is a placeholder - implement based on your payment provider
        return False
    
    def post(self, request, *args, **kwargs):
        # Only providers can purchase credits
        if not request.user.is_provider:
            return Response(
                {'error': 'Only providers can purchase credits'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        payment_method = serializer.validated_data['payment_method']
        
        # Handle different payment methods
        if payment_method == 'paypal':
            # For PayPal, redirect to PayPal payment creation
            return Response({
                'message': 'Redirect to PayPal payment creation endpoint',
                'redirect_to': '/api/payments/paypal/create-payment/',
                'data': {
                    'credits': serializer.validated_data['amount'],
                    'payment_method': payment_method
                }
            })
        else:
            # For manual deposit method, create a deposit request
            if payment_method == 'manual':
                from .payment_service import PaymentService
                payment_service = PaymentService()
                
                try:
                    # Create manual deposit request
                    deposit_result = payment_service.create_deposit_request(
                        user=request.user,
                        amount=serializer.validated_data['amount'],
                        bank_reference=serializer.validated_data.get('payment_reference', ''),
                        proof_of_payment=None
                    )
                    
                    return Response({
                        'message': 'Manual deposit request created. Please make payment and upload proof.',
                        'deposit_request': {
                            'id': deposit_result['deposit_id'],
                            'amount': serializer.validated_data['amount'],
                            'credits': deposit_result['credits'],
                            'bank_reference': deposit_result['bank_reference'],
                            'status': 'pending_verification'
                        }
                    }, status=status.HTTP_201_CREATED)
                    
                except ValueError as e:
                    return Response(
                        {'error': str(e)}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                # For other payment methods, require payment validation
                payment_reference = serializer.validated_data.get('payment_reference', '')
                
                if not payment_reference:
                    return Response(
                        {'error': 'Payment reference required for non-PayPal transactions'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # For now, only allow manual deposits for non-PayPal methods
                return Response(
                    {'error': 'Only manual deposits and PayPal are currently supported'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )


class CreditRefundView(generics.GenericAPIView):
    """Handle credit refunds"""
    serializer_class = CreditRefundSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # Only admins can process refunds
        if not request.user.is_admin:
            return Response(
                {'error': 'Only admins can process refunds'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        from backend.leads.models import LeadAssignment
        
        # Get the assignment
        assignment = LeadAssignment.objects.get(
            id=serializer.validated_data['lead_assignment_id']
        )
        
        # Create refund transaction
        transaction = CreditTransaction.create_transaction(
            provider=assignment.provider,
            transaction_type='refund',
            amount=assignment.credit_cost,
            lead_assignment=assignment,
            description=serializer.validated_data['refund_reason'],
            admin_notes=serializer.validated_data.get('admin_notes', '')
        )
        
        # Mark assignment as refunded
        assignment.credit_refunded = True
        assignment.refund_reason = serializer.validated_data['refund_reason']
        assignment.save()
        
        return Response({
            'message': 'Credits refunded successfully',
            'transaction': CreditTransactionSerializer(transaction).data
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def credit_balance_view(request):
    """Get credit balance information"""
    if not request.user.is_provider:
        return Response(
            {'error': 'Only providers can access credit balance'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        profile = request.user.provider_profile
    except:
        return Response(
            {'error': 'Provider profile not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    serializer = CreditBalanceSerializer({
        'current_balance': profile.credit_balance,
        'monthly_limit': profile.monthly_lead_limit,
        'leads_used_this_month': profile.leads_used_this_month,
        'subscription_tier': profile.subscription_tier,
        'subscription_active': profile.is_subscription_active,
    })
    
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def credit_transaction_stats(request):
    """Get credit transaction statistics"""
    if not request.user.is_provider:
        return Response(
            {'error': 'Only providers can access transaction stats'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    transactions = CreditTransaction.objects.filter(provider=request.user)
    
    stats = {
        'total_transactions': transactions.count(),
        'total_credits_purchased': transactions.filter(
            transaction_type='purchase', 
            status='completed'
        ).aggregate(total=models.Sum('amount'))['total'] or 0,
        'total_credits_used': abs(transactions.filter(
            transaction_type='deduction'
        ).aggregate(total=models.Sum('amount'))['total'] or 0),
        'total_refunds': transactions.filter(
            transaction_type='refund'
        ).aggregate(total=models.Sum('amount'))['total'] or 0,
        'transactions_by_type': {},
        'transactions_by_status': {}
    }
    
    # Count by type
    for transaction_type, _ in CreditTransaction.TRANSACTION_TYPES:
        count = transactions.filter(transaction_type=transaction_type).count()
        stats['transactions_by_type'][transaction_type] = count
    
    # Count by status
    for status_choice, _ in CreditTransaction.TRANSACTION_STATUS:
        count = transactions.filter(status=status_choice).count()
        stats['transactions_by_status'][status_choice] = count
    
    return Response(stats)


# Manual Deposit Views
class ManualDepositCreateView(generics.GenericAPIView):
    """Create a manual deposit request"""
    serializer_class = ManualDepositCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # Only providers can create manual deposits
        if not request.user.is_provider:
            return Response(
                {'error': 'Only providers can create manual deposits'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create manual deposit
        from .models import ManualDeposit
        deposit = ManualDeposit.create_deposit(
            provider=request.user,
            amount=serializer.validated_data['amount'],
            credits_to_activate=serializer.validated_data['credits_to_activate']
        )
        
        # Generate and send invoice automatically
        try:
            from .invoice_service import InvoiceService
            invoice_service = InvoiceService()
            
            # Determine invoice type
            invoice_type = 'subscription_deposit' if request.user.provider_profile.is_subscription_active else 'manual_deposit'
            
            # Generate invoice
            invoice_result = invoice_service.generate_invoice(deposit, invoice_type)
            
            if invoice_result['success']:
                # Send invoice email
                email_sent = invoice_service.send_invoice_email(
                    deposit=deposit,
                    invoice_data=invoice_result['invoice_data'],
                    html_content=invoice_result['html_content'],
                    text_content=invoice_result['text_content']
                )
                
                if email_sent:
                    logger.info(f"Invoice {invoice_result['invoice_number']} sent to {request.user.email}")
                else:
                    logger.warning(f"Failed to send invoice email to {request.user.email}")
            else:
                logger.error(f"Failed to generate invoice for deposit {deposit.id}: {invoice_result['error']}")
                
        except Exception as e:
            logger.error(f"Error generating/sending invoice: {str(e)}")
            # Don't fail the deposit creation if invoice generation fails
        
        return Response({
            'message': 'Manual deposit created successfully',
            'deposit': ManualDepositSerializer(deposit).data
        }, status=status.HTTP_201_CREATED)


class ManualDepositListView(generics.ListAPIView):
    """List manual deposits for provider"""
    serializer_class = ManualDepositSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_provider:
            return self.request.user.manual_deposits.all()
        elif self.request.user.is_admin:
            from .models import ManualDeposit
            return ManualDeposit.objects.all()
        else:
            return ManualDeposit.objects.none()


class ManualDepositDetailView(generics.RetrieveAPIView):
    """Get details of a specific manual deposit"""
    serializer_class = ManualDepositSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_provider:
            return self.request.user.manual_deposits.all()
        elif self.request.user.is_admin:
            from .models import ManualDeposit
            return ManualDeposit.objects.all()
        else:
            from .models import ManualDeposit
            return ManualDeposit.objects.none()


class ManualDepositVerificationView(generics.GenericAPIView):
    """Admin verification of manual deposits"""
    serializer_class = ManualDepositVerificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, deposit_id, *args, **kwargs):
        # Only admins can verify deposits
        if not request.user.is_admin:
            return Response(
                {'error': 'Only admins can verify deposits'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        from .models import ManualDeposit
        try:
            deposit = ManualDeposit.objects.get(id=deposit_id)
        except ManualDeposit.DoesNotExist:
            return Response(
                {'error': 'Manual deposit not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        action = serializer.validated_data['action']
        notes = serializer.validated_data.get('notes', '')
        
        try:
            if action == 'verify':
                deposit.verify_deposit(verified_by=request.user, notes=notes)
                message = 'Deposit verified successfully'
            else:  # reject
                deposit.reject_deposit(verified_by=request.user, reason=notes)
                message = 'Deposit rejected'
            
            return Response({
                'message': message,
                'deposit': ManualDepositSerializer(deposit).data
            })
            
        except ValueError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class ManualDepositUploadView(generics.GenericAPIView):
    """Upload deposit slip for manual deposit"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, deposit_id, *args, **kwargs):
        from .models import ManualDeposit
        
        try:
            deposit = ManualDeposit.objects.get(id=deposit_id, provider=request.user)
        except ManualDeposit.DoesNotExist:
            return Response(
                {'error': 'Manual deposit not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if 'deposit_slip' not in request.FILES:
            return Response(
                {'error': 'No file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file = request.FILES['deposit_slip']
        
        # Validate file type
        allowed_types = ['image/jpeg', 'image/png', 'application/pdf']
        if file.content_type not in allowed_types:
            return Response(
                {'error': 'Invalid file type. Only JPEG, PNG, and PDF files are allowed'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 10MB)
        if file.size > 10 * 1024 * 1024:
            return Response(
                {'error': 'File too large. Maximum size is 10MB'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save file (in production, upload to cloud storage)
        import os
        from django.conf import settings
        
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'deposit_slips')
        os.makedirs(upload_dir, exist_ok=True)
        
        filename = f"{deposit.reference_number}_{file.name}"
        file_path = os.path.join(upload_dir, filename)
        
        with open(file_path, 'wb+') as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        # Update deposit with file URL
        deposit.deposit_slip = f"/media/deposit_slips/{filename}"
        deposit.save()
        
        return Response({
            'message': 'Deposit slip uploaded successfully',
            'deposit': ManualDepositSerializer(deposit).data
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def lookup_deposit_by_reference(request, reference_number):
    """Look up manual deposit by reference number (admin only)"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Only admin users can lookup deposits by reference'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        deposit = ManualDeposit.objects.get(reference_number=reference_number)
        serializer = ManualDepositSerializer(deposit)
        return Response(serializer.data)
    except ManualDeposit.DoesNotExist:
        return Response(
            {'error': 'Deposit not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def process_auto_deposit(request):
    """Process automatic deposit using customer code (admin only)"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Only admin users can process auto deposits'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    from .auto_deposit_service import AutoDepositService
    
    customer_code = request.data.get('customer_code')
    amount = request.data.get('amount')
    reference_number = request.data.get('reference_number')
    
    if not customer_code or not amount:
        return Response(
            {'error': 'customer_code and amount are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        amount = float(amount)
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid amount format'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    service = AutoDepositService()
    result = service.process_deposit_by_customer_code(
        customer_code=customer_code,
        amount=amount,
        reference_number=reference_number
    )
    
    if result['success']:
        return Response(result, status=status.HTTP_200_OK)
    else:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_customer_code_info(request):
    """Get customer code information for current provider"""
    if not request.user.is_provider:
        return Response(
            {'error': 'Only providers can access customer code info'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    from .auto_deposit_service import AutoDepositService
    
    provider = request.user.provider_profile
    if not provider.customer_code:
        # Generate customer code if not exists
        provider.customer_code = provider.generate_customer_code()
        provider.save(update_fields=['customer_code'])
    
    service = AutoDepositService()
    result = service.get_deposit_instructions(provider.customer_code)
    
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def lookup_customer_code(request, customer_code):
    """Look up customer code information (admin only)"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Only admin users can lookup customer codes'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    from .auto_deposit_service import AutoDepositService
    
    service = AutoDepositService()
    result = service.get_provider_by_customer_code(customer_code)
    
    if result['success']:
        return Response(result)
    else:
        return Response(result, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_invoice(request, deposit_id):
    """Generate invoice for a manual deposit"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Only admin users can generate invoices'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    from .invoice_service import InvoiceService
    
    try:
        deposit = ManualDeposit.objects.get(id=deposit_id)
    except ManualDeposit.DoesNotExist:
        return Response(
            {'error': 'Deposit not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Determine invoice type
    invoice_type = 'subscription_deposit' if deposit.provider.provider_profile.is_subscription_active else 'manual_deposit'
    
    # Generate invoice
    service = InvoiceService()
    result = service.generate_invoice(deposit, invoice_type)
    
    if result['success']:
        return Response({
            'success': True,
            'invoice_number': result['invoice_number'],
            'invoice_data': result['invoice_data'],
            'html_content': result['html_content'],
            'text_content': result['text_content']
        })
    else:
        return Response({
            'success': False,
            'error': result['error']
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_invoice_email(request, deposit_id):
    """Send invoice via email"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Only admin users can send invoice emails'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    from .invoice_service import InvoiceService
    
    try:
        deposit = ManualDeposit.objects.get(id=deposit_id)
    except ManualDeposit.DoesNotExist:
        return Response(
            {'error': 'Deposit not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Generate invoice
    service = InvoiceService()
    invoice_result = service.generate_invoice(deposit)
    
    if not invoice_result['success']:
        return Response({
            'success': False,
            'error': invoice_result['error']
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Send email
    email_sent = service.send_invoice_email(
        deposit=deposit,
        invoice_data=invoice_result['invoice_data'],
        html_content=invoice_result['html_content'],
        text_content=invoice_result['text_content']
    )
    
    if email_sent:
        return Response({
            'success': True,
            'message': f'Invoice {invoice_result["invoice_number"]} sent to {deposit.provider.email}',
            'invoice_number': invoice_result['invoice_number']
        })
    else:
        return Response({
            'success': False,
            'error': 'Failed to send invoice email'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_invoice_preview(request, deposit_id):
    """Get invoice preview for a manual deposit"""
    if not request.user.is_staff:
        return Response(
            {'error': 'Only admin users can preview invoices'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    from .invoice_service import InvoiceService
    
    try:
        deposit = ManualDeposit.objects.get(id=deposit_id)
    except ManualDeposit.DoesNotExist:
        return Response(
            {'error': 'Deposit not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Determine invoice type
    invoice_type = 'subscription_deposit' if deposit.provider.provider_profile.is_subscription_active else 'manual_deposit'
    
    # Generate invoice
    service = InvoiceService()
    result = service.generate_invoice(deposit, invoice_type)
    
    if result['success']:
        return Response({
            'success': True,
            'invoice_data': result['invoice_data'],
            'html_content': result['html_content']
        })
    else:
        return Response({
            'success': False,
            'error': result['error']
        }, status=status.HTTP_400_BAD_REQUEST)


# Subscription Views
class SubscriptionStartView(generics.GenericAPIView):
    """Start or upgrade provider subscription tier."""
    serializer_class = SubscriptionStartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not request.user.is_provider:
            return Response({'error': 'Only providers can start subscriptions'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        tier = serializer.validated_data['tier']
        months = serializer.validated_data['months']
        payment_reference = serializer.validated_data.get('payment_reference', '')

        profile = request.user.provider_profile
        now = timezone.now()
        start = profile.subscription_start_date or now
        end = (profile.subscription_end_date or now)
        # Extend from current end if active, else from now
        base = end if profile.is_subscription_active else now
        new_end = base + timedelta(days=30 * months)

        # Update profile
        profile.subscription_tier = tier
        profile.subscription_start_date = start if profile.subscription_start_date else now
        profile.subscription_end_date = new_end
        profile.save(update_fields=['subscription_tier', 'subscription_start_date', 'subscription_end_date'])

        # Record subscription transaction for audit
        CreditTransaction.create_transaction(
            provider=request.user,
            transaction_type='subscription',
            amount=0,
            payment_reference=payment_reference,
            description=f'Subscription {tier} for {months} month(s)'
        )

        return Response({
            'message': 'Subscription updated successfully',
            'status': SubscriptionStatusSerializer({
                'subscription_tier': profile.subscription_tier,
                'active': profile.is_subscription_active,
                'start_date': profile.subscription_start_date,
                'end_date': profile.subscription_end_date,
            }).data
        })


class SubscriptionCancelView(generics.GenericAPIView):
    """Cancel auto-renewal or end subscription immediately."""
    serializer_class = SubscriptionCancelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if not request.user.is_provider:
            return Response({'error': 'Only providers can cancel subscriptions'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        immediate = serializer.validated_data.get('immediate', False)
        profile = request.user.provider_profile

        if immediate:
            profile.subscription_end_date = timezone.now()
        else:
            # Stop auto-renew: keep end date as is; business logic placeholder
            pass
        profile.save(update_fields=['subscription_end_date'])

        return Response({
            'message': 'Subscription cancellation updated',
            'status': SubscriptionStatusSerializer({
                'subscription_tier': profile.subscription_tier,
                'active': profile.is_subscription_active,
                'start_date': profile.subscription_start_date,
                'end_date': profile.subscription_end_date,
            }).data
        })


class SubscriptionStatusView(generics.GenericAPIView):
    """Return current subscription status for the provider."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not request.user.is_provider:
            return Response({'error': 'Only providers can view subscription status'}, status=status.HTTP_403_FORBIDDEN)

        profile = request.user.provider_profile
        data = SubscriptionStatusSerializer({
            'subscription_tier': profile.subscription_tier,
            'active': profile.is_subscription_active,
            'start_date': profile.subscription_start_date,
            'end_date': profile.subscription_end_date,
        }).data
        return Response(data)

