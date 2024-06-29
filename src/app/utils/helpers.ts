'use server'

/**
 * Formats bytes to a human-readable string
 * @param bytes Number of bytes
 * @param decimals Number of decimal places to show
 * @returns Formatted string (e.g., "1.5 MB")
 */
export async function formatBytes(
  bytes: number,
  decimals = 2
): Promise<string> {
  try {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  } catch (error) {
    console.error('Error in formatBytes:', error)
    throw error
  }
}

/**
 * Formats a timestamp to a readable date string
 * @param timestamp Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export async function formatDate(timestamp: number): Promise<string> {
  try {
    return new Date(timestamp).toLocaleString()
  } catch (error) {
    console.error('Error in formatDate:', error)
    throw error
  }
}

/**
 * Calculates the percentage change between two numbers
 * @param oldValue The original value
 * @param newValue The new value
 * @returns Percentage change as a string with % symbol
 */
export async function calculatePercentageChange(
  oldValue: number,
  newValue: number
): Promise<string> {
  try {
    const change = ((newValue - oldValue) / oldValue) * 100
    return change.toFixed(2) + '%'
  } catch (error) {
    console.error('Error in calculatePercentageChange:', error)
    throw error
  }
}

/**
 * Truncates a string to a specified length
 * @param str The string to truncate
 * @param maxLength The maximum length of the string
 * @returns Truncated string with ellipsis if necessary
 */
export async function truncateString(
  str: string,
  maxLength: number
): Promise<string> {
  try {
    if (str.length <= maxLength) return str
    return str.slice(0, maxLength - 3) + '...'
  } catch (error) {
    console.error('Error in truncateString:', error)
    throw error
  }
}
