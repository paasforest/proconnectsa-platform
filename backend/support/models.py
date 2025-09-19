"""
Support System Models

This module defines models for support ticket management, including:
- Support tickets and responses
- Support team management
- Support staff roles and permissions
- Support analytics and metrics
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

User = get_user_model()


class SupportStaffProfile(models.Model):
    """Profile for support staff members"""
    
    ROLE_CHOICES = [
        ('agent', 'Support Agent'),
        ('senior_agent', 'Senior Support Agent'),
        ('supervisor', 'Support Supervisor'),
        ('manager', 'Support Manager'),
        ('admin', 'Support Admin'),
    ]
    
    DEPARTMENT_CHOICES = [
        ('general', 'General Support'),
        ('technical', 'Technical Support'),
        ('billing', 'Billing Support'),
        ('sales', 'Sales Support'),
        ('escalation', 'Escalation Team'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='support_profile')
    employee_id = models.CharField(max_length=20, unique=True, help_text="Unique employee ID")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='agent')
    department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES, default='general')
    hire_date = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    max_concurrent_tickets = models.PositiveIntegerField(default=10)
    specializations = models.JSONField(default=list, blank=True, help_text="List of specializations")
    languages = models.JSONField(default=list, blank=True, help_text="List of supported languages")
    timezone = models.CharField(max_length=50, default='UTC')
    phone = models.CharField(max_length=20, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Support Staff Profile"
        verbose_name_plural = "Support Staff Profiles"
    
    def __str__(self):
        return f"{self.user.get_full_name()} ({self.role})"
    
    @property
    def full_name(self):
        return self.user.get_full_name()
    
    @property
    def email(self):
        return self.user.email
    
    @property
    def is_available(self):
        """Check if staff member is available for new tickets"""
        if not self.is_active:
            return False
        
        # Check current ticket load
        current_tickets = SupportTicket.objects.filter(
            assigned_to=self.user,
            status__in=['open', 'in_progress', 'pending_customer']
        ).count()
        
        return current_tickets < self.max_concurrent_tickets
    
    def get_workload(self):
        """Get current workload statistics"""
        return {
            'current_tickets': SupportTicket.objects.filter(
                assigned_to=self.user,
                status__in=['open', 'in_progress', 'pending_customer']
            ).count(),
            'resolved_today': SupportTicket.objects.filter(
                assigned_to=self.user,
                resolved_at__date=timezone.now().date(),
                status='resolved'
            ).count(),
            'avg_resolution_time': self.get_avg_resolution_time(),
            'satisfaction_rating': self.get_avg_satisfaction_rating()
        }
    
    def get_avg_resolution_time(self):
        """Calculate average resolution time in hours"""
        resolved_tickets = SupportTicket.objects.filter(
            assigned_to=self.user,
            status='resolved',
            resolved_at__isnull=False
        )
        
        if not resolved_tickets.exists():
            return 0
        
        total_time = 0
        count = 0
        
        for ticket in resolved_tickets:
            if ticket.resolved_at and ticket.created_at:
                resolution_time = (ticket.resolved_at - ticket.created_at).total_seconds() / 3600
                total_time += resolution_time
                count += 1
        
        return total_time / count if count > 0 else 0
    
    def get_avg_satisfaction_rating(self):
        """Calculate average satisfaction rating"""
        rated_tickets = SupportTicket.objects.filter(
            assigned_to=self.user,
            satisfaction_rating__isnull=False
        )
        
        if not rated_tickets.exists():
            return 0
        
        total_rating = sum(ticket.satisfaction_rating for ticket in rated_tickets)
        return total_rating / rated_tickets.count()


class SupportTeam(models.Model):
    """Support team management"""
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    department = models.CharField(max_length=20, choices=SupportStaffProfile.DEPARTMENT_CHOICES)
    team_lead = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='led_teams'
    )
    members = models.ManyToManyField(
        User, 
        through='SupportTeamMembership',
        related_name='support_teams'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Support Team"
        verbose_name_plural = "Support Teams"
    
    def __str__(self):
        return self.name
    
    def get_member_count(self):
        return self.members.count()
    
    def get_active_members(self):
        return self.members.filter(support_profile__is_active=True)


class SupportTeamMembership(models.Model):
    """Membership in support teams"""
    
    ROLE_CHOICES = [
        ('member', 'Team Member'),
        ('lead', 'Team Lead'),
        ('backup_lead', 'Backup Team Lead'),
    ]
    
    team = models.ForeignKey(SupportTeam, on_delete=models.CASCADE)
    member = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['team', 'member']
        verbose_name = "Team Membership"
        verbose_name_plural = "Team Memberships"
    
    def __str__(self):
        return f"{self.member.get_full_name()} in {self.team.name}"


class SupportTicket(models.Model):
    """Support ticket model"""
    
    CATEGORY_CHOICES = [
        ('general', 'General Inquiry'),
        ('technical', 'Technical Issue'),
        ('billing', 'Billing Question'),
        ('account', 'Account Issue'),
        ('feature', 'Feature Request'),
        ('bug', 'Bug Report'),
        ('refund', 'Refund Request'),
        ('subscription', 'Subscription Management'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('pending_customer', 'Pending Customer'),
        ('pending_internal', 'Pending Internal'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    # Basic ticket information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_number = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    # User information
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_tickets')
    user_type = models.CharField(max_length=20, choices=[('client', 'Client'), ('provider', 'Provider')])
    
    # Assignment and resolution
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_tickets'
    )
    assigned_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='resolved_tickets'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    
    # Additional information
    tags = models.JSONField(default=list, blank=True)
    attachments = models.JSONField(default=list, blank=True)
    satisfaction_rating = models.PositiveIntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    satisfaction_feedback = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Support Ticket"
        verbose_name_plural = "Support Tickets"
    
    def __str__(self):
        return f"{self.ticket_number} - {self.title}"
    
    def save(self, *args, **kwargs):
        if not self.ticket_number:
            self.ticket_number = self.generate_ticket_number()
        super().save(*args, **kwargs)
    
    def generate_ticket_number(self):
        """Generate unique ticket number"""
        import random
        import string
        
        while True:
            # Format: ST-YYYYMMDD-XXXXXX
            date_str = timezone.now().strftime('%Y%m%d')
            random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            ticket_number = f"ST-{date_str}-{random_str}"
            
            if not SupportTicket.objects.filter(ticket_number=ticket_number).exists():
                return ticket_number
    
    def assign_to(self, user):
        """Assign ticket to a user"""
        self.assigned_to = user
        self.assigned_at = timezone.now()
        self.status = 'in_progress'
        self.save()
    
    def resolve(self, user, notes=''):
        """Resolve the ticket"""
        self.resolved_by = user
        self.resolved_at = timezone.now()
        self.status = 'resolved'
        self.resolution_notes = notes
        self.save()
    
    def close(self, user):
        """Close the ticket"""
        self.resolved_by = user
        self.resolved_at = timezone.now()
        self.status = 'closed'
        self.save()
    
    @property
    def age_days(self):
        """Get ticket age in days"""
        return (timezone.now() - self.created_at).days
    
    @property
    def is_open(self):
        """Check if ticket is open"""
        return self.status in ['open', 'in_progress', 'pending_customer', 'pending_internal']
    
    @property
    def is_resolved(self):
        """Check if ticket is resolved"""
        return self.status in ['resolved', 'closed']
    
    @property
    def priority_weight(self):
        """Get priority weight for sorting"""
        weights = {
            'low': 1,
            'medium': 2,
            'high': 3,
            'urgent': 4,
            'critical': 5
        }
        return weights.get(self.priority, 2)


class TicketResponse(models.Model):
    """Response to a support ticket"""
    
    RESPONSE_TYPE_CHOICES = [
        ('customer', 'Customer Response'),
        ('staff', 'Staff Response'),
        ('system', 'System Response'),
    ]
    
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='responses')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    response_type = models.CharField(max_length=20, choices=RESPONSE_TYPE_CHOICES, default='staff')
    is_internal = models.BooleanField(default=False, help_text="Internal note not visible to customer")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = "Ticket Response"
        verbose_name_plural = "Ticket Responses"
    
    def __str__(self):
        return f"Response to {self.ticket.ticket_number} by {self.author.get_full_name()}"


class TicketTemplate(models.Model):
    """Template for common ticket responses"""
    
    CATEGORY_CHOICES = [
        ('general_responses', 'General Responses'),
        ('technical_responses', 'Technical Responses'),
        ('billing_responses', 'Billing Responses'),
        ('account_responses', 'Account Responses'),
    ]
    
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    subject_template = models.CharField(max_length=200, blank=True)
    message_template = models.TextField()
    variables = models.JSONField(default=list, blank=True, help_text="Available template variables")
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Ticket Template"
        verbose_name_plural = "Ticket Templates"
    
    def __str__(self):
        return self.name


class SupportMetrics(models.Model):
    """Support system metrics and analytics"""
    
    date = models.DateField(unique=True)
    total_tickets = models.PositiveIntegerField(default=0)
    open_tickets = models.PositiveIntegerField(default=0)
    resolved_tickets = models.PositiveIntegerField(default=0)
    avg_resolution_time = models.FloatField(default=0.0, help_text="Average resolution time in hours")
    avg_satisfaction_rating = models.FloatField(default=0.0)
    first_response_time = models.FloatField(default=0.0, help_text="Average first response time in hours")
    escalation_count = models.PositiveIntegerField(default=0)
    
    # Staff metrics
    active_staff_count = models.PositiveIntegerField(default=0)
    staff_utilization = models.FloatField(default=0.0, help_text="Staff utilization percentage")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date']
        verbose_name = "Support Metrics"
        verbose_name_plural = "Support Metrics"
    
    def __str__(self):
        return f"Support Metrics for {self.date}"