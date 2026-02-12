'use client'

import { useState, useEffect } from 'react'
import { useBlogs } from '../../hooks/useBlogs'
import { sportPromptsApi, SportPrompt } from '../../lib/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Save, Edit2, X, Check } from 'lucide-react'

export default function SportPromptsPage() {
  const { data: blogs, isLoading, refetch } = useBlogs({ includePrompts: true }) // need to extend hook
  const [editing, setEditing] = useState<Record<string, boolean>>({})
  const [promptValues, setPromptValues] = useState<Record<string, SportPrompt>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  // Generate a unique key for each blog+sport
  const getKey = (blogId: number, sportId: number) => `${blogId}-${sportId}`

  // Initialize local state when data loads
  useEffect(() => {
    if (!blogs) return
    const initial: Record<string, SportPrompt> = {}
    blogs.forEach((blog: any) => {
      blog.sports?.forEach((sport: any) => {
        const prompt = blog.sport_prompts?.find((p: any) => p.sport_id === sport.id)
        const key = getKey(blog.id, sport.id)
        initial[key] = {
          blog_id: blog.id,
          sport_id: sport.id,
          sport_name: sport.name,
          system_prompt: prompt?.system_prompt ?? '',
          user_instructions: prompt?.user_instructions ?? '',
        }
      })
    })
    setPromptValues(initial)
  }, [blogs])

  const handleEdit = (key: string) => {
    setEditing((prev) => ({ ...prev, [key]: true }))
  }

  const handleCancel = (key: string) => {
    setEditing((prev) => ({ ...prev, [key]: false }))
    // revert to original value (re-fetch from props)
    if (blogs) {
      const [blogId, sportId] = key.split('-').map(Number)
      const blog = blogs.find((b: any) => b.id === blogId)
      const sport = blog?.sports?.find((s: any) => s.id === sportId)
      const prompt = blog?.sport_prompts?.find((p: any) => p.sport_id === sportId)
      setPromptValues((prev) => ({
        ...prev,
        [key]: {
          blog_id: blogId,
          sport_id: sportId,
          sport_name: sport?.name,
          system_prompt: prompt?.system_prompt ?? '',
          user_instructions: prompt?.user_instructions ?? '',
        },
      }))
    }
  }

  const handleChange = (key: string, field: 'system_prompt' | 'user_instructions', value: string) => {
    setPromptValues((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }))
  }

  const handleSave = async (key: string) => {
    const prompt = promptValues[key]
    if (!prompt) return
    setSaving((prev) => ({ ...prev, [key]: true }))
    try {
      await sportPromptsApi.update(prompt.blog_id, prompt.sport_id, {
        system_prompt: prompt.system_prompt || null,
        user_instructions: prompt.user_instructions || null,
      })
      setEditing((prev) => ({ ...prev, [key]: false }))
      refetch() // refresh blog data to get updated prompts
    } catch (error) {
      console.error('Failed to save sport prompt:', error)
      alert('Failed to save. Please try again.')
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sport‑Specific Prompts</h1>
        <p className="text-gray-600">
          Customize system prompts and user instructions per blog and per sport.
          Leave blank to use the blog’s generic prompts or sport defaults.
        </p>
      </div>

      {blogs?.map((blog: any) => (
        <div key={blog.id} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">{blog.name}</h2>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              blog.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {blog.active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="space-y-6">
            {blog.sports?.map((sport: any) => {
              const key = getKey(blog.id, sport.id)
              const prompt = promptValues[key]
              const isEditing = editing[key]
              const isSaving = saving[key]

              return (
                <div key={sport.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{sport.title || sport.name}</h3>
                    {!isEditing ? (
                      <button
                        onClick={() => handleEdit(key)}
                        className="text-primary-600 flex items-center gap-1 text-sm"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(key)}
                          disabled={isSaving}
                          className="text-green-600 flex items-center gap-1 text-sm disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : <><Save size={14} /> Save</>}
                        </button>
                        <button
                          onClick={() => handleCancel(key)}
                          disabled={isSaving}
                          className="text-gray-500 flex items-center gap-1 text-sm"
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        System Prompt
                      </label>
                      {isEditing ? (
                        <textarea
                          value={prompt?.system_prompt ?? ''}
                          onChange={(e) => handleChange(key, 'system_prompt', e.target.value)}
                          rows={4}
                          className="w-full border rounded px-3 py-2 text-sm font-mono"
                          placeholder="Leave empty to use blog generic or sport default"
                        />
                      ) : (
                        <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">
                          {prompt?.system_prompt || (
                            <span className="text-gray-400 italic">Using blog generic / sport default</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        User Instructions
                      </label>
                      {isEditing ? (
                        <textarea
                          value={prompt?.user_instructions ?? ''}
                          onChange={(e) => handleChange(key, 'user_instructions', e.target.value)}
                          rows={4}
                          className="w-full border rounded px-3 py-2 text-sm"
                          placeholder="Additional instructions for this sport"
                        />
                      ) : (
                        <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">
                          {prompt?.user_instructions || (
                            <span className="text-gray-400 italic">None</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}