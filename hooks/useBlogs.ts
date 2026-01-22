import { useQuery } from '@tanstack/react-query'
import { nhlApi } from '../lib/api'

export const useBlogs = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: nhlApi.getBlogs,
  })
}

export const useArticles = (limit = 100, offset = 0) => {
  return useQuery({
    queryKey: ['articles', limit, offset],
    queryFn: () => nhlApi.getArticles(limit, offset),
  })
}

export const useGames = () => {
  return useQuery({
    queryKey: ['games'],
    queryFn: nhlApi.getGames,
  })
}

export const useHealth = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: nhlApi.healthCheck,
    refetchInterval: 30000, // Check every 30 seconds
  })
}