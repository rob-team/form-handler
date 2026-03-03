import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert ISO 3166-1 alpha-2 country code to flag emoji.
 * Returns empty string for invalid codes.
 * @example countryCodeToFlag("US") => "🇺🇸"
 * @example countryCodeToFlag("CN") => "🇨🇳"
 */
export function countryCodeToFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return ""
  const code = countryCode.toUpperCase()
  // Regional indicator symbols start at 0x1F1E6 (🇦)
  const base = 0x1f1e6 - 65 // 'A' is 65
  const char1 = String.fromCodePoint(base + code.charCodeAt(0))
  const char2 = String.fromCodePoint(base + code.charCodeAt(1))
  return char1 + char2
}
