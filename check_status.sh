#!/bin/bash
# Quick System Check - Run this anytime to see new registrations, problems, etc.

echo "🔍 Checking ProConnectSA System Status..."
ssh root@128.140.123.48 "cd /opt/proconnectsa && source venv/bin/activate && python monitor_system.py"

