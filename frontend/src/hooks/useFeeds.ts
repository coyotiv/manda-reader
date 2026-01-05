import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFeeds, getAvailableFeeds, addFeed, subscribeFeed, deleteFeed } from '../api/feeds'

export function useFeeds() {
  return useQuery({
    queryKey: ['feeds'],
    queryFn: getFeeds,
  })
}

export function useAvailableFeeds() {
  return useQuery({
    queryKey: ['feeds', 'available'],
    queryFn: getAvailableFeeds,
  })
}

export function useAddFeed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] })
    },
  })
}

export function useSubscribeFeed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: subscribeFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] })
    },
  })
}

export function useDeleteFeed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feeds'] })
    },
  })
}
