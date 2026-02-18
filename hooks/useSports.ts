// hooks/useSports.ts
import { useQuery } from '@tanstack/react-query'
import { re } from '../lib/api'

export function useSports() {
  return useQuery({
    queryKey: ['sports'],
    queryFn: async () => {
      const res = await re.getSports()
      return res.data
    },
  })
}