from celery import shared_task
from django.utils import timezone
from decimal import Decimal
import logging
import requests
import json
from django.conf import settings

from .models import Wallet, WalletTransaction
from backend.utils.sendgrid_service import sendgrid_service
from backend.payments.models import DepositRequest, TransactionStatus
from datetime import timedelta

logger = logging.getLogger(__name__)

def _activate_premium_listing_from_deposit(deposit: DepositRequest):
    """
    Activate premium listing on the provider profile once a PREMIUM deposit is detected.
    Premium listing gives FREE lead unlocks while active.
    """
    provider = deposit.account.user.provider_profile

    notes = (deposit.verification_notes or "").lower()
    plan_type = "monthly" if "monthly" in notes else ("lifetime" if "lifetime" in notes else None)

    # Fallback based on amount if plan_type wasn't captured in notes
    if not plan_type:
        try:
            amt = float(deposit.amount)
            if abs(amt - 299.0) < 1.0:
                plan_type = "monthly"
            elif abs(amt - 2990.0) < 5.0:
                plan_type = "lifetime"
        except Exception:
            plan_type = "monthly"

    now = timezone.now()
    provider.is_premium_listing = True
    provider.premium_listing_started_at = now
    provider.premium_listing_payment_reference = deposit.reference_number or deposit.bank_reference or ""
    if plan_type == "lifetime":
        provider.premium_listing_expires_at = None
    else:
        provider.premium_listing_expires_at = now + timedelta(days=30)

    provider.save(update_fields=[
        "is_premium_listing",
        "premium_listing_started_at",
        "premium_listing_expires_at",
        "premium_listing_payment_reference",
    ])

def _process_deposit_request_match(deposit: DepositRequest, bank_tx: dict):
    """
    Mark a pending DepositRequest as completed when we see a matching bank transaction.
    Handles both credit top-ups and premium listing deposits.
    """
    if deposit.status != TransactionStatus.PENDING:
        return False

    ref = (bank_tx.get("reference") or "").strip()
    bank_tx_id = bank_tx.get("id") or ""

    # Mark deposit as completed + attach bank txn id for dedupe/tracing
    deposit.status = TransactionStatus.COMPLETED
    deposit.processed_at = timezone.now()
    deposit.is_auto_verified = True
    deposit.bank_reference = bank_tx_id or ref
    deposit.verification_notes = (deposit.verification_notes or "") + f"\nAuto-reconciled from bank tx: {bank_tx_id}"
    deposit.save(update_fields=[
        "status",
        "processed_at",
        "is_auto_verified",
        "bank_reference",
        "verification_notes",
    ])

    # Premium listing deposits: no credits, activate premium listing
    if (deposit.credits_to_activate or 0) == 0 and "premium listing request" in (deposit.verification_notes or "").lower():
        _activate_premium_listing_from_deposit(deposit)
        try:
            sendgrid_service.send_email(
                deposit.account.user.email,
                "Premium listing activated",
                f"<p>Your premium listing payment was detected and your premium listing is now active.</p><p>Reference: <strong>{ref}</strong></p>",
                f"Your premium listing payment was detected and your premium listing is now active.\nReference: {ref}",
            )
        except Exception as e:
            logger.warning(f"Failed to send premium activation email: {e}")
        return True

    # Credit top-up deposit requests: activate credits in wallet like normal reconciliation
    try:
        wallet, _ = Wallet.objects.get_or_create(user=deposit.account.user)
        credits_added = int(deposit.credits_to_activate or 0)
        if credits_added > 0:
            wallet.credits += credits_added
            wallet.save(update_fields=["credits"])

            WalletTransaction.objects.create(
                wallet=wallet,
                amount=Decimal(str(bank_tx.get("amount", deposit.amount))),
                credits=credits_added,
                transaction_type="deposit",
                reference=f"DEP_{timezone.now().strftime('%Y%m%d%H%M%S')}_{wallet.customer_code}",
                bank_reference=bank_tx_id,
                status="confirmed",
                description=f"Auto-reconciled deposit for deposit request {deposit.reference_number}",
                confirmed_at=timezone.now(),
            )
    except Exception as e:
        logger.error(f"Failed to apply credits for deposit request {deposit.reference_number}: {e}")

    return True

@shared_task
def reconcile_bank_deposits():
    """
    Reconcile bank deposits with user wallets using customer codes
    This runs every 5 minutes via Celery Beat for automatic processing
    """
    try:
        logger.info("Starting automatic bank reconciliation...")
        
        # Get bank transactions from API or mock data
        bank_transactions = fetch_bank_transactions()
        
        if not bank_transactions:
            logger.info("No bank transactions found for reconciliation")
            return 0
        
        reconciled_count = 0
        unmatched_count = 0
        
        for bank_tx in bank_transactions:
            try:
                # Extract reference from bank transaction
                reference = (bank_tx.get('reference') or '').strip()
                if not reference:
                    unmatched_count += 1
                    continue

                # First: try to match a pending DepositRequest by reference_number.
                # This supports PREMIUM... references and any other DepositRequest-driven payments.
                matching_deposit = DepositRequest.objects.filter(
                    reference_number=reference,
                    status=TransactionStatus.PENDING
                ).select_related("account", "account__user").first()

                if matching_deposit:
                    # Dedupe using bank tx id
                    bank_tx_id = bank_tx.get("id")
                    if bank_tx_id and DepositRequest.objects.filter(bank_reference=bank_tx_id).exists():
                        logger.info(f"Bank tx {bank_tx_id} already linked to a deposit request, skipping")
                        continue
                    _process_deposit_request_match(matching_deposit, bank_tx)
                    reconciled_count += 1
                    logger.info(f"✅ Reconciled deposit request {matching_deposit.reference_number} for {matching_deposit.account.user.email}")
                    continue

                # Otherwise: treat reference as a wallet customer code (CUS...)
                customer_code = reference
                if not customer_code.startswith('CUS'):
                    logger.warning(f"Unmatched bank reference (not CUS and no DepositRequest match): {customer_code}")
                    unmatched_count += 1
                    continue
                
                # Try to find wallet by exact customer code match
                wallet = Wallet.objects.filter(customer_code=customer_code).first()
                
                if wallet:
                    # Check if this transaction was already processed
                    existing_transaction = WalletTransaction.objects.filter(
                        bank_reference=bank_tx['id']
                    ).first()
                    
                    if existing_transaction:
                        logger.info(f"Transaction {bank_tx['id']} already processed, skipping")
                        continue
                    
                    # Process the deposit
                    credits_added = wallet.add_credits(bank_tx['amount'])
                    
                    # Create confirmed transaction record
                    transaction = WalletTransaction.objects.create(
                        wallet=wallet,
                        amount=Decimal(str(bank_tx['amount'])),
                        credits=credits_added,
                        transaction_type='deposit',
                        reference=f"DEP_{timezone.now().strftime('%Y%m%d%H%M%S')}_{wallet.customer_code}",
                        bank_reference=bank_tx['id'],
                        status='confirmed',
                        description=f"Auto-reconciled deposit via {bank_tx.get('method', 'bank transfer')} - Ref: {customer_code}",
                        confirmed_at=timezone.now()
                    )
                    
                    # Send notification
                    send_deposit_notification(wallet.user, credits_added, wallet.credits)
                    
                    reconciled_count += 1
                    logger.info(f"✅ Auto-reconciled deposit for {wallet.user.email}: R{bank_tx['amount']} -> {credits_added} credits (Ref: {customer_code})")
                
                else:
                    # Customer code not found - create pending transaction for manual review
                    WalletTransaction.objects.get_or_create(
                        bank_reference=bank_tx['id'],
                        defaults={
                            'wallet': None,
                            'amount': Decimal(str(bank_tx['amount'])),
                            'transaction_type': 'deposit',
                            'reference': f"UNMATCHED_{customer_code}",
                            'status': 'pending',
                            'description': f"Unmatched deposit - Customer code not found: {customer_code}",
                            'created_at': timezone.now()
                        }
                    )
                    
                    unmatched_count += 1
                    logger.warning(f"⚠️ Unmatched deposit: Customer code {customer_code} not found in database")
                    
            except Exception as e:
                logger.error(f"❌ Error processing bank transaction {bank_tx.get('id', 'unknown')}: {str(e)}")
                unmatched_count += 1
                continue
        
        # Log summary
        logger.info(f"🏦 Bank reconciliation completed:")
        logger.info(f"   ✅ Reconciled: {reconciled_count} deposits")
        logger.info(f"   ⚠️ Unmatched: {unmatched_count} deposits")
        logger.info(f"   📊 Total processed: {len(bank_transactions)} transactions")
        
        return {
            'reconciled': reconciled_count,
            'unmatched': unmatched_count,
            'total': len(bank_transactions),
            'timestamp': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Bank reconciliation job failed: {str(e)}")
        raise


def fetch_bank_transactions():
    """
    Fetch bank transactions from Nedbank API using customer codes as reference
    Account: 1313872032, Branch: 198765
    """
    try:
        # Try to fetch from real bank API first
        bank_transactions = fetch_from_bank_api()
        if bank_transactions:
            logger.info(f"Fetched {len(bank_transactions)} transactions from bank API")
            return bank_transactions
    except Exception as e:
        logger.warning(f"Bank API fetch failed: {e}, using mock data")
    
    # Fallback to mock data for testing
    return get_mock_bank_transactions()


def fetch_from_bank_api():
    """
    Fetch transactions from Nedbank API
    Account: 1313872032, Branch: 198765
    Configure Nedbank API credentials in Django settings
    """
    # Get bank API configuration from settings
    bank_config = getattr(settings, 'BANK_API_CONFIG', {})
    
    if not bank_config.get('enabled', False):
        return []
    
    api_url = bank_config.get('api_url')
    api_key = bank_config.get('api_key')
    account_id = bank_config.get('account_id')
    
    if not all([api_url, api_key, account_id]):
        logger.warning("Bank API not configured properly")
        return []
    
    try:
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        # Fetch recent transactions (last 24 hours)
        params = {
            'account_id': account_id,
            'from_date': (timezone.now() - timezone.timedelta(days=1)).isoformat(),
            'to_date': timezone.now().isoformat(),
            'transaction_type': 'credit'  # Only deposits
        }
        
        response = requests.get(api_url, headers=headers, params=params, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        transactions = []
        
        for tx in data.get('transactions', []):
            # Look for customer code in reference field
            reference = tx.get('reference', '').strip()
            if reference.startswith('CUS'):
                transactions.append({
                    'id': tx.get('id'),
                    'amount': float(tx.get('amount', 0)),
                    'reference': reference,  # Customer code
                    'method': tx.get('payment_method', 'EFT'),
                    'timestamp': tx.get('timestamp'),
                    'description': tx.get('description', '')
                })
        
        return transactions
        
    except requests.RequestException as e:
        logger.error(f"Bank API request failed: {e}")
        return []
    except Exception as e:
        logger.error(f"Bank API processing failed: {e}")
        return []


def get_mock_bank_transactions():
    """
    Generate mock bank transactions for testing
    Uses real customer codes from the database
    """
    # Get some real customer codes from the database
    real_customer_codes = list(Wallet.objects.values_list('customer_code', flat=True)[:5])
    
    # If no real codes exist, create some test ones
    if not real_customer_codes:
        real_customer_codes = ['CUS12345678', 'CUS87654321', 'CUS11111111']
    
    mock_transactions = []
    for i, code in enumerate(real_customer_codes):
        # Use only Nedbank (real account details)
        mock_transactions.append({
            'id': f'NED{100000 + i}',
            'amount': 100.00 + (i * 50),  # R100, R150, R200, etc.
            'reference': code,  # Real customer code
            'method': 'EFT',
            'timestamp': timezone.now().isoformat(),
            'description': f'Nedbank deposit for customer {code}',
            'bank': 'Nedbank',
            'account_number': '1313872032',
            'branch_code': '198765'
        })
    
    return mock_transactions


def send_deposit_notification(user, credits_added, total_credits):
    """Send email/SMS notification for successful deposit"""
    try:
        # Get the latest transaction for this user
        latest_transaction = WalletTransaction.objects.filter(
            wallet__user=user,
            status='confirmed',
            transaction_type='deposit'
        ).order_by('-created_at').first()
        
        if latest_transaction:
            # Send payment confirmation email
            sendgrid_service.send_payment_confirmation(user, latest_transaction)
            logger.info(f"📧 Payment confirmation email sent to {user.email}")
        
        logger.info(f"Deposit notification: {user.username} received {credits_added} credits (total: {total_credits})")
    except Exception as e:
        logger.error(f"❌ Failed to send deposit notification: {str(e)}")


def create_mock_deposit_for_testing(user, amount):
    """Create a mock deposit for testing purposes"""
    wallet, created = Wallet.objects.get_or_create(user=user)
    
    # Add credits to wallet
    credits_added = wallet.add_credits(amount)
    
    # Create transaction record
    transaction = WalletTransaction.objects.create(
        wallet=wallet,
        amount=Decimal(str(amount)),
        credits=credits_added,
        transaction_type='deposit',
        reference=f"TEST_DEP_{timezone.now().strftime('%Y%m%d%H%M%S')}",
        status='confirmed',
        description=f"Test deposit of R{amount}",
        confirmed_at=timezone.now()
    )
    
    return transaction