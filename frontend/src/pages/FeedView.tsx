import { useState, useEffect, useCallback } from 'react'
import {
  Stack,
  Modal,
  TextInput,
  Box,
  Group,
  Text,
  UnstyledButton,
  Notification,
} from '@mantine/core'
import { useFeeds, useAvailableFeeds, useAddFeed, useSubscribeFeed } from '../hooks/useFeeds'
import { useFeedItems, useMarkAsRead } from '../hooks/useFeedItems'
import FeedList from '../components/FeedList'
import ReaderLayout from '../components/ReaderLayout'
import ItemList from '../components/ItemList'
import { FeedItem } from '../api/items'

// Helper to check if string is a valid URL
function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export default function FeedView() {
  const [addFeedOpen, setAddFeedOpen] = useState(false)
  const [feedUrl, setFeedUrl] = useState('')
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const { data: feeds } = useFeeds()
  const { data: availableFeeds } = useAvailableFeeds()
  const { data: items = [] } = useFeedItems(selectedFeedId || undefined)
  const addFeedMutation = useAddFeed()
  const subscribeMutation = useSubscribeFeed()
  const markAsReadMutation = useMarkAsRead()

  // Handle adding feed from URL (used by both modal and paste)
  const addFeedFromUrl = useCallback(
    async (url: string) => {
      if (!url.trim()) return

      try {
        await addFeedMutation.mutateAsync(url.trim())
        setNotification({ message: 'Feed added successfully!', type: 'success' })
        setFeedUrl('')
        setAddFeedOpen(false)
      } catch (error: any) {
        const errorMessage = error?.response?.data?.error || 'Failed to add feed'
        setNotification({ message: errorMessage, type: 'error' })
      }
    },
    [addFeedMutation]
  )

  // Global paste handler for Cmd+V / Ctrl+V
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Don't intercept if user is typing in an input field
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      const pastedText = e.clipboardData?.getData('text')?.trim()
      if (pastedText && isValidUrl(pastedText)) {
        e.preventDefault()
        await addFeedFromUrl(pastedText)
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [addFeedFromUrl])

  // Auto-hide notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleAddFeed = async () => {
    if (!feedUrl) return
    await addFeedFromUrl(feedUrl)
  }

  const handleSubscribe = async (feedId: string) => {
    await subscribeMutation.mutateAsync(feedId)
  }

  const handleItemSelect = (item: FeedItem) => {
    setSelectedItem(item)
    if (!item.isRead) {
      markAsReadMutation.mutate({ id: item._id, isRead: true })
    }
  }

  const sidebar = (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text size="xs" fw={600} c="dimmed" tt="uppercase">
          Feeds
        </Text>
        <UnstyledButton
          onClick={() => setAddFeedOpen(true)}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            background:
              'linear-gradient(135deg, var(--mantine-color-amber-6) 0%, var(--mantine-color-orange-6) 100%)',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.05)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.25)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add
        </UnstyledButton>
      </Group>
      <FeedList
        feeds={feeds}
        availableFeeds={availableFeeds}
        onSelect={setSelectedFeedId}
        onSubscribe={handleSubscribe}
        selectedId={selectedFeedId}
      />
    </Stack>
  )

  return (
    <>
      <ReaderLayout
        sidebar={sidebar}
        sidebarWidth={260}
        items={items}
        selectedItem={selectedItem}
        onCloseReader={() => setSelectedItem(null)}
        emptyMessage="No items found. Select a feed or add a new one."
        renderList={items => (
          <ItemList items={items} onSelect={handleItemSelect} selectedId={selectedItem?._id} />
        )}
      />

      <Modal
        opened={addFeedOpen}
        onClose={() => setAddFeedOpen(false)}
        title={
          <Text fw={600} size="lg">
            Add Feed
          </Text>
        }
        centered
        radius="lg"
        styles={{
          header: {
            background: 'transparent',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            paddingBottom: 16,
          },
          content: {
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          },
          body: {
            padding: 24,
          },
        }}
      >
        <Stack gap="lg">
          <Box>
            <Text size="sm" fw={500} mb={8} c="gray.4">
              Feed URL
            </Text>
            <TextInput
              placeholder="https://example.com or RSS feed URL"
              value={feedUrl}
              onChange={e => setFeedUrl(e.target.value)}
              styles={{
                input: {
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  height: 'auto',
                  color: 'var(--mantine-color-gray-2)',
                },
              }}
            />
            <Text size="xs" c="dimmed" mt={8}>
              Paste a website URL and we'll auto-discover the RSS feed
            </Text>
          </Box>

          <UnstyledButton
            onClick={handleAddFeed}
            disabled={addFeedMutation.isPending || !feedUrl}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '12px',
              background:
                addFeedMutation.isPending || !feedUrl
                  ? 'rgba(255, 193, 7, 0.3)'
                  : 'linear-gradient(135deg, var(--mantine-color-amber-6) 0%, var(--mantine-color-orange-6) 100%)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '14px',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              cursor: addFeedMutation.isPending || !feedUrl ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => {
              if (!addFeedMutation.isPending && feedUrl) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 193, 7, 0.25)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {addFeedMutation.isPending ? 'Adding...' : 'Add Feed'}
          </UnstyledButton>
        </Stack>
      </Modal>

      {/* Notification for paste feedback */}
      {notification && (
        <Notification
          color={notification.type === 'success' ? 'teal' : 'red'}
          title={notification.type === 'success' ? 'Success' : 'Error'}
          onClose={() => setNotification(null)}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            minWidth: 300,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          {notification.message}
        </Notification>
      )}

      {/* Loading overlay when adding feed via paste */}
      {addFeedMutation.isPending && !addFeedOpen && (
        <Notification
          loading
          title="Discovering feed..."
          withCloseButton={false}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            minWidth: 300,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          Looking for RSS feed in the pasted URL
        </Notification>
      )}
    </>
  )
}
