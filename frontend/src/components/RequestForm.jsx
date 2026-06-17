import React, { useState } from 'react'
import { submitRequest } from '../api/requests'

const PRIORITY_BADGE = {
  Critical: { background: '#fef2f2', color: '#dc2626', border: '0.5px solid #fecaca' },
  High:     { background: '#fff7ed', color: '#ea580c', border: '0.5px solid #fed7aa' },
  Medium:   { background: '#fefce8', color: '#ca8a04', border: '0.5px solid #fef08a' },
  Low:      { background: '#f0fdf4', color: '#16a34a', border: '0.5px solid #bbf7d0' },
}

function PriorityBadge({ priority }) {
  const s = PRIORITY_BADGE[priority] || { background: '#f3f4f6', color: '#6b7280', border: '0.5px solid #d1d5db' }
  return (
    <span style={{ ...s, borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: '500' }}>
      {priority}
    </span>
  )
}

export default function RequestForm({ onRequestSubmitted }) {
  const [requestText, setRequestText] = useState('')
  const [location, setLocation] = useState('')
  const [submittedBy, setSubmittedBy] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await submitRequest({
        request_text: requestText,
        location,
        submitted_by: submittedBy,
      })
      setResult(data)
      setRequestText('')
      setLocation('')
      setSubmittedBy('')
      if (onRequestSubmitted) onRequestSubmitted()
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '4px',
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    border: '0.5px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
    color: '#374151',
  }

  const resultFields = result
    ? [
        { label: 'Ticket',   value: `LA-DGS-${String(result.id).padStart(5, '0')}` },
        { label: 'Category', value: result.category },
        { label: 'Priority', value: <PriorityBadge priority={result.priority} /> },
        { label: 'Summary',  value: result.summary },
        { label: 'Action',   value: result.recommended_action },
        { label: 'Status',   value: result.status },
      ]
    : []

  return (
    <div>
      <div
        style={{
          fontSize: '13px',
          fontWeight: '500',
          color: '#6b7280',
          marginBottom: '16px',
        }}
      >
        Submit a request
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle} htmlFor="requestText">
            Description <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <textarea
            id="requestText"
            style={{ ...inputStyle, height: '80px', resize: 'none' }}
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
            minLength={10}
            required
            placeholder="Describe the issue in detail..."
          />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={labelStyle} htmlFor="location">
            Location <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            id="location"
            type="text"
            style={inputStyle}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            minLength={2}
            required
            placeholder="e.g. City Hall, 200 N Spring St"
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle} htmlFor="submittedBy">
            Submitted by <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            id="submittedBy"
            type="text"
            style={inputStyle}
            value={submittedBy}
            onChange={(e) => setSubmittedBy(e.target.value)}
            minLength={2}
            required
            placeholder="Your name"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            background: loading ? '#9ca3af' : '#1e3a5f',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {loading ? 'Submitting...' : 'Submit request'}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 12px',
            background: '#fef2f2',
            border: '0.5px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '12px',
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div
          style={{
            background: '#f0fdf4',
            border: '0.5px solid #bbf7d0',
            borderRadius: '8px',
            padding: '14px',
            marginTop: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '10px',
            }}
          >
            <span style={{ color: '#16a34a', fontSize: '13px', lineHeight: 1 }}>✓</span>
            <span style={{ fontSize: '12px', fontWeight: '500', color: '#16a34a' }}>
              Request classified
            </span>
          </div>

          {resultFields.map(({ label, value }, i) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderBottom: i < resultFields.length - 1 ? '0.5px solid #dcfce7' : 'none',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '11px', color: '#15803d', flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: '11px', color: '#166534', fontWeight: '500', textAlign: 'right' }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
