import React from 'react'
import Link from 'next/link'

import './NavDashboardLink.scss'

export function NavDashboardLink() {
  return (
    <Link className="nav-dashboard-link" href="/admin">
      Dashboard
    </Link>
  )
}
