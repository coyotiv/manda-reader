import { Stack, Text, Group, Badge, Box, UnstyledButton } from '@mantine/core'
import { useNavigate } from 'react-router-dom'
import { useBookmarks, useDeleteBookmark, useExportBookmarks } from '../hooks/useBookmarks'
import { showNotification } from '@mantine/notifications'
import { formatDistanceToNow } from 'date-fns'

export default function BookmarkList() {
  const navigate = useNavigate()
  const { data: bookmarks = [] } = useBookmarks()
  const deleteBookmarkMutation = useDeleteBookmark()
  const exportBookmarksMutation = useExportBookmarks()

  const handleClick = (bookmark: { url: string; title: string }) => {
    navigate(
      `/read?url=${encodeURIComponent(bookmark.url)}&title=${encodeURIComponent(bookmark.title)}`
    )
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await deleteBookmarkMutation.mutateAsync(id)
      showNotification({ message: 'Bookmark deleted', color: 'green' })
    } catch (error) {
      showNotification({ message: 'Failed to delete bookmark', color: 'red' })
    }
  }

  const handleExport = async () => {
    try {
      const data = await exportBookmarksMutation.mutateAsync('text')
      const blob = new Blob([data], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showNotification({ message: 'Bookmarks exported', color: 'green' })
    } catch (error) {
      showNotification({ message: 'Failed to export bookmarks', color: 'red' })
    }
  }

  return (
    <Stack gap="md">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Text size="sm" c="dimmed">
          {bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}
        </Text>
        <UnstyledButton
          onClick={handleExport}
          disabled={exportBookmarksMutation.isPending || bookmarks.length === 0}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            color:
              bookmarks.length === 0
                ? 'var(--mantine-color-gray-6)'
                : 'var(--mantine-color-gray-3)',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
            cursor: bookmarks.length === 0 ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={e => {
            if (bookmarks.length > 0) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {exportBookmarksMutation.isPending ? 'Exporting...' : 'Export'}
        </UnstyledButton>
      </Group>

      {/* Content */}
      {bookmarks.length === 0 ? (
        <Stack align="center" justify="center" style={{ minHeight: 200 }}>
          <Box
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(77, 171, 247, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ color: 'var(--mantine-color-blue-4)' }}
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </Box>
          <Text c="dimmed" ta="center" size="sm">
            No bookmarks yet. Bookmark articles to see them here.
          </Text>
        </Stack>
      ) : (
        <Stack gap="sm">
          {bookmarks.map((bookmark, index) => (
            <UnstyledButton
              key={bookmark._id}
              onClick={() => handleClick(bookmark)}
              className="card-interactive animate-fadeIn"
              style={{
                animationDelay: `${index * 0.03}s`,
                opacity: 0,
                padding: '16px 20px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                transition: 'all 0.2s ease',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(77, 171, 247, 0.2)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)'
              }}
            >
              <Group justify="space-between" mb={8} wrap="nowrap">
                <Text fw={500} size="sm" c="gray.2" lineClamp={1} style={{ flex: 1 }}>
                  {bookmark.title}
                </Text>
                <UnstyledButton
                  onClick={e => handleDelete(e, bookmark._id)}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    color: 'var(--mantine-color-gray-6)',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255, 107, 107, 0.15)'
                    e.currentTarget.style.color = 'var(--mantine-color-red-4)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--mantine-color-gray-6)'
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
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </UnstyledButton>
              </Group>

              {bookmark.note && (
                <Text size="xs" c="dimmed" mb={8} lineClamp={2}>
                  {bookmark.note}
                </Text>
              )}

              <Group gap="xs" wrap="nowrap">
                <Text size="xs" c="dimmed">
                  {formatDistanceToNow(new Date(bookmark.createdAt), { addSuffix: true })}
                </Text>
                {bookmark.tags && bookmark.tags.length > 0 && (
                  <Group gap={4} wrap="nowrap">
                    {bookmark.tags.slice(0, 3).map(tag => (
                      <Badge
                        key={tag}
                        size="xs"
                        variant="light"
                        color="blue"
                        radius="sm"
                        styles={{ root: { textTransform: 'none' } }}
                      >
                        #{tag}
                      </Badge>
                    ))}
                    {bookmark.tags.length > 3 && (
                      <Text size="xs" c="dimmed">
                        +{bookmark.tags.length - 3}
                      </Text>
                    )}
                  </Group>
                )}
              </Group>
            </UnstyledButton>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
