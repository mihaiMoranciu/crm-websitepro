import {
  CircleHelp,
  LayoutDashboard,
  Mail,
  Newspaper,
  PanelsTopLeft,
  PenTool,
  ReceiptText,
  Route,
  Server,
  ShoppingBag,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/*
 * The site's main navigation. An entry either links somewhere or opens a
 * panel of grouped links, the way the header's large menu shows them.
 *
 * Every page linked here is written in code under src/app/(frontend). The
 * contact page is still missing: "Contact" points at the home page's
 * contact section until it exists. "Proiecte" comes back as a top-level
 * link once projects are published from the admin.
 */

export type NavLink = { label: string; href: string; icon: LucideIcon }
export type NavGroup = { label: string; links: NavLink[] }
export type NavEntry = { label: string; href: string } | { label: string; groups: NavGroup[] }

export const NAV: NavEntry[] = [
  {
    label: 'Servicii',
    groups: [
      {
        label: 'Construim',
        links: [
          {
            label: 'Site-uri de prezentare',
            href: '/servicii/site-uri-de-prezentare',
            icon: PanelsTopLeft,
          },
          { label: 'Magazine online', href: '/servicii/magazine-online', icon: ShoppingBag },
          { label: 'Aplicații web', href: '/servicii/aplicatii-web', icon: LayoutDashboard },
          { label: 'Identitate vizuală', href: '/servicii/identitate-vizuala', icon: PenTool },
        ],
      },
      {
        label: 'După lansare',
        links: [
          { label: 'Mentenanță', href: '/servicii/mentenanta', icon: Wrench },
          { label: 'Găzduire', href: '/servicii/gazduire', icon: Server },
        ],
      },
      {
        label: 'Produse',
        links: [{ label: 'CRM și facturare', href: '/produse/crm', icon: ReceiptText }],
      },
    ],
  },
  {
    label: 'Resurse',
    groups: [
      {
        label: 'Învață',
        links: [
          { label: 'Blog', href: '/blog', icon: Newspaper },
          { label: 'Întrebări frecvente', href: '/intrebari-frecvente', icon: CircleHelp },
          { label: 'Cum lucrăm', href: '/#proces', icon: Route },
        ],
      },
      {
        label: 'Firma',
        links: [
          { label: 'Despre noi', href: '/despre-noi', icon: Users },
          { label: 'Contact', href: '/#contact', icon: Mail },
        ],
      },
    ],
  },
]
