
/**
 * Unified ID Generator Utility
 * Ensures all generated IDs have enough randomness to avoid React key collisions.
 */
export function generateUniqueId(prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

export function generateNumericId(): number {
  return Date.now() + Math.floor(Math.random() * 1000000);
}
