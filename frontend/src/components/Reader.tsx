import { Group, UnstyledButton, TextInput, Switch, Box, Text, Tooltip } from '@mantine/core'
import { useState, useEffect } from 'react'
import { FeedItem } from '../api/items'
import { showNotification } from '@mantine/notifications'
import client from '../api/client'
import { useToggleBookmark } from '../hooks/useFeedItems'
import { useReaderEngine } from '../hooks/useReaderEngine'

// Get API URL from client baseURL
const API_URL = (client.defaults.baseURL as string) || 'http://localhost:3000/api'

interface ReaderProps {
  item: FeedItem
  onOpen?: () => void
  onToggleBookmark?: (item: FeedItem) => Promise<void>
}

export default function Reader({ item, onOpen, onToggleBookmark }: ReaderProps) {
  const [isBookmarked, setIsBookmarked] = useState(item.isBookmarked)
  const toggleBookmarkMutation = useToggleBookmark()

  const { readerMode, setReaderMode, iframeRef, handleIframeLoad, handleIframeError } =
    useReaderEngine({ url: item.link })

  // Sync bookmark state with item prop
  useEffect(() => {
    setIsBookmarked(item.isBookmarked)
  }, [item.isBookmarked])

  // Mark as read when component mounts (link is opened)
  useEffect(() => {
    onOpen?.()
  }, [onOpen])

  const handleOpenInNewTab = () => {
    window.open(item.link, '_blank')
    onOpen?.()
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(item.link)
      showNotification({
        message: 'Link copied to clipboard',
        color: 'green',
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ),
      })
    } catch (error) {
      showNotification({ message: 'Failed to copy link', color: 'red' })
    }
  }

  const handleToggleBookmark = async () => {
    try {
      if (onToggleBookmark) {
        await onToggleBookmark(item)
      } else {
        await toggleBookmarkMutation.mutateAsync(item._id)
      }
      setIsBookmarked(!isBookmarked)
      showNotification({
        message: isBookmarked ? 'Bookmark removed' : 'Bookmarked',
        color: 'green',
        icon: (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        ),
      })
    } catch (error) {
      showNotification({ message: 'Failed to toggle bookmark', color: 'red' })
    }
  }

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <Group
        mb="md"
        gap="sm"
        wrap="nowrap"
        style={{
          padding: '12px 16px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* URL Display */}
        <TextInput
          value={item.link}
          readOnly
          variant="unstyled"
          styles={{
            root: { flex: 1 },
            input: {
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              color: 'var(--mantine-color-gray-4)',
              height: 'auto',
            },
          }}
        />

        {/* Reader Mode Toggle */}
        <Group gap={8}>
          <Switch
            checked={readerMode}
            onChange={e => setReaderMode(e.currentTarget.checked)}
            size="sm"
            color="amber"
            styles={{
              track: {
                cursor: 'pointer',
              },
            }}
          />
          <Text size="xs" c="dimmed">
            Reader
          </Text>
        </Group>

        {/* Actions */}
        <Group gap={6}>
          <Tooltip label="Open in new tab" position="bottom">
            <UnstyledButton
              onClick={handleOpenInNewTab}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background:
                  'linear-gradient(135deg, var(--mantine-color-amber-6) 0%, var(--mantine-color-orange-6) 100%)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.25)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open
            </UnstyledButton>
          </Tooltip>

          <Tooltip label="Copy link" position="bottom">
            <UnstyledButton
              onClick={handleCopyLink}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--mantine-color-gray-4)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.color = 'var(--mantine-color-gray-2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.color = 'var(--mantine-color-gray-4)'
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </UnstyledButton>
          </Tooltip>

          <Tooltip label={isBookmarked ? 'Remove bookmark' : 'Bookmark'} position="bottom">
            <UnstyledButton
              onClick={handleToggleBookmark}
              disabled={toggleBookmarkMutation.isPending}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: isBookmarked ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: isBookmarked
                  ? 'var(--mantine-color-yellow-5)'
                  : 'var(--mantine-color-gray-4)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
                cursor: toggleBookmarkMutation.isPending ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => {
                if (!toggleBookmarkMutation.isPending) {
                  e.currentTarget.style.background = isBookmarked
                    ? 'rgba(255, 193, 7, 0.3)'
                    : 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.color = isBookmarked
                    ? 'var(--mantine-color-yellow-4)'
                    : 'var(--mantine-color-gray-2)'
                }
              }}
              onMouseLeave={e => {
                if (!toggleBookmarkMutation.isPending) {
                  e.currentTarget.style.background = isBookmarked
                    ? 'rgba(255, 193, 7, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.color = isBookmarked
                    ? 'var(--mantine-color-yellow-5)'
                    : 'var(--mantine-color-gray-4)'
                }
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill={isBookmarked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </UnstyledButton>
          </Tooltip>
        </Group>
      </Group>

      {/* Content Frame */}
      <Box
        className="reader-frame"
        style={{
          flex: 1,
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
        }}
      >
        {readerMode ? (
          <iframe
            src={`${API_URL}/reader?url=${encodeURIComponent(item.link)}`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
            title={`Reader view of ${item.title}`}
          />
        ) : (
          <iframe
            ref={iframeRef}
            src={item.link}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
            title={item.title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            onError={handleIframeError}
            onLoad={handleIframeLoad}
          />
        )}
      </Box>
    </Box>
  )
}
