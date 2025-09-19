"""
ML Model Performance Tracking Models
"""
from django.db import models
from django.utils import timezone


class MLModelPerformance(models.Model):
    """Track ML model performance over time"""
    MODEL_TYPES = [
        ('lead_quality', 'Lead Quality Prediction'),
        ('conversion', 'Lead Conversion Prediction'),
        ('churn', 'Provider Churn Prediction'),
        ('pricing', 'Dynamic Pricing'),
        ('matching', 'Lead-Provider Matching'),
        ('fraud', 'Fraud Detection'),
    ]
    
    model_name = models.CharField(max_length=100)
    model_type = models.CharField(max_length=50, choices=MODEL_TYPES)
    version = models.CharField(max_length=50)
    
    # Performance metrics
    accuracy_score = models.FloatField()
    precision_score = models.FloatField()
    recall_score = models.FloatField()
    f1_score = models.FloatField()
    
    # Training data info
    training_data_size = models.IntegerField()
    training_duration_minutes = models.FloatField()
    
    # Model metadata
    features_used = models.JSONField(default=list, blank=True)
    hyperparameters = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    trained_at = models.DateTimeField(default=timezone.now)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_production = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['model_name', 'version']
        db_table = 'ml_model_performance'
    
    def __str__(self):
        return f"{self.model_name} v{self.version} - {self.accuracy_score:.3f}"


class MLModelTrainingLog(models.Model):
    """Log of ML model training attempts"""
    STATUS_CHOICES = [
        ('started', 'Training Started'),
        ('completed', 'Training Completed'),
        ('failed', 'Training Failed'),
        ('cancelled', 'Training Cancelled'),
    ]
    
    model_name = models.CharField(max_length=100)
    model_type = models.CharField(max_length=50, choices=MLModelPerformance.MODEL_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    # Training details
    training_data_size = models.IntegerField()
    features_count = models.IntegerField()
    training_duration_minutes = models.FloatField(null=True, blank=True)
    
    # Results
    final_accuracy = models.FloatField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    # Metadata
    hyperparameters = models.JSONField(default=dict, blank=True)
    training_config = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'ml_model_training_log'
    
    def __str__(self):
        return f"{self.model_name} - {self.status} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class MLPredictionLog(models.Model):
    """Log of ML predictions for analysis"""
    PREDICTION_TYPES = [
        ('lead_quality', 'Lead Quality Score'),
        ('conversion_probability', 'Conversion Probability'),
        ('churn_risk', 'Churn Risk Score'),
        ('credit_price', 'Credit Price'),
        ('lead_matching', 'Lead-Provider Match'),
    ]
    
    model_name = models.CharField(max_length=100)
    prediction_type = models.CharField(max_length=50, choices=PREDICTION_TYPES)
    
    # Input data
    input_data = models.JSONField()
    prediction = models.FloatField()
    confidence = models.FloatField()
    
    # Context
    user_id = models.CharField(max_length=100, blank=True)
    lead_id = models.CharField(max_length=100, blank=True)
    provider_id = models.CharField(max_length=100, blank=True)
    
    # Outcome tracking (for validation)
    actual_outcome = models.CharField(max_length=100, blank=True)
    was_correct = models.BooleanField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['model_name', 'prediction_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['user_id']),
        ]
        db_table = 'ml_prediction_log'
    
    def __str__(self):
        return f"{self.model_name} - {self.prediction_type} - {self.prediction:.3f}"


class MLFeatureImportance(models.Model):
    """Track feature importance for ML models"""
    model_name = models.CharField(max_length=100)
    model_version = models.CharField(max_length=50)
    
    feature_name = models.CharField(max_length=100)
    importance_score = models.FloatField()
    feature_type = models.CharField(max_length=50)  # 'categorical', 'numerical', 'text'
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-importance_score']
        unique_together = ['model_name', 'model_version', 'feature_name']
        db_table = 'ml_feature_importance'
    
    def __str__(self):
        return f"{self.model_name} - {self.feature_name} - {self.importance_score:.3f}"



