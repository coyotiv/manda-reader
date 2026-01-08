import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import {
  AppShell,
  Group,
  Stack,
  Text,
  UnstyledButton,
  Box,
  Tooltip,
  Avatar,
  Divider,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import FeedView from './pages/FeedView'
import ReaderView from './pages/ReaderView'
import ReadView from './pages/ReadView'
import BookmarksView from './pages/BookmarksView'
import HistoryView from './pages/HistoryView'

// Icon components for cleaner code
const Icons = {
  Feeds: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  ),
  Bookmarks: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ),
  History: () => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Logout: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Manda: () => (
    <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
      {/* Water buffalo / Manda icon */}
      <ellipse cx="32" cy="36" rx="22" ry="18" fill="currentColor" />
      {/* Horns */}
      <path
        d="M8 24 Q4 16 12 12 Q18 14 20 22"
        stroke="#1a1a2e"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M56 24 Q60 16 52 12 Q46 14 44 22"
        stroke="#1a1a2e"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      {/* Face */}
      <ellipse cx="32" cy="40" rx="14" ry="12" fill="#d4a574" />
      {/* Eyes */}
      <circle cx="24" cy="32" r="4" fill="#f5f5f5" />
      <circle cx="40" cy="32" r="4" fill="#f5f5f5" />
      <circle cx="24" cy="33" r="2" fill="#1a1a2e" />
      <circle cx="40" cy="33" r="2" fill="#1a1a2e" />
      {/* Nose */}
      <ellipse cx="32" cy="44" rx="8" ry="5" fill="#8b6914" />
      <circle cx="28" cy="44" r="2" fill="#1a1a2e" />
      <circle cx="36" cy="44" r="2" fill="#1a1a2e" />
      {/* Ears */}
      <ellipse cx="12" cy="28" rx="5" ry="4" fill="currentColor" />
      <ellipse cx="52" cy="28" rx="5" ry="4" fill="currentColor" />
    </svg>
  ),
}

function App() {
  const { isAuthenticated, logout, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [opened, { toggle }] = useDisclosure(true)

  const navItems = [
    { icon: <Icons.Feeds />, label: 'Feeds', href: '/' },
    { icon: <Icons.Bookmarks />, label: 'Bookmarks', href: '/bookmarks', color: '#4dabf7' },
    { icon: <Icons.History />, label: 'History', href: '/history', color: '#69db7c' },
  ]

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell
              padding="xl"
              navbar={{
                width: opened ? 260 : 80,
                breakpoint: 'sm',
              }}
              styles={{
                main: {
                  background: 'transparent',
                  minHeight: '100vh',
                },
                navbar: {
                  background: 'rgba(15, 23, 42, 0.7)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
                <AppShell.Navbar p="md">
                <Stack h="100%" justify="space-between">
                  {/* Logo & Brand */}
                  <Box>
                    {/* Toggle Button - Fixed Position */}
                    <Box style={{ position: 'relative', height: '48px', marginBottom: '8px' }}>
                      <Tooltip label={opened ? 'Collapse sidebar' : 'Expand sidebar'} position="right">
                        <UnstyledButton
                          onClick={toggle}
                          style={{
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            padding: '10px',
                            borderRadius: '8px',
                            background: 'transparent',
                            color: 'var(--mantine-color-gray-5)',
                            transition: 'background 0.2s ease, color 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(255, 193, 7, 0.1)'
                            e.currentTarget.style.color = 'var(--mantine-color-amber-5)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = 'var(--mantine-color-gray-5)'
                          }}
                        >
                          {opened ? (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="11 17 6 12 11 7" />
                              <polyline points="18 17 13 12 18 7" />
                            </svg>
                          ) : (
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="13 7 18 12 13 17" />
                              <polyline points="6 7 11 12 6 17" />
                            </svg>
                          )}
                        </UnstyledButton>
                      </Tooltip>
                    </Box>

                    {/* Logo - Fixed Position */}
                    <Box mb="lg" style={{ height: '56px', display: 'flex', alignItems: 'center' }}>
                      <Group gap="sm" wrap="nowrap" style={{ width: '100%' }}>
                        <Box style={{ color: '#ffc107', flexShrink: 0 }}>
                          <Icons.Manda />
                        </Box>
                        {opened && (
                          <Box style={{ overflow: 'hidden' }}>
                            <Text
                              size="lg"
                              fw={700}
                              style={{
                                background: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Manda Reader
                            </Text>
                            <Text size="xs" c="dimmed" style={{ lineHeight: 1.4, whiteSpace: 'nowrap' }}>
                              Fast content, minimal noise
                            </Text>
                          </Box>
                        )}
                      </Group>
                    </Box>

                    <Divider mb="md" color="rgba(255, 255, 255, 0.06)" />

                    {/* Navigation */}
                    <Stack gap={6}>
                      {navItems.map(item => {
                        const isActive =
                          item.href === '/'
                            ? location.pathname === '/' || location.pathname.startsWith('/item')
                            : location.pathname === item.href

                        return (
                          <Tooltip
                            key={item.href}
                            label={item.label}
                            position="right"
                            transitionProps={{ duration: 150 }}
                            disabled={opened}
                          >
                            <UnstyledButton
                              onClick={() => navigate(item.href)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                color: isActive
                                  ? item.color || 'var(--mantine-color-amber-5)'
                                  : 'var(--mantine-color-gray-4)',
                                background: isActive ? 'rgba(255, 193, 7, 0.1)' : 'transparent',
                                transition: 'background 0.2s ease, color 0.2s ease',
                                width: '100%',
                                justifyContent: opened ? 'flex-start' : 'center',
                              }}
                              onMouseEnter={e => {
                                if (!isActive) {
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                                  e.currentTarget.style.color = item.color || 'var(--mantine-color-gray-2)'
                                }
                              }}
                              onMouseLeave={e => {
                                if (!isActive) {
                                  e.currentTarget.style.background = 'transparent'
                                  e.currentTarget.style.color = 'var(--mantine-color-gray-4)'
                                }
                              }}
                            >
                              <Box style={{ color: isActive ? item.color || 'var(--mantine-color-amber-5)' : 'inherit' }}>
                                {item.icon}
                              </Box>
                              {opened && (
                                <Text size="sm" fw={isActive ? 600 : 500}>
                                  {item.label}
                                </Text>
                              )}
                            </UnstyledButton>
                          </Tooltip>
                        )
                      })}
                    </Stack>
                  </Box>

                  {/* User Section */}
                  <Box>
                    <Divider mb="md" color="rgba(255, 255, 255, 0.06)" />
                    {opened ? (
                      <Group justify="space-between" p="md">
                        <Group gap="sm">
                          <Avatar size="sm" radius="xl" color="amber" style={{ border: '2px solid rgba(255, 193, 7, 0.2)' }}>
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                          </Avatar>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              size="sm"
                              fw={500}
                              c="gray.3"
                              lineClamp={1}
                              style={{ lineHeight: 1.4 }}
                            >
                              {user?.email?.split('@')[0] || 'User'}
                            </Text>
                          </Box>
                        </Group>
                        <Tooltip label="Sign out" position="top">
                          <UnstyledButton
                            onClick={logout}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              color: 'var(--mantine-color-gray-5)',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(255, 107, 107, 0.12)'
                              e.currentTarget.style.color = 'var(--mantine-color-red-5)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.color = 'var(--mantine-color-gray-5)'
                            }}
                          >
                            <Icons.Logout />
                          </UnstyledButton>
                        </Tooltip>
                      </Group>
                    ) : (
                      <Stack gap="lg" align="center" p="md" pt="sm">
                        <Tooltip label={user?.email?.split('@')[0] || 'User'} position="right">
                          <Avatar size="sm" radius="xl" color="amber" style={{ cursor: 'default', border: '2px solid rgba(255, 193, 7, 0.2)' }}>
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                          </Avatar>
                        </Tooltip>
                        <Tooltip label="Sign out" position="right">
                          <UnstyledButton
                            onClick={logout}
                            style={{
                              padding: '10px',
                              borderRadius: '8px',
                              color: 'var(--mantine-color-gray-5)',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(255, 107, 107, 0.12)'
                              e.currentTarget.style.color = 'var(--mantine-color-red-5)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.color = 'var(--mantine-color-gray-5)'
                            }}
                          >
                            <Icons.Logout />
                          </UnstyledButton>
                        </Tooltip>
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </AppShell.Navbar>

              <AppShell.Main>
                <Box style={{ height: '100%' }}>
                  <Routes>
                    <Route path="/" element={<FeedView />} />
                    <Route path="/item/:id" element={<ReaderView />} />
                    <Route path="/read" element={<ReadView />} />
                    <Route path="/bookmarks" element={<BookmarksView />} />
                    <Route path="/history" element={<HistoryView />} />
                  </Routes>
                </Box>
              </AppShell.Main>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
