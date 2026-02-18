'use client'

import { useState } from 'react'
import { FileText, Calendar, Edit, Save, X, Search } from 'lucide-react'
import { useArticles } from '../../hooks/useBlogs'
import LoadingSpinner from '../../components/LoadingSpinner'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://statsgeneral.com/api'
import BulkSyncModal from '../../components/BulkSyncModal'


export default function ArticlesPage() {
  const [page, setPage] = useState(0)
  const [showBulkModal, setShowBulkModal] = useState(false)

  const [expandedArticles, setExpandedArticles] = useState<Record<number, boolean>>(
    {}
  )

  const [editingArticle, setEditingArticle] = useState<Record<number, boolean>>(
    {}
  )

  const [editedContent, setEditedContent] = useState<Record<number, string>>({})

  /* 🔍 Regenerate Modal State */
  const [showModal, setShowModal] = useState(false)
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [regenerating, setRegenerating] = useState(false)

  const limit = 20

  const { data, isLoading, refetch } = useArticles(limit, page * limit)

  /* ---------------- Helpers ---------------- */

  const toggleExpand = (index: number) => {
    setExpandedArticles(p => ({ ...p, [index]: !p[index] }))
  }

  const startEditing = (index: number, content: string) => {
    setEditingArticle(p => ({ ...p, [index]: true }))
    setEditedContent(p => ({ ...p, [index]: content }))
  }

  const cancelEditing = (index: number) => {
    setEditingArticle(p => ({ ...p, [index]: false }))
  }

  /* ---------------- Save Edit ---------------- */

  const saveArticle = async (articleId: number, index: number) => {
    try {
      const token = localStorage.getItem('token')

      const res = await fetch(
        `${API_BASE_URL}/articles/${articleId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            content: editedContent[index]
          })
        }
      )

      if (!res.ok) throw new Error()

      setEditingArticle(p => ({ ...p, [index]: false }))
      refetch()
    } catch {
      alert('Failed to save article')
    }
  }

  /* ---------------- Regenerate ---------------- */

  const openModal = (id: number) => {
    setSelectedArticleId(id)
    setSearchQuery('')
    setShowModal(true)
  }

  const regenerateArticle = async () => {
    if (!selectedArticleId || !searchQuery) return

    try {
      setRegenerating(true)

      const token = localStorage.getItem('token')

      const res = await fetch(
        `${API_BASE_URL}/articles/${selectedArticleId}/regenerate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            search_query: searchQuery
          })
        }
      )

      if (!res.ok) throw new Error()

      setShowModal(false)
      refetch()
    } catch {
      alert('Regeneration failed')
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
    <p className="text-gray-600">Generated sports preview articles</p>
  </div>
  <button
    onClick={() => setShowBulkModal(true)}
    className="btn-primary flex items-center gap-2"
  >
    <FileText className="w-4 h-4" />
    Bulk Sync
  </button>
</div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Articles */}
      {!isLoading && (
        <div className="space-y-4">
          {data?.map((article: any, index: number) => {
            const isExpanded = expandedArticles[index]
            const isEditing = editingArticle[index]

            return (
              <div
                key={article.id}
                className="card p-4 hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex justify-between items-start">

                  <div className="flex gap-3">
                    <FileText className="w-6 h-6 text-primary-600" />

                    <div>
                      <h3 className="font-semibold">
                        {article.title || 'Untitled'}
                      </h3>

                      <div className="flex gap-2 text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4" />
                        {article.generated_at
                          ? new Date(
                              article.generated_at + 'Z'
                            ).toLocaleString()
                          : 'Unknown'}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">

                    {!isEditing && (
                      <button
                        onClick={() =>
                          startEditing(index, article.content)
                        }
                        className="text-primary-600 flex items-center gap-1 text-sm"
                      >
                        <Edit size={14} /> Edit
                      </button>
                    )}

                    <button
                      onClick={() => openModal(article.id)}
                      className="text-sm text-gray-600 flex gap-1 items-center"
                    >
                      <Search size={14} /> Improve
                    </button>

                  </div>
                </div>

                {/* Content */}
                <div className="mt-3 text-sm">

                  {isEditing ? (
                    <>
                      <textarea
                        value={editedContent[index]}
                        onChange={e =>
                          setEditedContent(p => ({
                            ...p,
                            [index]: e.target.value
                          }))
                        }
                        rows={7}
                        className="w-full border rounded p-2"
                      />

                      <div className="flex gap-2 mt-2">

                        <button
                          onClick={() =>
                            saveArticle(article.id, index)
                          }
                          className="btn-primary flex gap-1"
                        >
                          <Save size={14} /> Save
                        </button>

                        <button
                          onClick={() => cancelEditing(index)}
                          className="btn-secondary flex gap-1"
                        >
                          <X size={14} /> Cancel
                        </button>

                      </div>
                    </>
                  ) : (
                    <>
                      <p className={isExpanded ? '' : 'line-clamp-3'}>
                        {article.content}
                      </p>

                      {article.content?.split(' ').length > 30 && (
                        <button
                          onClick={() => toggleExpand(index)}
                          className="text-primary-600 text-sm mt-1"
                        >
                          {isExpanded ? 'Less' : 'More'}
                        </button>
                      )}
                    </>
                  )}

                </div>
              </div>
            )
          })}

          {/* Pagination */}
          <div className="flex justify-between pt-4">

            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="btn-secondary"
            >
              Previous
            </button>

            <button
              onClick={() => setPage(p => p + 1)}
              className="btn-primary"
            >
              Next
            </button>

          </div>
        </div>
      )}

      {/* Empty */}
      {!isLoading && data?.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No articles found
        </div>
      )}

      {/* ================= MODAL ================= */}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-lg w-full max-w-md">

            <h3 className="text-lg font-semibold mb-3">
              Search & Improve Article
            </h3>

            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g. Lakers vs Bulls injuries odds news"
              className="w-full border rounded p-2 mb-4"
            />

            <div className="flex justify-end gap-2">

              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>

              <button
                disabled={regenerating}
                onClick={regenerateArticle}
                className="btn-primary"
              >
                {regenerating ? 'Working...' : 'Generate'}
              </button>

            </div>

          </div>
        </div>
      )}
      <BulkSyncModal
  isOpen={showBulkModal}
  onClose={() => setShowBulkModal(false)}
/>
    </div>
  )
}
