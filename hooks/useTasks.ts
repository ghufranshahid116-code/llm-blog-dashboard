import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { nhlApi } from '../lib/api'
import toast from 'react-hot-toast'

const getErrorMessage = (error: any) => {
  return (
    error?.response?.data?.detail?.[0]?.msg ||
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong'
  )
}

export const useTasks = (limit = 100, offset = 0) => {
  return useQuery({
    queryKey: ['tasks', limit, offset],
    queryFn: () => nhlApi.listTasks(limit, offset),
    refetchInterval: 5000,
  })
}

export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => nhlApi.getTaskStatus(taskId),
    enabled: !!taskId,
    refetchInterval: 2000,
  })
}

export const useCancelTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: nhlApi.cancelTask,
    onSuccess: () => {
      toast.success('Task cancelled successfully')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const generatePreviews = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: nhlApi.generatePreviews,
    onSuccess: () => {
      toast.success('Generation task started successfully')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useGeneratePreviewsSync = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: nhlApi.generatePreviewsSync,
    onSuccess: () => {
      toast.success('Preview generation completed')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error))
    },
  })
}
