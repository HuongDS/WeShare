/**
 * Extracts the Google Drive file ID from common Google Drive sharing URLs:
 * - https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
 * - https://drive.google.com/open?id={FILE_ID}
 * - https://drive.google.com/uc?id={FILE_ID}&export=view
 * - https://drive.google.com/thumbnail?id={FILE_ID}&sz=w2000
 */
export function extractDriveFileId(input?: string | null): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (!trimmed) return null

  const filePathMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/)
  if (filePathMatch?.[1]) {
    return filePathMatch[1]
  }

  const queryIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/)
  if (queryIdMatch?.[1]) {
    return queryIdMatch[1]
  }

  return null
}

/**
 * Converts a Google Drive sharing link into a direct embeddable image URL,
 * or returns the original URL if it is already a direct/data URL.
 */
export function normalizeDriveImageUrl(input?: string | null): string {
  if (!input) return ""
  const trimmed = input.trim()
  const fileId = extractDriveFileId(trimmed)
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`
  }
  return trimmed
}

/**
 * Returns a Google Drive web viewer link if the URL points to a Drive file,
 * otherwise returns the original URL.
 */
export function getDriveViewerUrl(input?: string | null): string {
  if (!input) return ""
  const fileId = extractDriveFileId(input)
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/view`
  }
  return input.trim()
}
