import { Box } from '@mantine/core'
import { FeedItem } from '../api/items'
import client from '../api/client'
import { CSSProperties } from 'react'

const API_URL = (client.defaults.baseURL as string) || 'http://localhost:3000/api'

interface ReaderContentProps {
  item: FeedItem
  readerMode: boolean
  iframeRef?: React.RefObject<HTMLIFrameElement>
  onIframeLoad?: () => void
  onIframeError?: () => void
  additionalStyles?: CSSProperties
}

export default function ReaderContent({
  item,
  readerMode,
  iframeRef,
  onIframeLoad,
  onIframeError,
  additionalStyles,
}: ReaderContentProps) {
  return (
    <Box
      className="reader-frame"
      style={{
        flex: 1,
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
        ...additionalStyles,
      }}
    >
      {readerMode ? (
        <iframe
          src={`${API_URL}/reader?url=${encodeURIComponent(item.link)}`}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title={`Reader view of ${item.title}`}
        />
      ) : (
        <iframe
          ref={iframeRef}
          src={item.link}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          title={item.title}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          onError={onIframeError}
          onLoad={onIframeLoad}
        />
      )}
    </Box>
  )
}
