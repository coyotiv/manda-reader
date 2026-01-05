import { createTheme, MantineColorsTuple, rem, virtualColor } from '@mantine/core'

// Preserving the Amber palette for Brand/Logo consistency
const amber: MantineColorsTuple = [
  '#fff8e1',
  '#ffecb3',
  '#ffe082',
  '#ffd54f',
  '#ffca28',
  '#ffc107',
  '#ffb300',
  '#ffa000',
  '#ff8f00',
  '#ff6f00',
]

// "Galaxy" - Deep, rich violets and indigos for that AI/Next-Gen background base
const galaxy: MantineColorsTuple = [
  '#e0e7ff', // 0
  '#c7d2fe', // 1
  '#a5b4fc', // 2
  '#818cf8', // 3
  '#6366f1', // 4
  '#4f46e5', // 5
  '#4338ca', // 6
  '#3730a3', // 7
  '#312e81', // 8
  '#1e1b4b', // 9 - Very deep indigo
]

// "Cyber" - Cool, blue-tinted grays for UI elements
const cyber: MantineColorsTuple = [
  '#f8fafc',
  '#f1f5f9',
  '#e2e8f0',
  '#cbd5e1',
  '#94a3b8',
  '#64748b',
  '#475569',
  '#334155',
  '#1e293b',
  '#0f172a',
]

// "Neon" - Vibrant accent for actions (replacing Coral)
const neon: MantineColorsTuple = [
  '#ffe4e6',
  '#fecdd3',
  '#fda4af',
  '#fb7185',
  '#f43f5e',
  '#e11d48',
  '#be123c',
  '#9f1239',
  '#881337',
  '#4c0519',
]

// "Matrix" - Tech teal/green
const matrix: MantineColorsTuple = [
  '#ecfdf5',
  '#d1fae5',
  '#a7f3d0',
  '#6ee7b7',
  '#34d399',
  '#10b981',
  '#059669',
  '#047857',
  '#065f46',
  '#064e3b',
]

export const theme = createTheme({
  colors: {
    amber,
    galaxy,
    cyber,
    neon,
    matrix,
    // Mapping mantine default colors to our new palettes
    dark: cyber,
    gray: cyber,
    blue: galaxy,
    primary: virtualColor({
      name: 'primary',
      dark: 'amber',
      light: 'galaxy',
    }),
  },
  primaryColor: 'primary',
  primaryShade: { light: 6, dark: 5 },

  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, "SF Mono", Menlo, Consolas, monospace',

  headings: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: rem(42), lineHeight: '1.1' },
      h2: { fontSize: rem(32), lineHeight: '1.2' },
      h3: { fontSize: rem(24), lineHeight: '1.3' },
      h4: { fontSize: rem(20), lineHeight: '1.35' },
    },
  },

  radius: {
    xs: rem(6),
    sm: rem(10),
    md: rem(16), // Increased default radius
    lg: rem(24),
    xl: rem(32),
  },

  spacing: {
    xs: rem(10),
    sm: rem(14),
    md: rem(20),
    lg: rem(32),
    xl: rem(48),
  },

  shadows: {
    xs: '0 1px 2px rgba(0, 0, 0, 0.2)',
    sm: '0 4px 8px rgba(0, 0, 0, 0.2)',
    md: '0 8px 16px rgba(0, 0, 0, 0.2)',
    lg: '0 12px 32px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 60px rgba(0, 0, 0, 0.4)',
  },

  defaultRadius: 'md',

  components: {
    Button: {
      defaultProps: {
        radius: 'xl', // Pill shape buttons
        fw: 600,
      },
      styles: {
        root: {
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        padding: 'lg',
      },
      styles: {
        root: {
          backgroundColor: 'rgba(30, 41, 59, 0.4)', // Semi-transparent
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
      styles: {
        root: {
          backgroundColor: 'rgba(30, 41, 59, 0.4)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          borderRadius: 'var(--mantine-radius-md)',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          backgroundColor: 'rgba(15, 23, 42, 0.3)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          color: 'var(--mantine-color-white)',
          '&:focus': {
            borderColor: 'var(--mantine-color-primary-5)',
          },
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: 'xl',
        overlayProps: {
          blur: 8,
          backgroundOpacity: 0.7,
        },
      },
      styles: {
        content: {
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        header: {
          backgroundColor: 'transparent',
        },
      },
    },
    Tooltip: {
      defaultProps: {
        radius: 'md',
        color: 'dark',
      },
    },
  },

  other: {
    transitionDuration: '200ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
})
