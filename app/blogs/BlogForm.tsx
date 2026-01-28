'use client'

import { useState, useEffect } from 'react'
import { Blog } from "../../lib/api";
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
  const [throttle, setThrottle] = useState(blog?.throttle_delay || 5)
  const [active, setActive] = useState(blog?.active ?? true)
  const [systemPrompt, setSystemPrompt] = useState(
    blog?.system_prompt || DEFAULT_SYSTEM_PROMPT
  )
  const [userInstructions, setUserInstructions] = useState(
    blog?.user_instructions || DEFAULT_USER_INSTRUCTIONS
  )
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    setSaving(true)
    const payload = {
      name,
      url,
      username,
      throttle_delay: throttle,
      active,
      system_prompt: systemPrompt,
      user_instructions: userInstructions,
    }

    let res
    if (blog) {
      res = await api.put(`/blogs/${blog.id}`, payload)
    } else {
      res = await api.post('/blogs', payload)
    }

    onSave(res.data)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
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
            type="number"
            placeholder="Throttle Delay (s)"
            value={throttle}
            onChange={e => setThrottle(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          />

          {/* Prompt fields */}
          <textarea
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
          />

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
