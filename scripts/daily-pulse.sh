#!/bin/bash
# FLUX-DNA Daily Pulse Cron Job
# Runs at 9:00 AM AST (6:00 AM UTC)

# Configuration
BACKEND_URL="http://localhost:8080"
FOUNDER_PASSWORD="PhoenixSovereign2026!"
LOG_FILE="/var/log/flux-dna-pulse.log"

# Log timestamp
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting daily pulse..." >> "$LOG_FILE"

# Send pulse email
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${BACKEND_URL}/api/founder/send-pulse" \
  -H "Authorization: Bearer ${FOUNDER_PASSWORD}" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Pulse email sent successfully" >> "$LOG_FILE"
  echo "$BODY" >> "$LOG_FILE"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Failed to send pulse. HTTP $HTTP_CODE" >> "$LOG_FILE"
  echo "$BODY" >> "$LOG_FILE"
fi

echo "----------------------------------------" >> "$LOG_FILE"
