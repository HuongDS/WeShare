/**
 * TikTok URL parser and helper utilities for WeShare travel planning
 */

/**
 * Extracts a TikTok URL from any text or string (e.g. from notes)
 */
export function extractTikTokUrl(text?: string | null): string | null {
  if (!text) return null
  const match = text.match(/https?:\/\/(?:www\.|vt\.|vm\.|v\.)?tiktok\.com\/[^\s)]+/i)
  return match ? match[0] : null
}

/**
 * Extracts the numerical video ID from a standard TikTok video URL
 */
export function extractTikTokVideoId(url?: string | null): string | null {
  if (!url) return null
  const match = url.match(/(?:video\/|v\/|player\/v1\/)(\d+)/)
  return match ? match[1] : null
}

/**
 * Combines note description and a TikTok link into a single notes string
 */
export function combineNotesAndTikTok(notes?: string | null, tiktokUrl?: string | null): string {
  const cleanUrl = tiktokUrl?.trim() || ""
  const existingUrl = extractTikTokUrl(notes)
  let cleanNotes = notes || ""
  if (existingUrl) {
    cleanNotes = cleanNotes.replace(existingUrl, "").trim()
  }
  if (!cleanUrl) return cleanNotes
  return cleanNotes ? `${cleanUrl}\n${cleanNotes}` : cleanUrl
}

/**
 * Strips the TikTok URL from notes to display clean user notes
 */
export function getCleanNotesWithoutTikTok(notes?: string | null): string {
  if (!notes) return ""
  const url = extractTikTokUrl(notes)
  if (!url) return notes
  return notes.replace(url, "").trim()
}
