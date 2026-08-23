#!/bin/sh
set -eu

# The source dump comes from PostgreSQL 18 and uses the original "postgres"
# owner. Normalize it for the configured container user and PostgreSQL 17.
sed \
  -e '/^\\restrict /d' \
  -e '/^\\unrestrict /d' \
  -e "s/OWNER TO postgres;/OWNER TO ${POSTGRES_USER};/g" \
  /seed/vocahire_full.sql |
  psql --set ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB"

