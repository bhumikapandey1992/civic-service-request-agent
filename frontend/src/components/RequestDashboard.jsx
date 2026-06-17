import React, { useState, useEffect } from 'react'
import { fetchRequests } from '../api/requests'

const PRIORITY_BADGE = {
  Critical: { background: '#fef2f2', color: '#dc2626', border: '0.5px solid #fecaca' },
  High:     { background: '#fff7ed', color: '#ea580c', border: '0.5px solid #fed7aa' },
  Medium:   { background: '#fefce8', color: '#ca8a04', border: '0.5px solid #fef08a' },
  Low:      { background: '#f0fdf4', color: '#16a34a', border: '0.5px solid #bbf7d0' },
}

const CATEGORIES = [
  'Facility Maintenance', 'Public Works', 'Procurement',
  'IT Support', 'Safety Issue', 'General Inquiry',
]
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']

function PriorityBadge({ priority }) {
  const s = PRIORITY_BADGE[priority] || { background: '#f3f4f6', color: '#6b7280', border: '0.5px solid #d1d5db' }
  return (
    <span style={{ ...s, borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: '500' }}>
      {priority}
    </span>
  )
}

function formatTicketId(id) {
  return `LA-DGS-${String(id).padStart(5, '0')}`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function RequestModal({ request, onClose }) {
  const fields = [
    { label: 'Ticket ID',           value: formatTicketId(request.id) },
    { label: 'Submitted By',        value: request.submitted_by },
    { label: 'Location',            value: request.location },
    { label: 'Date Submitted',      value: formatDate(request.created_at) },
    { label: 'Category',            value: request.category },
    { label: 'Priority',            value: <PriorityBadge priority={request.priority} /> },
    { label: 'Department',          value: request.department },
    { label: 'Status',              value: <span style={{ color: '#15803d', fontWeight: '500' }}>{request.status}</span> },
    { label: 'Summary',             value: request.summary },
    { label: 'Recommended Action',  value: request.recommended_action },
  ]

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '28px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <span style={{ fontSize: '16px', fontWeight: '500', color: '#1e3a5f' }}>Request details</span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px 8px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr',
            gap: '10px 16px',
            alignItems: 'start',
          }}
        >
          {fields.map(({ label, value }) => (
            <React.Fragment key={label}>
              <span style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', paddingTop: '2px' }}>
                {label}
              </span>
              <span style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                {value}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function RequestDashboard({ refreshTrigger }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)

  async function loadRequests() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRequests({
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
      })
      setRequests(data)
    } catch (err) {
      setError(err.message || 'Failed to load requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, categoryFilter, priorityFilter])

  const stats = [
    { label: 'Total',    value: requests.length,                                       sub: 'all requests', color: '#374151' },
    { label: 'Critical', value: requests.filter((r) => r.priority === 'Critical').length, sub: 'priority',    color: requests.filter((r) => r.priority === 'Critical').length > 0 ? '#dc2626' : '#374151' },
    { label: 'High',     value: requests.filter((r) => r.priority === 'High').length,    sub: 'priority',    color: '#ea580c' },
    { label: 'Open',     value: requests.filter((r) => r.status === 'Open').length,      sub: 'active',      color: '#16a34a' },
  ]

  const selectStyle = {
    border: '0.5px solid #d1d5db',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '12px',
    background: '#fff',
    cursor: 'pointer',
    fontFamily: 'inherit',
    outline: 'none',
    color: '#374151',
  }

  const thStyle = {
    padding: '9px 12px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '500',
    color: '#6b7280',
    background: '#f9fafb',
    borderBottom: '0.5px solid #e5e7eb',
  }

  const tdBase = {
    padding: '10px 12px',
    fontSize: '12px',
    color: '#374151',
    verticalAlign: 'top',
  }

  const columns = ['ID', 'Submitted by', 'Location', 'Category', 'Priority', 'Summary']

  return (
    <div>
      {selectedRequest && (
        <RequestModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
      )}

      {/* Header */}
      <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '14px' }}>
        Service requests dashboard
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 160px))',
          justifyContent: 'flex-start',
          gap: '10px',
          marginBottom: '16px',
        }}
      >
        {stats.map(({ label, value, sub, color }) => (
          <div
            key={label}
            style={{
              background: '#fff',
              border: '0.5px solid #e5e7eb',
              borderRadius: '8px',
              padding: '10px 12px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>{label}</div>
            <div style={{ fontSize: '20px', fontWeight: '500', color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
          flexWrap: 'wrap',
        }}
      >
        <select style={selectStyle} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select style={selectStyle} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button
          onClick={loadRequests}
          style={{ ...selectStyle, marginLeft: 'auto' }}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: '10px 12px',
            background: '#fef2f2',
            border: '0.5px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '12px',
            marginBottom: '12px',
          }}
        >
          {error}
        </div>
      )}

      {/* Table */}
      <div
        style={{
          background: '#fff',
          border: '0.5px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0', fontSize: '13px', margin: 0 }}>
            Loading requests...
          </p>
        ) : requests.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0', fontSize: '13px', margin: 0 }}>
            No requests found.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col} style={thStyle}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((req, idx) => {
                const isLast = idx === requests.length - 1
                const td = { ...tdBase, borderBottom: isLast ? 'none' : '0.5px solid #e5e7eb' }
                return (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    style={{ cursor: 'pointer', background: '#fff' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}
                  >
                    <td style={td}>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>#{req.id}</div>
                      <div style={{ fontSize: '10px', color: '#9ca3af' }}>{formatTicketId(req.id)}</div>
                    </td>
                    <td style={td}>{req.submitted_by}</td>
                    <td style={td}>{req.location}</td>
                    <td style={td}>{req.category}</td>
                    <td style={td}><PriorityBadge priority={req.priority} /></td>
                    <td
                      style={{
                        ...td,
                        maxWidth: '160px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: '11px',
                        color: '#6b7280',
                      }}
                    >
                      {req.summary}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
