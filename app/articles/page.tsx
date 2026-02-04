'use client'

import { useState } from 'react'
import { FileText, Calendar, Edit, Save, X } from 'lucide-react'
import { useArticles } from '../../hooks/useBlogs'
import LoadingSpinner from '../../components/LoadingSpinner'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://statsgeneral.com/api'


export default function ArticlesPage() {
  const [page, setPage] = useState(0)
  const [expandedArticles, setExpandedArticles] = useState<{ [key: number]: boolean }>({})
  const [editingArticle, setEditingArticle] = useState<{ [key: number]: boolean }>({})
  const [editedContent, setEditedContent] = useState<{ [key: number]: string }>({})
  const limit = 20

  const { data, isLoading, refetch } = useArticles(limit, page * limit)

  const toggleExpand = (index: number) => {
    setExpandedArticles(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const startEditing = (index: number, content: string) => {
    setEditingArticle(prev => ({ ...prev, [index]: true }))
    setEditedContent(prev => ({ ...prev, [index]: content }))
  }

  const cancelEditing = (index: number) => {
    setEditingArticle(prev => ({ ...prev, [index]: false }))
  }

  const saveArticle = async (articleId: number, index: number) => {
    try {
      const token = localStorage.getItem('token') // Or wherever you store auth
      const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: editedContent[index] })
      })

      if (!response.ok) throw new Error('Failed to save article')

      setEditingArticle(prev => ({ ...prev, [index]: false }))
      refetch() // refresh articles
    } catch (err) {
      console.error(err)
      alert('Error saving article')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
        <p className="text-gray-600">Generated sports preview articles</p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-4">
          {data?.map((article: any, index: number) => {
            const isExpanded = expandedArticles[index] || false
            const isEditing = editingArticle[index] || false

            return (
              <div key={index} className="card hover:shadow-md transition-shadow p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-6 h-6 text-primary-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{article.title || 'Untitled Article'}</h3>
                      <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{article.generated_at ? new Date(article.generated_at + 'Z').toLocaleString() : 'Unknown date'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Edit button */}
                  {!isEditing && (
                    <button
                      className="ml-4 text-sm text-primary-600 flex items-center gap-1"
                      onClick={() => startEditing(index, article.content)}
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                  )}
                </div>

                {/* Article content / editor */}
                {article.content && (
                  <div className="mt-3 text-sm text-gray-700">
                    {isEditing ? (
                      <>
                        <textarea
                          value={editedContent[index]}
                          onChange={(e) => setEditedContent(prev => ({ ...prev, [index]: e.target.value }))}
                          className="w-full border rounded p-2"
                          rows={6}
                        />
                        <div className="flex space-x-2 mt-2">
                          <button
                            className="btn-primary flex items-center gap-1"
                            onClick={() => saveArticle(article.id, index)}
                          >
                            <Save className="w-4 h-4" /> Save
                          </button>
                          <button
                            className="btn-secondary flex items-center gap-1"
                            onClick={() => cancelEditing(index)}
                          >
                            <X className="w-4 h-4" /> Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className={isExpanded ? '' : 'line-clamp-3'}>{article.content}</p>
                        {article.content.split(' ').length > 30 && (
                          <button
                            onClick={() => toggleExpand(index)}
                            className="text-primary-600 font-medium mt-1"
                          >
                            {isExpanded ? 'See Less' : 'See More'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Pagination */}
          <div className="flex justify-between pt-4">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary disabled:opacity-50">
              Previous
            </button>
            <button onClick={() => setPage(p => p + 1)} className="btn-primary">
              Next
            </button>
          </div>
        </div>
      )}

      {!isLoading && data?.length === 0 && <div className="text-center py-12 text-gray-500">No articles found</div>}
    </div>
  )
}
