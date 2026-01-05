import { useQuery } from '@tanstack/react-query'
import { getHistory, getHistoryByDays } from '../api/history'

export function useHistory(date?: string) {
  return useQuery({
    queryKey: ['history', date],
    queryFn: () => getHistory(date),
  })
}

export function useHistoryByDays() {
  return useQuery({
    queryKey: ['history', 'days'],
    queryFn: getHistoryByDays,
  })
}
