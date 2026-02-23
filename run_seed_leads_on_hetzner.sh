#!/bin/bash
# Run create_seed_leads command on Hetzner server

HETZNER_IP="128.140.123.48"
HETZNER_DIR="/opt/proconnectsa"

echo "🌱 Creating Seed Leads on Hetzner Server"
echo "=========================================="

ssh root@${HETZNER_IP} "cd ${HETZNER_DIR} && \
  source venv/bin/activate && \
  python manage.py create_seed_leads
"

echo ""
echo "✅ Seed leads creation complete!"
echo ""
