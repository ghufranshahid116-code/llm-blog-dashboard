'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { PlayCircle, RefreshCw, AlertCircle, Calendar } from 'lucide-react'
import { sportsApi } from '../../lib/api'
import { useBlogs } from '../../hooks/useBlogs'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

interface GenerateFormData {
  blogs: string[]
  sport: string
}

const useSports = () => {
  const [sports, setSports] = useState<{ name: string; title: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const data = await sportsApi.getSports()
        setSports(data || [])
      } catch (error) {
        console.error('Failed to fetch sports', error)
        setSports([])
      } finally {
        setLoading(false)
      }
    }
    fetchSports()
  }, [])

  return { sports, loading }
}

export default function GeneratePage() {
  const [isAsync, setIsAsync] = useState(true)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  const { register, handleSubmit, watch, setValue } = useForm<GenerateFormData>({
    defaultValues: { sport: '' },
  })
  const { data: blogs, isLoading: blogsLoading } = useBlogs()
  const { sports, loading: sportsLoading } = useSports()

  // Set default sport once sports are loaded
  useEffect(() => {
    if (sports.length > 0 && !watch('sport')) {
      setValue('sport', sports[0].name)
    }
  }, [sports, setValue, watch])

  const selectedBlogs = watch('blogs') || []
  const selectedSport = watch('sport') || (sports[0]?.name || '')

  const onSubmit = async (data: GenerateFormData) => {
    try {
      const payload = {
        sport: data.sport,
        blogs: data.blogs?.length ? data.blogs : undefined,
        from_date: selectedDate,
        to_date: selectedDate,
      }

      if (isAsync) {
        await sportsApi.generatePreviews(payload)
        toast.success(`${data.sport.toUpperCase()} previews generation started for ${selectedDate}!`)
      } else {
        await sportsApi.generatePreviewsSync(payload)
        toast.success(`${data.sport.toUpperCase()} previews generated for ${selectedDate}!`)
      }
    } catch (error) {
      console.error('Generation failed:', error)
      toast.error('Generation failed')
    }
  }

  if (sportsLoading || blogsLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generate Previews</h1>
        <p className="text-gray-600">
          Create AI-powered previews for upcoming games on a selected day
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            {/* Async / Sync Buttons */}
            <div className="flex space-x-4 mb-6">
              <button
                type="button"
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
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Sport Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Sport
                </label>
                <select
                  {...register('sport')}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  {sports.map((sport) => (
                    <option key={sport.name} value={sport.name}>
                      {sport.title || sport.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Game Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Games starting on this local date will be fetched (converted to UTC range).
                </p>
              </div>

              {/* Blog Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Blogs
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Choose which blogs to generate previews for (leave empty for all)
                </p>

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
                      <span
                        className={`ml-auto px-2 py-1 text-xs rounded-full ${
                          blog.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {blog.active ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="mt-2 text-sm text-gray-500">
                  Selected: {selectedBlogs.length} of {blogs?.length ?? 0} blogs
                </div>
              </div>

              {/* Mode Info */}
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

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
              >
                <PlayCircle className="w-5 h-5" />
                <span>{isAsync ? 'Start Async Generation' : 'Start Sync Generation'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Mode</span>
                <span className="font-medium">{isAsync ? 'Asynchronous' : 'Synchronous'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Selected Blogs</span>
                <span className="font-medium">{selectedBlogs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sport</span>
                <span className="font-medium">{selectedSport.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">{selectedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}