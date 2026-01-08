import { Box } from '@mantine/core'
import { useState, useEffect } from 'react'
import { FeedItem } from '../api/items'
import { showNotification } from '@mantine/notifications'
import { useToggleBookmark } from '../hooks/useFeedItems'
import { useReaderEngine } from '../hooks/useReaderEngine'
import { useShortcutEvent } from '../hooks/useKeyboardShortcuts/useShortcutEvent'
import { fullscreenShortcut } from '../hooks/useKeyboardShortcuts/shortcuts/fullscreen'
import FullScreenReader from './FullScreenReader'
import ReaderToolbar from './ReaderToolbar'
import ReaderContent from './ReaderContent'
import { CheckIcon, BookmarkIcon } from '../assets/icons'

interface ReaderProps {
  item: FeedItem
  onOpen?: () => void
  onToggleBookmark?: (item: FeedItem) => Promise<void>
  readerMode?: boolean
  onReaderModeChange?: (mode: boolean) => void
  showToolbar?: boolean
}

export default function Reader({
  item,
  onOpen,
  onToggleBookmark,
  readerMode: controlledReaderMode,
  onReaderModeChange,
  showToolbar = true
}: ReaderProps) {
  const [isBookmarked, setIsBookmarked] = useState(item.isBookmarked)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const toggleBookmarkMutation = useToggleBookmark()

  const {
    readerMode: internalReaderMode,
    setReaderMode: setInternalReaderMode,
    iframeRef,
    handleIframeLoad,
    handleIframeError
  } = useReaderEngine({ url: item.link })

  const readerMode = controlledReaderMode ?? internalReaderMode
  const setReaderMode = onReaderModeChange ?? setInternalReaderMode

  useEffect(() => {
    setIsBookmarked(item.isBookmarked)
  }, [item.isBookmarked])

  useEffect(() => {
    onOpen?.()
  }, [onOpen])

  useShortcutEvent(fullscreenShortcut, () => {
    setIsFullScreen(prev => !prev)
  })

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
        icon: <CheckIcon />,
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
        icon: <BookmarkIcon />,
      })
    } catch (error) {
      showNotification({ message: 'Failed to toggle bookmark', color: 'red' })
    }
  }

  return (
    <>
      <Box style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {showToolbar && (
          <ReaderToolbar
            item={item}
            isBookmarked={isBookmarked}
            readerMode={readerMode}
            onReaderModeChange={setReaderMode}
            onToggleBookmark={handleToggleBookmark}
            onOpenInNewTab={handleOpenInNewTab}
            onCopyLink={handleCopyLink}
            isBookmarkPending={toggleBookmarkMutation.isPending}
          />
        )}

        <ReaderContent
          item={item}
          readerMode={readerMode}
          iframeRef={iframeRef}
          onIframeLoad={handleIframeLoad}
          onIframeError={handleIframeError}
        />
      </Box>

      {isFullScreen && (
        <FullScreenReader
          item={item}
          readerMode={readerMode}
          setReaderMode={setReaderMode}
          onToggleBookmark={handleToggleBookmark}
          onClose={() => setIsFullScreen(false)}
        />
      )}
    </>
  )
}
