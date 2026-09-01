#!/usr/bin/env bash
set -euo pipefail

CONNECT_URL="${CONNECT_URL:-http://localhost:8083}"
echo "A aguardar Kafka Connect em $CONNECT_URL ..."
for i in $(seq 1 60); do
  if curl -sf "$CONNECT_URL/connectors" >/dev/null; then
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Kafka Connect não respondeu."
    exit 1
  fi
  sleep 2
done

if curl -sf "$CONNECT_URL/connectors/ticketing-postgres" >/dev/null; then
  echo "Connector ticketing-postgres já existe."
  exit 0
fi

curl -sf -X POST "$CONNECT_URL/connectors" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ticketing-postgres",
    "config": {
      "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
      "database.hostname": "postgres",
      "database.port": "5432",
      "database.user": "ticketing",
      "database.password": "ticketing",
      "database.dbname": "ticketing",
      "topic.prefix": "ticketing",
      "plugin.name": "pgoutput",
      "slot.name": "ticketing_debezium",
      "publication.name": "ticketing_publication",
      "publication.autocreate.mode": "filtered",
      "table.include.list": "public.Event,public.Venue,public.Session",
      "tombstones.on.delete": "false",
      "decimal.handling.mode": "string",
      "time.precision.mode": "connect"
    }
  }'

echo
echo "Connector ticketing-postgres registado."
