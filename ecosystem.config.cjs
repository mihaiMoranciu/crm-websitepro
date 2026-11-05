/*
 * PM2 keeps the site running on the server, on port 3001 (3000 belongs to other
 * apps on the same machine): it starts it, restarts it after
 * a crash, and brings it back after a reboot (`pm2 startup` + `pm2 save`).
 *
 * The server keeps every release in its own folder, with `current` pointing
 * at the live one (see scripts/deploy.sh). The app runs from `current`, so a
 * reload after a deploy picks up the new release without changing anything here.
 */
const path = require('path')

// This file is read from inside a release: <app>/releases/<release>/ecosystem.config.cjs
const appDir = path.resolve(__dirname, '../..')

module.exports = {
  apps: [
    {
      name: 'websitepro',
      cwd: path.join(appDir, 'current'),
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NODE_OPTIONS: '--no-deprecation',
      },
      max_memory_restart: '1G',
    },
  ],
}
