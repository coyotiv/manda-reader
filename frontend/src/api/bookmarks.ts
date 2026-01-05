import client from './client'

export interface Bookmark {
  _id: string
  userId: string
  feedItemId?: string
  title: string
  url: string
  note?: string
  tags?: string[]
  createdAt: string
}

export const getBookmarks = async (): Promise<Bookmark[]> => {
  try {
    const response = await client.get('/bookmarks')
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return []
  }
}

export const createBookmark = async (bookmark: {
  title: string
  url: string
  note?: string
  tags?: string[]
  feedItemId?: string
}): Promise<Bookmark> => {
  const response = await client.post('/bookmarks', bookmark)
  return response.data
}

export const deleteBookmark = async (id: string): Promise<void> => {
  await client.delete(`/bookmarks/${id}`)
}

export const exportBookmarks = async (format: 'json' | 'text' = 'json'): Promise<string> => {
  const response = await client.get(`/bookmarks/export?format=${format}`)
  return response.data
}
