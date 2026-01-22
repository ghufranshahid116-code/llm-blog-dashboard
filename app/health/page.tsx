'use client'

import { Heart, Activity, Database, Server, CheckCircle, XCircle } from 'lucide-react'
import { useHealth } from '../../hooks/useBlogs'
import LoadingSpinner from '../../components/LoadingSpinner'
import { PlayCircle, RefreshCw, AlertCircle } from 'lucide-react'


export default function HealthPage() {
  const { data: healthData, isLoading, error } = useHealth()

  const services = [
    {
      name: 'API Server',
      status: 'healthy',
      icon: Server,
      description: 'Main application server',
    },
    {
      name: 'Database',
      status: 'healthy',
      icon: Database,
      description: 'PostgreSQL database',
    },
    {
      name: 'Task Queue',
      status: 'degraded',
      icon: Activity,
      description: 'Celery task queue',
    },
    {
      name: 'Cache',
      status: 'healthy',
      icon: Database,
      description: 'Redis cache',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
        <p className="text-gray-600">Monitor the health and status of your services</p>
      </div>

      {/* Overview Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">All systems operational</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">98.7%</div>
            <div className="text-sm text-gray-600">Uptime (30 days)</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map((service) => (
            <div
              key={service.name}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center justify-between mb-2">
                <service.icon className="w-5 h-5 text-gray-600" />
                {service.status === 'healthy' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <h3 className="font-medium text-gray-900">{service.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* API Health Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Status</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  <h4 className="font-medium text-red-800">API Unavailable</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Unable to connect to the API server
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <h4 className="font-medium text-green-800">API Healthy</h4>
                  <p className="text-sm text-green-700 mt-1">
                    API is responding normally
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Response Time</p>
                  <p className="text-lg font-semibold text-gray-900">142ms</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Checked</p>
                  <p className="text-lg font-semibold text-gray-900">Just now</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">CPU Usage</span>
                <span className="text-sm font-medium text-gray-900">42%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full w-2/5"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <span className="text-sm font-medium text-gray-900">3.2/8 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full w-2/5"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Disk Usage</span>
                <span className="text-sm font-medium text-gray-900">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full w-[45%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Incidents</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <h4 className="font-medium text-yellow-800">Task Queue Latency</h4>
                <p className="text-sm text-yellow-700">Increased latency detected - 5 minutes ago</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
              Investigating
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-800">API Maintenance</h4>
                <p className="text-sm text-gray-700">Scheduled maintenance completed - 2 days ago</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
              Resolved
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}