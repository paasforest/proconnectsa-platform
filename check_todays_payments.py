#!/usr/bin/env python
"""
Check today's payments and deposits on production server
"""
import os
import sys
import django

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.procompare.settings')
django.setup()

from backend.payments.models import Transaction, Deposit
from django.utils import timezone
from datetime import datetime, timedelta

def check_todays_payments():
    """Check today's payments and deposits"""
    print('💰 CHECKING TODAY\'S PAYMENTS AND DEPOSITS')
    print('=' * 60)

    # Get today's date
    today = timezone.now().date()
    print(f'📅 Checking payments for: {today}')

    # Check all transactions from today
    today_transactions = Transaction.objects.filter(
        created_at__date=today
    ).order_by('-created_at')

    print(f'\n💳 Transactions today: {today_transactions.count()}')

    if today_transactions.count() > 0:
        print('\n📊 Transaction Details:')
        for tx in today_transactions:
            print(f'   ID: {tx.id}')
            print(f'   Type: {tx.transaction_type}')
            print(f'   Amount: R{tx.amount}')
            print(f'   Status: {tx.status}')
            print(f'   User: {tx.user.email if tx.user else "N/A"}')
            print(f'   Time: {tx.created_at.strftime("%H:%M:%S")}')
            print(f'   Description: {tx.description}')
            print('   ---')
    else:
        print('   ℹ️  No transactions found for today')

    # Check deposits specifically
    today_deposits = Deposit.objects.filter(
        created_at__date=today
    ).order_by('-created_at')

    print(f'\n💎 Deposits today: {today_deposits.count()}')

    if today_deposits.count() > 0:
        print('\n📊 Deposit Details:')
        for deposit in today_deposits:
            print(f'   ID: {deposit.id}')
            print(f'   Amount: R{deposit.amount}')
            print(f'   Status: {deposit.status}')
            print(f'   User: {deposit.user.email if deposit.user else "N/A"}')
            print(f'   Time: {deposit.created_at.strftime("%H:%M:%S")}')
            print(f'   Payment Method: {deposit.payment_method}')
            print('   ---')
    else:
        print('   ℹ️  No deposits found for today')

    # Check recent transactions (last 7 days)
    week_ago = timezone.now() - timedelta(days=7)
    recent_transactions = Transaction.objects.filter(
        created_at__gte=week_ago
    ).order_by('-created_at')

    print(f'\n📈 Recent transactions (last 7 days): {recent_transactions.count()}')

    if recent_transactions.count() > 0:
        print('\n📊 Recent Transaction Summary:')
        for tx in recent_transactions[:10]:  # Show last 10
            time_str = tx.created_at.strftime("%Y-%m-%d %H:%M")
            print(f'   {time_str} - {tx.transaction_type} - R{tx.amount} - {tx.status}')

    # Check total revenue today
    total_today = today_transactions.filter(
        status='completed',
        transaction_type__in=['deposit', 'payment', 'credit_purchase']
    ).aggregate(total=models.Sum('amount'))['total'] or 0

    print(f'\n💰 Total revenue today: R{total_today}')

    print('\n🎉 Payment check completed!')

if __name__ == '__main__':
    try:
        check_todays_payments()
    except Exception as e:
        print(f'❌ Error: {str(e)}')
        import traceback
        traceback.print_exc()



