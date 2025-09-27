from flask import Flask, request, jsonify
from datetime import datetime
import json
import os

# Initialize Flask app
app = Flask(__name__)

# In-memory storage (in production, use a proper database)
users_db = {}
leads_db = {}

# CORS headers for cross-origin requests
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/api/register/', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name', 'user_type']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False, 
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Validate password confirmation if provided
        if 'password_confirm' in data and data['password'] != data['password_confirm']:
            return jsonify({
                'success': False,
                'message': 'Passwords do not match'
            }), 400
        
        # Clean and validate email
        email = data['email'].lower().strip()
        if not email or '@' not in email:
            return jsonify({
                'success': False,
                'message': 'Invalid email address'
            }), 400
        
        # Check if user already exists
        if email in users_db:
            return jsonify({
                'success': False,
                'message': 'User with this email already exists'
            }), 409
        
        # Validate password strength (basic)
        password = data['password']
        if len(password) < 6:
            return jsonify({
                'success': False,
                'message': 'Password must be at least 6 characters long'
            }), 400
        
        # Validate user_type
        valid_user_types = ['client', 'service_provider', 'admin']
        if data['user_type'] not in valid_user_types:
            return jsonify({
                'success': False,
                'message': f'Invalid user type. Must be one of: {", ".join(valid_user_types)}'
            }), 400
        
        # Generate new user ID
        user_id = len(users_db) + 1
        
        # Create new user
        new_user = {
            'id': user_id,
            'email': email,
            'password': password,  # In production, hash this with bcrypt
            'first_name': data['first_name'].strip(),
            'last_name': data['last_name'].strip(),
            'user_type': data['user_type'],
            'phone': data.get('phone', ''),
            'city': data.get('city', ''),
            'province': data.get('province', ''),
            'country': data.get('country', 'South Africa'),
            'credits': 0.0,
            'created_at': datetime.now().isoformat(),
            'is_active': True,
            'email_verified': False
        }
        
        # Add to users database
        users_db[email] = new_user
        
        # Log the registration
        print(f"New user registered: {email} ({data['user_type']})")
        print(f"Total users: {len(users_db)}")
        
        # Return success response (don't include password)
        user_response = new_user.copy()
        del user_response['password']
        
        return jsonify({
            'success': True,
            'message': 'Registration successful! You can now login with your credentials.',
            'data': {
                'user': user_response
            }
        }), 201
        
    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Registration failed due to server error'
        }), 500

@app.route('/api/leads/create-public/', methods=['POST'])
def create_public_lead():
    """Create a lead without authentication (public endpoint)"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['service_category', 'service_type', 'location', 'urgency', 
                          'project_title', 'project_description', 'budget_range',
                          'contact_name', 'contact_phone', 'contact_email']
        
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Generate lead ID
        lead_id = len(leads_db) + 1
        
        # Calculate lead score
        lead_score = calculate_lead_score(data)
        
        # Create new lead
        new_lead = {
            'id': lead_id,
            'service_category': data['service_category'],
            'service_type': data['service_type'],
            'location': data['location'],
            'urgency': data['urgency'],
            'project_title': data['project_title'],
            'project_description': data['project_description'],
            'budget_range': data['budget_range'],
            'contact_name': data['contact_name'],
            'contact_phone': data['contact_phone'],
            'contact_email': data['contact_email'],
            'preferred_contact_method': data.get('preferred_contact_method', 'Phone'),
            'marketing_consent': data.get('marketing_consent', False),
            'hiring_intent': data.get('hiring_intent', ''),
            'hiring_timeline': data.get('hiring_timeline', ''),
            'decision_maker': data.get('decision_maker', ''),
            'best_time_to_call': data.get('best_time_to_call', ''),
            'tried_diy': data.get('tried_diy', ''),
            'preferred_start_date': data.get('preferred_start_date', ''),
            'special_requirements': data.get('special_requirements', ''),
            'lead_score': lead_score,
            'status': 'active',
            'created_at': datetime.now().isoformat(),
            'is_public': True
        }
        
        # Add to leads database
        leads_db[lead_id] = new_lead
        
        # Log the lead creation
        print(f"New public lead created: {data['contact_email']} - {data['service_type']}")
        print(f"Lead ID: {lead_id}, Score: {lead_score}")
        print(f"Total leads: {len(leads_db)}")
        
        # Return success response
        return jsonify({
            'success': True,
            'message': 'Lead created successfully! We will connect you with qualified professionals.',
            'data': {
                'lead_id': lead_id,
                'lead_score': lead_score,
                'status': 'active'
            }
        }), 201
        
    except Exception as e:
        print(f"Lead creation error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Lead creation failed due to server error'
        }), 500

def calculate_lead_score(data):
    """Calculate lead quality score"""
    score = 20  # Base score
    
    # Hiring intent scoring
    hiring_intent_scores = {
        'ready-to-hire': 40,
        'comparing-quotes': 34,
        'planning-project': 24,
        'just-browsing': 12
    }
    score += hiring_intent_scores.get(data.get('hiring_intent', ''), 0)
    
    # Timeline scoring
    timeline_scores = {
        'immediately': 20,
        'within-week': 15,
        'within-month': 10,
        'next-few-months': 5,
        'just-researching': 0
    }
    score += timeline_scores.get(data.get('hiring_timeline', ''), 0)
    
    # Decision maker scoring
    decision_scores = {
        'yes-me': 15,
        'yes-jointly': 10,
        'need-approval': 5,
        'not-me': 0
    }
    score += decision_scores.get(data.get('decision_maker', ''), 0)
    
    # Urgency scoring
    urgency_scores = {
        'urgent': 15,
        'this-week': 10,
        'this-month': 5,
        'flexible': 0
    }
    score += urgency_scores.get(data.get('urgency', ''), 0)
    
    # Budget scoring
    budget = data.get('budget_range', '')
    if '50,000' in budget:
        score += 10
    elif '15,000' in budget:
        score += 8
    elif '5,000' in budget:
        score += 5
    
    # Description quality
    desc_length = len(data.get('project_description', ''))
    if desc_length > 150:
        score += 5
    if desc_length > 300:
        score += 3
    
    # Contact completeness bonus
    if data.get('contact_phone') and data.get('contact_email') and data.get('best_time_to_call'):
        score += 5
    
    return min(100, max(0, score))

@app.route('/api/leads/', methods=['GET'])
def get_leads():
    """Get all leads (for testing)"""
    return jsonify({
        'success': True,
        'data': {
            'leads': list(leads_db.values()),
            'total': len(leads_db)
        }
    }), 200

@app.route('/api/leads/<int:lead_id>/', methods=['GET'])
def get_lead(lead_id):
    """Get specific lead by ID"""
    if lead_id not in leads_db:
        return jsonify({
            'success': False,
            'message': 'Lead not found'
        }), 404
    
    return jsonify({
        'success': True,
        'data': {
            'lead': leads_db[lead_id]
        }
    }), 200

@app.route('/health/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'users_count': len(users_db),
        'leads_count': len(leads_db)
    }), 200

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return jsonify({
        'message': 'Flask Lead Generation Server',
        'version': '1.0.0',
        'endpoints': {
            'register': '/api/register/',
            'create_lead': '/api/leads/create-public/',
            'get_leads': '/api/leads/',
            'health': '/health/'
        }
    }), 200

if __name__ == '__main__':
    print("🚀 Starting Flask Lead Generation Server...")
    print("📋 Available endpoints:")
    print("  POST /api/register/ - User registration")
    print("  POST /api/leads/create-public/ - Create public lead")
    print("  GET  /api/leads/ - Get all leads")
    print("  GET  /health/ - Health check")
    print("  GET  / - Home")
    
    app.run(host='0.0.0.0', port=5000, debug=True)









