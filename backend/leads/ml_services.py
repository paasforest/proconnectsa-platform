"""
Machine Learning services for lead analysis and prediction
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error
from django.db.models import Q
from .models import Lead, LeadAssignment, ServiceCategory
from backend.users.models import User
import logging
import joblib
import os
from django.conf import settings
import re
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class LeadQualityMLService:
    """ML service for predicting lead quality and conversion probability"""
    
    def __init__(self):
        self.quality_model = None
        self.conversion_model = None
        self.text_vectorizer = None
        self.scaler = None
        self.label_encoders = {}
        self.model_path = os.path.join(settings.BASE_DIR, 'ml_models')
        self.model_version = datetime.now().strftime('%Y%m%d%H%M%S')
        os.makedirs(self.model_path, exist_ok=True)
    
    def extract_features(self, lead_data):
        """Extract features for ML models"""
        features = {}
        
        # Text features
        features['title_length'] = len(lead_data.get('title', ''))
        features['description_length'] = len(lead_data.get('description', ''))
        features['title_word_count'] = len(lead_data.get('title', '').split())
        features['description_word_count'] = len(lead_data.get('description', '').split())
        
        # Contact quality features
        features['has_phone'] = 1 if lead_data.get('contact_phone') else 0
        features['has_email'] = 1 if lead_data.get('contact_email') else 0
        features['phone_length'] = len(lead_data.get('contact_phone', ''))
        features['email_has_domain'] = 1 if '@' in lead_data.get('contact_email', '') else 0
        
        # Location features
        features['has_address'] = 1 if lead_data.get('location_address') else 0
        features['has_suburb'] = 1 if lead_data.get('location_suburb') else 0
        features['has_city'] = 1 if lead_data.get('location_city') else 0
        features['address_length'] = len(lead_data.get('location_address', ''))
        
        # Budget features
        budget_range = lead_data.get('budget_range', 'no_budget')
        budget_mapping = {
            'under_1000': 500,
            '1000_5000': 3000,
            '5000_15000': 10000,
            '15000_50000': 32500,
            'over_50000': 75000,
            'no_budget': 0
        }
        features['budget_value'] = budget_mapping.get(budget_range, 0)
        features['has_budget'] = 1 if budget_range != 'no_budget' else 0
        
        # Urgency features
        urgency = lead_data.get('urgency', 'flexible')
        urgency_mapping = {
            'urgent': 4,
            'this_week': 3,
            'this_month': 2,
            'flexible': 1
        }
        features['urgency_score'] = urgency_mapping.get(urgency, 1)
        
        # Intent features
        hiring_intent = lead_data.get('hiring_intent', 'researching')
        intent_mapping = {
            'ready_to_hire': 4,
            'planning_to_hire': 3,
            'comparing_quotes': 2,
            'researching': 1
        }
        features['intent_score'] = intent_mapping.get(hiring_intent, 1)
        
        # Timeline features
        hiring_timeline = lead_data.get('hiring_timeline', 'flexible')
        timeline_mapping = {
            'asap': 4,
            'this_month': 3,
            'next_month': 2,
            'flexible': 1
        }
        features['timeline_score'] = timeline_mapping.get(hiring_timeline, 1)
        
        # Additional features
        features['has_special_requirements'] = 1 if lead_data.get('additional_requirements') else 0
        features['has_research_purpose'] = 1 if lead_data.get('research_purpose') else 0
        features['special_requirements_length'] = len(lead_data.get('additional_requirements', ''))
        
        # Time-based features
        now = datetime.now()
        features['hour_of_day'] = now.hour
        features['day_of_week'] = now.weekday()
        features['is_weekend'] = 1 if now.weekday() >= 5 else 0
        
        # Text quality features
        title = lead_data.get('title', '')
        description = lead_data.get('description', '')
        
        features['title_has_question'] = 1 if '?' in title else 0
        features['title_has_caps'] = 1 if any(c.isupper() for c in title) else 0
        features['description_has_question'] = 1 if '?' in description else 0
        features['description_has_caps'] = 1 if any(c.isupper() for c in description) else 0
        
        # Spam detection features
        features['title_spam_score'] = self._calculate_spam_score(title)
        features['description_spam_score'] = self._calculate_spam_score(description)

        # TF-IDF richness scalar if vectorizer is available
        try:
            if self.text_vectorizer is not None:
                text = f"{title} {description}".strip()
                if text:
                    vec = self.text_vectorizer.transform([text])
                    tfidf_norm = float(np.sqrt(vec.multiply(vec).sum()))
                else:
                    tfidf_norm = 0.0
                features['tfidf_norm'] = tfidf_norm
            else:
                features['tfidf_norm'] = 0.0
        except Exception:
            features['tfidf_norm'] = 0.0
        
        return features
    
    def _calculate_spam_score(self, text):
        """Calculate spam score for text"""
        if not text:
            return 0
        
        spam_indicators = [
            r'\b(urgent|asap|immediately|right now)\b',
            r'\b(cheap|affordable|budget)\b',
            r'\b(guaranteed|promise|sure)\b',
            r'[!]{2,}',
            r'[A-Z]{3,}',
            r'\b(free|no cost|gratis)\b'
        ]
        
        score = 0
        for pattern in spam_indicators:
            matches = len(re.findall(pattern, text.lower()))
            score += matches * 5
        
        return min(score, 100)
    
    def train_quality_model(self):
        """Train ML model for lead quality prediction"""
        try:
            min_leads = getattr(settings, 'ML_MIN_QUALITY_TRAINING_LEADS', 50)
            # Get historical lead data - use verified leads too if we don't have enough completed ones
            completed_leads = Lead.objects.filter(
                status__in=['completed', 'cancelled', 'expired']
            )
            
            # If we don't have enough completed leads, also include verified leads
            completed_count = completed_leads.count()
            if completed_count < min_leads:
                leads_qs = Lead.objects.filter(
                    status__in=['completed', 'cancelled', 'expired', 'verified']
                ).select_related('client')
            else:
                leads_qs = completed_leads.select_related('client')
            
            # Convert to list of dicts
            leads = list(leads_qs.values(
                'title', 'description', 'location_address', 'location_suburb', 
                'location_city', 'budget_range', 'urgency', 'hiring_intent',
                'hiring_timeline', 'additional_requirements', 'research_purpose',
                'verification_score', 'assigned_providers_count', 'total_provider_contacts', 
                'status', 'client__phone', 'client__email'
            ))
            
            logger.info(f"Using {len(leads)} leads for training (completed: {completed_count})")
            
            if len(leads) < min_leads:
                logger.warning(f"Not enough data to train quality model: {len(leads)} < {min_leads}")
                return False
            
            # Fit TF-IDF vectorizer on historical texts
            texts = [f"{l.get('title', '')} {l.get('description', '')}" for l in leads if l.get('title') or l.get('description')]
            if texts and len(texts) > 0:
                try:
                    self.text_vectorizer = TfidfVectorizer(
                        max_features=500,
                        ngram_range=(1, 2),
                        stop_words='english'
                    )
                    self.text_vectorizer.fit(texts)
                    logger.info(f"TF-IDF vectorizer fitted on {len(texts)} texts")
                except Exception as e:
                    logger.warning(f"TF-IDF vectorizer fit failed, proceeding without: {e}")
                    self.text_vectorizer = None
            else:
                logger.warning("No text data available for TF-IDF vectorizer")
                self.text_vectorizer = None

            # Prepare data
            X = []
            y = []
            
            for lead in leads:
                # Prepare lead data for feature extraction
                lead_data = {
                    'title': lead['title'],
                    'description': lead['description'],
                    'location_address': lead['location_address'],
                    'location_suburb': lead['location_suburb'],
                    'location_city': lead['location_city'],
                    'budget_range': lead['budget_range'],
                    'urgency': lead['urgency'],
                    'hiring_intent': lead['hiring_intent'],
                    'hiring_timeline': lead['hiring_timeline'],
                    'additional_requirements': lead['additional_requirements'],
                    'research_purpose': lead['research_purpose'],
                    'contact_phone': lead['client__phone'],
                    'contact_email': lead['client__email'],
                }
                
                try:
                    features = self.extract_features(lead_data)
                    if features and isinstance(features, dict):
                        X.append(list(features.values()))
                    else:
                        logger.warning(f"Skipping lead with invalid features: {lead.get('title', 'unknown')}")
                        continue
                except Exception as e:
                    logger.warning(f"Error extracting features for lead: {e}")
                    continue
                
                # Quality score based on outcomes
                if lead['status'] == 'completed':
                    quality_score = 100
                elif lead['status'] == 'verified':
                    # For verified leads, use verification_score as quality target
                    # Boost score if providers showed interest
                    base_score = lead['verification_score'] or 50
                    if lead['assigned_providers_count'] > 0:
                        quality_score = min(100, base_score + (lead['total_provider_contacts'] * 5))
                    else:
                        quality_score = base_score
                elif lead['assigned_providers_count'] > 0:
                    quality_score = 70 + (lead['total_provider_contacts'] * 5)
                else:
                    quality_score = lead['verification_score'] or 50
                
                y.append(quality_score)
            
            X = np.array(X)
            y = np.array(y)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train model
            self.quality_model = GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42
            )
            self.quality_model.fit(X_train_scaled, y_train)
            
            # Evaluate
            y_pred = self.quality_model.predict(X_test_scaled)
            mse = mean_squared_error(y_test, y_pred)
            logger.info(f"Quality model MSE: {mse}")
            
            # Save model
            # Versioned save
            joblib.dump(self.quality_model, 
                       os.path.join(self.model_path, f'lead_quality_model_{self.model_version}.pkl'))
            joblib.dump(self.scaler, 
                       os.path.join(self.model_path, f'lead_quality_scaler_{self.model_version}.pkl'))
            if self.text_vectorizer is not None:
                joblib.dump(self.text_vectorizer,
                           os.path.join(self.model_path, f'lead_quality_tfidf_{self.model_version}.pkl'))
            # Also update latest pointers
            joblib.dump(self.quality_model, 
                       os.path.join(self.model_path, 'lead_quality_model.pkl'))
            joblib.dump(self.scaler, 
                       os.path.join(self.model_path, 'lead_quality_scaler.pkl'))
            if self.text_vectorizer is not None:
                joblib.dump(self.text_vectorizer,
                           os.path.join(self.model_path, 'lead_quality_tfidf.pkl'))
            
            return True
            
        except Exception as e:
            logger.error(f"Error training quality model: {str(e)}")
            return False
    
    def predict_lead_quality(self, lead_data):
        """Predict lead quality score"""
        try:
            if not self.quality_model:
                self.load_models()
            
            if not self.quality_model:
                # Fallback to rule-based scoring
                return self._rule_based_quality_score(lead_data)
            
            features = self.extract_features(lead_data)
            X = np.array([list(features.values())])
            
            if self.scaler:
                X = self.scaler.transform(X)
            
            quality_score = self.quality_model.predict(X)[0]
            return max(0, min(100, quality_score))
            
        except Exception as e:
            logger.error(f"Error predicting lead quality: {str(e)}")
            return self._rule_based_quality_score(lead_data)
    
    def _rule_based_quality_score(self, lead_data):
        """Fallback rule-based quality scoring"""
        score = 0
        
        # Basic information (40 points)
        if len(lead_data.get('title', '')) > 20:
            score += 10
        if len(lead_data.get('description', '')) > 100:
            score += 15
        if len(lead_data.get('location_address', '')) > 20:
            score += 10
        if len(lead_data.get('contact_phone', '')) >= 10:
            score += 5
        
        # Intent and urgency (30 points)
        intent_score = {
            'ready_to_hire': 20,
            'planning_to_hire': 15,
            'comparing_quotes': 10,
            'researching': 5
        }.get(lead_data.get('hiring_intent', 'researching'), 5)
        score += intent_score
        
        urgency_score = {
            'urgent': 10,
            'this_week': 8,
            'this_month': 5,
            'flexible': 3
        }.get(lead_data.get('urgency', 'flexible'), 3)
        score += urgency_score
        
        # Budget and details (30 points)
        if lead_data.get('budget_range') != 'no_budget':
            score += 15
        if lead_data.get('additional_requirements'):
            score += 10
        if lead_data.get('research_purpose'):
            score += 5
        
        return min(score, 100)
    
    def load_models(self):
        """Load trained models"""
        try:
            quality_model_path = os.path.join(self.model_path, 'lead_quality_model.pkl')
            scaler_path = os.path.join(self.model_path, 'lead_quality_scaler.pkl')
            tfidf_path = os.path.join(self.model_path, 'lead_quality_tfidf.pkl')
            
            if os.path.exists(quality_model_path):
                self.quality_model = joblib.load(quality_model_path)
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
            if os.path.exists(tfidf_path):
                self.text_vectorizer = joblib.load(tfidf_path)
                
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")


class LeadConversionMLService:
    """ML service for predicting lead conversion probability"""
    
    def __init__(self):
        self.conversion_model = None
        self.model_path = os.path.join(settings.BASE_DIR, 'ml_models')
        self.model_version = datetime.now().strftime('%Y%m%d%H%M%S')
    
    def train_conversion_model(self):
        """Train model to predict lead conversion probability"""
        try:
            min_assignments = getattr(settings, 'ML_MIN_CONVERSION_TRAINING_ASSIGNMENTS', 30)
            # Get lead assignment data with outcomes
            assignments = LeadAssignment.objects.filter(
                status__in=['won', 'lost', 'no_response']
            ).select_related('lead', 'lead__client', 'provider', 'provider__provider_profile')
            
            if len(assignments) < min_assignments:
                logger.warning("Not enough assignment data to train conversion model")
                return False
            
            X = []
            y = []
            
            for assignment in assignments:
                # Lead features
                lead = assignment.lead
                features = {
                    'lead_quality_score': lead.verification_score,
                    'budget_value': self._get_budget_value(lead.budget_range),
                    'urgency_score': self._get_urgency_score(lead.urgency),
                    'intent_score': self._get_intent_score(lead.hiring_intent),
                    'description_length': len(lead.description),
                    'has_requirements': 1 if lead.additional_requirements else 0,
                }
                
                # Provider features
                provider = assignment.provider
                profile = provider.provider_profile
                features.update({
                    'provider_rating': float(profile.average_rating),
                    'provider_experience': profile.years_experience or 0,
                    'provider_credits': profile.credit_balance,
                    'subscription_tier': self._get_subscription_score(profile.subscription_tier),
                    'response_time': profile.response_time_hours,
                })
                
                # Assignment features
                features.update({
                    'assignment_hour': assignment.assigned_at.hour,
                    'assignment_day': assignment.assigned_at.weekday(),
                    'credit_cost': assignment.credit_cost,
                })
                
                X.append(list(features.values()))
                y.append(1 if assignment.won_job else 0)
            
            X = np.array(X)
            y = np.array(y)
            
            # Train model
            self.conversion_model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            self.conversion_model.fit(X, y)
            
            # Save model
            # Versioned save
            joblib.dump(self.conversion_model, 
                       os.path.join(self.model_path, f'conversion_model_{self.model_version}.pkl'))
            # Update latest pointer
            joblib.dump(self.conversion_model, 
                       os.path.join(self.model_path, 'conversion_model.pkl'))
            
            return True
            
        except Exception as e:
            logger.error(f"Error training conversion model: {str(e)}")
            return False
    
    def predict_conversion_probability(self, lead, provider):
        """Predict conversion probability for lead-provider pair"""
        try:
            if not self.conversion_model:
                self.load_conversion_model()
            
            if not self.conversion_model:
                return 0.5  # Default probability
            
            # Extract features
            features = {
                'lead_quality_score': lead.verification_score,
                'budget_value': self._get_budget_value(lead.budget_range),
                'urgency_score': self._get_urgency_score(lead.urgency),
                'intent_score': self._get_intent_score(lead.hiring_intent),
                'description_length': len(lead.description),
                'has_requirements': 1 if lead.additional_requirements else 0,
            }
            
            profile = provider.provider_profile
            features.update({
                'provider_rating': float(profile.average_rating),
                'provider_experience': profile.years_experience or 0,
                'provider_credits': profile.credit_balance,
                'subscription_tier': self._get_subscription_score(profile.subscription_tier),
                'response_time': profile.response_time_hours,
            })
            
            # Current assignment features
            now = datetime.now()
            features.update({
                'assignment_hour': now.hour,
                'assignment_day': now.weekday(),
                'credit_cost': 1,  # Default credit cost
            })
            
            X = np.array([list(features.values())])
            probability = self.conversion_model.predict_proba(X)[0][1]
            
            return probability
            
        except Exception as e:
            logger.error(f"Error predicting conversion: {str(e)}")
            return 0.5
    
    def _get_budget_value(self, budget_range):
        mapping = {
            'under_1000': 500,
            '1000_5000': 3000,
            '5000_15000': 10000,
            '15000_50000': 32500,
            'over_50000': 75000,
            'no_budget': 0
        }
        return mapping.get(budget_range, 0)
    
    def _get_urgency_score(self, urgency):
        mapping = {
            'urgent': 4,
            'this_week': 3,
            'this_month': 2,
            'flexible': 1
        }
        return mapping.get(urgency, 1)
    
    def _get_intent_score(self, intent):
        mapping = {
            'ready_to_hire': 4,
            'planning_to_hire': 3,
            'comparing_quotes': 2,
            'researching': 1
        }
        return mapping.get(intent, 1)
    
    def _get_subscription_score(self, tier):
        mapping = {
            'basic': 1,
            'premium': 2,
            'enterprise': 3
        }
        return mapping.get(tier, 1)
    
    def load_conversion_model(self):
        """Load trained conversion model"""
        try:
            model_path = os.path.join(self.model_path, 'conversion_model.pkl')
            if os.path.exists(model_path):
                self.conversion_model = joblib.load(model_path)
        except Exception as e:
            logger.error(f"Error loading conversion model: {str(e)}")


class DynamicPricingMLService:
    """ML service for dynamic credit pricing optimization"""
    
    def __init__(self):
        self.pricing_model = None
        self.model_path = os.path.join(settings.BASE_DIR, 'ml_models')
        self.use_ml = getattr(settings, 'USE_ML_PRICING', False)  # Only use ML in production
    
    def calculate_dynamic_lead_price(self, lead, provider):
        """Calculate dynamic lead price with ML fallback"""
        logger.info(f"🔍 DynamicPricingMLService: use_ml={self.use_ml}, lead_urgency={lead.urgency}, lead_budget={lead.budget_range}")
        
        if not self.use_ml:
            logger.info("🔍 Using simple pricing (ML disabled)")
            return self._calculate_simple_price(lead, provider)
        
        try:
            # ML pricing returns credits directly
            logger.info("🔍 Attempting ML pricing...")
            credits = self.calculate_optimal_credit_cost(lead, provider)
            result = {
                'price': credits,
                'reasoning': f"ML pricing: {credits} credits based on lead characteristics",
                'base_price': 50,
                'multiplier': credits
            }
            logger.info(f"🔍 ML pricing result: {result}")
            return result
        except Exception as e:
            logger.warning(f"ML pricing failed, using fallback: {str(e)}")
            return self._calculate_simple_price(lead, provider)
    
    def _calculate_simple_price(self, lead, provider):
        """Fast fallback pricing calculation - REALISTIC REVENUE-OPTIMIZED PRICING"""
        # Base pricing: 4 credits (R200) - REALISTIC BASE PRICE
        base_credits = 4  # 4 credits = R200 (realistic base price)
        
        multiplier = 1.0
        logger.info(f"🔍 Simple pricing: base_credits={base_credits}, initial_multiplier={multiplier}")
        
        # Urgency multipliers (based on lead urgency field) - AGGRESSIVE PRICING
        if lead.urgency == 'urgent':
            multiplier = 3.0  # 12 credits = R600 (urgent premium)
            logger.info(f"🔍 Urgent lead: multiplier={multiplier}")
        elif lead.urgency == 'this_week':
            multiplier = 2.0  # 8 credits = R400 (this week premium)
            logger.info(f"🔍 This week lead: multiplier={multiplier}")
        elif lead.urgency == 'this_month':
            multiplier = 1.5  # 6 credits = R300 (this month premium)
            logger.info(f"🔍 This month lead: multiplier={multiplier}")
        else:  # flexible
            multiplier = 1.0  # 4 credits = R200 (base price)
            logger.info(f"🔍 Flexible lead: multiplier={multiplier}")
        
        # Quality multipliers (verification score) - HIGHER PREMIUMS
        if lead.verification_score > 80:
            multiplier += 1.0  # +1.0 credits = +R50 (high quality premium)
            logger.info(f"🔍 High quality lead: +1.0, multiplier={multiplier}")
        elif lead.verification_score > 60:
            multiplier += 0.5  # +0.5 credits = +R25 (medium quality premium)
            logger.info(f"🔍 Medium quality lead: +0.5, multiplier={multiplier}")
        
        # Budget multipliers (higher budget = MUCH higher credit cost) - AGGRESSIVE PRICING
        if hasattr(lead, 'budget_range'):
            if 'over_50000' in str(lead.budget_range):
                multiplier += 3.0  # +3.0 credits = +R150 (high budget premium)
                logger.info(f"🔍 High budget lead: +3.0, multiplier={multiplier}")
            elif '15000_50000' in str(lead.budget_range):
                multiplier += 2.0  # +2.0 credits = +R100 (medium-high budget premium)
                logger.info(f"🔍 Medium-high budget lead: +2.0, multiplier={multiplier}")
            elif '5000_15000' in str(lead.budget_range):
                multiplier += 1.0  # +1.0 credits = +R50 (medium budget premium)
                logger.info(f"🔍 Medium budget lead: +1.0, multiplier={multiplier}")
        
        # High intent multiplier (ready to hire = MUCH more valuable) - AGGRESSIVE PRICING
        if hasattr(lead, 'hiring_intent'):
            if lead.hiring_intent == 'ready_to_hire':
                multiplier += 2.0  # +2.0 credits = +R100 (ready to hire premium)
                logger.info(f"🔍 Ready to hire: +2.0, multiplier={multiplier}")
            elif lead.hiring_intent == 'planning_to_hire':
                multiplier += 1.0  # +1.0 credits = +R50 (planning premium)
                logger.info(f"🔍 Planning to hire: +1.0, multiplier={multiplier}")
        
        # Service category multipliers (different services have different values)
        if hasattr(lead, 'service_category'):
            service_multipliers = {
                'cleaning': 1.0,      # Base multiplier
                'electrical': 1.5,    # Electrical is more valuable
                'plumbing': 1.3,      # Plumbing is valuable
                'hvac': 1.4,          # HVAC is valuable
                'carpentry': 1.2,     # Carpentry is moderately valuable
                'painting': 1.1,      # Painting is slightly more valuable
                'roofing': 1.6,       # Roofing is very valuable
                'flooring': 1.3,      # Flooring is valuable
                'landscaping': 1.1,   # Landscaping is slightly more valuable
                'moving': 1.2,        # Moving is moderately valuable
                'appliance-repair': 1.3,  # Appliance repair is valuable
                'handyman': 1.1,      # Handyman is slightly more valuable
                'pool-maintenance': 1.4,  # Pool maintenance is valuable
                'security': 1.5,      # Security is valuable
                'it-support': 1.3,    # IT support is valuable
                'web-design': 1.2,    # Web design is moderately valuable
                'marketing': 1.1,     # Marketing is slightly more valuable
                'accounting': 1.2,    # Accounting is moderately valuable
                'legal': 1.8,         # Legal is very valuable
                'consulting': 1.4,    # Consulting is valuable
                'other': 1.0          # Other services base multiplier
            }
            service_multiplier = service_multipliers.get(lead.service_category.slug, 1.0)
            multiplier *= service_multiplier
            logger.info(f"🔍 Service category {lead.service_category.slug}: ×{service_multiplier}, multiplier={multiplier}")
        
        # Cap the maximum price to be reasonable but PROFITABLE (max 20 credits = R1000)
        total_credits = min(int(base_credits * multiplier), 20)  # Max 20 credits = R1000
        logger.info(f"🔍 Final calculation: {base_credits} × {multiplier:.1f} = {total_credits} credits")
        
        result = {
            'price': total_credits,
            'reasoning': f"Base: {base_credits} credits × {multiplier:.1f} (urgency: {lead.urgency}, quality: {lead.verification_score}, budget: {lead.budget_range})",
            'base_price': 50,  # R50 per credit
            'multiplier': multiplier
        }
        logger.info(f"🔍 Simple pricing result: {result}")
        return result

    def calculate_optimal_credit_cost(self, lead, provider):
        """Calculate optimal credit cost using ML - STARTUP-FRIENDLY PRICING"""
        try:
            # Start with base cost of 2 credits (R100) - STARTUP-FRIENDLY BASE
            base_cost = 2.0
            
            # Urgency multiplier (moderate pricing for startup)
            if lead.urgency == 'urgent':
                base_cost = 3.0  # 3 credits = R150 (urgent premium)
            elif lead.urgency == 'this_week':
                base_cost = 2.5  # 2.5 credits = R125 (this week premium)
            elif lead.urgency == 'this_month':
                base_cost = 2.2  # 2.2 credits = R110 (this month premium)
            else:  # flexible
                base_cost = 2.0  # 2 credits = R100 (base price)
            
            # Quality multiplier (verification score) - MODERATE PREMIUMS
            if lead.verification_score > 80:
                base_cost += 0.5  # +0.5 credits = +R25 (high quality premium)
            elif lead.verification_score > 60:
                base_cost += 0.2  # +0.2 credits = +R10 (medium quality premium)
            
            # Budget multiplier (higher budget = more expensive) - AGGRESSIVE PRICING FOR HIGH-VALUE
            if lead.budget_range == 'over_50000':
                base_cost += 3.0  # +3 credits = +R150 (high budget premium)
            elif lead.budget_range == '15000_50000':
                base_cost += 1.5  # +1.5 credits = +R75 (medium-high budget premium)
            elif lead.budget_range == '5000_15000':
                base_cost += 0.5  # +0.5 credits = +R25 (medium budget premium)
            
            # Property type multiplier (industrial = premium pricing)
            if hasattr(lead, 'property_type'):
                if lead.property_type == 'industrial':
                    base_cost += 2.0  # +2 credits = +R100 (industrial premium)
                elif lead.property_type == 'commercial':
                    base_cost += 1.0  # +1 credit = +R50 (commercial premium)
            
            # High intent multiplier (ready to hire = more valuable) - MODERATE PRICING
            if hasattr(lead, 'hiring_intent'):
                if lead.hiring_intent == 'ready_to_hire':
                    base_cost += 0.5  # +0.5 credits = +R25 (ready to hire premium)
                elif lead.hiring_intent == 'planning_to_hire':
                    base_cost += 0.2  # +0.2 credits = +R10 (planning premium)
            
            # Service category multiplier (different services have different values) - MODERATE PRICING
            service_multiplier = self._get_service_multiplier(lead.service_category.slug)
            base_cost *= service_multiplier
            
            # Provider tier discount (generous discounts for startup)
            if provider and hasattr(provider, 'provider_profile'):
                if provider.provider_profile.subscription_tier == 'enterprise':
                    base_cost *= 0.8  # 20% discount for enterprise
                elif provider.provider_profile.subscription_tier == 'pro':
                    base_cost *= 0.9  # 10% discount for pro
            
            # Clamp to realistic range: 1-20 credits (R50-R1000) for high-value projects
            final_cost = max(1, min(20, int(round(base_cost))))
            
            logger.info(f"💰 ML Pricing: base=2, final={final_cost} credits (urgency={lead.urgency}, quality={lead.verification_score}, budget={lead.budget_range}, service={lead.service_category.slug})")
            return final_cost
            
        except Exception as e:
            logger.error(f"Error calculating optimal pricing: {str(e)}")
            return 2  # Fallback to 2 credits (R100)
    
    def _get_budget_value(self, budget_range):
        mapping = {
            'under_1000': 500,
            '1000_5000': 3000,
            '5000_15000': 10000,
            '15000_50000': 32500,
            'over_50000': 75000,
            'no_budget': 0
        }
        return mapping.get(budget_range, 0)
    
    def _get_urgency_score(self, urgency):
        mapping = {
            'urgent': 4,
            'this_week': 3,
            'this_month': 2,
            'flexible': 1
        }
        return mapping.get(urgency, 1)
    
    def _get_intent_score(self, intent):
        mapping = {
            'ready_to_hire': 4,
            'planning_to_hire': 3,
            'comparing_quotes': 2,
            'researching': 1
        }
        return mapping.get(intent, 1)
    
    def _get_subscription_score(self, tier):
        mapping = {
            'basic': 1,
            'premium': 2,
            'enterprise': 3
        }
        return mapping.get(tier, 1)
    
    def _get_service_multiplier(self, category_slug):
        """Get pricing multiplier based on service category - STARTUP-FRIENDLY"""
        multipliers = {
            'cleaning': 1.0,      # Cleaning: 1x (base)
            'electrical': 1.3,    # Electrical: 1.3x (moderate premium)
            'plumbing': 1.2,      # Plumbing: 1.2x (moderate premium)
            'hvac': 1.3,          # HVAC: 1.3x (moderate premium)
            'carpentry': 1.1,     # Carpentry: 1.1x (slight premium)
            'painting': 1.0,      # Painting: 1x (base)
            'roofing': 1.4,       # Roofing: 1.4x (moderate premium)
            'flooring': 1.2,      # Flooring: 1.2x (moderate premium)
            'landscaping': 1.0,   # Landscaping: 1x (base)
            'moving': 1.1,        # Moving: 1.1x (slight premium)
            'appliance-repair': 1.2,  # Appliance repair: 1.2x (moderate premium)
            'handyman': 1.0,      # Handyman: 1x (base)
            'pool-maintenance': 1.2,  # Pool maintenance: 1.2x (moderate premium)
            'security': 1.3,      # Security: 1.3x (moderate premium)
            'it-support': 1.2,    # IT support: 1.2x (moderate premium)
            'web-design': 1.1,    # Web design: 1.1x (slight premium)
            'marketing': 1.0,     # Marketing: 1x (base)
            'accounting': 1.1,    # Accounting: 1.1x (slight premium)
            'legal': 1.5,         # Legal: 1.5x (moderate premium)
            'consulting': 1.2,    # Consulting: 1.2x (moderate premium)
            'other': 1.0          # Other: 1x (base)
        }
        return multipliers.get(category_slug, 1.0)
    
    def _get_market_demand(self, category_slug):
        # Live demand: leads in last 30 days vs global average
        try:
            from django.utils import timezone
            from datetime import timedelta
            window = timezone.now() - timedelta(days=30)
            total = Lead.objects.filter(created_at__gte=window).count() or 1
            cat = ServiceCategory.objects.filter(slug=category_slug).first()
            if not cat:
                return 0.5
            cat_count = Lead.objects.filter(service_category=cat, created_at__gte=window).count()
            ratio = cat_count / total
            # Normalize to 0.3-0.9 range for stability
            return max(0.3, min(0.9, ratio * 3))
        except Exception:
            return 0.5
    
    def _get_competition_level(self, city):
        # Live competition: active verified providers serving the city vs global average
        try:
            from backend.users.models import ProviderProfile
            total_providers = ProviderProfile.objects.filter(is_verified=True).count() or 1
            city_providers = ProviderProfile.objects.filter(
                is_verified=True,
                service_cities__icontains=city
            ).count()
            ratio = city_providers / total_providers
            # Normalize to 0.2-0.8 range
            return max(0.2, min(0.8, ratio * 2))
        except Exception:
            return 0.5
    
    
    def _get_lead_quality_tier(self, lead):
        """Determine lead quality tier based on multiple factors"""
        try:
            score = 0
            
            # Verification score (0-100)
            if lead.verification_score > 80:
                score += 3
            elif lead.verification_score > 60:
                score += 2
            elif lead.verification_score > 40:
                score += 1
            
            # Budget range
            if lead.budget_range in ["15000_50000", "over_50000"]:
                score += 2
            elif lead.budget_range == "5000_15000":
                score += 1
            
            # Hiring intent
            if lead.hiring_intent == "ready_to_hire":
                score += 2
            elif lead.hiring_intent == "planning_to_hire":
                score += 1
            
            # Urgency
            if lead.urgency == "urgent":
                score += 2
            elif lead.urgency == "this_week":
                score += 1
            
            # SMS verification
            if lead.is_sms_verified:
                score += 1
            
            # Determine tier based on total score
            if score >= 7:
                return 'premium'
            elif score >= 4:
                return 'standard'
            else:
                return 'basic'
                
        except Exception as e:
            logger.error(f"Error determining lead quality tier: {str(e)}")
            return 'standard'
    
    def calculate_batch_pricing(self, leads, provider=None):
        """Calculate pricing for multiple leads in batch - MUCH FASTER than individual calls"""
        try:
            if not leads:
                return []
            
            # Use fast fallback pricing for batch operations to improve performance
            # VERY AFFORDABLE SOUTH AFRICAN PRICING
            base_prices = {
                'basic': 5,       # R5 for basic tier
                'advanced': 4,    # R4 for advanced tier (discount)
                'pro': 3,         # R3 for pro tier (discount)
                'enterprise': 2,  # R2 for enterprise tier (discount)
                None: 5           # R5 default
            }
            
            provider_tier = None
            if provider and hasattr(provider, 'provider_profile'):
                provider_tier = provider.provider_profile.subscription_tier
            
            base_price = base_prices.get(provider_tier, 50)
            
            # Batch calculate common multipliers (much faster than individual calculations)
            time_multiplier = self._calculate_time_multiplier()
            
            results = []
            for lead in leads:
                # Use simplified pricing for batch operations
                # Only calculate essential multipliers to maintain performance
                urgency_multiplier = self._calculate_urgency_multiplier(lead)
                quality_multiplier = self._calculate_quality_multiplier(lead)
                
                # Simplified multiplier calculation
                final_multiplier = urgency_multiplier * quality_multiplier * time_multiplier
                final_multiplier = max(0.5, min(2.0, final_multiplier))  # Clamp to reasonable range
                
                # More realistic minimum price for SA market
                final_price = max(8, min(35, int(base_price * final_multiplier)))  # R8-R35 range
                
                results.append({
                    'price': final_price,
                    'currency': 'ZAR',
                    'reasoning': f'Batch pricing: urgency={urgency_multiplier:.1f}x, quality={quality_multiplier:.1f}x',
                    'demand_multiplier': 1.0,
                    'quality_multiplier': round(quality_multiplier, 2),
                    'urgency_multiplier': round(urgency_multiplier, 2),
                    'competition_multiplier': 1.0,
                    'final_multiplier': round(final_multiplier, 2)
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Error in batch pricing calculation: {str(e)}")
            # Return default pricing for all leads
            return [{'price': 50, 'reasoning': 'Default pricing (batch error)'} for _ in leads]
    
    def _calculate_demand_multiplier(self, lead):
        """Calculate demand-based pricing multiplier"""
        try:
            from django.utils import timezone
            from datetime import timedelta
            
            # Get recent leads in same category
            last_7_days = timezone.now() - timedelta(days=7)
            recent_leads = Lead.objects.filter(
                service_category=lead.service_category,
                created_at__gte=last_7_days
            ).count()
            
            # Get average leads per week for this category
            total_weeks = 12  # Look back 12 weeks
            historical_start = timezone.now() - timedelta(weeks=total_weeks)
            historical_leads = Lead.objects.filter(
                service_category=lead.service_category,
                created_at__gte=historical_start
            ).count()
            
            avg_weekly_leads = historical_leads / total_weeks if historical_leads > 0 else 1
            
            # Calculate demand ratio
            demand_ratio = recent_leads / max(avg_weekly_leads, 1)
            
            # Convert to multiplier (0.7x to 1.5x range)
            if demand_ratio > 2.0:
                return 1.5  # Very high demand
            elif demand_ratio > 1.5:
                return 1.3  # High demand
            elif demand_ratio > 1.0:
                return 1.1  # Above average demand
            elif demand_ratio > 0.5:
                return 1.0  # Normal demand
            else:
                return 0.8  # Low demand
                
        except Exception:
            return 1.0
    
    def _calculate_quality_multiplier(self, lead):
        """Calculate quality-based pricing multiplier"""
        try:
            quality_score = getattr(lead, 'verification_score', 75)
            
            if quality_score >= 90:
                return 1.4  # Premium quality leads cost more
            elif quality_score >= 80:
                return 1.2  # High quality
            elif quality_score >= 70:
                return 1.0  # Standard quality
            elif quality_score >= 60:
                return 0.9  # Below average quality
            else:
                return 0.8  # Low quality leads cost less
                
        except Exception:
            return 1.0
    
    def _calculate_urgency_multiplier(self, lead):
        """Calculate urgency-based pricing multiplier"""
        urgency_multipliers = {
            'urgent': 1.3,      # Urgent jobs command premium
            'this_week': 1.1,   # Time-sensitive
            'this_month': 1.0,  # Standard
            'flexible': 0.9     # Flexible timing, lower price
        }
        return urgency_multipliers.get(lead.urgency, 1.0)
    
    def _calculate_competition_multiplier(self, lead):
        """Calculate competition-based pricing multiplier"""
        try:
            from backend.users.models import ProviderProfile
            
            # Count providers serving this location and category
            matching_providers = ProviderProfile.objects.filter(
                is_verified=True,
                service_categories__icontains=lead.service_category.name,
                service_cities__icontains=lead.location_city
            ).count()
            
            # Adjust pricing based on competition level
            if matching_providers <= 2:
                return 1.4  # Low competition = higher prices
            elif matching_providers <= 5:
                return 1.2  # Medium competition
            elif matching_providers <= 10:
                return 1.0  # Normal competition
            elif matching_providers <= 20:
                return 0.9  # High competition = lower prices
            else:
                return 0.8  # Very high competition
                
        except Exception:
            return 1.0
    
    def _calculate_time_multiplier(self):
        """Calculate time-of-day/week pricing multiplier"""
        try:
            from datetime import datetime
            now = datetime.now()
            hour = now.hour
            weekday = now.weekday()  # 0=Monday, 6=Sunday
            
            # Peak hours (business hours): slight premium
            if 8 <= hour <= 17 and weekday < 5:  # Business hours, weekdays
                return 1.1
            elif weekday >= 5:  # Weekends: premium
                return 1.2
            else:  # Off-hours: standard
                return 1.0
                
        except Exception:
            return 1.0
    
    def _generate_pricing_reasoning(self, lead, demand_mult, quality_mult, urgency_mult, competition_mult, time_mult):
        """Generate human-readable pricing explanation"""
        reasons = []
        
        if demand_mult > 1.2:
            reasons.append("High demand in this category")
        elif demand_mult < 0.9:
            reasons.append("Lower demand category")
        
        if quality_mult > 1.1:
            reasons.append("Premium quality lead")
        elif quality_mult < 0.9:
            reasons.append("Standard quality lead")
        
        if urgency_mult > 1.1:
            reasons.append("Urgent timeline")
        elif urgency_mult < 1.0:
            reasons.append("Flexible timeline")
        
        if competition_mult > 1.1:
            reasons.append("Limited provider availability")
        elif competition_mult < 0.9:
            reasons.append("High provider competition")
        
        if time_mult > 1.0:
            reasons.append("Peak hours pricing")
        
        if not reasons:
            reasons.append("Standard market pricing")
        
        return " • ".join(reasons)


class GeographicalMLService:
    """ML service for geographical and proximity-based lead matching"""
    
    def __init__(self):
        self.model_path = os.path.join(settings.BASE_DIR, "ml_models")
        self.geographical_model = None
        self.proximity_model = None
        self.scaler = None
        self.label_encoders = {}
        self.model_version = datetime.now().strftime('%Y%m%d%H%M%S')
        os.makedirs(self.model_path, exist_ok=True)
    
    def extract_geographical_features(self, lead, provider):
        """Extract geographical features for ML models"""
        features = {}
        
        # Distance features
        if (lead.latitude and lead.longitude and 
            provider.latitude and provider.longitude):
            distance = self.calculate_distance(
                lead.latitude, lead.longitude,
                provider.latitude, provider.longitude
            )
            features['distance_km'] = distance
            features['has_coordinates'] = 1
        else:
            features['distance_km'] = 0
            features['has_coordinates'] = 0
        
        # City matching features
        features['same_city'] = 1 if lead.location_city.lower() == provider.city.lower() else 0
        features['same_suburb'] = 1 if lead.location_suburb.lower() == provider.suburb.lower() else 0
        
        # Province matching
        lead_province = self.get_province_from_city(lead.location_city)
        provider_province = self.get_province_from_city(provider.city)
        features['same_province'] = 1 if lead_province == provider_province else 0
        
        # Service area matching
        service_areas_lower = [area.lower() for area in provider.provider_profile.service_areas]
        features['city_in_service_areas'] = 1 if lead.location_city.lower() in service_areas_lower else 0
        features['suburb_in_service_areas'] = 1 if lead.location_suburb.lower() in service_areas_lower else 0
        features['province_in_service_areas'] = 1 if lead_province and lead_province.lower() in service_areas_lower else 0
        
        # Travel distance features
        features['within_travel_radius'] = 1 if features['distance_km'] <= provider.provider_profile.max_travel_distance else 0
        features['travel_radius_km'] = provider.provider_profile.max_travel_distance
        
        # Major city features
        features['lead_major_city'] = 1 if self.is_major_sa_city(lead.location_city) else 0
        features['provider_major_city'] = 1 if self.is_major_sa_city(provider.city) else 0
        
        return features
    
    def calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two points using Haversine formula"""
        import math
        # Convert latitude and longitude from degrees to radians
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        # Radius of earth in kilometers
        r = 6371
        return c * r
    
    def get_province_from_city(self, city):
        """Get South African province from city name"""
        city_lower = city.lower()
        
        province_mapping = {
            'western cape': ['cape town', 'george', 'knysna', 'mossel bay', 'oudtshoorn', 'stellenbosch', 'paarl', 'somerset west'],
            'gauteng': ['johannesburg', 'pretoria', 'soweto', 'sandton', 'randburg', 'centurion', 'midrand', 'benoni', 'kempton park'],
            'kwazulu-natal': ['durban', 'pietermaritzburg', 'newcastle', 'richards bay', 'empangeni', 'ballito', 'umhlanga'],
            'eastern cape': ['port elizabeth', 'east london', 'grahamstown', 'gqeberha', 'nelson mandela bay'],
            'free state': ['bloemfontein', 'welkom', 'bethlehem', 'kroonstad', 'sasolburg'],
            'mpumalanga': ['nelspruit', 'witbank', 'secunda', 'standerton', 'mbombela'],
            'limpopo': ['polokwane', 'tzaneen', 'modimolle', 'bela-bela', 'lephalale'],
            'northern cape': ['kimberley', 'upington', 'springbok', 'de aar', 'kathu'],
            'north west': ['mahikeng', 'klerksdorp', 'potchefstroom', 'rustenburg', 'mafikeng']
        }
        
        for province, cities in province_mapping.items():
            if city_lower in cities:
                return province.title()
        
        return None
    
    def is_major_sa_city(self, city):
        """Check if city is a major South African city"""
        major_cities = [
            'cape town', 'johannesburg', 'durban', 'pretoria', 'port elizabeth',
            'bloemfontein', 'nelspruit', 'polokwane', 'kimberley', 'mahikeng',
            'east london', 'george', 'knysna', 'mossel bay', 'oudtshoorn',
            'soweto', 'sandton', 'randburg', 'centurion', 'midrand'
        ]
        return city.lower() in major_cities
    
    def train_geographical_model(self):
        """Train ML model for geographical matching"""
        try:
            from sklearn.ensemble import RandomForestClassifier
            from sklearn.model_selection import train_test_split
            from sklearn.metrics import accuracy_score, classification_report
            
            # Get training data from successful assignments
            from django.utils import timezone
            assignments = LeadAssignment.objects.filter(
                assigned_at__gte=timezone.now() - timedelta(days=90),
                status__in=['accepted', 'completed']
            ).select_related('lead', 'provider__user', 'provider')
            
            if assignments.count() < 50:
                logger.warning(f"Not enough training data for geographical model: {assignments.count()} assignments")
                return False
            
            # Prepare training data
            X = []
            y = []
            
            for assignment in assignments:
                features = self.extract_geographical_features(assignment.lead, assignment.provider)
                X.append(list(features.values()))
                y.append(1)  # Positive match
            
            # Add negative examples (leads that weren't assigned to providers)
            all_leads = Lead.objects.filter(
                created_at__gte=timezone.now() - timedelta(days=90),
                status='verified'
            ).select_related('service_category')
            
            all_providers = User.objects.filter(
                user_type='provider',
                provider_profile__verification_status='verified'
            ).select_related('provider_profile')
            
            # Sample negative examples
            negative_count = min(len(y), 1000)  # Limit negative examples
            for _ in range(negative_count):
                lead = all_leads.order_by('?').first()
                provider = all_providers.order_by('?').first()
                
                # Skip if this was actually assigned
                if LeadAssignment.objects.filter(lead=lead, provider=provider).exists():
                    continue
                
                features = self.extract_geographical_features(lead, provider)
                X.append(list(features.values()))
                y.append(0)  # Negative match
            
            # Convert to numpy arrays
            X = np.array(X)
            y = np.array(y)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Train model
            self.geographical_model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            self.geographical_model.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = self.geographical_model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            logger.info(f"Geographical model trained with accuracy: {accuracy:.3f}")
            
            # Save model
            model_path = os.path.join(self.model_path, f'geographical_model_{self.model_version}.joblib')
            joblib.dump(self.geographical_model, model_path)
            
            return True
            
        except Exception as e:
            logger.error(f"Error training geographical model: {str(e)}")
            return False
    
    def predict_geographical_match(self, lead, provider):
        """Predict if lead and provider are a good geographical match"""
        try:
            if not self.geographical_model:
                # Load latest model
                self.load_geographical_model()
            
            if not self.geographical_model:
                # Fallback to rule-based matching
                return self.fallback_geographical_match(lead, provider)
            
            features = self.extract_geographical_features(lead, provider)
            X = np.array([list(features.values())])
            
            # Get prediction probability
            prob = self.geographical_model.predict_proba(X)[0][1]
            
            return {
                'is_match': prob > 0.5,
                'confidence': prob,
                'features': features
            }
            
        except Exception as e:
            logger.error(f"Error predicting geographical match: {str(e)}")
            return self.fallback_geographical_match(lead, provider)
    
    def fallback_geographical_match(self, lead, provider):
        """Fallback rule-based geographical matching"""
        features = self.extract_geographical_features(lead, provider)
        
        # Rule-based matching
        is_match = (
            features['same_city'] or
            features['city_in_service_areas'] or
            features['suburb_in_service_areas'] or
            (features['same_province'] and features['province_in_service_areas']) or
            (features['has_coordinates'] and features['within_travel_radius'])
        )
        
        confidence = 0.8 if is_match else 0.2
        
        return {
            'is_match': is_match,
            'confidence': confidence,
            'features': features
        }
    
    def load_geographical_model(self):
        """Load the latest geographical model"""
        try:
            import glob
            model_files = glob.glob(os.path.join(self.model_path, 'geographical_model_*.joblib'))
            if model_files:
                latest_model = max(model_files, key=os.path.getctime)
                self.geographical_model = joblib.load(latest_model)
                logger.info(f"Loaded geographical model: {latest_model}")
                return True
        except Exception as e:
            logger.error(f"Error loading geographical model: {str(e)}")
        return False


class LeadAccessControlMLService:
    """ML service for lead access control based on subscription tiers and usage patterns"""
    
    def __init__(self):
        self.model_path = os.path.join(settings.BASE_DIR, "ml_models")
        
        # Additional lead cost after limit (corrected pricing)
        self.ADDITIONAL_LEAD_COST = 50  # R50 per additional lead for most tiers
        
        # Subscription tier limits (corrected pricing)
        self.SUBSCRIPTION_LEAD_LIMITS = {
            'basic': 5,      # 5 leads per month
            'advanced': 12,  # 12 leads per month  
            'pro': 30,       # 30 leads per month
            'enterprise': 50, # 50 leads per month
            'pay_as_you_go': 0  # No monthly allowance
        }
        
        # Additional lead costs by tier (after monthly limit)
        self.ADDITIONAL_LEAD_COSTS = {
            'basic': 59,     # R59 per additional lead for Basic subscribers
            'advanced': 50,  # R50 per additional lead for Advanced subscribers
            'pro': 50,       # R50 per additional lead for Pro subscribers
            'enterprise': 50, # R50 per additional lead for Enterprise subscribers
            'pay_as_you_go': 50  # R50 per lead for Pay-as-You-Go
        }
    
    def can_access_lead(self, provider, lead):
        """Check if provider can access a specific lead using ML-based analysis"""
        try:
            from .models import LeadAccess
            
            # Check if lead is already unlocked for this provider
            existing_access = LeadAccess.objects.filter(
                lead=lead, 
                provider=provider.user, 
                is_active=True
            ).first()
            
            if existing_access:
                return {
                    "can_access": True,
                    "reason": "Lead already unlocked for you",
                    "remaining_leads": 0,
                    "additional_cost": 0,
                    "ml_confidence": 1.0
                }
            
            # Check if provider is verified and has active subscription
            if not provider.verification_status == "verified":
                return {
                    "can_access": False,
                    "reason": "Provider not verified",
                    "remaining_leads": 0,
                    "additional_cost": 0,
                    "ml_confidence": 1.0
                }
            
            # NEW SYSTEM: No subscription requirement - only verification needed
            # Removed subscription active check as we no longer use monthly subscriptions
            
            # Get subscription tier limit from provider model
            tier_limit = provider.get_monthly_lead_limit()
            
            # Enterprise tier is capped at 50 leads (same as Pro)
            # No special unlimited logic - use standard monthly limit check
            
            # NEW SYSTEM: All verified providers can SEE leads, credits only needed for UNLOCK
            # Providers can view lead previews for free, pay 1 credit to unlock contact details
            
            # Use ML to predict if this lead is worth showing to this provider
            ml_confidence = self._predict_lead_worth(lead, provider)
            
            logger.info(f"Access granted: verified provider can view lead preview (unlock costs 1 credit)")
            return {
                "can_access": True,
                "reason": f"Verified provider - can view lead preview",
                "remaining_leads": 999,  # Unlimited viewing
                "additional_cost": 1,  # 1 credit to unlock contact details
                "ml_confidence": ml_confidence
            }
            
        except Exception as e:
            logger.error(f"Error checking lead access: {str(e)}")
            return {
                "can_access": False,
                "reason": "System error",
                "remaining_leads": 0,
                "additional_cost": 0,
                "ml_confidence": 0.0
            }
    
    def _predict_lead_worth(self, lead, provider):
        """Use ML to predict if a lead is worth using monthly allowance or credits"""
        try:
            # Extract features for ML prediction
            features = {
                "lead_quality": lead.verification_score,
                "budget_value": self._get_budget_value(lead.budget_range),
                "urgency": self._get_urgency_score(lead.urgency),
                "intent": self._get_intent_score(lead.hiring_intent),
                "provider_rating": float(provider.average_rating),
                "provider_credits": provider.credit_balance,
                "subscription_tier": self._get_subscription_score(provider.subscription_tier),
                "hour_of_day": datetime.now().hour,
                "day_of_week": datetime.now().weekday(),
                "lead_age_hours": (datetime.now() - lead.created_at.replace(tzinfo=None)).total_seconds() / 3600,
                "competition_level": self._get_competition_level(lead.location_city),
                "market_demand": self._get_market_demand(lead.service_category.slug)
            }
            
            # Simple ML-based scoring (can be enhanced with trained models)
            score = 0.5  # Base score
            
            # Lead quality boost
            if lead.verification_score > 80:
                score += 0.2
            elif lead.verification_score > 60:
                score += 0.1
            
            # Intent boost
            if lead.hiring_intent == "ready_to_hire":
                score += 0.2
            elif lead.hiring_intent == "planning_to_hire":
                score += 0.1
            
            # Urgency boost
            if lead.urgency == "urgent":
                score += 0.15
            elif lead.urgency == "this_week":
                score += 0.1
            
            # Budget boost
            if lead.budget_range in ["15000_50000", "over_50000"]:
                score += 0.15
            elif lead.budget_range == "5000_15000":
                score += 0.1
            
            # Provider tier boost
            if provider.subscription_tier == "enterprise":
                score += 0.1
            elif provider.subscription_tier == "pro":
                score += 0.05
            
            # Competition boost (less competition = higher worth)
            if features["competition_level"] < 0.5:
                score += 0.1
            
            # Market demand boost
            if features["market_demand"] > 0.7:
                score += 0.1
            
            # Time decay (older leads less valuable)
            if features["lead_age_hours"] > 24:
                score -= 0.1
            if features["lead_age_hours"] > 72:
                score -= 0.2
            
            return max(0.0, min(1.0, score))
            
        except Exception as e:
            logger.error(f"Error predicting lead worth: {str(e)}")
            return 0.5
    
    def consume_lead_access(self, provider, lead):
        """Consume a lead access for a provider using ML-based decision making"""
        try:
            from django.db import transaction
            from .models import LeadAccess
            
            with transaction.atomic():
                # Check if lead is already unlocked for this provider
                existing_access = LeadAccess.objects.filter(
                    lead=lead, 
                    provider=provider.user, 
                    is_active=True
                ).first()
                
                if existing_access:
                    return {
                        "success": True,
                        "message": "Lead already unlocked for you",
                        "remaining_leads": 0,
                        "credit_used": False,
                        "ml_confidence": 1.0
                    }
                
                # Check access first
                access_check = self.can_access_lead(provider, lead)
                
                if not access_check["can_access"]:
                    return {
                        "success": False,
                        "message": access_check["reason"],
                        "remaining_leads": access_check["remaining_leads"],
                        "credit_used": False,
                        "ml_confidence": access_check["ml_confidence"]
                    }
                
                # Get subscription tier limit from provider model
                tier_limit = provider.get_monthly_lead_limit()
                
                # NEW SYSTEM: Simple credit-based access - 1 credit per lead unlock
                credit_cost = 1  # Fixed cost: 1 credit (R50) per lead
                
                if provider.credit_balance >= credit_cost:
                    # Deduct credits
                    provider.credit_balance -= credit_cost
                    provider.save(update_fields=["credit_balance"])
                    
                    # Create lead access record
                    LeadAccess.objects.create(
                        lead=lead,
                        provider=provider.user,
                        credit_cost=credit_cost
                    )
                    
                    return {
                        "success": True,
                        "message": f"Lead accessed using {credit_cost} credits ({provider.credit_balance} remaining)",
                        "remaining_leads": 999,  # Unlimited
                        "credit_used": True,
                        "ml_confidence": access_check["ml_confidence"]
                    }
                else:
                    return {
                        "success": False,
                        "message": f"Insufficient credits. Need {credit_cost} credit (R50), have {provider.credit_balance}",
                        "remaining_leads": 0,
                        "credit_used": False,
                        "ml_confidence": 0.0
                    }
                
                return {
                    "success": False,
                    "message": "No credits available",
                    "remaining_leads": 0,
                    "credit_used": False,
                    "ml_confidence": 0.0
                }
                
        except Exception as e:
            logger.error(f"Error consuming lead access: {str(e)}")
            return {
                "success": False,
                "message": "System error",
                "remaining_leads": 0,
                "credit_used": False,
                "ml_confidence": 0.0
            }
    
    def get_provider_lead_status(self, provider):
        """Get current lead access status for a provider with ML insights"""
        try:
            tier_limit = provider.get_monthly_lead_limit()
            remaining = tier_limit - provider.leads_used_this_month
            
            # Generate ML-based recommendations
            recommendations = self._generate_ml_recommendations(provider)
            
            return {
                "subscription_tier": provider.subscription_tier,
                "monthly_limit": tier_limit,
                "leads_used": provider.leads_used_this_month,
                "remaining_leads": max(0, remaining),
                "credit_balance": provider.credit_balance,
                "can_access_more": remaining > 0 or provider.credit_balance > 0,
                "additional_cost": self.ADDITIONAL_LEAD_COST,
                "ml_recommendations": recommendations
            }
            
        except Exception as e:
            logger.error(f"Error getting provider lead status: {str(e)}")
            return {
                "subscription_tier": "unknown",
                "monthly_limit": 0,
                "leads_used": 0,
                "remaining_leads": 0,
                "credit_balance": 0,
                "can_access_more": False,
                "additional_cost": 0,
                "ml_recommendations": []
            }
    
    def _generate_ml_recommendations(self, provider):
        """Generate ML-based recommendations for the provider"""
        recommendations = []
        
        try:
            # Check usage patterns
            if provider.leads_used_this_month > 0:
                usage_rate = provider.leads_used_this_month / self.SUBSCRIPTION_LEAD_LIMITS.get(provider.subscription_tier, 1)
                
                if usage_rate > 0.8:
                    recommendations.append("High lead usage detected. Consider upgrading to higher tier for better value.")
                elif usage_rate < 0.3:
                    recommendations.append("Low lead usage. Consider optimizing your profile to attract more leads.")
            
            # Check credit balance
            if provider.credit_balance < 5:
                recommendations.append("Low credit balance. Consider purchasing credits to avoid missing opportunities.")
            
            # Check subscription tier
            if provider.subscription_tier == "basic" and provider.leads_used_this_month >= 5:
                recommendations.append("You have reached your monthly limit. Upgrade to Advanced for 12 leads per month.")
            elif provider.subscription_tier == "advanced" and provider.leads_used_this_month >= 12:
                recommendations.append("You have reached your monthly limit. Upgrade to Pro for 30 leads per month.")
            elif provider.subscription_tier == "pro" and provider.leads_used_this_month >= 30:
                recommendations.append("You have reached your monthly limit. Upgrade to Enterprise for 50 leads per month with premium features.")
            elif provider.subscription_tier == "enterprise" and provider.leads_used_this_month >= 50:
                recommendations.append("You have reached your monthly limit. Purchase additional credits to access more leads at R50 each.")
            
            # Check performance
            if provider.average_rating < 4.0:
                recommendations.append("Improve your rating to get better lead matching and priority.")
            
            if provider.response_time_hours > 24:
                recommendations.append("Faster response times lead to better conversion rates.")
            
        except Exception as e:
            logger.error(f"Error generating ML recommendations: {str(e)}")
        
        return recommendations
    
    def get_access_restriction_message(self, provider):
        """Get a user-friendly message explaining why a provider cannot access leads"""
        try:
            if not provider.verification_status == "verified":
                return "Your account is not verified. Please complete verification to access leads."
            
            if not provider.is_subscription_active:
                return "Your subscription has expired. Please renew to access leads."
            
            tier_limit = provider.get_monthly_lead_limit()
            remaining = tier_limit - provider.leads_used_this_month
            
            if remaining > 0:
                return f"You have {remaining} leads remaining this month."
            
            if provider.credit_balance > 0:
                return f"Monthly limit reached. You have {provider.credit_balance} credits to access more leads at R{self.ADDITIONAL_LEAD_COST} each."
            
            return f"Monthly limit reached ({tier_limit} leads). Buy credits to continue accessing leads at R{self.ADDITIONAL_LEAD_COST} each."
            
        except Exception as e:
            logger.error(f"Error getting restriction message: {str(e)}")
            return "Unable to access leads at this time. Please contact support."
    
    def purchase_additional_credits(self, provider, amount):
        """Purchase additional credits for lead access"""
        try:
            from django.db import transaction
            from backend.payments.models import Transaction
            
            with transaction.atomic():
                # Add credits to provider balance
                provider.credit_balance += amount
                provider.save(update_fields=['credit_balance'])
                
                # Create credit transaction record (simplified)
                # Note: This would need to be integrated with the payment system
                pass
                
                return {
                    "success": True,
                    "message": f"Successfully purchased {amount} credits",
                    "new_balance": provider.credit_balance,
                    "cost": amount * self.ADDITIONAL_LEAD_COST
                }
                
        except Exception as e:
            logger.error(f"Error purchasing credits: {str(e)}")
            return {
                "success": False,
                "message": "Failed to purchase credits",
                "error": str(e)
            }
    
    def _get_budget_value(self, budget_range):
        mapping = {
            "under_1000": 500,
            "1000_5000": 3000,
            "5000_15000": 10000,
            "15000_50000": 32500,
            "over_50000": 75000,
            "no_budget": 0
        }
        return mapping.get(budget_range, 0)
    
    def _get_urgency_score(self, urgency):
        mapping = {
            "urgent": 4,
            "this_week": 3,
            "this_month": 2,
            "flexible": 1
        }
        return mapping.get(urgency, 1)
    
    def _get_intent_score(self, intent):
        mapping = {
            "ready_to_hire": 4,
            "planning_to_hire": 3,
            "comparing_quotes": 2,
            "researching": 1
        }
        return mapping.get(intent, 1)
    
    def _get_subscription_score(self, tier):
        mapping = {
            "basic": 1,
            "advanced": 2,
            "pro": 3,
            "enterprise": 4
        }
        return mapping.get(tier, 1)
    
    def _get_market_demand(self, category_slug):
        try:
            from django.utils import timezone
            from datetime import timedelta
            window = timezone.now() - timedelta(days=30)
            total = Lead.objects.filter(created_at__gte=window).count() or 1
            cat = ServiceCategory.objects.filter(slug=category_slug).first()
            if not cat:
                return 0.5
            cat_count = Lead.objects.filter(service_category=cat, created_at__gte=window).count()
            ratio = cat_count / total
            return max(0.3, min(0.9, ratio * 3))
        except Exception:
            return 0.5
    
    def _get_competition_level(self, city):
        try:
            from backend.users.models import ProviderProfile
            qs = ProviderProfile.objects.filter(
                verification_status="verified",
                is_subscription_active=True
            )
            total = qs.count() or 1
            city_lower = (city or "").lower()
            in_city = 0
            for p in qs.only("service_areas"):
                areas = [a.lower() for a in (p.service_areas or [])]
                if city_lower and city_lower in areas:
                    in_city += 1
            ratio = in_city / total
            return max(0.3, min(0.9, ratio * 3))
        except Exception:
            return 0.5

    def predict_user_churn_risk(self, provider):
        """Predict if a provider is at risk of churning using ML"""
        try:
            from django.utils import timezone
            
            # Calculate churn risk factors
            risk_score = 0.0
            
            # Activity-based factors
            recent_logins = provider.user.last_login
            if recent_logins:
                days_since_login = (timezone.now() - recent_logins).days
                if days_since_login > 30:
                    risk_score += 0.3
                elif days_since_login > 14:
                    risk_score += 0.2
                elif days_since_login > 7:
                    risk_score += 0.1
            else:
                risk_score += 0.4  # Never logged in
            
            # Lead engagement factors
            if provider.leads_used_this_month == 0:
                risk_score += 0.2
            elif provider.leads_used_this_month < 2:
                risk_score += 0.1
            
            # Credit usage patterns
            if provider.credit_balance > 20:
                risk_score += 0.1  # Hoarding credits without using
            elif provider.credit_balance == 0:
                risk_score += 0.15  # No credits left
            
            # Subscription tier factors
            if provider.subscription_tier == 'basic' and provider.leads_used_this_month >= 4:
                risk_score -= 0.1  # Active basic user
            elif provider.subscription_tier == 'pay-as-you-go':
                risk_score += 0.2  # Higher churn risk
            
            # Performance factors
            if provider.average_rating < 3.5:
                risk_score += 0.2
            elif provider.average_rating > 4.5:
                risk_score -= 0.1
            
            # Response time factors
            if provider.response_time_hours > 48:
                risk_score += 0.15
            elif provider.response_time_hours < 6:
                risk_score -= 0.1
            
            return max(0.0, min(1.0, risk_score))
            
        except Exception as e:
            logger.error(f"Error predicting churn risk: {str(e)}")
            return 0.5

    def recommend_subscription_upgrade(self, provider):
        """Recommend optimal subscription tier using ML analysis"""
        try:
            current_tier = provider.subscription_tier
            recommendations = []
            
            # Analyze current usage vs limits
            if current_tier == 'basic':
                if provider.leads_used_this_month >= 4:  # Close to limit
                    recommendations.append({
                        'tier': 'advanced',
                        'reason': f'You\'ve used {provider.leads_used_this_month}/5 leads. Advanced gives you 12 leads + R50 additional vs R59.',
                        'confidence': 0.8,
                        'potential_savings': f'Save R{(provider.leads_used_this_month - 5) * 9} per month on additional leads'
                    })
                    
                if provider.leads_used_this_month >= 8:  # Heavy user
                    recommendations.append({
                        'tier': 'pro',
                        'reason': f'Heavy usage detected ({provider.leads_used_this_month} leads). Pro offers 30 leads + better rates.',
                        'confidence': 0.9,
                        'potential_savings': f'Save R{(provider.leads_used_this_month - 5) * 9} per month'
                    })
            
            elif current_tier == 'advanced':
                if provider.leads_used_this_month >= 10:
                    recommendations.append({
                        'tier': 'pro',
                        'reason': f'You\'ve used {provider.leads_used_this_month}/12 leads. Pro offers 30 leads for better value.',
                        'confidence': 0.7,
                        'potential_savings': 'Better value for high-volume lead access'
                    })
                    
                if provider.leads_used_this_month >= 20:
                    recommendations.append({
                        'tier': 'enterprise',
                        'reason': f'Very high usage ({provider.leads_used_this_month} leads). Enterprise offers 50 leads + premium features.',
                        'confidence': 0.9,
                        'potential_savings': 'More leads with premium features'
                    })
            
            elif current_tier == 'pro':
                if provider.leads_used_this_month >= 25:
                    recommendations.append({
                        'tier': 'enterprise',
                        'reason': f'High usage ({provider.leads_used_this_month}/30 leads). Enterprise offers 50 leads + premium features.',
                        'confidence': 0.8,
                        'potential_savings': 'More leads + dedicated support'
                    })
            
            return {
                'current_tier': current_tier,
                'recommendations': recommendations
            }
            
        except Exception as e:
            logger.error(f"Error generating subscription recommendations: {str(e)}")
            return {'current_tier': current_tier, 'recommendations': []}
