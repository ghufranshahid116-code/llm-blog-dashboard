'use client'

import { useState } from 'react'
import { Search, Filter, Download, MoreVertical, Eye, XCircle } from 'lucide-react'
import { useTasks, useCancelTask } from '../../hooks/useTasks'
import StatusBadge from '../../components/StatusBadge'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { PlayCircle, RefreshCw, AlertCircle } from 'lucide-react'


export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { data: tasksData, isLoading, refetch } = useTasks()
  const cancelTaskMutation = useCancelTask()

  const handleCancelTask = async (taskId: string) => {
    if (confirm('Are you sure you want to cancel this task?')) {
      await cancelTaskMutation.mutateAsync(taskId)
      refetch()
    }
  }

  const filteredTasks = tasksData?.tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesSearch =
      task.task_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.task_type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  }) || []

  const statusCounts = {
    all: tasksData?.total || 0,
    PENDING: tasksData?.tasks.filter(t => t.status === 'PENDING').length || 0,
    RUNNING: tasksData?.tasks.filter(t => t.status === 'RUNNING').length || 0,
    COMPLETED: tasksData?.tasks.filter(t => t.status === 'COMPLETED').length || 0,
    FAILED: tasksData?.tasks.filter(t => t.status === 'FAILED').length || 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600">Monitor and manage background tasks</p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="search"
                placeholder="Search tasks by ID or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status ({statusCounts.all})</option>
            <option value="PENDING">Pending ({statusCounts.PENDING})</option>
            <option value="RUNNING">Running ({statusCounts.RUNNING})</option>
            <option value="COMPLETED">Completed ({statusCounts.COMPLETED})</option>
            <option value="FAILED">Failed ({statusCounts.FAILED})</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button className="flex items-center space-x-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm">
            <Filter className="w-4 h-4" />
            <span>Sort: Newest First</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Task ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.task_id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="text-sm font-mono text-gray-900">
                        {task.task_id.substring(0, 12)}...
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {task.created_at &&
                          formatDistanceToNow(
                            new Date(task.created_at + 'Z'),
                            { addSuffix: true }
                          )
                        }
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">{task.task_type}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-700">
                        {task.created_at ? new Date(task.created_at).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-700">
                        {task.created_at && task.completed_at
                          ? formatDistanceToNow(
                            new Date(task.completed_at + 'Z'),
                            { addSuffix: false }
                          )
                          : '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => { }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        {(task.status === 'PENDING' || task.status === 'RUNNING') && (
                          <button
                            onClick={() => handleCancelTask(task.task_id)}
                            disabled={cancelTaskMutation.isPending}
                            className="p-1.5 hover:bg-red-50 rounded-lg"
                            title="Cancel Task"
                          >
                            <XCircle className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{count}</div>
            <div className="text-sm text-gray-600 capitalize">{status.toLowerCase()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}