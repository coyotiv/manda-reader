import { Modal, Box, UnstyledButton } from '@mantine/core'
import { useState, useEffect, useRef, useCallback } from 'react'
import { FeedItem } from '../api/items'
import ReaderToolbar from './ReaderToolbar'
import ReaderContent from './ReaderContent'
import { CloseIcon } from '../assets/icons'

function debounce<T extends (...args: never[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

interface FullScreenReaderProps {
  item: FeedItem
  readerMode: boolean
  setReaderMode: (mode: boolean) => void
  onToggleBookmark: () => Promise<void>
  onClose: () => void
}

export default function FullScreenReader({
  item,
  readerMode,
  setReaderMode,
  onToggleBookmark,
  onClose,
}: FullScreenReaderProps) {
  const [showToolbar, setShowToolbar] = useState(true)
  const [showEscHint, setShowEscHint] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(item.isBookmarked)

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    setIsBookmarked(item.isBookmarked)
  }, [item.isBookmarked])

  useEffect(() => {
    const timer = setTimeout(() => setShowEscHint(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleScroll = useCallback(
    debounce(() => {
      const container = scrollContainerRef.current
      if (!container) return

      const { scrollTop } = container

      if (scrollTop > lastScrollY.current && scrollTop > 50) {
        setShowToolbar(false)
      } else if (scrollTop < lastScrollY.current) {
        setShowToolbar(true)
      }
      lastScrollY.current = scrollTop
    }, 100),
    []
  )

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScrollEvent = () => handleScroll()
    container.addEventListener('scroll', handleScrollEvent)
    return () => container.removeEventListener('scroll', handleScrollEvent)
  }, [handleScroll])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f' || e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    const handleClick = () => {
      container.focus()
    }

    container.addEventListener('keydown', handleKeyDown)
    container.addEventListener('click', handleClick)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
      container.removeEventListener('click', handleClick)
    }
  }, [onClose])

  const handleToggleBookmark = async () => {
    await onToggleBookmark()
    setIsBookmarked(!isBookmarked)
  }

  return (
    <Modal
      opened={true}
      onClose={onClose}
      fullScreen
      withCloseButton={false}
      padding={0}
      transitionProps={{ transition: 'fade', duration: 300 }}
      styles={{
        content: { background: '#0f172a', color: '#f8fafc' },
        body: { padding: 0, height: '100vh', overflow: 'hidden' },
      }}
      aria-label="Full screen reader"
    >
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          transform: showToolbar ? 'translateY(0)' : 'translateY(-100%)',
          opacity: showToolbar ? 1 : 0,
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1000,
        }}
      >
        <ReaderToolbar
          item={item}
          isBookmarked={isBookmarked}
          readerMode={readerMode}
          onReaderModeChange={setReaderMode}
          onToggleBookmark={handleToggleBookmark}
          showUrl={false}
          showTitle={true}
          containerStyle={{
            height: 64,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 120px 0 40px',
            marginBottom: 0,
          }}
        />
      </Box>

      <Box
        ref={scrollContainerRef}
        tabIndex={0}
        style={{
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          outline: 'none',
        }}
      >
        <Box style={{ maxWidth: 900, margin: '0 auto', padding: '100px 80px 140px', minHeight: '100vh', height: '100%' }}>
          <ReaderContent
            item={item}
            readerMode={readerMode}
            additionalStyles={{
              height: '100%',
            }}
          />
        </Box>
      </Box>

      <UnstyledButton
        onClick={onClose}
        aria-label="Close full screen"
        style={{
          position: 'fixed',
          top: 10,
          right: 40,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          zIndex: 1001,
          transition: 'all 0.15s ease',
          cursor: 'pointer',
        }}
      >
        <CloseIcon />
      </UnstyledButton>

      {showEscHint && (
        <Box
          style={{
            position: 'fixed',
            bottom: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#94a3b8',
            zIndex: 998,
            transition: 'opacity 300ms ease-out',
          }}
        >
          Press <strong style={{ color: '#ffc107' }}>ESC</strong> or <strong style={{ color: '#ffc107' }}>F</strong> to exit
        </Box>
      )}
    </Modal>
  )
}
