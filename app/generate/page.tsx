'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PlayCircle, RefreshCw, AlertCircle } from 'lucide-react'
import { generatePreviews, useGeneratePreviewsSync } from '../../hooks/useTasks'
import { useBlogs } from '../../hooks/useBlogs'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

interface GenerateFormData {
  blogs: string[]
}

export default function GeneratePage() {
  const [isAsync, setIsAsync] = useState(true)
  const { register, handleSubmit, watch } = useForm<GenerateFormData>()
  const { data: blogs, isLoading: blogsLoading } = useBlogs()
  const generateMutation = generatePreviews()
  const generateSyncMutation = useGeneratePreviewsSync()

  const selectedBlogs = watch('blogs') || []

  const onSubmit = async (data: GenerateFormData) => {
    try {
      if (isAsync) {
        await generateMutation.mutateAsync(data.blogs)
      } else {
        await generateSyncMutation.mutateAsync(data.blogs)
      }
    } catch (error) {
      console.error('Generation failed:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generate NHL Previews</h1>
        <p className="text-gray-600">Create AI-powered previews for upcoming NHL games</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setIsAsync(true)}
                className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-colors ${
                  isAsync
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Async Generation</span>
                </div>
                <p className="text-xs mt-1 opacity-75">Background task</p>
              </button>
              <button
                onClick={() => setIsAsync(false)}
                className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-colors ${
                  !isAsync
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <PlayCircle className="w-4 h-4" />
                  <span>Sync Generation</span>
                </div>
                <p className="text-xs mt-1 opacity-75">Immediate processing</p>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Blogs
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Choose which blogs to generate previews for (leave empty for all)
                </p>

                {blogsLoading ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner size="md" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {blogs?.map((blog) => (
                      <label
                        key={blog.id}
                        className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={blog.name}
                          {...register('blogs')}
                          className="h-4 w-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-900">{blog.name}</span>
                          <p className="text-xs text-gray-500 truncate">{blog.url}</p>
                        </div>
                        <span className={`ml-auto px-2 py-1 text-xs rounded-full ${
                          blog.active 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {blog.active ? 'Active' : 'Inactive'}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="mt-2 text-sm text-gray-500">
                  Selected: {selectedBlogs.length} of {blogs?.length || 0} blogs
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">
                      {isAsync ? 'Async Mode' : 'Sync Mode'}
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      {isAsync
                        ? 'Task will run in the background. You can monitor progress in the Tasks section.'
                        : 'Task will run immediately and block until completion. Use for quick generations.'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={generateMutation.isPending || generateSyncMutation.isPending}
                className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
              >
                {(generateMutation.isPending || generateSyncMutation.isPending) ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5" />
                    <span>{isAsync ? 'Start Async Generation' : 'Start Sync Generation'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Mode</span>
                <span className="font-medium">
                  {isAsync ? 'Asynchronous' : 'Synchronous'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Blogs</span>
                <span className="font-medium">{selectedBlogs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Time</span>
                <span className="font-medium">
                  {isAsync ? 'Varies' : '2-5 minutes'}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">NHL Preview</p>
                  <p className="text-xs text-gray-600">2 minutes ago</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Completed
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Game Analysis</p>
                  <p className="text-xs text-gray-600">15 minutes ago</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Running
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}