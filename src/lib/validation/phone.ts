/**
 * Kenyan Mobile & M-Pesa Phone Validation Utility
 *
 * Valid mobile formats in Kenya:
 * - 07XXXXXXXX (10 digits)
 * - 01XXXXXXXX (10 digits)
 * - +2547XXXXXXXX or +2541XXXXXXXX (13 chars)
 * - 2547XXXXXXXX or 2541XXXXXXXX (12 digits)
 * - 7XXXXXXXX or 1XXXXXXXX (9 digits)
 */

export interface PhoneValidationResult {
  isValid: boolean
  normalized: string     // Canonical 10-digit '07XXXXXXXX' or '01XXXXXXXX'
  mpesaFormatted: string // 12-digit international '254XXXXXXXXX'
  formatted: string      // Human spaced '0712 345 678'
  error?: string
}

export function validateKenyanPhone(raw: string): PhoneValidationResult {
  if (!raw || !raw.trim()) {
    return {
      isValid: false,
      normalized: '',
      mpesaFormatted: '',
      formatted: '',
      error: 'M-Pesa phone number is required.',
    }
  }

  // Strip whitespaces, dashes, dots, brackets
  let clean = raw.trim().replace(/[\s\-\.\(\)]/g, '')

  // Strip leading '+'
  if (clean.startsWith('+')) {
    clean = clean.slice(1)
  }

  // Check for non-digit characters
  if (!/^\d+$/.test(clean)) {
    return {
      isValid: false,
      normalized: '',
      mpesaFormatted: '',
      formatted: clean,
      error: 'Phone number must contain digits only.',
    }
  }

  // Case 1: Starts with 254 (international Kenyan prefix)
  if (clean.startsWith('254')) {
    if (clean.length < 12) {
      return {
        isValid: false,
        normalized: '',
        mpesaFormatted: '',
        formatted: clean,
        error: `Incomplete phone number (${clean.length}/12 digits). E.g. 254712345678`,
      }
    }
    if (clean.length > 12) {
      return {
        isValid: false,
        normalized: '',
        mpesaFormatted: '',
        formatted: clean,
        error: `Phone number is too long (${clean.length} digits). Max 12 digits.`,
      }
    }
    const thirdDigit = clean.charAt(3)
    if (thirdDigit !== '7' && thirdDigit !== '1') {
      return {
        isValid: false,
        normalized: '',
        mpesaFormatted: '',
        formatted: clean,
        error: 'Kenyan mobile numbers must start with 2547 or 2541.',
      }
    }
    const normalized = '0' + clean.slice(3)
    return {
      isValid: true,
      normalized,
      mpesaFormatted: clean,
      formatted: formatPhoneSpacing(normalized),
    }
  }

  // Case 2: Starts with 0 (standard national format)
  if (clean.startsWith('0')) {
    if (clean.length < 10) {
      return {
        isValid: false,
        normalized: '',
        mpesaFormatted: '',
        formatted: clean,
        error: `Incomplete phone number (${clean.length}/10 digits). E.g. 0712345678`,
      }
    }
    if (clean.length > 10) {
      return {
        isValid: false,
        normalized: '',
        mpesaFormatted: '',
        formatted: clean,
        error: `Phone number is too long (${clean.length} digits). Expected 10 digits.`,
      }
    }
    const prefix = clean.slice(0, 2)
    if (prefix !== '07' && prefix !== '01') {
      return {
        isValid: false,
        normalized: '',
        mpesaFormatted: '',
        formatted: clean,
        error: 'Mobile prefix must start with 07 or 01 (Safaricom / Airtel / Telkom).',
      }
    }
    return {
      isValid: true,
      normalized: clean,
      mpesaFormatted: '254' + clean.slice(1),
      formatted: formatPhoneSpacing(clean),
    }
  }

  // Case 3: Starts with 7 or 1 (omitted leading 0)
  if (clean.startsWith('7') || clean.startsWith('1')) {
    if (clean.length === 9) {
      const normalized = '0' + clean
      return {
        isValid: true,
        normalized,
        mpesaFormatted: '254' + clean,
        formatted: formatPhoneSpacing(normalized),
      }
    }
    if (clean.length < 9) {
      return {
        isValid: false,
        normalized: '',
        mpesaFormatted: '',
        formatted: clean,
        error: `Incomplete phone number (${clean.length}/9 digits). E.g. 0712345678`,
      }
    }
    return {
      isValid: false,
      normalized: '',
      mpesaFormatted: '',
      formatted: clean,
      error: `Invalid phone length (${clean.length} digits). Expected 10 digits (07xx xxx xxx).`,
    }
  }

  return {
    isValid: false,
    normalized: '',
    mpesaFormatted: '',
    formatted: clean,
    error: 'Invalid phone number. Must be a Kenyan mobile number starting with 07 or 01.',
  }
}

/**
 * Spaced format: '0712 345 678'
 */
export function formatPhoneSpacing(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length <= 4) return digits
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`
}
