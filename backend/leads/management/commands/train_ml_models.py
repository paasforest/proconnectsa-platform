"""
Django management command to train ML models for lead analysis
"""
from django.core.management.base import BaseCommand
from backend.leads.ml_services import LeadQualityMLService, LeadConversionMLService
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Train ML models for lead quality prediction and conversion analysis'

    def add_arguments(self, parser):
        parser.add_argument(
            '--model',
            type=str,
            choices=['quality', 'conversion', 'all'],
            default='all',
            help='Which model to train (quality, conversion, or all)'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force retrain even if models exist'
        )

    def handle(self, *args, **options):
        model_type = options['model']
        force = options['force']
        
        self.stdout.write(
            self.style.SUCCESS('Starting ML model training...')
        )
        
        if model_type in ['quality', 'all']:
            self.train_quality_model(force)
        
        if model_type in ['conversion', 'all']:
            self.train_conversion_model(force)
        
        self.stdout.write(
            self.style.SUCCESS('ML model training completed!')
        )

    def train_quality_model(self, force):
        """Train lead quality prediction model"""
        self.stdout.write('Training lead quality model...')
        
        try:
            quality_service = LeadQualityMLService()
            
            # Check if model already exists
            import os
            from django.conf import settings
            model_path = os.path.join(settings.BASE_DIR, 'ml_models', 'lead_quality_model.pkl')
            
            if os.path.exists(model_path) and not force:
                self.stdout.write(
                    self.style.WARNING('Quality model already exists. Use --force to retrain.')
                )
                return
            
            success = quality_service.train_quality_model()
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS('Lead quality model trained successfully!')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('Failed to train lead quality model. Check logs for details.')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error training quality model: {str(e)}')
            )

    def train_conversion_model(self, force):
        """Train lead conversion prediction model"""
        self.stdout.write('Training lead conversion model...')
        
        try:
            conversion_service = LeadConversionMLService()
            
            # Check if model already exists
            import os
            from django.conf import settings
            model_path = os.path.join(settings.BASE_DIR, 'ml_models', 'conversion_model.pkl')
            
            if os.path.exists(model_path) and not force:
                self.stdout.write(
                    self.style.WARNING('Conversion model already exists. Use --force to retrain.')
                )
                return
            
            success = conversion_service.train_conversion_model()
            
            if success:
                self.stdout.write(
                    self.style.SUCCESS('Lead conversion model trained successfully!')
                )
            else:
                self.stdout.write(
                    self.style.ERROR('Failed to train lead conversion model. Check logs for details.')
                )
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error training conversion model: {str(e)}')
            )









