"""
Client Behavior Learning for Lead Distribution
ML system to predict lead conversion probability and optimize distribution
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q, Count, Avg, Max
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, precision_recall_curve
import joblib
import logging

from backend.leads.models import Lead, LeadAssignment
from backend.users.models import User, ProviderProfile

logger = logging.getLogger(__name__)

class ClientBehaviorML:
    """ML system for predicting lead conversion probability"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = []
        self.is_trained = False
        
    def collect_training_data(self, days_back: int = 90) -> pd.DataFrame:
        """Collect training data from the last N days"""
        logger.info(f"Collecting training data from last {days_back} days")
        
        cutoff_date = timezone.now() - timedelta(days=days_back)
        
        # Get all leads from the period
        leads = Lead.objects.filter(
            created_at__gte=cutoff_date
        ).select_related('client', 'service_category').prefetch_related(
            'assignments__provider__provider_profile'
        )
        
        training_data = []
        
        for lead in leads:
            # Basic lead features
            lead_features = self._extract_lead_features(lead)
            
            # Client engagement features
            client_features = self._extract_client_features(lead.client)
            
            # Provider interaction features
            interaction_features = self._extract_interaction_features(lead)
            
            # Outcome (converted or not)
            outcome = self._determine_conversion(lead)
            
            # Combine all features
            features = {
                **lead_features,
                **client_features,
                **interaction_features,
                'converted': outcome
            }
            
            training_data.append(features)
        
        df = pd.DataFrame(training_data)
        logger.info(f"Collected {len(df)} training samples")
        return df
    
    def _extract_lead_features(self, lead: Lead) -> Dict:
        """Extract features from lead data"""
        return {
            'category_id': lead.service_category.id,
            'description_length': len(lead.description.split()) if lead.description else 0,
            'budget_range_numeric': self._budget_to_numeric(lead.budget_range),
            'urgency_numeric': self._urgency_to_numeric(lead.urgency),
            'has_location': 1 if lead.latitude and lead.longitude else 0,
            'time_of_day': lead.created_at.hour,
            'day_of_week': lead.created_at.weekday(),
            'is_weekend': 1 if lead.created_at.weekday() >= 5 else 0,
            'latitude': lead.latitude or 0,
            'longitude': lead.longitude or 0,
        }
    
    def _extract_client_features(self, client: User) -> Dict:
        """Extract client engagement features"""
        # Count previous requests
        total_requests = Lead.objects.filter(client=client).count()
        
        # Count completed jobs (leads that were accepted)
        completed_jobs = LeadAssignment.objects.filter(
            lead__client=client,
            status='accepted'
        ).count()
        
        # Calculate engagement score
        engagement_score = self._calculate_engagement_score(client)
        
        # Time since last request
        last_request = Lead.objects.filter(client=client).order_by('-created_at').first()
        days_since_last = (timezone.now() - last_request.created_at).days if last_request else 999
        
        return {
            'total_requests': total_requests,
            'completed_jobs': completed_jobs,
            'conversion_rate': completed_jobs / max(total_requests, 1),
            'engagement_score': engagement_score,
            'days_since_last_request': days_since_last,
            'is_new_client': 1 if total_requests <= 1 else 0,
        }
    
    def _extract_interaction_features(self, lead: Lead) -> Dict:
        """Extract provider interaction features"""
        assignments = lead.assignments.all()
        
        if not assignments.exists():
            return {
                'num_providers_assigned': 0,
                'avg_response_time_hours': 999,
                'min_distance_km': 999,
                'max_distance_km': 999,
                'providers_within_25km': 0,
            }
        
        # Calculate response times
        response_times = []
        distances = []
        
        for assignment in assignments:
            if assignment.assigned_at and assignment.viewed_at:
                response_time = (assignment.viewed_at - assignment.assigned_at).total_seconds() / 3600
                response_times.append(response_time)
            
            if hasattr(assignment.provider, 'provider_profile') and assignment.provider.provider_profile and lead.latitude and lead.longitude:
                distance = self._calculate_distance(
                    lead.latitude, lead.longitude,
                    assignment.provider.latitude or 0,
                    assignment.provider.longitude or 0
                )
                distances.append(distance)
        
        return {
            'num_providers_assigned': len(assignments),
            'avg_response_time_hours': np.mean(response_times) if response_times else 999,
            'min_distance_km': min(distances) if distances else 999,
            'max_distance_km': max(distances) if distances else 999,
            'providers_within_25km': sum(1 for d in distances if d <= 25),
        }
    
    def _determine_conversion(self, lead: Lead) -> int:
        """Determine if a lead was converted (client hired a provider)"""
        # A lead is converted if any assignment was won
        return 1 if lead.assignments.filter(status='won').exists() else 0
    
    def _calculate_engagement_score(self, client: User) -> float:
        """Calculate client engagement score (0-100)"""
        # Base score
        score = 50.0
        
        # Factor in total requests
        total_requests = Lead.objects.filter(client=client).count()
        score += min(total_requests * 5, 30)  # Max 30 points for request frequency
        
        # Factor in completion rate
        completed = LeadAssignment.objects.filter(
            lead__client=client,
            status='won'
        ).count()
        completion_rate = completed / max(total_requests, 1)
        score += completion_rate * 20  # Max 20 points for completion rate
        
        return min(score, 100.0)
    
    def _budget_to_numeric(self, budget_range: str) -> int:
        """Convert budget range to numeric value"""
        budget_mapping = {
            'under_500': 250,
            '500_1000': 750,
            '1000_2500': 1750,
            '2500_5000': 3750,
            '5000_10000': 7500,
            'over_10000': 15000,
        }
        return budget_mapping.get(budget_range, 1000)
    
    def _urgency_to_numeric(self, urgency: str) -> int:
        """Convert urgency to numeric value"""
        urgency_mapping = {
            'low': 1,
            'medium': 2,
            'high': 3,
        }
        return urgency_mapping.get(urgency, 2)
    
    def _calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points using Haversine formula"""
        from math import radians, cos, sin, asin, sqrt
        
        # Convert decimal degrees to radians
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        r = 6371  # Radius of earth in kilometers
        return c * r
    
    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer additional features for ML model"""
        logger.info("Engineering features for ML model")
        
        # Budget buckets
        df['budget_low'] = (df['budget_range_numeric'] < 1000).astype(int)
        df['budget_medium'] = ((df['budget_range_numeric'] >= 1000) & 
                              (df['budget_range_numeric'] < 5000)).astype(int)
        df['budget_high'] = (df['budget_range_numeric'] >= 5000).astype(int)
        
        # Time buckets
        df['morning'] = ((df['time_of_day'] >= 6) & (df['time_of_day'] < 12)).astype(int)
        df['afternoon'] = ((df['time_of_day'] >= 12) & (df['time_of_day'] < 18)).astype(int)
        df['evening'] = ((df['time_of_day'] >= 18) & (df['time_of_day'] < 22)).astype(int)
        df['night'] = ((df['time_of_day'] >= 22) | (df['time_of_day'] < 6)).astype(int)
        
        # Distance features
        df['very_close'] = (df['min_distance_km'] <= 10).astype(int)
        df['close'] = ((df['min_distance_km'] > 10) & (df['min_distance_km'] <= 25)).astype(int)
        df['far'] = (df['min_distance_km'] > 25).astype(int)
        
        # Response time features
        df['quick_response'] = (df['avg_response_time_hours'] <= 2).astype(int)
        df['slow_response'] = (df['avg_response_time_hours'] > 24).astype(int)
        
        # Client behavior features
        df['high_engagement'] = (df['engagement_score'] >= 70).astype(int)
        df['returning_client'] = (df['total_requests'] > 1).astype(int)
        
        return df
    
    def train_model(self, df: pd.DataFrame) -> Dict:
        """Train the ML model"""
        logger.info("Training ML model for lead conversion prediction")
        
        # Prepare features and target
        feature_columns = [col for col in df.columns if col != 'converted']
        X = df[feature_columns].fillna(0)
        y = df['converted']
        
        # Store feature columns for later use
        self.feature_columns = feature_columns
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model (start with Logistic Regression for simplicity)
        self.model = LogisticRegression(random_state=42, max_iter=1000)
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred_proba = self.model.predict_proba(X_test_scaled)[:, 1]
        auc_score = roc_auc_score(y_test, y_pred_proba)
        
        self.is_trained = True
        
        logger.info(f"Model trained successfully. AUC Score: {auc_score:.3f}")
        
        return {
            'auc_score': auc_score,
            'train_samples': len(X_train),
            'test_samples': len(X_test),
            'feature_importance': dict(zip(feature_columns, self.model.coef_[0]))
        }
    
    def predict_conversion_probability(self, lead: Lead) -> float:
        """Predict conversion probability for a single lead"""
        if not self.is_trained:
            logger.warning("Model not trained, returning default probability")
            return 0.5
        
        # Extract features for this lead
        lead_features = self._extract_lead_features(lead)
        client_features = self._extract_client_features(lead.client)
        interaction_features = self._extract_interaction_features(lead)
        
        # Combine features
        features = {**lead_features, **client_features, **interaction_features}
        
        # Create DataFrame and engineer features
        df = pd.DataFrame([features])
        df = self.engineer_features(df)
        
        # Select and scale features
        X = df[self.feature_columns].fillna(0)
        X_scaled = self.scaler.transform(X)
        
        # Predict probability
        probability = self.model.predict_proba(X_scaled)[0, 1]
        
        return float(probability)
    
    def save_model(self, filepath: str):
        """Save the trained model"""
        if self.is_trained:
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'feature_columns': self.feature_columns,
                'is_trained': self.is_trained
            }
            joblib.dump(model_data, filepath)
            logger.info(f"Model saved to {filepath}")
    
    def load_model(self, filepath: str):
        """Load a trained model"""
        try:
            model_data = joblib.load(filepath)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_columns = model_data['feature_columns']
            self.is_trained = model_data['is_trained']
            logger.info(f"Model loaded from {filepath}")
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            self.is_trained = False
