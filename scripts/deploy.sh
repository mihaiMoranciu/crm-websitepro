#!/usr/bin/env bash
#
# Runs on the server, inside a freshly uploaded release folder. Installs the
# packages, backs up and updates the database, builds, and only then points
# the live site at the new release. If any step fails the script stops and the
# previous release keeps serving.
#
# Server layout (created once by hand, see the deploy notes):
#   <app>/releases/<release>/   one folder per deploy, this script inside it
#   <app>/current               link to the live release
#   <app>/shared/.env           settings and secrets, shared by every release
#   <app>/shared/data/          the SQLite database
#   <app>/shared/media/         uploaded images (MEDIA_DIR)
#   <app>/shared/backups/       a copy of the database before each deploy

set -euo pipefail

RELEASE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$(cd "$RELEASE/../.." && pwd)"
SHARED="$APP_DIR/shared"
KEEP_RELEASES=3
KEEP_BACKUPS=10

cd "$RELEASE"
echo "→ Release $(basename "$RELEASE")"

ln -sfn "$SHARED/.env" .env
set -a
# shellcheck disable=SC1091
source "$SHARED/.env"
set +a

echo "→ Installing packages"
npm ci --no-audit --no-fund

# A consistent copy of the database, taken while the site keeps running.
DB_FILE="${DATABASE_URL#file:}"
if [ -f "$DB_FILE" ]; then
  echo "→ Backing up the database"
  mkdir -p "$SHARED/backups"
  BACKUP="$SHARED/backups/payload-$(date +%Y%m%d-%H%M%S).db"
  node -e "require('@libsql/client').createClient({ url: process.argv[1] }).execute({ sql: 'VACUUM INTO ?', args: [process.argv[2]] }).then(() => process.exit(0))" \
    "$DATABASE_URL" "$BACKUP"
  ls -1t "$SHARED"/backups/payload-*.db | tail -n +$((KEEP_BACKUPS + 1)) | xargs -r rm -f
fi

echo "→ Updating the database"
npx payload migrate

echo "→ Building"
npm run build

echo "→ Switching the live site"
ln -sfn "$RELEASE" "$APP_DIR/current"
if pm2 describe websitepro > /dev/null 2>&1; then
  pm2 reload websitepro --update-env
else
  pm2 start "$APP_DIR/current/ecosystem.config.cjs"
fi
pm2 save

ls -1dt "$APP_DIR"/releases/*/ | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf

echo "✓ Live: $(basename "$RELEASE") on port 3001"
