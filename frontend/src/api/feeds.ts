import client from './client'

export interface Feed {
  _id: string
  title: string
  url: string
  feedUrl: string
  type: 'rss' | 'atom' | 'substack' | 'custom'
  isActive: boolean
  isSubscribed?: boolean
}

export const getFeeds = async (): Promise<Feed[]> => {
  try {
    const response = await client.get('/feeds')
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching feeds:', error)
    return []
  }
}

export const getAvailableFeeds = async (): Promise<Feed[]> => {
  try {
    const response = await client.get('/feeds/available')
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching available feeds:', error)
    return []
  }
}

export const addFeed = async (url: string): Promise<Feed> => {
  const response = await client.post('/feeds', { url })
  return response.data
}

export const subscribeFeed = async (id: string): Promise<Feed> => {
  const response = await client.post(`/feeds/${id}/subscribe`)
  return response.data
}

export const deleteFeed = async (id: string): Promise<void> => {
  await client.delete(`/feeds/${id}`)
}
