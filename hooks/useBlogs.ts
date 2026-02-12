import { useQuery } from '@tanstack/react-query'
import { sportsApi, Blog } from '../lib/api' // use sportsApi now

export const useBlogs = (options?: { includePrompts?: boolean }) => {
  return useQuery<Blog[]>({
    queryKey: ['blogs', options],
    queryFn: async () => {
      const params: Record<string, any> = {}
      if (options?.includePrompts) {
        params.include_prompts = true
      }
      return sportsApi.getBlogs(params)
    },
  })
}

export const useArticles = (limit = 100, offset = 0) => {
  return useQuery({
    queryKey: ['articles', limit, offset],
    queryFn: () => sportsApi.getArticles(limit, offset),
  })
}

export const useGames = () => {
  return useQuery({
    queryKey: ['games'],
    queryFn: sportsApi.getGames,
  })
}

export const useHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: sportsApi.healthCheck,
    refetchInterval: 30000, // Check every 30 seconds
  })
}
