'use client'

import { useState, useEffect } from 'react'
import { Blog, Sport } from "../../lib/api";
import { api } from "../../lib/api";

interface BlogFormProps {
  blog?: Blog
  onSave: (blog: Blog) => void
  onClose: () => void
}

export const DEFAULT_SYSTEM_PROMPT = "SYSTEM PROMPT: NHL Pick & Betting Preview Generator (Feature Snippet Optimized)\nYou are a professional sports betting analyst and NHL preview writer.\nFOLLOW ALL STRUCTURE AND RULES EXACTLY"
export const DEFAULT_USER_INSTRUCTIONS = "Keep the tone friendly and engaging for readers"

export default function BlogForm({ blog, onSave, onClose }: BlogFormProps) {
  const [name, setName] = useState(blog?.name || '')
  const [url, setUrl] = useState(blog?.url || '')
  const [username, setUsername] = useState(blog?.username || '')
  const [password, setPassword] = useState(blog?.password || '')
  const [throttle, setThrottle] = useState(blog?.throttle_delay || 5)
  const [active, setActive] = useState(blog?.active ?? true)
  // const [systemPrompt, setSystemPrompt] = useState(
  //   blog?.system_prompt || DEFAULT_SYSTEM_PROMPT
  // )
  // const [userInstructions, setUserInstructions] = useState(
  //   blog?.user_instructions || DEFAULT_USER_INSTRUCTIONS
  // )
  const [saving, setSaving] = useState(false)

  // Sports state
  const [sportsList, setSportsList] = useState<Sport[]>([])
  const [selectedSports, setSelectedSports] = useState<string[]>([])

  // Fetch all sports on mount
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const res = await api.get('/sports')
        setSportsList(res.data)
      } catch (error) {
        console.error('Failed to fetch sports', error)
      }
    }
    fetchSports()
  }, [])

  // When editing, pre‑select the blog's sports
  useEffect(() => {
    if (blog && blog.sports) {
      setSelectedSports(blog.sports.map(s => s.name))
    } else {
      setSelectedSports([])
    }
  }, [blog])

  const handleSubmit = async () => {
    setSaving(true)
    const payload: any = {
      name,
      url,
      username,
      password,
      throttle_delay: throttle,
      active,
      // system_prompt: systemPrompt,
      // user_instructions: userInstructions,
      sports: selectedSports, // send array of sport names
    }

    try {
      let res
      if (blog) {
        res = await api.put(`/blogs/${blog.id}`, payload)
      } else {
        res = await api.post('/blogs', payload)
      }
      onSave(res.data)
    } catch (error) {
      console.error('Save failed', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleSport = (sportName: string) => {
    setSelectedSports(prev =>
      prev.includes(sportName)
        ? prev.filter(s => s !== sportName)
        : [...prev, sportName]
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">{blog ? 'Edit Blog' : 'Add Blog'}</h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Blog Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            placeholder="URL"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="password"
            placeholder="Password (optional)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="number"
            placeholder="Throttle Delay (s)"
            value={throttle}
            onChange={e => setThrottle(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          />

          {/* Sports selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Associated Sports
            </label>
            <div className="border rounded p-3 max-h-40 overflow-y-auto">
              {sportsList.map(sport => (
                <label key={sport.id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    checked={selectedSports.includes(sport.name)}
                    onChange={() => toggleSport(sport.name)}
                    className="rounded"
                  />
                  <span className="text-sm">{sport.title || sport.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Prompt fields */}
          {/* <textarea
            placeholder="System Prompt"
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            className="w-full border px-3 py-2 rounded h-20"
          />
          <textarea
            placeholder="User Instructions"
            value={userInstructions}
            onChange={e => setUserInstructions(e.target.value)}
            className="w-full border px-3 py-2 rounded h-20"
          /> */}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              id="active"
            />
            <label htmlFor="active" className="text-sm">Active</label>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              className="btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
