// components/BulkSyncModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Play, Loader } from 'lucide-react'
import { useBlogs } from '../hooks/useBlogs'
import { useSports } from '../hooks/useSports'
import { re, BulkSyncRequest, TaskStatus } from '../lib/api'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function BulkSyncModal({ isOpen, onClose }: Props) {
  const { data: blogs, isLoading: blogsLoading } = useBlogs()
  const { data: sports, isLoading: sportsLoading } = useSports()

  const [form, setForm] = useState<BulkSyncRequest>({
    blog_id: 0,
    sport_id: 0,
    generate_missing: true,
    regenerate_existing: false,
    status: '',
    older_than_days: undefined,
    limit: undefined,
    skip_throttle: false,
  })
  const [taskId, setTaskId] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null)
  const [loading, setLoading] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        blog_id: 0,
        sport_id: 0,
        generate_missing: true,
        regenerate_existing: false,
        status: '',
        older_than_days: undefined,
        limit: undefined,
        skip_throttle: false,
      })
      setTaskId(null)
      setTaskStatus(null)
    }
  }, [isOpen])

  // Poll task status
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (taskId) {
      const poll = async () => {
        try {
          const res = await re.getTask(taskId)
          setTaskStatus(res.data)
          if (res.data.status === 'completed' || res.data.status === 'failed') {
            clearInterval(interval)
            if (res.data.status === 'completed') {
              toast.success('Bulk sync completed!')
            } else {
              toast.error(`Bulk sync failed: ${res.data.error}`)
            }
          }
        } catch (err) {
          toast.error('Failed to fetch task status')
          clearInterval(interval)
        }
      }
      poll()
      interval = setInterval(poll, 2000)
    }
    return () => clearInterval(interval)
  }, [taskId])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setForm(prev => ({ ...prev, [name]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.blog_id || !form.sport_id) {
      toast.error('Please select both a blog and a sport')
      return
    }
    setLoading(true)
    setTaskId(null)
    try {
      const res = await re.startBulkSync(form)
      setTaskId(res.data.task_id)
      toast.success('Bulk sync started!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to start sync')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bulk Sync Articles</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {taskId ? (
          <div className="space-y-3">
            <p>
              <strong>Task ID:</strong> {taskId}
            </p>
            <p>
              <strong>Status:</strong> {taskStatus?.status}
            </p>
            {taskStatus?.result && (
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(taskStatus.result, null, 2)}
              </pre>
            )}
            {taskStatus?.error && (
              <div className="text-red-600 bg-red-50 p-3 rounded">
                Error: {taskStatus.error}
              </div>
            )}
            <button onClick={onClose} className="btn-primary w-full">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Blog Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blog <span className="text-red-500">*</span>
              </label>
              <select
                name="blog_id"
                value={form.blog_id}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">Select a blog</option>
                {blogsLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  blogs?.map(blog => (
                    <option key={blog.id} value={blog.id}>
                      {blog.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Sport Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sport <span className="text-red-500">*</span>
              </label>
              <select
                name="sport_id"
                value={form.sport_id}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">Select a sport</option>
                {sportsLoading ? (
                  <option disabled>Loading...</option>
                ) : (
                  sports?.map(sport => (
                    <option key={sport.id} value={sport.id}>
                      {sport.title || sport.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="generate_missing"
                  checked={form.generate_missing}
                  onChange={handleChange}
                />
                <span className="text-sm">Generate missing articles</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="regenerate_existing"
                  checked={form.regenerate_existing}
                  onChange={handleChange}
                />
                <span className="text-sm">Regenerate existing articles</span>
              </label>
            </div>

            {form.regenerate_existing && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status filter (optional)
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Any</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="regenerated">Regenerated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Older than (days)
                  </label>
                  <input
                    type="number"
                    name="older_than_days"
                    value={form.older_than_days || ''}
                    onChange={handleChange}
                    min="0"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max articles to process (limit)
              </label>
              <input
                type="number"
                name="limit"
                value={form.limit || ''}
                onChange={handleChange}
                min="1"
                className="w-full p-2 border rounded"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="skip_throttle"
                checked={form.skip_throttle}
                onChange={handleChange}
              />
              <span className="text-sm">Skip throttle delay (faster)</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Sync
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}