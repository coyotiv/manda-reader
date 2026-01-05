import client from './client'

export interface HistoryItem {
  _id: string
  userId: string
  feedItemId?: string
  url: string
  title: string
  action: 'viewed' | 'bookmarked' | 'shared'
  date: string
  createdAt: string
}

export const getHistory = async (date?: string): Promise<HistoryItem[]> => {
  try {
    const params = date ? { date } : {}
    const response = await client.get('/history', { params })
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching history:', error)
    return []
  }
}

export const getHistoryByDays = async (): Promise<Record<string, HistoryItem[]>> => {
  try {
    const response = await client.get('/history/days')
    return response.data || {}
  } catch (error) {
    console.error('Error fetching history by days:', error)
    return {}
  }
}
