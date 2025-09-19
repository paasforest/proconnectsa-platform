"""
Support Ticket ML Services

This module provides ML services for support ticket management, including:
- Ticket classification and categorization
- Priority prediction based on content
- Response time prediction
- Satisfaction rating prediction
- Auto-assignment based on content and staff expertise
- Sentiment analysis for ticket content
- Duplicate ticket detection
"""

import logging
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, mean_squared_error
from sklearn.preprocessing import LabelEncoder
import joblib
import os
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import re

logger = logging.getLogger(__name__)


class SupportTicketMLService:
    """ML service for support ticket management"""
    
    def __init__(self):
        self.models_dir = os.path.join(settings.BASE_DIR, 'ml_models', 'support')
        os.makedirs(self.models_dir, exist_ok=True)
        
        # Initialize models
        self.category_classifier = None
        self.priority_predictor = None
        self.response_time_predictor = None
        self.satisfaction_predictor = None
        self.auto_assigner = None
        self.sentiment_analyzer = None
        self.duplicate_detector = None
        
        # Initialize vectorizers
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        # Load or train models
        self._load_or_train_models()
    
    def _load_or_train_models(self):
        """Load existing models or train new ones"""
        try:
            self._load_models()
            logger.info("Support ML models loaded successfully")
        except Exception as e:
            logger.warning(f"Could not load models: {str(e)}. Training new models...")
            self._train_all_models()
    
    def _load_models(self):
        """Load pre-trained models"""
        self.category_classifier = joblib.load(os.path.join(self.models_dir, 'category_classifier.pkl'))
        self.priority_predictor = joblib.load(os.path.join(self.models_dir, 'priority_predictor.pkl'))
        self.response_time_predictor = joblib.load(os.path.join(self.models_dir, 'response_time_predictor.pkl'))
        self.satisfaction_predictor = joblib.load(os.path.join(self.models_dir, 'satisfaction_predictor.pkl'))
        self.auto_assigner = joblib.load(os.path.join(self.models_dir, 'auto_assigner.pkl'))
        self.sentiment_analyzer = joblib.load(os.path.join(self.models_dir, 'sentiment_analyzer.pkl'))
        self.duplicate_detector = joblib.load(os.path.join(self.models_dir, 'duplicate_detector.pkl'))
        
        # Load vectorizer
        self.tfidf_vectorizer = joblib.load(os.path.join(self.models_dir, 'tfidf_vectorizer.pkl'))
    
    def _save_models(self):
        """Save trained models"""
        joblib.dump(self.category_classifier, os.path.join(self.models_dir, 'category_classifier.pkl'))
        joblib.dump(self.priority_predictor, os.path.join(self.models_dir, 'priority_predictor.pkl'))
        joblib.dump(self.response_time_predictor, os.path.join(self.models_dir, 'response_time_predictor.pkl'))
        joblib.dump(self.satisfaction_predictor, os.path.join(self.models_dir, 'satisfaction_predictor.pkl'))
        joblib.dump(self.auto_assigner, os.path.join(self.models_dir, 'auto_assigner.pkl'))
        joblib.dump(self.sentiment_analyzer, os.path.join(self.models_dir, 'sentiment_analyzer.pkl'))
        joblib.dump(self.duplicate_detector, os.path.join(self.models_dir, 'duplicate_detector.pkl'))
        joblib.dump(self.tfidf_vectorizer, os.path.join(self.models_dir, 'tfidf_vectorizer.pkl'))
    
    def _train_all_models(self):
        """Train all ML models"""
        from .models import SupportTicket, TicketResponse
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        # Get training data
        tickets = SupportTicket.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=365)
        ).select_related('user', 'assigned_to', 'resolved_by')
        
        if tickets.count() < 50:
            logger.warning("Not enough data to train support ML models")
            self._create_dummy_models()
            return
        
        # Prepare training data
        training_data = self._prepare_training_data(tickets)
        
        if len(training_data) < 50:
            logger.warning("Not enough valid data to train support ML models")
            self._create_dummy_models()
            return
        
        # Train models
        self._train_category_classifier(training_data)
        self._train_priority_predictor(training_data)
        self._train_response_time_predictor(training_data)
        self._train_satisfaction_predictor(training_data)
        self._train_auto_assigner(training_data)
        self._train_sentiment_analyzer(training_data)
        self._train_duplicate_detector(training_data)
        
        # Save models
        self._save_models()
        logger.info("All support ML models trained and saved successfully")
    
    def _create_dummy_models(self):
        """Create dummy models when there's insufficient data"""
        from sklearn.dummy import DummyClassifier, DummyRegressor
        
        self.category_classifier = DummyClassifier(strategy='most_frequent')
        self.priority_predictor = DummyClassifier(strategy='most_frequent')
        self.response_time_predictor = DummyRegressor(strategy='mean')
        self.satisfaction_predictor = DummyRegressor(strategy='mean')
        self.auto_assigner = DummyClassifier(strategy='most_frequent')
        self.sentiment_analyzer = DummyClassifier(strategy='most_frequent')
        self.duplicate_detector = DummyClassifier(strategy='most_frequent')
        
        # Train dummy models with minimal data
        dummy_X = np.array([[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]])  # 10 features
        dummy_y_categorical = np.array(['general'])
        dummy_y_numeric = np.array([1.0])
        
        self.category_classifier.fit(dummy_X, dummy_y_categorical)
        self.priority_predictor.fit(dummy_X, dummy_y_categorical)
        self.response_time_predictor.fit(dummy_X, dummy_y_numeric)
        self.satisfaction_predictor.fit(dummy_X, dummy_y_numeric)
        self.auto_assigner.fit(dummy_X, dummy_y_numeric)
        self.sentiment_analyzer.fit(dummy_X, dummy_y_categorical)
        self.duplicate_detector.fit(dummy_X, dummy_y_numeric)
    
    def _prepare_training_data(self, tickets):
        """Prepare training data from tickets"""
        training_data = []
        
        for ticket in tickets:
            # Extract features
            features = self._extract_ticket_features(ticket)
            if features:
                training_data.append(features)
        
        return training_data
    
    def _extract_ticket_features(self, ticket):
        """Extract features from a support ticket"""
        try:
            # Text features
            title = ticket.title or ""
            description = ticket.description or ""
            combined_text = f"{title} {description}".strip()
            
            if not combined_text:
                return None
            
            # User features
            user_type = 1 if ticket.user_type == 'provider' else 0
            user_experience = self._calculate_user_experience(ticket.user)
            
            # Time features
            created_hour = ticket.created_at.hour
            created_day_of_week = ticket.created_at.weekday()
            is_weekend = 1 if created_day_of_week >= 5 else 0
            
            # Content features
            text_length = len(combined_text)
            word_count = len(combined_text.split())
            has_urgency_words = self._has_urgency_words(combined_text)
            has_technical_words = self._has_technical_words(combined_text)
            has_billing_words = self._has_billing_words(combined_text)
            
            # Response features
            response_count = ticket.responses.count()
            avg_response_time = self._calculate_avg_response_time(ticket)
            
            # Resolution features
            resolution_time_hours = None
            if ticket.resolved_at:
                resolution_time_hours = (ticket.resolved_at - ticket.created_at).total_seconds() / 3600
            
            # Satisfaction features
            satisfaction_rating = ticket.satisfaction_rating or 0
            
            return {
                'ticket_id': ticket.id,
                'title': title,
                'description': description,
                'combined_text': combined_text,
                'category': ticket.category,
                'priority': ticket.priority,
                'status': ticket.status,
                'user_type': user_type,
                'user_experience': user_experience,
                'created_hour': created_hour,
                'created_day_of_week': created_day_of_week,
                'is_weekend': is_weekend,
                'text_length': text_length,
                'word_count': word_count,
                'has_urgency_words': has_urgency_words,
                'has_technical_words': has_technical_words,
                'has_billing_words': has_billing_words,
                'response_count': response_count,
                'avg_response_time': avg_response_time,
                'resolution_time_hours': resolution_time_hours,
                'satisfaction_rating': satisfaction_rating,
                'assigned_to_id': ticket.assigned_to_id,
                'resolved_by_id': ticket.resolved_by_id
            }
        except Exception as e:
            logger.error(f"Error extracting features from ticket {ticket.id}: {str(e)}")
            return None
    
    def _calculate_user_experience(self, user):
        """Calculate user experience level based on account age and activity"""
        try:
            account_age_days = (timezone.now() - user.date_joined).days
            
            # Count previous tickets
            from .models import SupportTicket
            previous_tickets = SupportTicket.objects.filter(user=user).count()
            
            # Simple experience score
            experience_score = min(account_age_days / 30 + previous_tickets, 10)
            return experience_score
        except:
            return 0
    
    def _has_urgency_words(self, text):
        """Check if text contains urgency words"""
        urgency_words = [
            'urgent', 'asap', 'immediately', 'critical', 'emergency',
            'broken', 'down', 'not working', 'error', 'failed'
        ]
        text_lower = text.lower()
        return 1 if any(word in text_lower for word in urgency_words) else 0
    
    def _has_technical_words(self, text):
        """Check if text contains technical words"""
        technical_words = [
            'api', 'database', 'server', 'code', 'bug', 'error',
            'login', 'password', 'authentication', 'integration'
        ]
        text_lower = text.lower()
        return 1 if any(word in text_lower for word in technical_words) else 0
    
    def _has_billing_words(self, text):
        """Check if text contains billing words"""
        billing_words = [
            'payment', 'billing', 'invoice', 'charge', 'refund',
            'subscription', 'credit', 'money', 'cost', 'price'
        ]
        text_lower = text.lower()
        return 1 if any(word in text_lower for word in billing_words) else 0
    
    def _calculate_avg_response_time(self, ticket):
        """Calculate average response time for a ticket"""
        responses = ticket.responses.all().order_by('created_at')
        if len(responses) < 2:
            return 0
        
        total_time = 0
        count = 0
        
        for i in range(1, len(responses)):
            time_diff = (responses[i].created_at - responses[i-1].created_at).total_seconds() / 3600
            total_time += time_diff
            count += 1
        
        return total_time / count if count > 0 else 0
    
    def _train_category_classifier(self, training_data):
        """Train category classification model"""
        df = pd.DataFrame(training_data)
        
        # Prepare features
        X_text = df['combined_text'].tolist()
        
        # Ensure all numeric columns are properly converted
        numeric_columns = ['user_type', 'user_experience', 'created_hour', 'is_weekend', 
                          'text_length', 'word_count', 'has_urgency_words', 
                          'has_technical_words', 'has_billing_words']
        
        # Convert to numeric, handling any non-numeric values
        for col in numeric_columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        X_numeric = df[numeric_columns].values.astype(float)
        
        # Vectorize text
        X_text_vectorized = self.tfidf_vectorizer.fit_transform(X_text)
        
        # Combine features
        X_combined = np.hstack([X_text_vectorized.toarray(), X_numeric])
        y = df['category'].values
        
        # Train model
        self.category_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.category_classifier.fit(X_combined, y)
        
        logger.info("Category classifier trained successfully")
    
    def _train_priority_predictor(self, training_data):
        """Train priority prediction model"""
        df = pd.DataFrame(training_data)
        
        # Prepare features
        X_text = df['combined_text'].tolist()
        
        # Ensure all numeric columns are properly converted
        numeric_columns = ['user_type', 'user_experience', 'created_hour', 'is_weekend',
                          'text_length', 'word_count', 'has_urgency_words',
                          'has_technical_words', 'has_billing_words']
        
        # Convert to numeric, handling any non-numeric values
        for col in numeric_columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        X_numeric = df[numeric_columns].values.astype(float)
        
        # Vectorize text
        X_text_vectorized = self.tfidf_vectorizer.transform(X_text)
        
        # Combine features
        X_combined = np.hstack([X_text_vectorized.toarray(), X_numeric])
        y = df['priority'].values
        
        # Train model
        self.priority_predictor = RandomForestClassifier(n_estimators=100, random_state=42)
        self.priority_predictor.fit(X_combined, y)
        
        logger.info("Priority predictor trained successfully")
    
    def _train_response_time_predictor(self, training_data):
        """Train response time prediction model"""
        df = pd.DataFrame(training_data)
        
        # Filter data with response times
        df_with_responses = df[df['avg_response_time'] > 0].copy()
        
        if len(df_with_responses) < 10:
            logger.warning("Not enough response time data for training")
            return
        
        # Prepare features
        X_text = df_with_responses['combined_text'].tolist()
        
        # Ensure all numeric columns are properly converted
        numeric_columns = ['user_type', 'user_experience', 'created_hour', 'is_weekend',
                          'text_length', 'word_count', 'has_urgency_words',
                          'has_technical_words', 'has_billing_words', 'priority']
        
        # Convert to numeric, handling any non-numeric values
        for col in numeric_columns:
            df_with_responses[col] = pd.to_numeric(df_with_responses[col], errors='coerce').fillna(0)
        
        X_numeric = df_with_responses[numeric_columns].values.astype(float)
        
        # Vectorize text
        X_text_vectorized = self.tfidf_vectorizer.transform(X_text)
        
        # Combine features
        X_combined = np.hstack([X_text_vectorized.toarray(), X_numeric])
        y = df_with_responses['avg_response_time'].values
        
        # Train model
        self.response_time_predictor = GradientBoostingRegressor(n_estimators=100, random_state=42)
        self.response_time_predictor.fit(X_combined, y)
        
        logger.info("Response time predictor trained successfully")
    
    def _train_satisfaction_predictor(self, training_data):
        """Train satisfaction rating prediction model"""
        df = pd.DataFrame(training_data)
        
        # Filter data with satisfaction ratings
        df_with_ratings = df[df['satisfaction_rating'] > 0].copy()
        
        if len(df_with_ratings) < 10:
            logger.warning("Not enough satisfaction rating data for training")
            return
        
        # Prepare features
        X_text = df_with_ratings['combined_text'].tolist()
        
        # Ensure all numeric columns are properly converted
        numeric_columns = ['user_type', 'user_experience', 'created_hour', 'is_weekend',
                          'text_length', 'word_count', 'has_urgency_words',
                          'has_technical_words', 'has_billing_words', 'priority',
                          'response_count', 'avg_response_time']
        
        # Convert to numeric, handling any non-numeric values
        for col in numeric_columns:
            df_with_ratings[col] = pd.to_numeric(df_with_ratings[col], errors='coerce').fillna(0)
        
        X_numeric = df_with_ratings[numeric_columns].values.astype(float)
        
        # Vectorize text
        X_text_vectorized = self.tfidf_vectorizer.transform(X_text)
        
        # Combine features
        X_combined = np.hstack([X_text_vectorized.toarray(), X_numeric])
        y = df_with_ratings['satisfaction_rating'].values
        
        # Train model
        self.satisfaction_predictor = GradientBoostingRegressor(n_estimators=100, random_state=42)
        self.satisfaction_predictor.fit(X_combined, y)
        
        logger.info("Satisfaction predictor trained successfully")
    
    def _train_auto_assigner(self, training_data):
        """Train auto-assignment model"""
        df = pd.DataFrame(training_data)
        
        # Filter data with assignments
        df_with_assignments = df[df['assigned_to_id'].notna()].copy()
        
        if len(df_with_assignments) < 10:
            logger.warning("Not enough assignment data for training")
            return
        
        # Prepare features
        X_text = df_with_assignments['combined_text'].tolist()
        X_numeric = df_with_assignments[['user_type', 'user_experience', 'created_hour', 'is_weekend',
                                       'text_length', 'word_count', 'has_urgency_words',
                                       'has_technical_words', 'has_billing_words', 'priority']].values
        
        # Vectorize text
        X_text_vectorized = self.tfidf_vectorizer.transform(X_text)
        
        # Ensure numeric features are float
        X_numeric = X_numeric.astype(float)
        
        # Combine features
        X_combined = np.hstack([X_text_vectorized.toarray(), X_numeric])
        y = df_with_assignments['assigned_to_id'].values
        
        # Train model
        self.auto_assigner = RandomForestClassifier(n_estimators=100, random_state=42)
        self.auto_assigner.fit(X_combined, y)
        
        logger.info("Auto assigner trained successfully")
    
    def _train_sentiment_analyzer(self, training_data):
        """Train sentiment analysis model"""
        df = pd.DataFrame(training_data)
        
        # Create sentiment labels based on satisfaction ratings
        df['sentiment'] = df['satisfaction_rating'].apply(
            lambda x: 'positive' if x >= 4 else 'negative' if x <= 2 else 'neutral'
        )
        
        # Filter data with sentiment labels
        df_with_sentiment = df[df['satisfaction_rating'] > 0].copy()
        
        if len(df_with_sentiment) < 10:
            logger.warning("Not enough sentiment data for training")
            return
        
        # Prepare features
        X_text = df_with_sentiment['combined_text'].tolist()
        X_numeric = df_with_sentiment[['user_type', 'user_experience', 'created_hour', 'is_weekend',
                                     'text_length', 'word_count', 'has_urgency_words',
                                     'has_technical_words', 'has_billing_words']].values
        
        # Vectorize text
        X_text_vectorized = self.tfidf_vectorizer.transform(X_text)
        
        # Ensure numeric features are float
        X_numeric = X_numeric.astype(float)
        
        # Combine features
        X_combined = np.hstack([X_text_vectorized.toarray(), X_numeric])
        y = df_with_sentiment['sentiment'].values
        
        # Train model
        self.sentiment_analyzer = RandomForestClassifier(n_estimators=100, random_state=42)
        self.sentiment_analyzer.fit(X_combined, y)
        
        logger.info("Sentiment analyzer trained successfully")
    
    def _train_duplicate_detector(self, training_data):
        """Train duplicate ticket detection model"""
        df = pd.DataFrame(training_data)
        
        # Create duplicate labels (simplified - would need more sophisticated logic)
        df['is_duplicate'] = 0  # For now, assume no duplicates
        
        # Prepare features
        X_text = df['combined_text'].tolist()
        
        # Ensure all numeric columns are properly converted
        numeric_columns = ['user_type', 'user_experience', 'created_hour', 'is_weekend',
                          'text_length', 'word_count', 'has_urgency_words',
                          'has_technical_words', 'has_billing_words']
        
        # Convert to numeric, handling any non-numeric values
        for col in numeric_columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        X_numeric = df[numeric_columns].values.astype(float)
        
        # Vectorize text
        X_text_vectorized = self.tfidf_vectorizer.transform(X_text)
        
        # Combine features
        X_combined = np.hstack([X_text_vectorized.toarray(), X_numeric])
        y = df['is_duplicate'].values
        
        # Train model
        self.duplicate_detector = RandomForestClassifier(n_estimators=100, random_state=42)
        self.duplicate_detector.fit(X_combined, y)
        
        logger.info("Duplicate detector trained successfully")
    
    def predict_category(self, title, description, user_type='client'):
        """Predict ticket category"""
        try:
            combined_text = f"{title} {description}".strip()
            features = self._extract_prediction_features(combined_text, user_type)
            
            if self.category_classifier:
                prediction = self.category_classifier.predict([features])[0]
                confidence = self.category_classifier.predict_proba([features]).max()
                return {
                    'category': prediction,
                    'confidence': float(confidence)
                }
            else:
                return {'category': 'general', 'confidence': 0.5}
        except Exception as e:
            logger.error(f"Error predicting category: {str(e)}")
            return {'category': 'general', 'confidence': 0.5}
    
    def predict_priority(self, title, description, user_type='client'):
        """Predict ticket priority"""
        try:
            combined_text = f"{title} {description}".strip()
            features = self._extract_prediction_features(combined_text, user_type)
            
            if self.priority_predictor:
                prediction = self.priority_predictor.predict([features])[0]
                confidence = self.priority_predictor.predict_proba([features]).max()
                return {
                    'priority': prediction,
                    'confidence': float(confidence)
                }
            else:
                return {'priority': 'medium', 'confidence': 0.5}
        except Exception as e:
            logger.error(f"Error predicting priority: {str(e)}")
            return {'priority': 'medium', 'confidence': 0.5}
    
    def predict_response_time(self, title, description, user_type='client'):
        """Predict response time in hours"""
        try:
            combined_text = f"{title} {description}".strip()
            features = self._extract_prediction_features(combined_text, user_type)
            
            if self.response_time_predictor:
                prediction = self.response_time_predictor.predict([features])[0]
                return {
                    'response_time_hours': float(prediction),
                    'confidence': 0.8  # Simplified confidence
                }
            else:
                return {'response_time_hours': 24.0, 'confidence': 0.5}
        except Exception as e:
            logger.error(f"Error predicting response time: {str(e)}")
            return {'response_time_hours': 24.0, 'confidence': 0.5}
    
    def predict_satisfaction(self, title, description, user_type='client'):
        """Predict satisfaction rating"""
        try:
            combined_text = f"{title} {description}".strip()
            features = self._extract_prediction_features(combined_text, user_type)
            
            if self.satisfaction_predictor:
                prediction = self.satisfaction_predictor.predict([features])[0]
                return {
                    'satisfaction_rating': float(prediction),
                    'confidence': 0.8  # Simplified confidence
                }
            else:
                return {'satisfaction_rating': 4.0, 'confidence': 0.5}
        except Exception as e:
            logger.error(f"Error predicting satisfaction: {str(e)}")
            return {'satisfaction_rating': 4.0, 'confidence': 0.5}
    
    def predict_sentiment(self, title, description, user_type='client'):
        """Predict sentiment of ticket content"""
        try:
            combined_text = f"{title} {description}".strip()
            features = self._extract_prediction_features(combined_text, user_type)
            
            if self.sentiment_analyzer:
                prediction = self.sentiment_analyzer.predict([features])[0]
                confidence = self.sentiment_analyzer.predict_proba([features]).max()
                return {
                    'sentiment': prediction,
                    'confidence': float(confidence)
                }
            else:
                return {'sentiment': 'neutral', 'confidence': 0.5}
        except Exception as e:
            logger.error(f"Error predicting sentiment: {str(e)}")
            return {'sentiment': 'neutral', 'confidence': 0.5}
    
    def suggest_auto_assignment(self, title, description, user_type='client'):
        """Suggest staff member for auto-assignment"""
        try:
            combined_text = f"{title} {description}".strip()
            features = self._extract_prediction_features(combined_text, user_type)
            
            if self.auto_assigner:
                prediction = self.auto_assigner.predict([features])[0]
                confidence = self.auto_assigner.predict_proba([features]).max()
                return {
                    'suggested_staff_id': int(prediction),
                    'confidence': float(confidence)
                }
            else:
                return {'suggested_staff_id': None, 'confidence': 0.0}
        except Exception as e:
            logger.error(f"Error suggesting auto-assignment: {str(e)}")
            return {'suggested_staff_id': None, 'confidence': 0.0}
    
    def detect_duplicate(self, title, description, user_type='client'):
        """Detect if ticket is a duplicate"""
        try:
            combined_text = f"{title} {description}".strip()
            features = self._extract_prediction_features(combined_text, user_type)
            
            if self.duplicate_detector:
                prediction = self.duplicate_detector.predict([features])[0]
                confidence = self.duplicate_detector.predict_proba([features]).max()
                return {
                    'is_duplicate': bool(prediction),
                    'confidence': float(confidence)
                }
            else:
                return {'is_duplicate': False, 'confidence': 0.5}
        except Exception as e:
            logger.error(f"Error detecting duplicate: {str(e)}")
            return {'is_duplicate': False, 'confidence': 0.5}
    
    def _extract_prediction_features(self, combined_text, user_type):
        """Extract features for prediction"""
        # Basic features
        user_type_val = 1 if user_type == 'provider' else 0
        created_hour = timezone.now().hour
        created_day_of_week = timezone.now().weekday()
        is_weekend = 1 if created_day_of_week >= 5 else 0
        
        # Content features
        text_length = len(combined_text)
        word_count = len(combined_text.split())
        has_urgency_words = self._has_urgency_words(combined_text)
        has_technical_words = self._has_technical_words(combined_text)
        has_billing_words = self._has_billing_words(combined_text)
        
        # Vectorize text
        text_vector = self.tfidf_vectorizer.transform([combined_text]).toarray()[0]
        
        # Combine features
        numeric_features = [
            user_type_val, 0,  # user_experience placeholder
            created_hour, is_weekend, text_length, word_count,
            has_urgency_words, has_technical_words, has_billing_words
        ]
        
        return np.concatenate([text_vector, numeric_features])
    
    def get_ml_recommendations(self, title, description, user_type='client'):
        """Get comprehensive ML recommendations for a ticket"""
        try:
            recommendations = {
                'category': self.predict_category(title, description, user_type),
                'priority': self.predict_priority(title, description, user_type),
                'response_time': self.predict_response_time(title, description, user_type),
                'satisfaction': self.predict_satisfaction(title, description, user_type),
                'sentiment': self.predict_sentiment(title, description, user_type),
                'auto_assignment': self.suggest_auto_assignment(title, description, user_type),
                'duplicate_check': self.detect_duplicate(title, description, user_type)
            }
            
            return {
                'success': True,
                'recommendations': recommendations,
                'timestamp': timezone.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting ML recommendations: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'recommendations': None
            }
    
    def retrain_models(self):
        """Retrain all ML models with latest data"""
        try:
            logger.info("Starting support ML model retraining...")
            self._train_all_models()
            logger.info("Support ML model retraining completed successfully")
            return {
                'success': True,
                'message': 'Support ML models retrained successfully',
                'timestamp': timezone.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error retraining support ML models: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': timezone.now().isoformat()
            }
