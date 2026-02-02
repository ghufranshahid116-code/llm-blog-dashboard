import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://statsgeneral.com/api'

// --- Token Management ---
let accessToken: string | null = null

export const setAuthToken = (token: string | null) => {
  accessToken = token
  if (typeof window !== 'undefined') {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }
}

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('token')) {
      accessToken = localStorage.getItem('token')
    }
    return localStorage.getItem('token')
  }
  return null
}
// --- Axios Instance ---
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Bearer token automatically
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }
  return config
})

// --- Types ---
export interface Blog {
  id: number
  name?: string
  url?: string
  username?: string
  active: boolean
  system_prompt?: string
  user_instructions?: string
  throttle_delay?: number
  created_at?: string
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

// --- API Wrapper ---
export const nhlApi = {
  // --- Auth ---
  login: async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password })
    const { access_token } = res.data
    setAuthToken(access_token)
    return res.data
  },

  // --- NHL Previews ---
  generatePreviews: async (payload?: { blogs?: string[] }) => {
    const res = await api.post('/generate/nhl', payload || {})
    return res.data
  },

  generatePreviewsSync: async (payload?: { blogs?: string[] }) => {
    const res = await api.post('/generate/nhl/sync', payload || {})
    return res.data
  },

  // --- Tasks ---
  getTaskStatus: async (taskId: string) => {
    const res = await api.get(`/tasks/${taskId}`)
    return res.data
  },

  cancelTask: async (taskId: string) => {
    const res = await api.delete(`/tasks/${taskId}`)
    return res.data
  },

  listTasks: async (limit = 100, offset = 0) => {
    const res = await api.get(`/tasks?limit=${limit}&offset=${offset}`)
    return res.data
  },

  // --- Blogs ---
  getBlogs: async () => {
    const res = await api.get('/blogs')
    return res.data
  },

  deactivateBlog: async (blogId: number, data: Partial<Blog>) => {
    const res = await api.patch(`/blogs/${blogId}`, data)
    return res.data
  },

  // --- Games ---
  getGames: async () => {
    const res = await api.get('/games')
    return res.data
  },

  // --- Articles ---
  getArticles: async (limit = 100, offset = 0) => {
    const res = await api.get(`/articles?limit=${limit}&offset=${offset}`)
    return res.data
  },

  // --- Health ---
  healthCheck: async () => {
    const res = await api.get('/health')
    return res.data
  },
}
