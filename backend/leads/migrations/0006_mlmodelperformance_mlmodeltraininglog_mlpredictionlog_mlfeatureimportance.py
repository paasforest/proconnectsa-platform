# Generated manually for ML model tracking

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('leads', '0005_auto_20250911_1609'),
    ]

    operations = [
        migrations.CreateModel(
            name='MLModelPerformance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('model_name', models.CharField(max_length=100)),
                ('model_type', models.CharField(choices=[('lead_quality', 'Lead Quality Prediction'), ('conversion', 'Lead Conversion Prediction'), ('churn', 'Provider Churn Prediction'), ('pricing', 'Dynamic Pricing'), ('matching', 'Lead-Provider Matching'), ('fraud', 'Fraud Detection')], max_length=50)),
                ('version', models.CharField(max_length=50)),
                ('accuracy_score', models.FloatField()),
                ('precision_score', models.FloatField()),
                ('recall_score', models.FloatField()),
                ('f1_score', models.FloatField()),
                ('training_data_size', models.IntegerField()),
                ('training_duration_minutes', models.FloatField()),
                ('features_used', models.JSONField(blank=True, default=list)),
                ('hyperparameters', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('trained_at', models.DateTimeField()),
                ('is_active', models.BooleanField(default=True)),
                ('is_production', models.BooleanField(default=False)),
            ],
            options={
                'ordering': ['-created_at'],
                'db_table': 'ml_model_performance',
            },
        ),
        migrations.CreateModel(
            name='MLModelTrainingLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('model_name', models.CharField(max_length=100)),
                ('model_type', models.CharField(choices=[('lead_quality', 'Lead Quality Prediction'), ('conversion', 'Lead Conversion Prediction'), ('churn', 'Provider Churn Prediction'), ('pricing', 'Dynamic Pricing'), ('matching', 'Lead-Provider Matching'), ('fraud', 'Fraud Detection')], max_length=50)),
                ('status', models.CharField(choices=[('started', 'Training Started'), ('completed', 'Training Completed'), ('failed', 'Training Failed'), ('cancelled', 'Training Cancelled')], max_length=20)),
                ('training_data_size', models.IntegerField()),
                ('features_count', models.IntegerField()),
                ('training_duration_minutes', models.FloatField(blank=True, null=True)),
                ('final_accuracy', models.FloatField(blank=True, null=True)),
                ('error_message', models.TextField(blank=True)),
                ('hyperparameters', models.JSONField(blank=True, default=dict)),
                ('training_config', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'ordering': ['-created_at'],
                'db_table': 'ml_model_training_log',
            },
        ),
        migrations.CreateModel(
            name='MLPredictionLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('model_name', models.CharField(max_length=100)),
                ('prediction_type', models.CharField(choices=[('lead_quality', 'Lead Quality Score'), ('conversion_probability', 'Conversion Probability'), ('churn_risk', 'Churn Risk Score'), ('credit_price', 'Credit Price'), ('lead_matching', 'Lead-Provider Match')], max_length=50)),
                ('input_data', models.JSONField()),
                ('prediction', models.FloatField()),
                ('confidence', models.FloatField()),
                ('user_id', models.CharField(blank=True, max_length=100)),
                ('lead_id', models.CharField(blank=True, max_length=100)),
                ('provider_id', models.CharField(blank=True, max_length=100)),
                ('actual_outcome', models.CharField(blank=True, max_length=100)),
                ('was_correct', models.BooleanField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-created_at'],
                'db_table': 'ml_prediction_log',
            },
        ),
        migrations.CreateModel(
            name='MLFeatureImportance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('model_name', models.CharField(max_length=100)),
                ('model_version', models.CharField(max_length=50)),
                ('feature_name', models.CharField(max_length=100)),
                ('importance_score', models.FloatField()),
                ('feature_type', models.CharField(max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-importance_score'],
                'db_table': 'ml_feature_importance',
            },
        ),
        migrations.AddIndex(
            model_name='mlpredictionlog',
            index=models.Index(fields=['model_name', 'prediction_type'], name='ml_prediction_model_pred_idx'),
        ),
        migrations.AddIndex(
            model_name='mlpredictionlog',
            index=models.Index(fields=['created_at'], name='ml_prediction_created_idx'),
        ),
        migrations.AddIndex(
            model_name='mlpredictionlog',
            index=models.Index(fields=['user_id'], name='ml_prediction_user_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='mlmodelperformance',
            unique_together={('model_name', 'version')},
        ),
        migrations.AlterUniqueTogether(
            name='mlfeatureimportance',
            unique_together={('model_name', 'model_version', 'feature_name')},
        ),
    ]



