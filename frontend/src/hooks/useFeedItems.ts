import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFeedItems, getAllItems, markAsRead, toggleBookmark } from '../api/items'

export function useFeedItems(feedId?: string) {
  return useQuery({
    queryKey: ['items', feedId],
    queryFn: () => (feedId ? getFeedItems(feedId) : getAllItems()),
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) => markAsRead(id, isRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['history'] })
    },
  })
}

export function useToggleBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: toggleBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })
}
