"""
Provider Behavior ML Service

This service analyzes provider behavior patterns to improve lead matching
and identify problematic providers who unlock leads but don't follow through.
"""

import logging
import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
from datetime import datetime, timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
import joblib
import os

from backend.leads.models import Lead, LeadAssignment
from backend.users.models import User, ProviderProfile, LeadUnlock

User = get_user_model()
logger = logging.getLogger(__name__)


class ProviderBehaviorML:
    """
    ML service for analyzing provider behavior patterns and predicting follow-through rates
    """
    
    def __init__(self):
        self.models_dir = '/home/paas/work_platform/backend/models'
        self.scaler = StandardScaler()
        self.follow_through_model = None
        self.quality_model = None
        self.is_trained = False
        
        # Create models directory if it doesn't exist
        os.makedirs(self.models_dir, exist_ok=True)
    
    def collect_provider_behavior_data(self, days_back: int = 90) -> pd.DataFrame:
        """Collect comprehensive provider behavior data for ML training"""
        logger.info(f"Collecting provider behavior data from last {days_back} days")
        
        cutoff_date = timezone.now() - timedelta(days=days_back)
        
        # Get all providers with activity in the period
        providers = User.objects.filter(
            user_type='provider',
            lead_assignments__assigned_at__gte=cutoff_date
        ).select_related('provider_profile').prefetch_related(
            'lead_assignments',
            'leadunlock_set'
        ).distinct()
        
        behavior_data = []
        
        for provider in providers:
            # Basic provider features
            provider_features = self._extract_provider_features(provider)
            
            # Assignment behavior features
            assignment_features = self._extract_assignment_features(provider, cutoff_date)
            
            # Unlock behavior features
            unlock_features = self._extract_unlock_features(provider, cutoff_date)
            
            # Follow-through behavior features
            follow_through_features = self._extract_follow_through_features(provider, cutoff_date)
            
            # Quality indicators
            quality_features = self._extract_quality_features(provider, cutoff_date)
            
            # Combine all features
            features = {
                **provider_features,
                **assignment_features,
                **unlock_features,
                **follow_through_features,
                **quality_features
            }
            
            behavior_data.append(features)
        
        df = pd.DataFrame(behavior_data)
        logger.info(f"Collected {len(df)} provider behavior samples")
        return df
    
    def _extract_provider_features(self, provider: User) -> Dict:
        """Extract basic provider profile features"""
        profile = getattr(provider, 'provider_profile', None)
        
        return {
            'provider_id': str(provider.id),
            'email': provider.email,
            'registration_days': (timezone.now() - provider.date_joined).days,
            'has_profile': profile is not None,
            'verification_status': profile.verification_status if profile else 'unverified',
            'subscription_tier': profile.subscription_tier if profile else 'none',
            'credit_balance': profile.credit_balance if profile else 0,
            'average_rating': float(profile.average_rating) if profile else 0,
            'total_reviews': profile.total_reviews if profile else 0,
            'service_categories_count': len(profile.service_categories) if profile and profile.service_categories else 0,
            'service_areas_count': len(profile.service_areas) if profile and profile.service_areas else 0,
        }
    
    def _extract_assignment_features(self, provider: User, cutoff_date: datetime) -> Dict:
        """Extract lead assignment behavior features"""
        assignments = LeadAssignment.objects.filter(
            provider=provider,
            assigned_at__gte=cutoff_date
        ).select_related('lead', 'lead__service_category')
        
        if not assignments.exists():
            return {
                'total_assignments': 0,
                'avg_response_time_hours': 0,
                'assignment_frequency': 0,
                'service_category_diversity': 0,
                'location_diversity': 0,
            }
        
        # Calculate response times
        response_times = []
        for assignment in assignments:
            if assignment.viewed_at:
                response_time = (assignment.viewed_at - assignment.assigned_at).total_seconds() / 3600
                response_times.append(response_time)
        
        # Calculate diversity metrics
        service_categories = set(assignment.lead.service_category.name for assignment in assignments)
        locations = set(f"{assignment.lead.location_city}" for assignment in assignments)
        
        return {
            'total_assignments': assignments.count(),
            'avg_response_time_hours': np.mean(response_times) if response_times else 0,
            'assignment_frequency': assignments.count() / ((timezone.now() - cutoff_date).days + 1),
            'service_category_diversity': len(service_categories),
            'location_diversity': len(locations),
        }
    
    def _extract_unlock_features(self, provider: User, cutoff_date: datetime) -> Dict:
        """Extract lead unlock behavior features"""
        unlocks = LeadUnlock.objects.filter(
            user=provider,
            unlocked_at__gte=cutoff_date
        )
        
        if not unlocks.exists():
            return {
                'total_unlocks': 0,
                'unlock_frequency': 0,
                'avg_credits_per_unlock': 0,
                'total_credits_spent': 0,
                'unlock_pattern_score': 0,
            }
        
        # Analyze unlock patterns
        unlock_times = [unlock.unlocked_at for unlock in unlocks]
        unlock_intervals = []
        for i in range(1, len(unlock_times)):
            interval = (unlock_times[i] - unlock_times[i-1]).total_seconds() / 3600
            unlock_intervals.append(interval)
        
        # Pattern score based on consistency
        pattern_score = 100 if not unlock_intervals else max(0, 100 - np.std(unlock_intervals))
        
        return {
            'total_unlocks': unlocks.count(),
            'unlock_frequency': unlocks.count() / ((timezone.now() - cutoff_date).days + 1),
            'avg_credits_per_unlock': np.mean([unlock.credits_spent for unlock in unlocks]),
            'total_credits_spent': sum(unlock.credits_spent for unlock in unlocks),
            'unlock_pattern_score': pattern_score,
        }
    
    def _extract_follow_through_features(self, provider: User, cutoff_date: datetime) -> Dict:
        """Extract follow-through behavior features"""
        assignments = LeadAssignment.objects.filter(
            provider=provider,
            assigned_at__gte=cutoff_date
        )
        
        if not assignments.exists():
            return {
                'follow_through_rate': 0,
                'contact_rate': 0,
                'quote_rate': 0,
                'win_rate': 0,
                'avg_time_to_contact_hours': 0,
                'abandonment_rate': 0,
            }
        
        # Calculate follow-through metrics
        total_purchased = assignments.filter(status='purchased').count()
        total_contacted = assignments.filter(status='contacted').count()
        total_quoted = assignments.filter(status='quoted').count()
        total_won = assignments.filter(status='won').count()
        total_unlocked = assignments.filter(purchased_at__isnull=False).count()
        
        # Calculate time to contact
        contact_times = []
        for assignment in assignments.filter(contacted_at__isnull=False):
            if assignment.purchased_at:
                time_to_contact = (assignment.contacted_at - assignment.purchased_at).total_seconds() / 3600
                contact_times.append(time_to_contact)
        
        # Calculate abandonment rate (unlocked but never contacted)
        abandoned = assignments.filter(
            purchased_at__isnull=False,
            contacted_at__isnull=True
        ).count()
        
        return {
            'follow_through_rate': (total_contacted / total_unlocked * 100) if total_unlocked > 0 else 0,
            'contact_rate': (total_contacted / assignments.count() * 100) if assignments.count() > 0 else 0,
            'quote_rate': (total_quoted / assignments.count() * 100) if assignments.count() > 0 else 0,
            'win_rate': (total_won / assignments.count() * 100) if assignments.count() > 0 else 0,
            'avg_time_to_contact_hours': np.mean(contact_times) if contact_times else 0,
            'abandonment_rate': (abandoned / total_unlocked * 100) if total_unlocked > 0 else 0,
        }
    
    def _extract_quality_features(self, provider: User, cutoff_date: datetime) -> Dict:
        """Extract quality indicators and risk factors"""
        assignments = LeadAssignment.objects.filter(
            provider=provider,
            assigned_at__gte=cutoff_date
        )
        
        if not assignments.exists():
            return {
                'quality_score': 0,
                'risk_score': 0,
                'reliability_score': 0,
                'engagement_score': 0,
            }
        
        # Calculate quality metrics
        total_assignments = assignments.count()
        successful_interactions = assignments.filter(
            status__in=['contacted', 'quoted', 'won']
        ).count()
        
        # Risk factors
        high_abandonment = assignments.filter(
            purchased_at__isnull=False,
            contacted_at__isnull=True,
            purchased_at__lt=timezone.now() - timedelta(days=2)
        ).count()
        
        # Engagement metrics
        recent_activity = assignments.filter(
            assigned_at__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        # Calculate scores
        quality_score = (successful_interactions / total_assignments * 100) if total_assignments > 0 else 0
        risk_score = (high_abandonment / total_assignments * 100) if total_assignments > 0 else 0
        reliability_score = max(0, 100 - risk_score)
        engagement_score = min(100, recent_activity * 20)  # Recent activity bonus
        
        return {
            'quality_score': quality_score,
            'risk_score': risk_score,
            'reliability_score': reliability_score,
            'engagement_score': engagement_score,
        }
    
    def train_follow_through_model(self, training_data: pd.DataFrame) -> Dict:
        """Train ML model to predict provider follow-through rates"""
        logger.info("Training provider follow-through prediction model")
        
        # Prepare features and target
        feature_columns = [
            'registration_days', 'credit_balance', 'total_assignments',
            'assignment_frequency', 'total_unlocks', 'unlock_frequency',
            'service_category_diversity', 'location_diversity',
            'unlock_pattern_score', 'avg_response_time_hours'
        ]
        
        X = training_data[feature_columns].fillna(0)
        y = training_data['follow_through_rate']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.follow_through_model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=6,
            random_state=42
        )
        
        # Convert to classification (good vs poor follow-through)
        y_train_class = (y_train >= 50).astype(int)
        y_test_class = (y_test >= 50).astype(int)
        
        self.follow_through_model.fit(X_train_scaled, y_train_class)
        
        # Evaluate
        y_pred = self.follow_through_model.predict(X_test_scaled)
        
        # Cross-validation
        cv_scores = cross_val_score(
            self.follow_through_model, X_train_scaled, y_train_class, cv=5
        )
        
        results = {
            'model_type': 'follow_through_classifier',
            'accuracy': self.follow_through_model.score(X_test_scaled, y_test_class),
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'classification_report': classification_report(y_test_class, y_pred, output_dict=True),
            'confusion_matrix': confusion_matrix(y_test_class, y_pred).tolist(),
            'feature_importance': dict(zip(feature_columns, self.follow_through_model.feature_importances_))
        }
        
        logger.info(f"Follow-through model trained: {results['accuracy']:.3f} accuracy")
        return results
    
    def train_quality_model(self, training_data: pd.DataFrame) -> Dict:
        """Train ML model to predict provider quality scores"""
        logger.info("Training provider quality prediction model")
        
        # Prepare features and target
        feature_columns = [
            'registration_days', 'credit_balance', 'total_assignments',
            'follow_through_rate', 'contact_rate', 'quote_rate', 'win_rate',
            'abandonment_rate', 'avg_time_to_contact_hours',
            'service_category_diversity', 'location_diversity'
        ]
        
        X = training_data[feature_columns].fillna(0)
        y = training_data['quality_score']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.quality_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        # Convert to classification (high vs low quality)
        y_train_class = (y_train >= 70).astype(int)
        y_test_class = (y_test >= 70).astype(int)
        
        self.quality_model.fit(X_train_scaled, y_train_class)
        
        # Evaluate
        y_pred = self.quality_model.predict(X_test_scaled)
        
        results = {
            'model_type': 'quality_classifier',
            'accuracy': self.quality_model.score(X_test_scaled, y_test_class),
            'classification_report': classification_report(y_test_class, y_pred, output_dict=True),
            'feature_importance': dict(zip(feature_columns, self.quality_model.feature_importances_))
        }
        
        logger.info(f"Quality model trained: {results['accuracy']:.3f} accuracy")
        return results
    
    def train_all_models(self, days_back: int = 90) -> Dict:
        """Train all provider behavior ML models"""
        logger.info("Starting provider behavior ML model training")
        
        # Collect training data
        training_data = self.collect_provider_behavior_data(days_back)
        
        if len(training_data) < 20:
            logger.warning(f"Not enough provider data for training: {len(training_data)} samples")
            return {'error': 'Insufficient training data', 'samples': len(training_data)}
        
        # Filter out providers with no activity
        training_data = training_data[training_data['total_assignments'] > 0]
        
        if len(training_data) < 10:
            logger.warning(f"Not enough active providers for training: {len(training_data)} samples")
            return {'error': 'Insufficient active provider data', 'samples': len(training_data)}
        
        logger.info(f"Training with {len(training_data)} provider samples")
        
        # Train models
        follow_through_results = self.train_follow_through_model(training_data)
        quality_results = self.train_quality_model(training_data)
        
        # Save models
        self.save_models()
        
        # Mark as trained
        self.is_trained = True
        
        results = {
            'success': True,
            'samples_used': len(training_data),
            'follow_through_model': follow_through_results,
            'quality_model': quality_results,
            'training_date': timezone.now().isoformat()
        }
        
        logger.info("Provider behavior ML models trained successfully")
        return results
    
    def predict_provider_risk(self, provider_id: str) -> Dict:
        """Predict risk score for a specific provider"""
        if not self.is_trained:
            self.load_models()
        
        if not self.is_trained:
            return {'error': 'Models not trained'}
        
        try:
            provider = User.objects.get(id=provider_id)
            provider_data = self.collect_provider_behavior_data(days_back=30)
            
            # Find provider in data
            provider_row = provider_data[provider_data['provider_id'] == provider_id]
            
            if provider_row.empty:
                return {'error': 'Provider not found in recent data'}
            
            # Prepare features
            feature_columns = [
                'registration_days', 'credit_balance', 'total_assignments',
                'assignment_frequency', 'total_unlocks', 'unlock_frequency',
                'service_category_diversity', 'location_diversity',
                'unlock_pattern_score', 'avg_response_time_hours'
            ]
            
            X = provider_row[feature_columns].fillna(0)
            X_scaled = self.scaler.transform(X)
            
            # Predict
            follow_through_prob = self.follow_through_model.predict_proba(X_scaled)[0]
            quality_prob = self.quality_model.predict_proba(X_scaled)[0]
            
            # Calculate risk score
            risk_score = (1 - follow_through_prob[1]) * 100  # Inverse of good follow-through probability
            
            return {
                'provider_id': provider_id,
                'provider_email': provider.email,
                'risk_score': risk_score,
                'follow_through_probability': follow_through_prob[1],
                'quality_probability': quality_prob[1],
                'recommendation': 'high_risk' if risk_score > 70 else 'medium_risk' if risk_score > 40 else 'low_risk'
            }
            
        except Exception as e:
            logger.error(f"Error predicting provider risk: {str(e)}")
            return {'error': str(e)}
    
    def get_problematic_providers(self, min_assignments: int = 5, risk_threshold: float = 70.0) -> List[Dict]:
        """Get list of problematic providers based on ML predictions"""
        if not self.is_trained:
            self.load_models()
        
        if not self.is_trained:
            return []
        
        # Get recent provider data
        provider_data = self.collect_provider_behavior_data(days_back=30)
        provider_data = provider_data[provider_data['total_assignments'] >= min_assignments]
        
        problematic_providers = []
        
        for _, row in provider_data.iterrows():
            risk_prediction = self.predict_provider_risk(row['provider_id'])
            
            if 'error' not in risk_prediction and risk_prediction['risk_score'] >= risk_threshold:
                problematic_providers.append({
                    'provider_id': row['provider_id'],
                    'provider_email': row['email'],
                    'risk_score': risk_prediction['risk_score'],
                    'follow_through_rate': row['follow_through_rate'],
                    'abandonment_rate': row['abandonment_rate'],
                    'total_unlocks': row['total_unlocks'],
                    'total_assignments': row['total_assignments'],
                    'recommendation': risk_prediction['recommendation']
                })
        
        # Sort by risk score
        problematic_providers.sort(key=lambda x: x['risk_score'], reverse=True)
        
        return problematic_providers
    
    def save_models(self):
        """Save trained models to disk"""
        if self.follow_through_model:
            joblib.dump(
                self.follow_through_model,
                os.path.join(self.models_dir, 'provider_follow_through_model.pkl')
            )
        
        if self.quality_model:
            joblib.dump(
                self.quality_model,
                os.path.join(self.models_dir, 'provider_quality_model.pkl')
            )
        
        joblib.dump(
            self.scaler,
            os.path.join(self.models_dir, 'provider_behavior_scaler.pkl')
        )
        
        logger.info("Provider behavior models saved")
    
    def load_models(self):
        """Load trained models from disk"""
        try:
            self.follow_through_model = joblib.load(
                os.path.join(self.models_dir, 'provider_follow_through_model.pkl')
            )
            self.quality_model = joblib.load(
                os.path.join(self.models_dir, 'provider_quality_model.pkl')
            )
            self.scaler = joblib.load(
                os.path.join(self.models_dir, 'provider_behavior_scaler.pkl')
            )
            self.is_trained = True
            logger.info("Provider behavior models loaded successfully")
        except FileNotFoundError:
            logger.warning("Provider behavior models not found - need to train first")
            self.is_trained = False
