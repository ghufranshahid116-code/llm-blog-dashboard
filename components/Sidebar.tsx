'use client'

import {
  Home,
  PlayCircle,
  ListTodo,
  Newspaper,
  Gamepad2,
  FileText,
  Heart,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Generate', href: '/generate', icon: PlayCircle },
  { name: 'Tasks', href: '/tasks', icon: ListTodo },
  { name: 'Articles', href: '/articles', icon: Newspaper },
  { name: 'Games', href: '/games', icon: Gamepad2 },
  { name: 'Blogs', href: '/blogs', icon: FileText },
  { name: 'Health', href: '/health', icon: Heart },
  { name: 'Sport Prompts', href: '/sport-prompts', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 bg-white border-r border-gray-200 min-h-screen`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Sports AI</h1>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mx-auto">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Settings className={`w-4 h-4 ${collapsed ? 'mx-auto' : ''}`} />
          </button>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center ${collapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' 
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                {!collapsed && (
                  <span className="ml-3 font-medium">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {!collapsed && (
          <div className="mt-8 p-4 bg-primary-50 rounded-lg">
            <h3 className="text-sm font-semibold text-primary-900 mb-2">
              Quick Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-primary-700">Active Tasks</span>
                <span className="font-semibold text-primary-900">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-700">Articles Today</span>
                <span className="font-semibold text-primary-900">12</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}