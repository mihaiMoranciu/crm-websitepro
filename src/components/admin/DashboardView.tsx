import React from 'react'
import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import { Gutter } from '@payloadcms/ui'

import './DashboardView.scss'

const ADMIN_CLIENTS = '/admin/collections/clienti'

const STATUS_LABEL: Record<string, string> = {
  activ: 'Activ',
  prospect: 'Prospect',
  inactiv: 'Inactiv',
}

function Stat({
  label,
  value,
  hint,
  emphasis = false,
}: {
  label: string
  value: number | string
  hint?: string
  emphasis?: boolean
}) {
  return (
    <div className={`crm-stat${emphasis ? ' crm-stat--emphasis' : ''}`}>
      <span className="crm-stat__label">{label}</span>
      <span className="crm-stat__value">{value}</span>
      {hint ? <span className="crm-stat__hint">{hint}</span> : null}
    </div>
  )
}

export async function DashboardView({ initPageResult }: AdminViewServerProps) {
  // The panel has already authenticated the request, so we reuse its user and
  // payload instance instead of opening a second connection.
  const { req } = initPageResult
  const { payload, user } = req

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // overrideAccess: false makes every figure respect the viewer's permissions,
  // so the dashboard can never show more than the user is allowed to read.
  const scope = { overrideAccess: false, user } as const

  const [total, activeCount, prospectCount, inactiveCount, unassignedCount, newCount, recent] =
    await Promise.all([
      payload.count({ collection: 'clienti', ...scope }),
      payload.count({ collection: 'clienti', where: { status: { equals: 'activ' } }, ...scope }),
      payload.count({ collection: 'clienti', where: { status: { equals: 'prospect' } }, ...scope }),
      payload.count({ collection: 'clienti', where: { status: { equals: 'inactiv' } }, ...scope }),
      payload.count({ collection: 'clienti', where: { responsabil: { exists: false } }, ...scope }),
      payload.count({
        collection: 'clienti',
        where: { createdAt: { greater_than: thirtyDaysAgo } },
        ...scope,
      }),
      payload.find({
        collection: 'clienti',
        limit: 6,
        sort: '-createdAt',
        depth: 0,
        select: { nume: true, status: true, tip: true, createdAt: true },
        ...scope,
      }),
    ])

  return (
    // Gutter is the panel's own page wrapper, so horizontal padding matches
    // every other admin screen at all breakpoints.
    <Gutter className="crm-dashboard">
      <header className="crm-dashboard__header">
        <h1>Dashboard</h1>
        <p className="crm-dashboard__subtitle">Situația la zi a portofoliului de clienți.</p>
      </header>

      <section className="crm-dashboard__stats">
        <Stat label="Total clienți" value={total.totalDocs} />
        <Stat label="Activi" value={activeCount.totalDocs} />
        <Stat label="Prospecți" value={prospectCount.totalDocs} hint="De contactat" />
        <Stat label="Inactivi" value={inactiveCount.totalDocs} />
        <Stat label="Adăugați în 30 zile" value={newCount.totalDocs} />
        <Stat
          label="Fără responsabil"
          value={unassignedCount.totalDocs}
          hint={unassignedCount.totalDocs > 0 ? 'Necesită atribuire' : 'Toți au responsabil'}
          emphasis={unassignedCount.totalDocs > 0}
        />
      </section>

      <section>
        <div className="crm-dashboard__section-head">
          <h2 className="crm-dashboard__section-title">Ultimii clienți adăugați</h2>
          <Link className="crm-dashboard__link" href={ADMIN_CLIENTS}>
            Vezi toți
          </Link>
        </div>

        {recent.docs.length === 0 ? (
          <div className="crm-dashboard__empty">
            Niciun client înregistrat încă.{' '}
            <Link className="crm-dashboard__link" href={`${ADMIN_CLIENTS}/create`}>
              Adaugă primul client
            </Link>
          </div>
        ) : (
          <ul className="crm-dashboard__list">
            {recent.docs.map((client) => (
              <li key={client.id}>
                <Link className="crm-dashboard__row" href={`${ADMIN_CLIENTS}/${client.id}`}>
                  <span className="crm-dashboard__row-name">{client.nume}</span>
                  <span className="crm-dashboard__row-meta">
                    <span>{client.tip === 'pj' ? 'Firmă' : 'Persoană fizică'}</span>
                    <span className="crm-dashboard__row-status">
                      {STATUS_LABEL[client.status] ?? client.status}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Gutter>
  )
}
