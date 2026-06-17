import React, { useState } from 'react'
import RequestForm from './components/RequestForm.jsx'
import RequestDashboard from './components/RequestDashboard.jsx'

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  function handleRequestSubmitted() {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0 }}>
      {/* Fixed header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: '#1e3a5f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
          boxSizing: 'border-box',
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            🏛️
          </div>
          <div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: '500', lineHeight: '1.2' }}>
              LA Department of General Services
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', lineHeight: '1.2' }}>
              Agentic Service Request Triage System
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.12)',
            border: '0.5px solid rgba(255,255,255,0.2)',
            borderRadius: '20px',
            padding: '4px 12px',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#4ade80',
              flexShrink: 0,
            }}
          />
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Gemini AI active</span>
        </div>
      </header>

      {/* Content below fixed header */}
      <div style={{ paddingTop: '60px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '340px 1fr',
            minHeight: 'calc(100vh - 60px)',
          }}
        >
          <aside
            style={{
              background: '#fff',
              borderRight: '0.5px solid #e5e7eb',
              padding: '20px',
              boxSizing: 'border-box',
            }}
          >
            <RequestForm onRequestSubmitted={handleRequestSubmitted} />
          </aside>

          <main
            style={{
              background: '#f8f9fa',
              padding: '20px',
              boxSizing: 'border-box',
              minWidth: 0,
            }}
          >
            <RequestDashboard refreshTrigger={refreshTrigger} />
          </main>
        </div>
      </div>
    </div>
  )
}
