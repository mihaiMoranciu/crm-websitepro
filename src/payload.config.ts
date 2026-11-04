import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Clients } from './collections/Clients'
import { Projects } from './collections/Projects'
import { Tasks } from './collections/Tasks'
import { Invoices } from './collections/Invoices'
import { Subscriptions } from './collections/Subscriptions'
import { Payments } from './collections/Payments'
import { TimeEntries } from './collections/TimeEntries'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { CompanySettings } from './globals/CompanySettings'
import { SUBSCRIPTIONS_QUEUE, issueSubscriptions } from './tasks/issueSubscriptions'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
      // The panel has no built-in link back to the homepage.
      beforeNavLinks: ['@/components/admin/NavDashboardLink#NavDashboardLink'],
      views: {
        // Replaces the panel homepage at /admin with the CRM dashboard, so the
        // whole tool lives behind a single shell, navigation and login.
        dashboard: {
          Component: '@/components/admin/DashboardView#DashboardView',
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || '',
    },
    // Off by default on SQLite. Without it a storno is two independent writes,
    // and a failure between them leaves a reversal with nothing reversed.
    transactionOptions: {},
    // A second request waits for the writer instead of failing on the spot.
    busyTimeout: 5000,
  }),
  // Nav groups appear in the order their first collection is declared, so CRM
  // leads and the website content follows.
  collections: [
    Clients,
    Projects,
    Tasks,
    TimeEntries,
    Invoices,
    Subscriptions,
    Payments,
    Pages,
    Posts,
    Media,
    Categories,
    Users,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  /**
   * Without SMTP credentials the adapter opens an Ethereal test mailbox and
   * logs a preview link instead of delivering. That is the right default for a
   * CRM under construction: the whole send path runs for real, attachments
   * included, but no invoice reaches a client by accident.
   */
  email: nodemailerAdapter({
    defaultFromAddress: process.env.SMTP_FROM_ADDRESS || 'facturi@websitepro.ro',
    defaultFromName: process.env.SMTP_FROM_NAME || 'WebsitePro',
    ...(process.env.SMTP_HOST
      ? {
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            // Port 465 is implicit TLS; everything else upgrades with STARTTLS.
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: process.env.SMTP_USER
              ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
              : undefined,
          },
        }
      : {}),
  }),
  globals: [CompanySettings, Header, Footer],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [issueSubscriptions],
    // Runs inside the server process: every ten minutes it queues whatever a
    // task's `schedule` says is due and works the queue. Needs a server that
    // stays up (`next start`); on serverless hosting, call
    // `/api/payload-jobs/run?queue=abonamente` from an external cron instead.
    autoRun: [{ cron: '0 */10 * * * *', queue: SUBSCRIPTIONS_QUEUE }],
  },
})
