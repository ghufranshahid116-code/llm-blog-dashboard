'use client'

import { useState } from 'react'
import { Sport } from "../../lib/api"
import { sportsApi } from "../../lib/api"

interface SportFormProps {
  sport?: Sport
  onSave: () => void
  onClose: () => void
}

export default function SportForm({ sport, onSave, onClose }: SportFormProps) {
  const [name, setName] = useState(sport?.name || '')
  const [title, setTitle] = useState(sport?.title || '')
  const [oddsKey, setOddsKey] = useState(sport?.odds_key || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    setSaving(true)
    const payload = { name, title, odds_key: oddsKey, stats_sources: {} }
    try {
      if (sport) {
        await sportsApi.updateSport(sport.id, payload)
      } else {
        await sportsApi.createSport(payload)
      }
      onSave()
    } catch (error) {
      console.error('Failed to save sport', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{sport ? 'Edit Sport' : 'Add Sport'}</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Sport Name (e.g., epl)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            placeholder="Display Title (e.g., English Premier League)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            placeholder="Odds Key (e.g., soccer_epl)"
            value={oddsKey}
            onChange={e => setOddsKey(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <div className="flex justify-end space-x-2 mt-4">
            <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}