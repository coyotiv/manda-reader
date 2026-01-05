import { useState } from 'react'
import { Stack, Text, Group, Box, UnstyledButton } from '@mantine/core'
import { useBookmarks, useDeleteBookmark, useExportBookmarks } from '../hooks/useBookmarks'
import { showNotification } from '@mantine/notifications'
import ReaderLayout from '../components/ReaderLayout'
import ItemList from '../components/ItemList'
import { FeedItem } from '../api/items'
import { Bookmark } from '../api/bookmarks'

export default function BookmarksView() {
  const [selectedBookmarkId, setSelectedBookmarkId] = useState<string | null>(null)
  const { data: bookmarks = [] } = useBookmarks()
  const deleteBookmarkMutation = useDeleteBookmark()
  const exportBookmarksMutation = useExportBookmarks()

  // Convert bookmarks to FeedItems for the list and reader
  const items: FeedItem[] = bookmarks.map((b: Bookmark) => ({
    _id: b._id,
    feedId: '', // Not needed for display
    title: b.title,
    link: b.url,
    publishedAt: b.createdAt,
    isRead: false, // Bookmarks are treated as "read" or irrelevant for read status in this view
    isBookmarked: true, // Always true in bookmarks view
    description: b.note, // Use note as description
  }))

  const selectedItem = selectedBookmarkId
    ? items.find(i => i._id === selectedBookmarkId) || null
    : null

  const handleItemSelect = (item: FeedItem) => {
    setSelectedBookmarkId(item._id)
  }

  const handleDelete = async (e: React.MouseEvent, item: FeedItem) => {
    e.stopPropagation()
    try {
      await deleteBookmarkMutation.mutateAsync(item._id)
      showNotification({ message: 'Bookmark deleted', color: 'green' })
      if (selectedBookmarkId === item._id) {
        setSelectedBookmarkId(null)
      }
    } catch (error) {
      showNotification({ message: 'Failed to delete bookmark', color: 'red' })
    }
  }

  const handleToggleBookmark = async (item: FeedItem) => {
    // In BookmarksView, item._id is the Bookmark ID
    // Toggling off means deleting the bookmark
    await deleteBookmarkMutation.mutateAsync(item._id)
    if (selectedBookmarkId === item._id) {
      setSelectedBookmarkId(null)
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

  const sidebar = (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Box>
          <Group gap="sm" mb={4}>
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background:
                  'linear-gradient(135deg, rgba(77, 171, 247, 0.15) 0%, rgba(99, 179, 237, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: 'var(--mantine-color-blue-4)' }}
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </Box>
            <Box>
              <Text size="md" fw={700} c="gray.1">
                Bookmarks
              </Text>
            </Box>
          </Group>
        </Box>
        <UnstyledButton
          onClick={handleExport}
          disabled={exportBookmarksMutation.isPending || bookmarks.length === 0}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            color:
              bookmarks.length === 0
                ? 'var(--mantine-color-gray-6)'
                : 'var(--mantine-color-gray-3)',
            fontSize: '12px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
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
            width="12"
            height="12"
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

      <Text size="xs" c="dimmed">
        {bookmarks.length} saved article{bookmarks.length !== 1 ? 's' : ''}
      </Text>
    </Stack>
  )

  return (
    <ReaderLayout
      sidebar={sidebar}
      sidebarWidth={260}
      items={items}
      selectedItem={selectedItem}
      onCloseReader={() => setSelectedBookmarkId(null)}
      emptyMessage="No bookmarks yet."
      renderList={listItems => (
        <ItemList
          items={listItems}
          onSelect={handleItemSelect}
          selectedId={selectedItem?._id}
          onSecondaryAction={handleDelete}
          accentColor="blue"
        />
      )}
      onToggleBookmark={handleToggleBookmark}
    />
  )
}
