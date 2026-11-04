/**
 * Temporary helper: boots Payload once so the SQLite adapter runs its dev
 * schema push in a controlled way, instead of relying on the dev server
 * reloading at the right moment. Safe to delete after running.
 */
import 'dotenv/config'
import { getPayload } from 'payload'

import config from './src/payload.config.js'

const payload = await getPayload({ config })

const clienti = await payload.count({ collection: 'clienti' })
console.log('Schema push done. Clienti rows readable by Payload:', clienti.totalDocs)

process.exit(0)
