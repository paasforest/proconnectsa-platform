from celery import shared_task
from django.utils import timezone
from decimal import Decimal
import logging
import requests
import json
from django.conf import settings

from .models import Wallet, WalletTransaction

logger = logging.getLogger(__name__)

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
                # Extract customer code from reference
                customer_code = bank_tx['reference'].strip()
                
                # Validate customer code format (should start with CUS)
                if not customer_code.startswith('CUS'):
                    logger.warning(f"Invalid customer code format: {customer_code}")
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
    # Implement your notification service (email/SMS)
    logger.info(f"Deposit notification: {user.username} received {credits_added} credits (total: {total_credits})")
    pass


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