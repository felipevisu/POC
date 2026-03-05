#!/bin/sh
set -e

CONNECT_URL="http://kafka-connect:8083"

echo "Waiting for Kafka Connect to be ready..."
until curl -s "$CONNECT_URL/connectors" > /dev/null 2>&1; do
  sleep 2
done
echo "Kafka Connect is ready"

EXISTING=$(curl -s "$CONNECT_URL/connectors")

if echo "$EXISTING" | grep -q "postgres-connector-source"; then
  echo "Connector already registered, updating..."
  curl -s -X PUT "$CONNECT_URL/connectors/postgres-connector-source/config" \
    -H "Content-Type: application/json" \
    -d "$(jq '.config' /config/connector.json)" | jq '.' 2>/dev/null || cat
else
  echo "Registering connector..."
  curl -s -X POST "$CONNECT_URL/connectors" \
    -H "Content-Type: application/json" \
    -d @/config/connector.json | jq '.' 2>/dev/null || cat
fi

echo ""
echo "Connector status:"
curl -s "$CONNECT_URL/connectors/postgres-connector-source/status" | jq '.' 2>/dev/null || cat
echo ""
echo "Done."
