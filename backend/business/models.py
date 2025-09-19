from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()

class BusinessRegistration(models.Model):
    """
    Model for storing business registration applications
    """
    BUSINESS_TYPES = [
        ('pty_ltd', 'Private Company (Pty Ltd)'),
        ('public_ltd', 'Public Company (Ltd)'),
        ('cc', 'Close Corporation (CC)'),
        ('sole_prop', 'Sole Proprietorship'),
        ('partnership', 'Partnership'),
        ('npc', 'Non-Profit Company (NPC)'),
        ('inc', 'Personal Liability Company (Inc)'),
    ]
    
    REGISTRATION_STATUS = [
        ('pending_payment', 'Pending Payment'),
        ('payment_received', 'Payment Received'),
        ('documents_review', 'Documents Under Review'),
        ('cipc_submission', 'CIPC Submission in Progress'),
        ('website_development', 'Website Development'),
        ('completed', 'Registration Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    URGENCY_CHOICES = [
        ('standard', 'Standard (7-14 days) - R1,350'),
        ('express', 'Express (3-7 days) - R1,850'),
        ('rush', 'Rush (1-3 days) - R2,350'),
    ]
    
    ID_TYPES = [
        ('sa_id', 'South African ID'),
        ('passport', 'Passport'),
    ]
    
    # Unique identifier
    registration_id = models.CharField(max_length=20, unique=True, db_index=True)
    
    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    nationality = models.CharField(max_length=100)
    id_type = models.CharField(max_length=20, choices=ID_TYPES)
    id_number = models.CharField(max_length=20)
    id_document = models.FileField(upload_to='business_registrations/id_documents/', null=True, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    # Business Information
    business_name = models.CharField(max_length=200, help_text="First choice business name")
    business_name_alternative = models.CharField(max_length=200, help_text="Second choice business name", default="")
    business_type = models.CharField(max_length=20, choices=BUSINESS_TYPES)
    business_category = models.CharField(max_length=100)
    business_description = models.TextField()
    
    # Business Address
    street_address = models.CharField(max_length=200)
    suburb = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    
    # Website Requirements
    website_required = models.BooleanField(default=True)
    website_type = models.CharField(max_length=200, null=True, blank=True)
    website_features = models.JSONField(default=list, blank=True)
    domain_preference = models.CharField(max_length=100, null=True, blank=True)
    
    # Registration Timeline
    registration_urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES)
    preferred_start_date = models.DateField()
    
    # Payment Information
    payment_method = models.CharField(max_length=50)
    payment_reference = models.CharField(max_length=50)  # Phone number for reference
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_received = models.BooleanField(default=False)
    payment_date = models.DateTimeField(null=True, blank=True)
    
    # Status and Tracking
    status = models.CharField(max_length=20, choices=REGISTRATION_STATUS, default='pending_payment')
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Terms and Consent
    terms_accepted = models.BooleanField(default=False)
    privacy_accepted = models.BooleanField(default=False)
    marketing_consent = models.BooleanField(default=False)
    
    # Internal tracking
    assigned_to = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_registrations')
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'business_registrations'
        ordering = ['-submitted_at']
        
    def __str__(self):
        return f"{self.business_name} - {self.first_name} {self.last_name}"
    
    def save(self, *args, **kwargs):
        if not self.registration_id:
            self.registration_id = f"BR{timezone.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:8].upper()}"
        
        # Set payment reference to phone number (cleaned)
        if self.phone and not self.payment_reference:
            self.payment_reference = ''.join(filter(str.isdigit, self.phone))
        
        # Set payment amount based on urgency
        if not self.payment_amount:
            urgency_text = (self.registration_urgency or '').lower()
            if 'express' in urgency_text:
                self.payment_amount = 1850.00
            elif 'rush' in urgency_text:
                self.payment_amount = 2350.00
            else:
                self.payment_amount = 1350.00
                
        super().save(*args, **kwargs)
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def is_paid(self):
        return self.payment_received
    
    @property
    def days_since_submission(self):
        return (timezone.now() - self.submitted_at).days


class BusinessDirector(models.Model):
    """
    Model for storing director information for business registrations
    """
    business_registration = models.ForeignKey(BusinessRegistration, on_delete=models.CASCADE, related_name='directors')
    
    # Director Information
    name = models.CharField(max_length=200)
    nationality = models.CharField(max_length=100)
    id_type = models.CharField(max_length=20, choices=BusinessRegistration.ID_TYPES)
    id_number = models.CharField(max_length=20)
    id_document = models.FileField(upload_to='business_registrations/director_documents/', null=True, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    shareholding = models.DecimalField(max_digits=5, decimal_places=2)  # Percentage
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'business_directors'
        
    def __str__(self):
        return f"{self.name} - {self.business_registration.business_name} ({self.shareholding}%)"


class BusinessRegistrationNote(models.Model):
    """
    Model for tracking notes and updates on business registrations
    """
    business_registration = models.ForeignKey(BusinessRegistration, on_delete=models.CASCADE, related_name='tracking_notes')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'business_registration_notes'
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Note for {self.business_registration.business_name} by {self.author.email}"
