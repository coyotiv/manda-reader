import { ReactNode } from 'react'
import { Stack, Group, Text, Box, UnstyledButton, Paper } from '@mantine/core'
import Reader from './Reader'
import { FeedItem } from '../api/items'

interface ReaderLayoutProps {
  sidebar: ReactNode
  sidebarWidth?: number
  items: FeedItem[]
  selectedItem: FeedItem | null
  onCloseReader: () => void
  emptyMessage?: string
  renderList: (items: FeedItem[]) => ReactNode
  onOpen?: () => void
  onToggleBookmark?: (item: FeedItem) => Promise<void>
}

export default function ReaderLayout({
  sidebar,
  sidebarWidth = 220,
  items,
  selectedItem,
  onCloseReader,
  emptyMessage = 'No items found.',
  renderList,
  onOpen,
  onToggleBookmark,
}: ReaderLayoutProps) {
  return (
    <Group
      align="stretch"
      gap={0}
      style={{ height: 'calc(100vh - 80px)', width: '100%' }}
      wrap="nowrap"
    >
      {/* Left Panel: Sidebar */}
      <Box
        className="animate-slideInLeft glass"
        style={{
          width: sidebarWidth,
          flexShrink: 0,
          padding: '20px',
          borderRadius: '16px',
          marginRight: '16px',
          height: '100%',
          opacity: 0,
        }}
      >
        {sidebar}
      </Box>

      {/* Middle Panel: Item List */}
      <Box
        className="animate-fadeIn"
        style={{
          width: selectedItem ? 380 : 'auto',
          flex: selectedItem ? '0 0 380px' : 1,
          minWidth: 0,
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          opacity: 0,
          animationDelay: '0.1s',
        }}
      >
        <Paper
          className="glass"
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
            borderRadius: '16px',
          }}
        >
          {items.length > 0 ? (
            renderList(items)
          ) : (
            <Stack align="center" justify="center" style={{ minHeight: 300 }}>
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'rgba(255, 193, 7, 0.1)',
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
                  style={{ color: 'var(--mantine-color-amber-5)' }}
                >
                  <path d="M4 11a9 9 0 0 1 9 9" />
                  <path d="M4 4a16 16 0 0 1 16 16" />
                  <circle cx="5" cy="19" r="1" />
                </svg>
              </Box>
              <Text c="dimmed" ta="center" size="sm" maw={250}>
                {emptyMessage}
              </Text>
            </Stack>
          )}
        </Paper>
      </Box>

      {/* Right Panel: Reader */}
      {selectedItem && (
        <Box
          className="animate-slideInRight"
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            marginLeft: '16px',
            opacity: 0,
          }}
        >
          <Paper
            className="glass"
            style={{
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px',
            }}
          >
            {/* Reader Header */}
            <Group
              justify="space-between"
              p="md"
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <Text fw={600} size="sm" lineClamp={1} style={{ flex: 1 }}>
                {selectedItem.title}
              </Text>
              <UnstyledButton
                onClick={onCloseReader}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--mantine-color-gray-5)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)'
                  e.currentTarget.style.color = 'var(--mantine-color-red-4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.color = 'var(--mantine-color-gray-5)'
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Close
              </UnstyledButton>
            </Group>

            {/* Reader Content */}
            <Box style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
              <Reader item={selectedItem} onOpen={onOpen} onToggleBookmark={onToggleBookmark} />
            </Box>
          </Paper>
        </Box>
      )}
    </Group>
  )
}
