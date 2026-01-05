import axios from 'axios'
import * as cheerio from 'cheerio'
import https from 'https'

// Create an HTTPS agent that ignores SSL certificate errors
// This is necessary for some feeds with misconfigured SSL certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
})

// Helper to check if content type indicates RSS/Atom feed
function isRssFeedContentType(contentType: string | undefined): boolean {
  if (!contentType) return false
  const lower = contentType.toLowerCase()
  return lower.includes('xml') || lower.includes('rss') || lower.includes('atom')
}

export async function discoverRSSFeed(url: string): Promise<string | null> {
  try {
    const urlObj = new URL(url)

    // First, check if the URL itself is already an RSS feed
    try {
      // Try GET instead of HEAD for better compatibility
      const response = await axios.get(url, {
        timeout: 5000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        httpsAgent,
      })
      if (isRssFeedContentType(response.headers['content-type'])) {
        return url
      }
    } catch (e) {
      // Continue with discovery
    }

    // Substack-specific handling - feed is always at origin/feed
    if (urlObj.hostname.includes('substack.com')) {
      const substackFeed = `${urlObj.origin}/feed`
      try {
        const testResponse = await axios.get(substackFeed, {
          timeout: 5000,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
          httpsAgent,
        })
        if (isRssFeedContentType(testResponse.headers['content-type'])) {
          return substackFeed
        }
      } catch (e) {
        // Fall through to general discovery
      }
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000,
      httpsAgent,
    })

    const contentType = response.headers['content-type'] || ''

    // If the GET response is already XML/RSS, return the URL
    if (isRssFeedContentType(contentType)) {
      return url
    }

    const $ = cheerio.load(response.data)

    // Check for RSS/Atom link tags (standard and alternate forms)
    const rssLink = $('link[type="application/rss+xml"]').attr('href')
    const atomLink = $('link[type="application/atom+xml"]').attr('href')
    const alternateRss = $('link[rel="alternate"][type="application/rss+xml"]').attr('href')
    const alternateAtom = $('link[rel="alternate"][type="application/atom+xml"]').attr('href')

    if (rssLink) return new URL(rssLink, url).href
    if (atomLink) return new URL(atomLink, url).href
    if (alternateRss) return new URL(alternateRss, url).href
    if (alternateAtom) return new URL(alternateAtom, url).href

    // Try common paths
    const baseUrl = urlObj.origin
    const commonPaths = ['/feed', '/rss', '/atom.xml', '/feed.xml', '/rss.xml', '/index.xml']

    for (const path of commonPaths) {
      try {
        const testUrl = baseUrl + path
        // Try GET instead of HEAD
        const testResponse = await axios.get(testUrl, {
          timeout: 5000,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
          httpsAgent,
        })
        if (isRssFeedContentType(testResponse.headers['content-type'])) {
          return testUrl
        }
      } catch (e) {
        continue
      }
    }

    return null
  } catch (error) {
    console.error('RSS Discovery Error:', error)
    throw new Error('Failed to discover RSS feed')
  }
}

export function detectFeedType(url: string): 'rss' | 'atom' | 'substack' | 'custom' {
  const urlObj = new URL(url)

  if (urlObj.hostname.includes('substack.com')) {
    return 'substack'
  }

  return 'rss'
}
