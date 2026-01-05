import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getBookmarks, createBookmark, deleteBookmark, exportBookmarks } from '../api/bookmarks'

export function useBookmarks() {
  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: getBookmarks,
  })
}

export function useCreateBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })
}

export function useExportBookmarks() {
  return useMutation({
    mutationFn: exportBookmarks,
  })
}
