/**
 * App
 *
 * Purpose: Root layout component. Renders the header, a two-column layout
 *          with RequestForm on the left and RequestDashboard on the right,
 *          and coordinates the refresh cycle between them via refreshTrigger state.
 */

import React, { useState } from 'react'
import RequestForm from './components/RequestForm.jsx'
import RequestDashboard from './components/RequestDashboard.jsx'

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  function handleRequestSubmitted() {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header
        style={{
          background: '#1e3a5f',
          color: '#fff',
          padding: '24px 32px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>
          🏛️ LA Department of General Services
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '14px', opacity: 0.8 }}>
          Agentic Service Request Triage System
        </p>
      </header>

      {/* Two-column layout, stacks on mobile */}
      <main
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
          padding: '28px 24px',
          maxWidth: '1400px',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <section>
          <RequestForm onRequestSubmitted={handleRequestSubmitted} />
        </section>

        <section style={{ minWidth: 0 }}>
          <RequestDashboard refreshTrigger={refreshTrigger} />
        </section>
      </main>
    </div>
  )
}
