import { useState, useEffect, useRef } from 'react'
import { showNotification } from '@mantine/notifications'
import client from '../api/client'

interface UseReaderEngineProps {
  url: string
}

export function useReaderEngine({ url }: UseReaderEngineProps) {
  const [readerMode, setReaderMode] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const cspCheckTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const hasSwitchedToReaderRef = useRef(false)

  // Check framing availability on link change
  useEffect(() => {
    // Reset state for new item
    hasSwitchedToReaderRef.current = false
    setReaderMode(false)

    const checkFraming = async () => {
      if (!url) return

      try {
        const { data } = await client.get('/reader/check-framing', {
          params: { url },
        })

        // Only switch if this is still the current item and we haven't switched yet
        if (data.blocked && !hasSwitchedToReaderRef.current) {
          hasSwitchedToReaderRef.current = true
          setReaderMode(true)
          showNotification({
            message: 'Switched to reader mode (site blocks embedding)',
            color: 'blue',
            autoClose: 3000,
          })
        }
      } catch (error) {
        console.error('Framing check failed:', error)
      }
    }

    checkFraming()
  }, [url])

  const handleCspViolation = () => {
    // Only switch once per item
    if (!hasSwitchedToReaderRef.current && !readerMode) {
      hasSwitchedToReaderRef.current = true
      setReaderMode(true)
      showNotification({
        message: 'Switched to reader mode due to security restrictions',
        color: 'blue',
        autoClose: 3000,
      })
    }
  }

  const checkCspViolation = () => {
    if (!iframeRef.current || readerMode || hasSwitchedToReaderRef.current) {
      return
    }

    try {
      const iframe = iframeRef.current
      const currentOrigin = window.location.origin

      try {
        const iframeUrl = new URL(iframe.src)
        const isSameOrigin = iframeUrl.origin === currentOrigin

        if (isSameOrigin) {
          // For same-origin, we should be able to access contentDocument
          // If we can't, it's likely a CSP violation
          try {
            const doc = iframe.contentDocument || iframe.contentWindow?.document
            if (!doc) {
              // Same origin but no document access = CSP violation
              handleCspViolation()
              return
            }
          } catch (error: any) {
            // SecurityError on same-origin = CSP violation
            if (error.name === 'SecurityError') {
              handleCspViolation()
              return
            }
          }
        }
        // For cross-origin, we can't reliably detect CSP violations
        // The timeout will handle cases where content doesn't load
      } catch (urlError) {
        // URL parsing failed, skip check
      }
    } catch (error) {
      // Error during check, skip
    }
  }

  const handleIframeLoad = () => {
    // Clear timeout
    if (cspCheckTimeoutRef.current) {
      clearTimeout(cspCheckTimeoutRef.current)
    }

    // Check for CSP violation after a short delay
    // CSP violations don't prevent load event, so we need to check content access
    setTimeout(() => {
      checkCspViolation()
    }, 1000) // 1 second delay to allow CSP errors to surface
  }

  const handleIframeError = () => {
    // Iframe failed to load - likely CSP or other blocking
    handleCspViolation()
  }

  // Set timeout to detect CSP violations that don't trigger load events or are delayed
  useEffect(() => {
    if (!readerMode && iframeRef.current) {
      // Set a timeout - if iframe doesn't load properly, check for CSP violation
      cspCheckTimeoutRef.current = setTimeout(() => {
        checkCspViolation()
      }, 3000) // 3 second timeout to catch delayed CSP violations
    }

    return () => {
      if (cspCheckTimeoutRef.current) {
        clearTimeout(cspCheckTimeoutRef.current)
      }
    }
  }, [readerMode, url])

  return {
    readerMode,
    setReaderMode,
    iframeRef,
    handleIframeLoad,
    handleIframeError,
  }
}
