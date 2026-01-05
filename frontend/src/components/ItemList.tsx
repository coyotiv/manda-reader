import { Stack, Text, Group, Box, UnstyledButton, Tooltip } from '@mantine/core'
import { formatDistanceToNow } from 'date-fns'
import { FeedItem } from '../api/items'

interface ItemListProps {
  items: FeedItem[]
  onSelect: (item: FeedItem) => void
  selectedId?: string
  onSecondaryAction?: (e: React.MouseEvent, item: FeedItem) => void
  secondaryActionIcon?: React.ReactNode
  accentColor?: string
}

export default function ItemList({
  items,
  onSelect,
  selectedId,
  onSecondaryAction,
  secondaryActionIcon,
  accentColor = 'amber',
}: ItemListProps) {
  const handleCommentsClick = (e: React.MouseEvent, link: string) => {
    e.stopPropagation()
    window.open(link, '_blank')
  }

  return (
    <Stack gap="xs">
      {items.map((item, index) => {
        const isSelected = selectedId === item._id
        const isRead = item.isRead

        return (
          <UnstyledButton
            key={item._id}
            onClick={() => onSelect(item)}
            className="card-interactive"
            style={{
              animationDelay: `${Math.min(index * 0.03, 0.3)}s`,
              padding: '16px',
              borderRadius: '12px',
              background: isSelected ? `rgba(255, 193, 7, 0.12)` : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${isSelected ? 'rgba(255, 193, 7, 0.3)' : 'rgba(255, 255, 255, 0.04)'}`,
              transition: 'all 0.2s ease',
              opacity: isRead && !isSelected ? 0.6 : 1,
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              if (!isSelected) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
              }
            }}
            onMouseLeave={e => {
              if (!isSelected) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)'
              }
            }}
          >
            {/* Selection indicator */}
            {isSelected && (
              <Box
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '3px',
                  background: `linear-gradient(180deg, var(--mantine-color-${accentColor}-5) 0%, var(--mantine-color-${accentColor}-7) 100%)`,
                  borderRadius: '0 4px 4px 0',
                }}
              />
            )}

            {/* Title with Unread Indicator */}
            <Group gap={8} align="flex-start" wrap="nowrap" mb={8}>
              {!isRead && (
                <Box
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--mantine-color-green-5)',
                    marginTop: 8, // Align with text (approximate)
                    flexShrink: 0,
                  }}
                />
              )}
              <Text
                fw={isRead ? 400 : 600}
                size="sm"
                lineClamp={2}
                style={{
                  color: isSelected
                    ? 'var(--mantine-color-gray-1)'
                    : isRead
                      ? 'var(--mantine-color-gray-4)'
                      : 'var(--mantine-color-gray-2)',
                  flex: 1,
                }}
              >
                {item.title}
              </Text>
            </Group>

            {/* Description */}
            {item.description && (
              <Text size="xs" c="dimmed" lineClamp={1} mb={10}>
                {item.description.replace(/Points: \d+|Comments: \d+/g, '').replace(/<[^>]*>/g, '')}
              </Text>
            )}

            {/* Metadata row */}
            <Group gap={8} justify="space-between" wrap="nowrap">
              <Group gap={12} wrap="nowrap">
                {/* Secondary Action (e.g. Delete) */}
                {onSecondaryAction && (
                  <UnstyledButton
                    onClick={e => onSecondaryAction(e, item)}
                    style={{
                      padding: '4px',
                      borderRadius: '4px',
                      color: 'var(--mantine-color-gray-5)',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255, 107, 107, 0.15)'
                      e.currentTarget.style.color = 'var(--mantine-color-red-4)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--mantine-color-gray-5)'
                    }}
                  >
                    {secondaryActionIcon || (
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
                    )}
                  </UnstyledButton>
                )}

                {/* Score / Points */}
                {item.score !== undefined && (
                  <Tooltip label="Points" position="bottom" openDelay={500}>
                    <Group gap={4} align="center">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        color="var(--mantine-color-orange-5)"
                      >
                        <path d="M12 20V10" />
                        <path d="M18 20V4" />
                        <path d="M6 20v-4" />
                      </svg>
                      <Text size="xs" c="dimmed" fw={500} style={{ fontSize: '11px' }}>
                        {item.score}
                      </Text>
                    </Group>
                  </Tooltip>
                )}

                {/* Comments Link */}
                {(item.commentsCount !== undefined || item.commentsLink) && (
                  <Tooltip label="View Comments on HN" position="bottom" openDelay={500}>
                    <UnstyledButton
                      onClick={e => item.commentsLink && handleCommentsClick(e, item.commentsLink)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: item.commentsLink ? 'pointer' : 'default',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginLeft: -6,
                      }}
                      onMouseEnter={e => {
                        if (item.commentsLink) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        color="var(--mantine-color-blue-4)"
                      >
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                      </svg>
                      <Text size="xs" c="dimmed" fw={500} style={{ fontSize: '11px' }}>
                        {item.commentsCount ?? 'Discuss'}
                      </Text>
                    </UnstyledButton>
                  </Tooltip>
                )}

                {/* Bookmark indicator */}
                {item.isBookmarked && (
                  <Box style={{ color: 'var(--mantine-color-yellow-5)' }}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </Box>
                )}
              </Group>

              {/* Timestamp */}
              <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap', fontSize: '11px' }}>
                {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
              </Text>
            </Group>
          </UnstyledButton>
        )
      })}
    </Stack>
  )
}
