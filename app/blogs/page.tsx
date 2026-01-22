'use client'

import { useState } from 'react'
import { Globe, User, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useBlogs } from '../../hooks/useBlogs'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDistanceToNow } from 'date-fns'

export default function BlogsPage() {
  const { data: blogs, isLoading } = useBlogs()
  const [filterActive, setFilterActive] = useState<string>('all')

  const filteredBlogs = blogs?.filter(blog => {
    if (filterActive === 'all') return true
    if (filterActive === 'active') return blog.active
    if (filterActive === 'inactive') return !blog.active
    return true
  }) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Configure and manage blog sources</p>
        </div>
        <button className="btn-primary">
          Add New Blog
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilterActive('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filterActive === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Blogs ({blogs?.length || 0})
        </button>
        <button
          onClick={() => setFilterActive('active')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filterActive === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active ({blogs?.filter(b => b.active).length || 0})
        </button>
        <button
          onClick={() => setFilterActive('inactive')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filterActive === 'inactive'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Inactive ({blogs?.filter(b => !b.active).length || 0})
        </button>
      </div>

      {/* Blogs Grid */}
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
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  blog.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {blog.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">URL</p>
                  <a
                    href={blog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 truncate block"
                  >
                    {blog.url}
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Throttle Delay</p>
                    <p className="text-sm font-medium text-gray-900">
                      {blog.throttle_delay}ms
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Created</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDistanceToNow(new Date(blog.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <button className="flex-1 btn-secondary py-2 text-sm">
                    Edit
                  </button>
                  <button className="flex-1 btn-primary py-2 text-sm">
                    {blog.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredBlogs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
          <p className="text-gray-600">Try adjusting your filter or add a new blog</p>
        </div>
      )}
    </div>
  )
}