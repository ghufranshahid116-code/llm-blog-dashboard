'use client'

import { useState, useEffect } from 'react'
import { Sport } from "../../lib/api"
import { sportsApi } from "../../lib/api"
import LoadingSpinner from '../../components/LoadingSpinner'
import SportForm from './SportForm'
import { Pencil, Trash2 } from 'lucide-react'

export default function SportsPage() {
  const [sports, setSports] = useState<Sport[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSport, setEditingSport] = useState<Sport | null>(null)

  const fetchSports = async () => {
    setLoading(true)
    try {
      const data = await sportsApi.getSports()
      setSports(data)
    } catch (error) {
      console.error('Failed to fetch sports', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSports()
  }, [])

  const handleSave = () => {
    setShowForm(false)
    setEditingSport(null)
    fetchSports()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sport?')) return
    try {
      await sportsApi.deleteSport(id)
      fetchSports()
    } catch (error) {
      console.error('Delete failed', error)
      alert('Failed to delete sport (maybe it is associated with blogs?)')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sports Management</h1>
          <p className="text-gray-600">Manage sports that blogs can cover</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingSport(null); setShowForm(true) }}>
          Add New Sport
        </button>
      </div>

      {showForm && (
        <SportForm
          sport={editingSport}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingSport(null) }}
        />
      )}

      {loading ? (
        <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odds Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sports.map(sport => (
                <tr key={sport.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sport.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sport.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sport.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sport.odds_key}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => { setEditingSport(sport); setShowForm(true) }}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sport.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}