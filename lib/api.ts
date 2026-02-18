// File: lib/api.ts
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
  sport?: string
  active: boolean
  system_prompt?: string
  user_instructions?: string
  throttle_delay?: number
  created_at?: string
  sports?: Sport[]               // add this
  sport_prompts?: SportPrompt[]  // add this
}

export interface Sport {
  id: number
  name: string
  title: string
}

export interface SportPrompt {
  id?: number
  blog_id: number
  sport_id: number
  sport_name?: string
  system_prompt: string | null
  user_instructions: string | null
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

export interface BulkSyncRequest {
  blog_id: number;
  sport_id: number;
  generate_missing: boolean;
  regenerate_existing: boolean;
  status?: string;
  older_than_days?: number;
  limit?: number;
  skip_throttle?: boolean;
}

export interface TaskResponse {
  task_id: string;
  status: string;
  monitor_url: string;
}

export interface TaskStatus {
  task_id: string;
  status: string;
  result?: any;
  error?: string;
}


// --- Multi-Sport API Wrapper ---
export const sportsApi = {
  // --- Auth ---
  login: async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password })
    const { access_token } = res.data
    setAuthToken(access_token)
    return res.data
  },

  // --- Generate Previews ---
  generatePreviews: async (data: { sport: string; blogs?: string[] }) => {
    const res = await api.post('/generate/previews', data)
    return res.data
  },

  generatePreviewsSync: async (data: { sport: string; blogs?: string[] }) => {
    const res = await api.post('/generate/previews/sync', data)
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
  getBlogs: async (params?: { include_prompts?: boolean }) => {
    const res = await api.get('/blogs', { params })
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

// --- Sport Prompts API (EXPORT THIS) ---
export const sportPromptsApi = {
  // Get all prompts for a blog
  getByBlog: async (blogId: number) => {
    const res = await api.get(`/blogs/${blogId}/sport-prompts`)
    return res.data
  },

  // Update a specific prompt (create or update)
  update: async (blogId: number, sportId: number, data: Partial<SportPrompt>) => {
    const res = await api.put(`/blogs/${blogId}/sport-prompts/${sportId}`, data)
    return res.data
  },

  // Bulk update for a blog
  updateMany: async (blogId: number, prompts: SportPrompt[]) => {
    const res = await api.put(`/blogs/${blogId}/sport-prompts`, prompts)
    return res.data
  },
}


export const re = {
  getBlogs: () => api.get<Blog[]>('/blogs'),

  getSports: () => api.get<Sport[]>('/sports'),

  startBulkSync: (data: BulkSyncRequest) =>
    api.post<TaskResponse>('/articles/bulk-sync', data),

  getTask: (taskId: string) =>
    api.get<TaskStatus>(`/tasks/${taskId}`),
};
