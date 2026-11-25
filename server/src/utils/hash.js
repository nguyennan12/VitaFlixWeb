import crypto from 'crypto';

/**
 * Hash a string using SHA-256 (hex)
 */
export function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
