// File: hooks/useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sportsApi } from '../lib/api'
import toast from 'react-hot-toast'

const getErrorMessage = (error: any) => {
  return (
    error?.response?.data?.detail?.[0]?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong'
  )
}

// --- Tasks ---
export const useTasks = (limit = 100, offset = 0) =>
  useQuery({
    queryKey: ['tasks', limit, offset],
    queryFn: () => sportsApi.listTasks(limit, offset),
    refetchInterval: 5000,
  })

export const useTask = (taskId: string) =>
  useQuery({
    queryKey: ['task', taskId],
    queryFn: () => sportsApi.getTaskStatus(taskId),
    enabled: !!taskId,
    refetchInterval: 2000,
  })

export const useCancelTask = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sportsApi.cancelTask,
    onSuccess: () => {
      toast.success('Task cancelled successfully')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error))
    },
  })
}

// --- Generate Previews (Async) ---
export const useGeneratePreviews = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { sport?: string; blogs?: string[] }) => {
      const response = await sportsApi.generatePreviews({
        sport: payload.sport || 'NHL',
        blogs: payload.blogs,
      })
      return response
    },
    onSuccess: () => {
      toast.success('Generation task started successfully')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error))
    },
  })
}

// --- Generate Previews (Sync) ---
export const useGeneratePreviewsSync = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { sport?: string; blogs?: string[] }) => {
      const response = await sportsApi.generatePreviewsSync({
        sport: payload.sport || 'NHL',
        blogs: payload.blogs,
      })
      return response
    },
    onSuccess: () => {
      toast.success('Preview generation completed')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error))
    },
  })
}
