import client from './client'

export interface FeedItem {
  _id: string
  feedId: string | { _id: string; title: string; url: string; type: string }
  title: string
  link: string
  description?: string
  publishedAt: string
  isRead: boolean
  isBookmarked: boolean
  commentsLink?: string
  commentsCount?: number
  score?: number
}

export const getFeedItems = async (feedId: string): Promise<FeedItem[]> => {
  try {
    const response = await client.get(`/items/feed/${feedId}`)
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching feed items:', error)
    return []
  }
}

export const getAllItems = async (): Promise<FeedItem[]> => {
  try {
    const response = await client.get('/items')
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching all items:', error)
    return []
  }
}

export const markAsRead = async (id: string, isRead: boolean): Promise<FeedItem> => {
  const response = await client.put(`/items/${id}/read`, { isRead })
  return response.data
}

export const toggleBookmark = async (id: string): Promise<FeedItem> => {
  const response = await client.put(`/items/${id}/bookmark`)
  return response.data
}
