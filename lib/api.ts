import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://104.131.28.18/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types based on OpenAPI schema
export interface Blog {
  id: number
  name: string
  url: string
  username: string
  active: boolean
  system_prompt?: string 
  user_instructions?: string  
  throttle_delay: number
  created_at: string
}

export interface Task {
  task_id: string
  task_type: string
  status: string
  result: any | null
  error: string | null
  created_at: string | null
  completed_at: string | null
  metadata: any | null
}

export interface TaskList {
  tasks: Task[]
  total: number
}

// API Methods
export const nhlApi = {

  // Generate NHL previews (sync)
  generatePreviews: async (payload?: { blogs?: string[] }) => {
  const response = await api.post('/generate/nhl', payload || {})
  return response.data
},

  generatePreviewsSync: async (payload?: { blogs?: string[] }) => {
    const response = await api.post('/generate/nhl/sync', payload || {})
    return response.data
},


  // Get task status
  getTaskStatus: async (taskId: string) => {
    const response = await api.get(`/tasks/${taskId}`)
    return response.data
  },

  // Cancel task
  cancelTask: async (taskId: string) => {
    const response = await api.delete(`/tasks/${taskId}`)
    return response.data
  },

  // List tasks
  listTasks: async (limit = 100, offset = 0) => {
    const response = await api.get(`/tasks?limit=${limit}&offset=${offset}`)
    return response.data
  },

  // Get blogs
  getBlogs: async () => {
    const response = await api.get('/blogs')
    return response.data
  },

  // Get games
  getGames: async () => {
    const response = await api.get('/games')
    return response.data
  },

  // Get articles
  getArticles: async (limit = 100, offset = 0) => {
    const response = await api.get(`/articles?limit=${limit}&offset=${offset}`)
    return response.data
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health')
    return response.data
  },
  // Update a blog partially
deactivateBlog: async (blogId: number, data: Partial<Blog>) => {
  const response = await api.patch(`/blogs/${blogId}`, data)
  return response.data
}

}