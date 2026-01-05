import { useSearchParams, useNavigate } from 'react-router-dom'
import { Box, Stack, Text, Group, UnstyledButton } from '@mantine/core'
import Reader from '../components/Reader'
import { FeedItem } from '../api/items'

export default function ReadView() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const url = searchParams.get('url')
  const title = searchParams.get('title') || 'Untitled'

  if (!url) {
    return (
      <Box style={{ height: 'calc(100vh - 80px)' }}>
        <Stack align="center" justify="center" style={{ height: '100%' }}>
          <Box
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(255, 107, 107, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ color: 'var(--mantine-color-red-4)' }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </Box>
          <Text fw={600} size="lg" c="gray.2">
            No URL Provided
          </Text>
          <Text c="dimmed" size="sm" ta="center" maw={300}>
            Please provide a URL to read content.
          </Text>
          <UnstyledButton
            onClick={() => navigate('/')}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'rgba(255, 193, 7, 0.1)',
              color: 'var(--mantine-color-amber-5)',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255, 193, 7, 0.15)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255, 193, 7, 0.1)'
            }}
          >
            Go to Feeds
          </UnstyledButton>
        </Stack>
      </Box>
    )
  }

  // Create a mock FeedItem for the reader
  const item: FeedItem = {
    _id: `read-${url}`,
    feedId: '',
    title,
    link: url,
    publishedAt: new Date().toISOString(),
    isRead: false,
    isBookmarked: false,
  }

  return (
    <Box
      className="animate-fadeIn"
      style={{
        height: 'calc(100vh - 80px)',
        opacity: 0,
      }}
    >
      <Stack gap="md" style={{ height: '100%' }}>
        {/* Header */}
        <Group justify="space-between" align="center">
          <Box style={{ flex: 1 }}>
            <Group gap="sm" mb={4}>
              <UnstyledButton
                onClick={() => navigate(-1)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--mantine-color-gray-4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
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
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back
              </UnstyledButton>
              <Text size="lg" fw={600} c="gray.1" lineClamp={1} style={{ flex: 1 }}>
                {title}
              </Text>
            </Group>
          </Box>
        </Group>

        {/* Reader */}
        <Box
          className="glass"
          style={{
            flex: 1,
            padding: '20px',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <Reader item={item} />
        </Box>
      </Stack>
    </Box>
  )
}
