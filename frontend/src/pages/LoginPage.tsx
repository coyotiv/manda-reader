import { useState } from 'react'
import {
  Container,
  TextInput,
  Stack,
  Text,
  Box,
  UnstyledButton,
  Group,
  PasswordInput,
} from '@mantine/core'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const { login, register } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await register(email, password)
      }
    } catch (error) {
      // Error handled in useAuth hook
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255, 193, 7, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-15%',
          width: '800px',
          height: '800px',
          background: 'radial-gradient(circle, rgba(255, 143, 0, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
        }}
      />

      <Container size={440} style={{ position: 'relative', zIndex: 1 }}>
        <Box
          className="animate-fadeIn glass"
          style={{
            padding: '48px 40px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            opacity: 0,
          }}
        >
          {/* Logo & Branding */}
          <Stack align="center" mb={40}>
            <Box
              className="animate-pulse"
              style={{
                width: 80,
                height: 80,
                borderRadius: '24px',
                background:
                  'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 143, 0, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              {/* Manda (water buffalo) icon */}
              <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
                <ellipse cx="32" cy="36" rx="22" ry="18" fill="#ffc107" />
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
                <ellipse cx="32" cy="40" rx="14" ry="12" fill="#d4a574" />
                <circle cx="24" cy="32" r="4" fill="#f5f5f5" />
                <circle cx="40" cy="32" r="4" fill="#f5f5f5" />
                <circle cx="24" cy="33" r="2" fill="#1a1a2e" />
                <circle cx="40" cy="33" r="2" fill="#1a1a2e" />
                <ellipse cx="32" cy="44" rx="8" ry="5" fill="#8b6914" />
                <circle cx="28" cy="44" r="2" fill="#1a1a2e" />
                <circle cx="36" cy="44" r="2" fill="#1a1a2e" />
                <ellipse cx="12" cy="28" rx="5" ry="4" fill="#ffc107" />
                <ellipse cx="52" cy="28" rx="5" ry="4" fill="#ffc107" />
              </svg>
            </Box>
            <Text
              size="xl"
              fw={700}
              style={{
                background: 'linear-gradient(135deg, #ffc107 0%, #ff8f00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '28px',
              }}
            >
              Manda Reader
            </Text>
            <Text c="dimmed" size="sm" ta="center">
              Fast content, minimal noise
            </Text>
          </Stack>

          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              <Box>
                <Text size="sm" fw={500} mb={8} c="gray.4">
                  Email
                </Text>
                <TextInput
                  placeholder="your@email.com"
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  size="md"
                  styles={{
                    input: {
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      height: 'auto',
                      color: 'var(--mantine-color-gray-2)',
                      '&:focus': {
                        borderColor: 'rgba(255, 193, 7, 0.5)',
                        boxShadow: '0 0 0 2px rgba(255, 193, 7, 0.15)',
                      },
                    },
                  }}
                />
              </Box>

              <Box>
                <Text size="sm" fw={500} mb={8} c="gray.4">
                  Password
                </Text>
                <PasswordInput
                  placeholder="Your password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  size="md"
                  styles={{
                    wrapper: {
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      minHeight: '48px',
                      '&:focus-within': {
                        borderColor: 'rgba(255, 193, 7, 0.5)',
                        boxShadow: '0 0 0 2px rgba(255, 193, 7, 0.15)',
                      },
                    },
                    input: {
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      height: 'auto',
                      color: 'var(--mantine-color-gray-2)',
                    },
                    innerInput: {
                      padding: 0,
                      height: 'auto',
                      color: 'var(--mantine-color-gray-2)',
                    },
                    visibilityToggle: {
                      color: 'var(--mantine-color-gray-5)',
                      marginLeft: '8px',
                    },
                  }}
                />
              </Box>

              <UnstyledButton
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  borderRadius: '12px',
                  background: loading
                    ? 'rgba(255, 193, 7, 0.5)'
                    : 'linear-gradient(135deg, var(--mantine-color-amber-6) 0%, var(--mantine-color-orange-6) 100%)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '15px',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  cursor: loading ? 'wait' : 'pointer',
                  marginTop: '8px',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 193, 7, 0.3)'
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {loading ? (
                  <Group gap={8} justify="center">
                    <Box
                      style={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </Group>
                ) : isLogin ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </UnstyledButton>
            </Stack>
          </form>

          <Text ta="center" mt={32} size="sm" c="dimmed">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <UnstyledButton
                  onClick={() => setIsLogin(false)}
                  style={{
                    color: 'var(--mantine-color-amber-5)',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--mantine-color-amber-4)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--mantine-color-amber-5)'
                  }}
                >
                  Create one
                </UnstyledButton>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <UnstyledButton
                  onClick={() => setIsLogin(true)}
                  style={{
                    color: 'var(--mantine-color-amber-5)',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'var(--mantine-color-amber-4)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--mantine-color-amber-5)'
                  }}
                >
                  Sign in
                </UnstyledButton>
              </>
            )}
          </Text>
        </Box>

        {/* Footer */}
        <Text ta="center" mt={24} size="xs" c="dimmed" style={{ opacity: 0.5 }}>
          Fast content, minimal noise • Read what matters
        </Text>
      </Container>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  )
}
