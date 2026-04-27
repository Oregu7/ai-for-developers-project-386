#!/bin/bash
set -e

PG_CLUSTER_VERSION=$(pg_lsclusters -h | awk '{print $1}' | head -1)
PG_CLUSTER_NAME=$(pg_lsclusters -h | awk '{print $2}' | head -1)

if [ -z "$PG_CLUSTER_VERSION" ]; then
    pg_createcluster 15 main
    PG_CLUSTER_VERSION=15
    PG_CLUSTER_NAME=main
fi

pg_ctlcluster "$PG_CLUSTER_VERSION" "$PG_CLUSTER_NAME" start

until pg_isready -q 2>/dev/null; do
    sleep 1
done

sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='booking'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER booking WITH PASSWORD 'booking';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='booking'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE booking OWNER booking;"

export DATABASE_URL="postgres://booking:booking@localhost:5432/booking"

cd /project/backend && npm run seed || true

exec "$@"
