'use client'

import { useState, useEffect } from 'react'
import { Blog, Sport } from "../../lib/api";
import { api, sportsApi } from "../../lib/api";

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
  const [uploading, setUploading] = useState(false)

  // Sports state
  const [sportsList, setSportsList] = useState<Sport[]>([])
  const [selectedSports, setSelectedSports] = useState<string[]>([])

  // Template image
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [templatePreview, setTemplatePreview] = useState<string | null>(blog?.template_image_url || null)

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

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (templatePreview && templatePreview.startsWith('blob:')) {
        URL.revokeObjectURL(templatePreview)
      }
    }
  }, [templatePreview])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setTemplateFile(file)
      const previewUrl = URL.createObjectURL(file)
      setTemplatePreview(previewUrl)
    }
  }

  const handleRemoveTemplate = () => {
    setTemplateFile(null)
    setTemplatePreview(null)
  }

  const handleSubmit = async () => {
    setSaving(true)
    try {
      let finalBlog: Blog

      if (templateFile && blog) {
        setUploading(true)
        const uploadRes = await sportsApi.uploadBlogTemplate(blog.id, templateFile)
        const templateUrl = uploadRes.template_image_url
        setUploading(false)
        const payload: any = {
          name,
          url,
          username,
          throttle_delay: throttle,
          active,
          sports: selectedSports,
          template_image_url: templateUrl,
        }
        const res = await api.put(`/blogs/${blog.id}`, payload)
        finalBlog = res.data
      } else if (templateFile && !blog) {
        const payload: any = {
          name,
          url,
          username,
          throttle_delay: throttle,
          active,
          password,
          sports: selectedSports,
        }
        const createRes = await api.post('/blogs', payload)
        finalBlog = createRes.data
        setUploading(true)
        await sportsApi.uploadBlogTemplate(finalBlog.id, templateFile)
        setUploading(false)
        const refreshed = await api.get(`/blogs/${finalBlog.id}`)
        finalBlog = refreshed.data
      } else {
        const payload: any = {
          name,
          url,
          username,
          throttle_delay: throttle,
          active,
          password,
          sports: selectedSports,
          template_image_url: templatePreview && !templatePreview.startsWith('blob:') ? templatePreview : null,
        }
        if (blog) {
          const res = await api.put(`/blogs/${blog.id}`, payload)
          finalBlog = res.data
        } else {
          const res = await api.post('/blogs', payload)
          finalBlog = res.data
        }
      }

      onSave(finalBlog)
    } catch (error) {
      console.error('Save failed', error)
    } finally {
      setSaving(false)
      setUploading(false)
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

          {/* Template image upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Image (for generated previews)
            </label>
            {templatePreview && (
              <div className="mb-2 relative">
                <img
                  src={templatePreview}
                  alt="Template preview"
                  className="max-h-32 rounded border"
                />
                <button
                  type="button"
                  onClick={handleRemoveTemplate}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
                >
                  ✕
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
              className="w-full border px-3 py-2 rounded"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended size: 1200×630 pixels. PNG or JPEG.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              className="btn-secondary"
              onClick={onClose}
              disabled={saving || uploading}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={saving || uploading}
            >
              {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
