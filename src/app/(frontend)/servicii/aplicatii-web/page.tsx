import React from 'react'
import { Badge } from '@radix-ui/themes'
import {
  AppWindow,
  Cable,
  Check,
  Eye,
  FileCode2,
  FileText,
  LayoutList,
  LifeBuoy,
  ListChecks,
  Lock,
  UsersRound,
  Zap,
} from 'lucide-react'

import { AppShowcase } from '@/components/site/AppShowcase'
import { Section } from '@/components/site/Frame'
import { APPS_FAQ } from '@/components/site/faqs'
import { Highlight } from '@/components/site/Highlight'
import { JsonLd } from '@/components/site/JsonLd'
import {
  Bento,
  BentoCell,
  bentoPanel,
  Body,
  CenteredHero,
  ClosingCta,
  FaqSection,
  FeatureCards,
  InlineLink,
  SplitHeader,
  Statement,
  TintedWindow,
} from '@/components/site/PageParts'
import { buildMeta } from '@/utilities/seo'
import { breadcrumbSchema, faqSchema, serviceSchema } from '@/utilities/structuredData'
import { cn } from '@/utilities/ui'

/*
 * The custom web applications page. Its search target is "aplicații web la
 * comandă" (docs/seo/keyword-map.md). The variants (cost, owning the code,
 * connecting existing software, upkeep) are the questions at the bottom.
 *
 * Under the title sits an app as a team would use it, for a generic
 * "Firma ta" whose orders used to live in a spreadsheet, played through in
 * three steps. No made-up brands: clients and orders go by kind and number. The bento shows the parts most such apps grow:
 * a client portal, roles, connections and a history of changes. The
 * examples describe kinds of work, not named clients.
 */

const PATH = '/servicii/aplicatii-web'
const TITLE = 'Aplicații web la comandă pentru firme'
const DESCRIPTION =
  'CRM-uri, portaluri pentru clienți și instrumente interne construite pe procesele firmei tale, nu invers. Codul e al tău, iar aplicația crește în etape.'

const KINDS = [
  {
    icon: LayoutList,
    title: 'Evidențe interne și CRM',
    text: 'Clienți, comenzi, intervenții sau stocuri într-un singur loc, cu drepturi diferite pentru fiecare om din echipă.',
    note: 'o firmă de service care vede fiecare intervenție cu tehnicianul, piesele folosite și factura.',
  },
  {
    icon: UsersRound,
    title: 'Portaluri pentru clienți',
    text: 'Locul în care clienții tăi văd comenzile, descarcă documente și trimit cereri, fără telefoane de verificare.',
    note: 'un distribuitor ai cărui clienți văd stocul și prețurile lor și plasează singuri comanda.',
  },
  {
    icon: Cable,
    title: 'Automatizări și legături',
    text: 'Programele pe care le folosiți deja, legate între ele, ca datele să nu mai fie copiate dintr-un loc în altul.',
    note: 'comenzile din magazinul online trimise direct în programul de contabilitate.',
  },
]

const AFTER_HANDOVER = [
  {
    icon: Eye,
    title: 'Un exemplu pe care îl poți vedea',
    text: (
      <>
        <InlineLink href="/produse/crm">CRM-ul și programul de facturare</InlineLink> pe care le
        oferim sunt o aplicație construită de noi: clienți, proiecte, pontaj, facturi și e-Factura.
      </>
    ),
  },
  {
    icon: FileCode2,
    title: 'Codul e al vostru',
    text: 'Primiți codul întreg, documentația și accesul la server. Folosim tehnologii stabile și răspândite, ca orice alt programator să poată continua.',
  },
  {
    icon: LifeBuoy,
    title: 'Rămânem după lansare',
    text: (
      <>
        Actualizări, copii de siguranță și cineva care răspunde când ceva nu merge, prin{' '}
        <InlineLink href="/servicii/mentenanta">mentenanța lunară</InlineLink>.
      </>
    ),
  },
]

const STAGES: { name: string; state: string; tone: 'grass' | 'iris' | 'gray' }[] = [
  { name: 'Comenzi și stări, pentru echipă', state: 'în folosință', tone: 'grass' },
  { name: 'Portal pentru clienți', state: 'în lucru', tone: 'iris' },
  { name: 'Legătura cu contabilitatea', state: 'urmează', tone: 'gray' },
]

/** A client following their order, without phoning to ask. */
function PortalMock() {
  const stages = ['Primită', 'Aprobată', 'În producție', 'Livrare']
  const current = 2
  return (
    <div className={cn(bentoPanel, 'absolute top-0 right-0 left-6 rounded-r-none p-5 text-xs')}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-strong">Comanda ta #2040</span>
        <span className="hidden text-subtle sm:inline">livrare estimată 18 nov.</span>
      </div>
      <ol className="m-0 mt-5 grid list-none grid-cols-4 gap-2 p-0">
        {stages.map((stage, i) => (
          <li key={stage} className="flex flex-col gap-2">
            <span
              className={cn(
                'h-1 rounded-full',
                i < current && 'bg-(--accent-9)',
                i === current && 'bg-(--accent-a6)',
                i > current && 'bg-(--gray-a4)',
              )}
            />
            <span className={i <= current ? 'text-strong' : 'text-subtle'}>{stage}</span>
          </li>
        ))}
      </ol>
      <ul className="m-0 mt-5 list-none divide-y divide-frame border-t border-frame p-0">
        {['Oferta acceptată.pdf', 'Proforma FT-0398.pdf'].map((doc) => (
          <li key={doc} className="flex items-center gap-2 py-2.5">
            <FileText size={14} strokeWidth={1.5} className="text-subtle" />
            <span className="text-strong">{doc}</span>
            <span className="ml-auto text-(--accent-11)">Descarcă</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Who may open what, as the app enforces it. */
function RolesMock() {
  const cols = ['Comenzi', 'Prețuri', 'Facturi']
  const rows: [string, boolean[]][] = [
    ['Vânzări', [true, true, false]],
    ['Producție', [true, false, false]],
    ['Contabilitate', [true, true, true]],
  ]
  return (
    <div className={cn(bentoPanel, 'absolute inset-x-6 top-0 text-xs')}>
      <div className="grid grid-cols-[1fr_repeat(3,3.75rem)] border-b border-frame px-4 py-2.5 text-subtle">
        <span />
        {cols.map((c) => (
          <span key={c} className="text-center">
            {c}
          </span>
        ))}
      </div>
      {rows.map(([role, can]) => (
        <div
          key={role}
          className="grid grid-cols-[1fr_repeat(3,3.75rem)] items-center border-b border-frame px-4 py-2.5 last:border-b-0"
        >
          <span className="text-strong">{role}</span>
          {can.map((ok, i) => (
            <span key={i} className="grid place-items-center">
              {ok ? (
                <Check size={14} strokeWidth={2} className="text-(--accent-11)" />
              ) : (
                <Lock size={12} strokeWidth={1.75} className="text-(--gray-8)" />
              )}
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

/** The app in the middle, wired to the programs around it. */
function ConnectionsMock() {
  const nodes = [
    { label: 'e-Factura', x: 20, y: 18 },
    { label: 'Contabilitate', x: 80, y: 18 },
    { label: 'Email', x: 20, y: 82 },
    { label: 'Magazin', x: 80, y: 82 },
  ]
  return (
    <div className="absolute inset-x-4 top-0 bottom-4">
      <svg className="absolute inset-0 size-full" aria-hidden>
        {nodes.map((n) => (
          <line
            key={n.label}
            x1="50%"
            y1="50%"
            x2={`${n.x}%`}
            y2={`${n.y}%`}
            stroke="var(--gray-a7)"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="flow-line"
          />
        ))}
      </svg>
      {nodes.map((n) => (
        <span
          key={n.label}
          className={cn(
            bentoPanel,
            'absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs whitespace-nowrap text-strong',
          )}
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          {n.label}
        </span>
      ))}
      <span className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-(--radius-3) bg-(--gray-12) px-3.5 py-2 text-xs font-medium whitespace-nowrap text-(--gray-1) shadow-[0_12px_30px_-12px_rgb(0_0_0/0.5)]">
        <span className="size-2.5 rounded-[3px] bg-(--accent-9)" />
        Aplicația voastră
      </span>
    </div>
  )
}

/** Who changed what, and when: the record a spreadsheet never keeps. */
function HistoryMock() {
  const entries: { who: string; app?: boolean; what: React.ReactNode; when: string }[] = [
    {
      who: 'DC',
      what: (
        <>
          Termen mutat pentru comanda #2038:{' '}
          <span className="text-subtle line-through">12 nov.</span> 15 nov.
        </>
      ),
      when: 'azi, 11:20',
    },
    { who: 'RI', what: 'Comanda #2039 a trecut în producție', when: 'ieri, 16:05' },
    {
      who: '',
      app: true,
      what: 'Factura FT-0412 emisă automat pentru comanda #2041',
      when: 'ieri, 09:12',
    },
  ]
  return (
    <ol
      className={cn(
        bentoPanel,
        'absolute top-0 right-0 left-6 m-0 list-none rounded-r-none p-0 text-xs',
      )}
    >
      {entries.map(({ who, app, what, when }) => (
        <li
          key={when}
          className="flex items-center gap-3 border-b border-frame px-4 py-3 last:border-b-0"
        >
          <span
            className={cn(
              'grid size-6 shrink-0 place-items-center rounded-full text-[9px] font-medium',
              app ? 'bg-(--accent-a3) text-(--accent-11)' : 'bg-(--gray-a3) text-strong',
            )}
          >
            {app ? <Zap size={11} strokeWidth={2} /> : who}
          </span>
          <span className="min-w-0 flex-1 text-strong">{what}</span>
          <span className="hidden shrink-0 text-subtle sm:inline">{when}</span>
        </li>
      ))}
    </ol>
  )
}

/** The plan of a growing app: what is in use, what is being built, what comes next. */
function StagedPlan() {
  return (
    <TintedWindow hue="lime" icon={ListChecks} title="Plan pe etape" note="aplicație comenzi">
      <ol className="m-0 list-none divide-y divide-frame p-0">
        {STAGES.map((stage, i) => (
          <li key={stage.name} className="flex items-center gap-4 px-4 py-3.5">
            <span className="w-14 shrink-0 text-sm text-subtle">Etapa {i + 1}</span>
            <span className="min-w-0 flex-1 text-sm text-strong">{stage.name}</span>
            <Badge color={stage.tone} variant={stage.tone === 'gray' ? 'outline' : 'soft'}>
              {stage.state}
            </Badge>
          </li>
        ))}
      </ol>
      <p className="m-0 border-t border-frame px-4 py-3 text-xs text-subtle">
        Fiecare etapă are prețul și termenul ei, scrise înainte să înceapă.
      </p>
    </TintedWindow>
  )
}

export default function WebAppsPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({ name: 'Aplicații web la comandă', description: DESCRIPTION, path: PATH }),
          breadcrumbSchema([{ name: 'Aplicații web', path: PATH }]),
          faqSchema(APPS_FAQ),
        ]}
      />

      <CenteredHero
        badge="Aplicații web"
        icon={AppWindow}
        title={
          <>
            Aplicații web la comandă, construite pe <Highlight>procesele</Highlight> firmei tale
          </>
        }
        text="Construim CRM-uri, portaluri pentru clienți și instrumente interne care înlocuiesc tabelele trimise pe email și pașii pe care cineva îi face de mână în fiecare zi."
        secondary={{ label: 'Vezi un exemplu', href: '#exemplu' }}
      />

      {/* An app as a team would use it, played through in three steps. */}
      <Section id="exemplu" className="scroll-mt-(--header-height)">
        <SplitHeader
          label="Un exemplu"
          title="Comenzile firmei tale, scoase din Excel"
          text="Un caz tipic: comenzile ținute într-un tabel trimis pe email, iar stadiul lor aflat la telefon. Așa arată aceleași comenzi într-o aplicație."
        />
        <AppShowcase />
      </Section>

      <FeatureCards
        title="Trei feluri de aplicații pe care le construim des"
        items={KINDS}
        className="bg-sunken"
      />

      {/* The parts most custom apps grow, as the screens themselves. */}
      <Section>
        <SplitHeader
          label="Ce primești"
          title="Făcută pentru oamenii care o folosesc zilnic"
          text="Fiecare aplicație e diferită, dar câteva piese apar în aproape toate. Le construim pe măsura firmei, nu le luăm dintr-un șablon."
        />
        <Bento>
          <BentoCell
            className="lg:col-span-2"
            title="Un portal pentru clienții tăi"
            text="Clientul își vede comanda, termenul și documentele, fără să sune ca să întrebe."
          >
            <PortalMock />
          </BentoCell>
          <BentoCell
            title="Drepturi pe roluri"
            text="Fiecare om vede și modifică doar ce ține de munca lui."
          >
            <RolesMock />
          </BentoCell>
          <BentoCell
            title="Legături cu ce folosiți deja"
            text="Datele circulă singure între aplicație și celelalte programe."
          >
            <ConnectionsMock />
          </BentoCell>
          <BentoCell
            className="lg:col-span-2"
            title="Istoric pentru fiecare schimbare"
            text="Cine a schimbat ce și când, ca nimic să nu se mai piardă între două versiuni de fișier."
          >
            <HistoryMock />
          </BentoCell>
        </Bento>
      </Section>

      {/* How the work is cut up: small stages, each one used before the next. */}
      <Section className="bg-sunken">
        <div className="grid items-center gap-12 lg:grid-cols-[6fr_5fr] lg:gap-20">
          <div className="flex flex-col gap-6">
            <Statement
              lead="Începem cu cea mai mică versiune care vă ajută."
              rest="O aplicație mare, livrată după un an, rezolvă problemele de acum un an."
            />
            <Body>
              Alegem împreună partea care vă consumă cel mai mult timp și o construim prima. O
              folosiți, vedem ce lipsește, apoi trecem la următoarea. Așa, fiecare etapă pornește de
              la cum se lucrează de fapt, nu de la cum ne-am imaginat la început.
            </Body>
          </div>
          <StagedPlan />
        </div>
      </Section>

      <FeatureCards title="Ce rămâne la voi după predare" items={AFTER_HANDOVER} />

      <FaqSection topic="aplicațiile web" items={APPS_FAQ} className="bg-sunken" />

      <ClosingCta
        lead="Ai un proces care îți ia prea mult timp?"
        rest="Descrie-ni-l pe scurt și îți spunem cum ar arăta prima etapă."
      />
    </>
  )
}

export const metadata = buildMeta({ title: TITLE, description: DESCRIPTION, path: PATH })
