import { Stack, Text, Divider, Box, UnstyledButton, Group } from '@mantine/core'
import { Feed } from '../api/feeds'

interface FeedListProps {
  feeds?: Feed[]
  availableFeeds?: Feed[]
  onSelect: (id: string | null) => void
  onSubscribe?: (id: string) => void
  selectedId: string | null
}

export default function FeedList({
  feeds = [],
  availableFeeds = [],
  onSelect,
  onSubscribe,
  selectedId,
}: FeedListProps) {
  const subscribedFeeds = Array.isArray(feeds) ? feeds : []
  const unsubscribedFeeds = (Array.isArray(availableFeeds) ? availableFeeds : []).filter(
    f => !f.isSubscribed
  )

  return (
    <Stack gap="sm">
      {/* All feeds option */}
      <UnstyledButton
        onClick={() => onSelect(null)}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: '10px',
          background: selectedId === null ? 'rgba(255, 193, 7, 0.12)' : 'transparent',
          border: `1px solid ${selectedId === null ? 'rgba(255, 193, 7, 0.3)' : 'transparent'}`,
          transition: 'all 0.15s ease',
          display: 'block',
        }}
        onMouseEnter={e => {
          if (selectedId !== null) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
          }
        }}
        onMouseLeave={e => {
          if (selectedId !== null) {
            e.currentTarget.style.background = 'transparent'
          }
        }}
      >
        <Group gap={10} wrap="nowrap">
          <Box
            style={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              background:
                'linear-gradient(135deg, var(--mantine-color-amber-5) 0%, var(--mantine-color-orange-6) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M4 11a9 9 0 0 1 9 9" />
              <path d="M4 4a16 16 0 0 1 16 16" />
              <circle cx="5" cy="19" r="1" />
            </svg>
          </Box>
          <Text
            size="sm"
            fw={selectedId === null ? 600 : 500}
            c={selectedId === null ? 'gray.1' : 'gray.4'}
          >
            All Feeds
          </Text>
        </Group>
      </UnstyledButton>

      {subscribedFeeds.length > 0 && (
        <>
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" mt="xs" px="xs">
            Your Feeds
          </Text>
          {subscribedFeeds.map((feed, index) => (
            <UnstyledButton
              key={feed._id}
              onClick={() => onSelect(feed._id)}
              className="animate-slideInLeft"
              style={{
                animationDelay: `${index * 0.03}s`,
                opacity: 0,
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                background: feed._id === selectedId ? 'rgba(255, 193, 7, 0.12)' : 'transparent',
                border: `1px solid ${feed._id === selectedId ? 'rgba(255, 193, 7, 0.3)' : 'transparent'}`,
                transition: 'all 0.15s ease',
                display: 'block',
              }}
              onMouseEnter={e => {
                if (feed._id !== selectedId) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }
              }}
              onMouseLeave={e => {
                if (feed._id !== selectedId) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <Group gap={10} wrap="nowrap">
                <Box
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    background: 'rgba(32, 201, 151, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--mantine-color-teal-5)',
                    fontSize: '11px',
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
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </Box>
                <Text
                  size="sm"
                  fw={feed._id === selectedId ? 600 : 500}
                  c={feed._id === selectedId ? 'gray.1' : 'gray.4'}
                  lineClamp={1}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  {feed.title}
                </Text>
              </Group>
            </UnstyledButton>
          ))}
        </>
      )}

      {unsubscribedFeeds.length > 0 && (
        <>
          <Divider my="xs" color="rgba(255, 255, 255, 0.06)" />
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" px="xs">
            Available Feeds
          </Text>
          {unsubscribedFeeds.map((feed, index) => (
            <UnstyledButton
              key={feed._id}
              onClick={() => onSelect(feed._id)}
              style={{
                width: '100%',
                display: 'block',
                background: selectedId === feed._id ? 'rgba(255, 193, 7, 0.12)' : 'transparent',
                borderRadius: '10px',
                border: `1px solid ${selectedId === feed._id ? 'rgba(255, 193, 7, 0.3)' : 'transparent'}`,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => {
                if (selectedId !== feed._id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }
              }}
              onMouseLeave={e => {
                if (selectedId !== feed._id) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <Group
                gap="xs"
                wrap="nowrap"
                className="animate-slideInLeft"
                style={{
                  animationDelay: `${(subscribedFeeds.length + index) * 0.03}s`,
                  opacity: 0,
                  padding: '8px 12px',
                }}
              >
                <Box
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--mantine-color-gray-6)',
                    flexShrink: 0,
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
                    <path d="M4 11a9 9 0 0 1 9 9" />
                    <path d="M4 4a16 16 0 0 1 16 16" />
                    <circle cx="5" cy="19" r="1" />
                  </svg>
                </Box>
                <Text size="sm" style={{ flex: 1, opacity: 0.6 }} lineClamp={1}>
                  {feed.title}
                </Text>
                {onSubscribe && (
                  <UnstyledButton
                    onClick={(e) => {
                      e.stopPropagation()
                      onSubscribe(feed._id)
                    }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '8px',
                      background: 'rgba(32, 201, 151, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--mantine-color-teal-5)',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(32, 201, 151, 0.2)'
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(32, 201, 151, 0.1)'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </UnstyledButton>
                )}
              </Group>
            </UnstyledButton>
          ))}
        </>
      )}

      {subscribedFeeds.length === 0 && unsubscribedFeeds.length === 0 && (
        <Stack align="center" py="xl">
          <Box
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(255, 193, 7, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ color: 'var(--mantine-color-amber-5)' }}
            >
              <path d="M4 11a9 9 0 0 1 9 9" />
              <path d="M4 4a16 16 0 0 1 16 16" />
              <circle cx="5" cy="19" r="1" />
            </svg>
          </Box>
          <Text size="sm" c="dimmed" ta="center">
            No feeds yet
          </Text>
        </Stack>
      )}
    </Stack>
  )
}
