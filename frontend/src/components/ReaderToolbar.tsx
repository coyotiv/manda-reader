import { Group, UnstyledButton, TextInput, Switch, Text, Tooltip } from '@mantine/core'
import { CSSProperties } from 'react'
import { FeedItem } from '../api/items'
import { BookmarkIcon, ExternalLinkIcon, CopyIcon } from '../assets/icons'

interface ReaderToolbarProps {
  item: FeedItem
  isBookmarked: boolean
  readerMode: boolean
  onReaderModeChange: (mode: boolean) => void
  onToggleBookmark: () => Promise<void>
  onOpenInNewTab?: () => void
  onCopyLink?: () => void
  isBookmarkPending?: boolean
  showUrl?: boolean
  showTitle?: boolean
  containerStyle?: CSSProperties
}

export default function ReaderToolbar({
  item,
  isBookmarked,
  readerMode,
  onReaderModeChange,
  onToggleBookmark,
  onOpenInNewTab,
  onCopyLink,
  isBookmarkPending = false,
  showUrl = true,
  showTitle = false,
  containerStyle,
}: ReaderToolbarProps) {
  const defaultStyle: CSSProperties = {
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    marginBottom: 'var(--mantine-spacing-md)',
  }

  return (
    <Group gap="sm" wrap="nowrap" style={{ ...defaultStyle, ...containerStyle }}>
      {showTitle && (
        <Text
          size="sm"
          fw={500}
          style={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: '#cbd5e1',
            letterSpacing: '0.01em',
          }}
        >
          {item.title}
        </Text>
      )}

      {showUrl && (
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
      )}

      <Group gap={showTitle ? 10 : 8}>
        <Switch
          checked={readerMode}
          onChange={e => onReaderModeChange(e.currentTarget.checked)}
          size="sm"
          color="amber"
          styles={{ track: { cursor: 'pointer' } }}
        />
        <Text
          size={showTitle ? 'sm' : 'xs'}
          c={showTitle ? undefined : 'dimmed'}
          style={showTitle ? { color: '#94a3b8', fontWeight: 500 } : undefined}
        >
          Reader
        </Text>
      </Group>

      <Group gap={6}>
        {onOpenInNewTab && (
          <Tooltip label="Open in new tab" position="bottom">
            <UnstyledButton
              onClick={onOpenInNewTab}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--mantine-color-amber-6) 0%, var(--mantine-color-orange-6) 100%)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <ExternalLinkIcon />
              Open
            </UnstyledButton>
          </Tooltip>
        )}
        {onCopyLink && (
          <Tooltip label="Copy link" position="bottom">
            <UnstyledButton
              onClick={onCopyLink}
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
            >
              <CopyIcon />
              Copy
            </UnstyledButton>
          </Tooltip>
        )}
        <Tooltip label={isBookmarked ? 'Remove bookmark' : 'Bookmark'} position="bottom">
          <UnstyledButton
            onClick={onToggleBookmark}
            disabled={isBookmarkPending}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: isBookmarked ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: isBookmarked ? 'var(--mantine-color-yellow-5)' : 'var(--mantine-color-gray-4)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              cursor: isBookmarkPending ? 'not-allowed' : 'pointer',
            }}
          >
            <BookmarkIcon filled={isBookmarked} />
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </UnstyledButton>
        </Tooltip>
      </Group>
    </Group>
  )
}
