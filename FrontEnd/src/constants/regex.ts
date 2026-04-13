/**
 * Regex pattern for password validation
 * Requirements:
 * - At least 8 characters
 * - At least 1 special character (!@#$%^&*)
 * - At least 1 number (0-9)
 */
export const PASSWORD_REGEX = /^(?=.*[!@#$%^&*])(?=.*\d).{8,}$/

/**
 * Email validation regex
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
