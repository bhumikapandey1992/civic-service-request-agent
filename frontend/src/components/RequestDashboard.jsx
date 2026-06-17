/**
 * RequestDashboard
 *
 * Purpose: Displays all submitted service requests in a filterable table.
 *
 * Props:
 *   refreshTrigger {number} - Increment this value to force the dashboard to
 *                             re-fetch data from the API (used after a new
 *                             request is submitted via RequestForm).
 */

import React, { useState, useEffect } from 'react'
import { fetchRequests } from '../api/requests'

const PRIORITY_COLORS = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#ca8a04',
  Low: '#16a34a',
}

const CATEGORIES = [
  'Facility Maintenance',
  'Public Works',
  'Procurement',
  'IT Support',
  'Safety Issue',
  'General Inquiry',
]

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low']

export default function RequestDashboard({ refreshTrigger }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

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

  const selectStyle = {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    background: '#fff',
    cursor: 'pointer',
  }

  const thStyle = {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #e5e7eb',
    whiteSpace: 'nowrap',
  }

  const tdStyle = {
    padding: '12px 14px',
    fontSize: '13px',
    color: '#374151',
    borderBottom: '1px solid #f3f4f6',
    verticalAlign: 'top',
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '10px',
        padding: '28px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ margin: 0, color: '#1e3a5f', fontSize: '18px' }}>
          Service Requests Dashboard
        </h2>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            style={selectStyle}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            style={selectStyle}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <button
            onClick={loadRequests}
            style={{
              padding: '8px 16px',
              background: '#1e3a5f',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '12px',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: '14px',
            marginBottom: '16px',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
          Loading requests...
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          {requests.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0', fontSize: '14px' }}>
              No requests found.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
              <thead>
                <tr>
                  {['ID', 'Submitted By', 'Location', 'Category', 'Priority', 'Summary', 'Department', 'Status', 'Date'].map(
                    (col) => (
                      <th key={col} style={thStyle}>
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} style={{ background: '#fff' }}>
                    <td style={tdStyle}>{req.id}</td>
                    <td style={tdStyle}>{req.submitted_by}</td>
                    <td style={tdStyle}>{req.location}</td>
                    <td style={tdStyle}>{req.category}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          background: PRIORITY_COLORS[req.priority] || '#6b7280',
                          color: '#fff',
                          padding: '2px 10px',
                          borderRadius: '12px',
                          fontWeight: '600',
                          fontSize: '12px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {req.priority}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, maxWidth: '220px' }}>
                      <span
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {req.summary}
                      </span>
                    </td>
                    <td style={tdStyle}>{req.department}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          color: '#15803d',
                          fontWeight: '600',
                          fontSize: '13px',
                        }}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', fontSize: '12px', color: '#6b7280' }}>
                      {new Date(req.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
