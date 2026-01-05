import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stack, Text, Group, Badge, Tabs, Select, Box, UnstyledButton } from '@mantine/core'
import { useHistory, useHistoryByDays } from '../hooks/useHistory'
import { formatDistanceToNow, format } from 'date-fns'

export default function HistoryView() {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<string | undefined>()
  const { data: history = [] } = useHistory(selectedDate)
  const { data: historyByDays = {} } = useHistoryByDays()

  const days = Object.keys(historyByDays)
    .filter(day => historyByDays[day] && historyByDays[day].length > 0)
    .sort((a, b) => b.localeCompare(a))

  const handleClick = (item: { url: string; title: string }) => {
    navigate(`/read?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.title)}`)
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'viewed':
        return 'blue'
      case 'bookmarked':
        return 'yellow'
      default:
        return 'teal'
    }
  }

  return (
    <Box style={{ height: 'calc(100vh - 80px)' }}>
      <Stack gap="lg" style={{ height: '100%' }}>
        {/* Header */}
        <Group justify="space-between" align="center">
          <Box>
            <Group gap="sm" mb={4}>
              <Box
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  background:
                    'linear-gradient(135deg, rgba(105, 219, 124, 0.15) 0%, rgba(32, 201, 151, 0.1) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: 'var(--mantine-color-teal-4)' }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </Box>
              <Box>
                <Text size="xl" fw={700} c="gray.1">
                  History
                </Text>
                <Text size="sm" c="dimmed">
                  Your reading activity
                </Text>
              </Box>
            </Group>
          </Box>
        </Group>

        {/* Content */}
        <Box
          className="glass animate-fadeIn"
          style={{
            flex: 1,
            padding: '24px',
            borderRadius: '16px',
            overflow: 'auto',
            opacity: 0,
            animationDelay: '0.1s',
          }}
        >
          <Tabs
            defaultValue="all"
            styles={{
              root: { height: '100%', display: 'flex', flexDirection: 'column' },
              panel: { flex: 1, overflow: 'auto', paddingTop: 16 },
              list: {
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '4px',
                borderRadius: '10px',
                gap: '4px',
                border: 'none',
              },
              tab: {
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 500,
                color: 'var(--mantine-color-gray-5)',
                transition: 'all 0.15s ease',
                '&[data-active]': {
                  background: 'rgba(255, 193, 7, 0.15)',
                  color: 'var(--mantine-color-amber-4)',
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                },
              },
            }}
          >
            <Tabs.List>
              <Tabs.Tab value="all">All History</Tabs.Tab>
              <Tabs.Tab value="by-day">By Day</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="all">
              <Select
                placeholder="Filter by date"
                clearable
                value={selectedDate || null}
                onChange={value => setSelectedDate(value || undefined)}
                data={days.map(day => ({
                  value: day,
                  label: format(new Date(day), 'MMMM d, yyyy'),
                }))}
                mb="lg"
                styles={{
                  input: {
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    color: 'var(--mantine-color-gray-3)',
                  },
                }}
              />

              {history.length === 0 ? (
                <Stack align="center" justify="center" style={{ minHeight: 200 }}>
                  <Box
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'rgba(105, 219, 124, 0.1)',
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
                      style={{ color: 'var(--mantine-color-teal-5)' }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </Box>
                  <Text c="dimmed" ta="center" size="sm">
                    No history yet. Your reading activity will appear here.
                  </Text>
                </Stack>
              ) : (
                <Stack gap="sm">
                  {history.map((item, index) => (
                    <UnstyledButton
                      key={item._id}
                      onClick={() => handleClick(item)}
                      className="animate-fadeIn"
                      style={{
                        animationDelay: `${index * 0.03}s`,
                        opacity: 0,
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'all 0.2s ease',
                        width: '100%',
                        textAlign: 'left',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)'
                      }}
                    >
                      <Group justify="space-between" mb={8} wrap="nowrap">
                        <Text fw={500} size="sm" c="gray.2" lineClamp={1} style={{ flex: 1 }}>
                          {item.title}
                        </Text>
                        <Badge
                          size="sm"
                          variant="light"
                          color={getActionColor(item.action)}
                          radius="sm"
                          styles={{ root: { textTransform: 'capitalize' } }}
                        >
                          {item.action}
                        </Badge>
                      </Group>
                      <Text size="xs" c="dimmed">
                        {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                      </Text>
                    </UnstyledButton>
                  ))}
                </Stack>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="by-day">
              {days.length === 0 ? (
                <Stack align="center" justify="center" style={{ minHeight: 200 }}>
                  <Box
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'rgba(105, 219, 124, 0.1)',
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
                      style={{ color: 'var(--mantine-color-teal-5)' }}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </Box>
                  <Text c="dimmed" ta="center" size="sm">
                    No history yet. Your reading activity will appear here.
                  </Text>
                </Stack>
              ) : (
                <Stack gap="lg">
                  {days.map((day, dayIndex) => {
                    const dayItems = historyByDays[day] || []
                    return (
                      <Box
                        key={day}
                        className="animate-fadeIn"
                        style={{
                          animationDelay: `${dayIndex * 0.05}s`,
                          opacity: 0,
                          padding: '20px',
                          borderRadius: '14px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        <Text fw={600} size="sm" c="gray.2" mb="md">
                          {format(new Date(day), 'EEEE, MMMM d, yyyy')}
                        </Text>
                        <Stack gap="xs">
                          {dayItems.map(item => (
                            <UnstyledButton
                              key={item._id}
                              onClick={() => handleClick(item)}
                              style={{
                                padding: '12px',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.02)',
                                transition: 'all 0.15s ease',
                                width: '100%',
                                textAlign: 'left',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                              }}
                            >
                              <Group justify="space-between" wrap="nowrap">
                                <Text size="sm" c="gray.3" lineClamp={1} style={{ flex: 1 }}>
                                  {item.title}
                                </Text>
                                <Group gap="xs" wrap="nowrap">
                                  <Badge
                                    size="xs"
                                    variant="light"
                                    color={getActionColor(item.action)}
                                    radius="sm"
                                    styles={{ root: { textTransform: 'capitalize' } }}
                                  >
                                    {item.action}
                                  </Badge>
                                  <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                                    {format(new Date(item.date), 'h:mm a')}
                                  </Text>
                                </Group>
                              </Group>
                            </UnstyledButton>
                          ))}
                        </Stack>
                      </Box>
                    )
                  })}
                </Stack>
              )}
            </Tabs.Panel>
          </Tabs>
        </Box>
      </Stack>
    </Box>
  )
}
