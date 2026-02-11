'use client'

import { useState } from 'react'
import { Globe, User } from 'lucide-react'
import { useBlogs } from '../../hooks/useBlogs'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDistanceToNow } from 'date-fns'
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_USER_INSTRUCTIONS } from './BlogForm'
import BlogForm from './BlogForm'
import { sportsApi } from "../../lib/api"

export default function BlogsPage() {
  const { data: blogs, isLoading, refetch } = useBlogs()
  const [filterActive, setFilterActive] = useState<string>('all')
  const [editingBlog, setEditingBlog] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)

  const filteredBlogs = blogs?.filter(blog => {
    if (filterActive === 'all') return true
    if (filterActive === 'active') return blog.active
    if (filterActive === 'inactive') return !blog.active
    return true
  }) || []

  const handleSave = (savedBlog: any) => {
    setShowForm(false)
    setEditingBlog(null)
    refetch?.()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Configure and manage blog sources</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingBlog(null)
            setShowForm(true)
          }}
        >
          Add New Blog
        </button>
      </div>

      {showForm && (
        <BlogForm
          blog={editingBlog}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false)
            setEditingBlog(null)
          }}
        />
      )}

      {/* Filters */}
      <div className="flex space-x-2 mb-4">
        {['all', 'active', 'inactive'].map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterActive(filter)}
            className={`px-4 py-2 rounded-lg font-medium ${filterActive === filter
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            {filter === 'all'
              ? ` (${blogs?.length || 0})`
              : filter === 'active'
              ? ` (${blogs?.filter(b => b.active).length || 0})`
              : ` (${blogs?.filter(b => !b.active).length || 0})`}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <div key={blog.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{blog.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{blog.username}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${blog.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                  {blog.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2">
                <pre className="text-xs text-gray-700 p-2 bg-gray-50 rounded overflow-x-auto">
                  {blog.system_prompt || DEFAULT_SYSTEM_PROMPT}
                </pre>

                <pre className="text-xs text-gray-700 p-2 bg-gray-50 rounded overflow-x-auto">
                  {blog.user_instructions || DEFAULT_USER_INSTRUCTIONS}
                </pre>
              </div>

              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <button
                  className="flex-1 btn-secondary py-2 text-sm"
                  onClick={() => {
                    setEditingBlog(blog)
                    setShowForm(true)
                  }}
                >
                  Edit
                </button>
                <button
                  className="flex-1 btn-primary py-2 text-sm"
                  onClick={async () => {
                    try {
                      // Use multi-sport API for activate/deactivate
                      await sportsApi.deactivateBlog(blog.id, { active: !blog.active })
                      refetch?.()
                    } catch (error) {
                      console.error("Failed to update blog:", error)
                    }
                  }}
                >
                  {blog.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
