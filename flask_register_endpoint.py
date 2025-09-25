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









