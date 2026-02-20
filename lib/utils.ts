import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function encryptToken(token: string): string {
  // In production, use proper encryption (e.g., AWS KMS)
  // This is a placeholder for development
  return Buffer.from(token).toString('base64')
}

export function decryptToken(encryptedToken: string): string {
  // In production, use proper decryption
  // This is a placeholder for development
  return Buffer.from(encryptedToken, 'base64').toString()
}
