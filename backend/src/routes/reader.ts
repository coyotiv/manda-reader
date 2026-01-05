import express from 'express'
import axios from 'axios'
import https from 'https'
import { JSDOM, VirtualConsole } from 'jsdom'
import { Readability } from '@mozilla/readability'
import { asyncHandler } from '../middleware/asyncHandler'
import { FeedItem } from '../models/FeedItem'

const router = express.Router()

// Create HTTPS agent that ignores SSL certificate errors for reader mode
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

// Check if a URL allows framing (CSP/X-Frame-Options)
router.get(
  '/check-framing',
  asyncHandler(async (req, res) => {
    const { url } = req.query

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' })
    }

    try {
      const response = await axios.head(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 5000,
        validateStatus: status => status < 500,
        httpsAgent: httpsAgent,
      })

      const headers = response.headers
      const xFrameOptions = headers['x-frame-options']?.toString().toLowerCase()
      const csp = headers['content-security-policy']?.toString().toLowerCase()

      let blocked = false

      // Check X-Frame-Options
      if (xFrameOptions) {
        if (xFrameOptions === 'deny' || xFrameOptions === 'sameorigin') {
          blocked = true
        }
      }

      // Check CSP frame-ancestors
      if (csp && !blocked) {
        if (csp.includes('frame-ancestors')) {
          // If it has frame-ancestors and isn't broadly permissive, assume blocked
          // 'none', 'self', or specific domains will block us
          if (
            !csp.includes('frame-ancestors *') &&
            !csp.includes('frame-ancestors https:') &&
            !csp.includes('frame-ancestors http:')
          ) {
            blocked = true
          }
        }
      }

      res.json({ blocked })
    } catch (error) {
      // If request fails, default to allowing iframe (client will handle load errors)
      res.json({ blocked: false })
    }
  })
)

// Reader mode endpoint - extracts main content from a webpage
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { url } = req.query

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' })
    }

    // Check cache first
    const item = await FeedItem.findOne({ link: url })
    if (item && item.readerContent) {
      res.setHeader('Content-Type', 'text/html')
      return res.send(item.readerContent)
    }

    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
      maxRedirects: 5,
      validateStatus: status => status < 500, // Accept redirects and client errors
      httpsAgent: httpsAgent, // Ignore SSL certificate errors
    })

    // Parse with Readability
    // Use a separate virtual console to suppress JSDOM logs (scripts, parsing errors, etc.)
    const virtualConsole = new VirtualConsole()
    const doc = new JSDOM(response.data, {
      url: url,
      virtualConsole,
    })
    const reader = new Readability(doc.window.document)
    const article = reader.parse()

    if (!article) {
      return res.status(422).send('Could not parse content')
    }

    // Create clean HTML
    const cleanHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${article.title}</title>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    color: #333;
    background: #fff;
  }
  h1 { font-size: 2.2em; margin-bottom: 0.5em; line-height: 1.2; }
  h2 { font-size: 1.8em; margin-top: 1.5em; }
  h3 { font-size: 1.4em; margin-top: 1.2em; }

  /* Prevent huge images/icons */
  img, svg {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1em auto;
  }

  /* Fix for huge icons in reader view */
  .icon, [class*="icon"], [id*="icon"], svg[class*="icon"] {
    max-width: 24px !important;
    max-height: 24px !important;
    width: auto;
    height: auto;
    display: inline-block;
    vertical-align: middle;
  }

  /* Restore normal sizing for content images */
  figure img, article img, .content img {
    max-width: 100%;
    max-height: none;
  }

  a { color: #0066cc; text-decoration: none; }
  a:hover { text-decoration: underline; }

  pre {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    font-size: 0.9em;
  }

  blockquote {
    border-left: 4px solid #ddd;
    margin: 1.5em 0;
    padding-left: 20px;
    color: #666;
  }

  .byline {
    font-size: 0.9em;
    color: #666;
    margin-bottom: 2em;
    border-bottom: 1px solid #eee;
    padding-bottom: 1em;
  }

  /* Video embeds */
  iframe, video {
    max-width: 100%;
  }
</style>
</head>
<body>
<h1>${article.title}</h1>
${article.byline ? `<div class="byline">${article.byline}</div>` : ''}
${article.content}
</body>
</html>
  `.trim()

    // Save to cache if item exists
    if (item) {
      item.readerContent = cleanHTML
      await item.save()
    }

    res.setHeader('Content-Type', 'text/html')
    res.send(cleanHTML)
  })
)

export default router
