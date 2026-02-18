"""
Utility functions to identify and filter test leads.
Test leads should NEVER be visible to providers in production.
"""
from django.db.models import Q


def is_test_lead(lead):
    """
    Check if a lead is a test lead based on various patterns.
    
    Test leads are identified by:
    - Description containing "test lead" or "This is test lead"
    - Title containing "#" followed by a number (e.g., "Service #1")
    - Source field set to 'test'
    - Client email containing 'test' or being a test account
    """
    if not lead:
        return False
    
    # Check description for test patterns
    description_lower = (lead.description or '').lower()
    if any(pattern in description_lower for pattern in [
        'this is test lead',
        'test lead number',
        'test lead #',
        '[test]',
        '(test)'
    ]):
        return True
    
    # Check title for test patterns (e.g., "Service #1", "Service #2")
    title_lower = (lead.title or '').lower()
    if ' #' in title_lower or title_lower.endswith(' #1') or title_lower.endswith(' #2'):
        return True
    
    # Check source field
    if lead.source and lead.source.lower() == 'test':
        return True
    
    # Check client email for test patterns
    if hasattr(lead, 'client') and lead.client:
        client_email = (lead.client.email or '').lower()
        if any(pattern in client_email for pattern in [
            'test@',
            '@test.',
            'testuser',
            'test_',
            '_test'
        ]):
            return True
    
    return False


def exclude_test_leads(queryset):
    """
    Filter out test leads from a queryset.
    
    This should be applied to ALL provider-facing lead queries.
    """
    return queryset.exclude(
        Q(description__icontains='this is test lead') |
        Q(description__icontains='test lead number') |
        Q(description__icontains='test lead #') |
        Q(description__icontains='[test]') |
        Q(description__icontains='(test)') |
        Q(title__icontains=' #') |
        Q(source='test') |
        Q(client__email__icontains='test@') |
        Q(client__email__icontains='@test.') |
        Q(client__email__icontains='testuser') |
        Q(client__email__icontains='test_') |
        Q(client__email__icontains='_test')
    )
