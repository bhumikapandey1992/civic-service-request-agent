/**
 * RequestForm
 *
 * Purpose: Allows city staff to submit a new service request.
 *
 * Props:
 *   onRequestSubmitted {function} - Callback invoked after a successful submission
 *                                   so the parent can trigger a dashboard refresh.
 */

import React, { useState } from 'react'
import { submitRequest } from '../api/requests'

const PRIORITY_COLORS = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#ca8a04',
  Low: '#16a34a',
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
    marginBottom: '4px',
    fontWeight: '600',
    fontSize: '14px',
    color: '#374151',
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    marginBottom: '16px',
    outline: 'none',
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
      <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#1e3a5f', fontSize: '18px' }}>
        Submit a Service Request
      </h2>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle} htmlFor="requestText">
          Service Request Description <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <textarea
          id="requestText"
          style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
          value={requestText}
          onChange={(e) => setRequestText(e.target.value)}
          minLength={10}
          required
          placeholder="Describe the issue in detail (min. 10 characters)..."
        />

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

        <label style={labelStyle} htmlFor="submittedBy">
          Submitted By <span style={{ color: '#dc2626' }}>*</span>
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

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#9ca3af' : '#1e3a5f',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: '20px',
            padding: '20px',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#15803d', fontSize: '16px' }}>
            Request Classified Successfully
          </h3>

          <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
            <Row label="Ticket ID" value={`LA-DGS-${String(result.id).padStart(5, '0')}`} />
            <Row label="Category" value={result.category} />
            <Row
              label="Priority"
              value={
                <span
                  style={{
                    background: PRIORITY_COLORS[result.priority] || '#6b7280',
                    color: '#fff',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '13px',
                  }}
                >
                  {result.priority}
                </span>
              }
            />
            <Row label="Summary" value={result.summary} />
            <Row label="Recommended Action" value={result.recommended_action} />
            <Row label="Department" value={result.department} />
            <Row
              label="Status"
              value={
                <span style={{ color: '#15803d', fontWeight: '600' }}>{result.status}</span>
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
      <span style={{ fontWeight: '600', minWidth: '170px', color: '#4b5563' }}>{label}:</span>
      <span style={{ color: '#111827' }}>{value}</span>
    </div>
  )
}
