"""
Enhanced input validation and sanitization
"""
import re
import html
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _


class InputValidator:
    """
    Comprehensive input validation and sanitization
    """
    
    @staticmethod
    def sanitize_string(value, max_length=255, allow_html=False):
        """
        Sanitize string input
        """
        if not value:
            return value
            
        # Convert to string and strip whitespace
        value = str(value).strip()
        
        # Limit length
        if len(value) > max_length:
            value = value[:max_length]
        
        # Remove HTML if not allowed
        if not allow_html:
            value = html.escape(value)
        
        return value
    
    @staticmethod
    def validate_email(email):
        """
        Validate email format
        """
        if not email:
            raise ValidationError(_('Email is required'))
        
        email = email.strip().lower()
        
        # Basic email regex
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        if not re.match(email_regex, email):
            raise ValidationError(_('Invalid email format'))
        
        # Check for suspicious patterns
        suspicious_patterns = [
            r'\.{2,}',  # Multiple consecutive dots
            r'@.*@',    # Multiple @ symbols
            r'\.@',     # Dot before @
            r'@\.',     # @ before dot
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, email):
                raise ValidationError(_('Invalid email format'))
        
        return email
    
    @staticmethod
    def validate_phone(phone):
        """
        Validate South African phone number
        """
        if not phone:
            return None
        
        # Remove all non-digit characters
        phone_digits = re.sub(r'\D', '', phone)
        
        # South African phone number patterns
        sa_patterns = [
            r'^27\d{9}$',      # +27XXXXXXXXX
            r'^0\d{9}$',       # 0XXXXXXXXX
            r'^\d{10}$',       # XXXXXXXXXX (10 digits)
        ]
        
        for pattern in sa_patterns:
            if re.match(pattern, phone_digits):
                # Format as +27XXXXXXXXX
                if phone_digits.startswith('0'):
                    return '+27' + phone_digits[1:]
                elif phone_digits.startswith('27'):
                    return '+' + phone_digits
                elif len(phone_digits) == 10:
                    return '+27' + phone_digits
                else:
                    return '+' + phone_digits
        
        raise ValidationError(_('Invalid South African phone number format'))
    
    @staticmethod
    def validate_password(password):
        """
        Validate password strength
        """
        if not password:
            raise ValidationError(_('Password is required'))
        
        if len(password) < 8:
            raise ValidationError(_('Password must be at least 8 characters long'))
        
        if len(password) > 128:
            raise ValidationError(_('Password is too long'))
        
        # Check for common weak passwords
        weak_passwords = [
            'password', '123456', '12345678', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey'
        ]
        
        if password.lower() in weak_passwords:
            raise ValidationError(_('Password is too common'))
        
        # Check for at least one letter and one number
        if not re.search(r'[A-Za-z]', password):
            raise ValidationError(_('Password must contain at least one letter'))
        
        if not re.search(r'\d', password):
            raise ValidationError(_('Password must contain at least one number'))
        
        return password
    
    @staticmethod
    def validate_business_name(name):
        """
        Validate business name
        """
        if not name:
            raise ValidationError(_('Business name is required'))
        
        name = InputValidator.sanitize_string(name, max_length=100)
        
        if len(name) < 2:
            raise ValidationError(_('Business name must be at least 2 characters long'))
        
        # Check for suspicious patterns
        suspicious_patterns = [
            r'<script',  # Script tags
            r'javascript:',  # JavaScript
            r'on\w+\s*=',  # Event handlers
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, name, re.IGNORECASE):
                raise ValidationError(_('Invalid characters in business name'))
        
        return name
    
    @staticmethod
    def validate_location_data(city, suburb, address):
        """
        Validate location data
        """
        # Validate city
        if city:
            city = InputValidator.sanitize_string(city, max_length=50)
            if len(city) < 2:
                raise ValidationError(_('City name must be at least 2 characters long'))
        
        # Validate suburb
        if suburb:
            suburb = InputValidator.sanitize_string(suburb, max_length=50)
            if len(suburb) < 2:
                raise ValidationError(_('Suburb name must be at least 2 characters long'))
        
        # Validate address
        if address:
            address = InputValidator.sanitize_string(address, max_length=200)
            if len(address) < 5:
                raise ValidationError(_('Address must be at least 5 characters long'))
        
        return city, suburb, address
    
    @staticmethod
    def validate_lead_data(data):
        """
        Validate lead creation data
        """
        # Validate title
        if 'title' in data:
            data['title'] = InputValidator.sanitize_string(data['title'], max_length=200)
            if len(data['title']) < 5:
                raise ValidationError(_('Lead title must be at least 5 characters long'))
        
        # Validate description
        if 'description' in data:
            data['description'] = InputValidator.sanitize_string(data['description'], max_length=1000)
            if len(data['description']) < 10:
                raise ValidationError(_('Lead description must be at least 10 characters long'))
        
        # Validate budget range
        valid_budget_ranges = [
            'under_1000', '1000_5000', '5000_15000', 
            '15000_50000', 'over_50000'
        ]
        if 'budget_range' in data and data['budget_range'] not in valid_budget_ranges:
            raise ValidationError(_('Invalid budget range'))
        
        # Validate urgency
        valid_urgency_levels = ['urgent', 'this_week', 'this_month', 'flexible']
        if 'urgency' in data and data['urgency'] not in valid_urgency_levels:
            raise ValidationError(_('Invalid urgency level'))
        
        return data
