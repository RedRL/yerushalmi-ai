/** Generates a client-side unique id for tracking uploads/list items before the server assigns one. */
export function generateClientId(prefix = 'id'): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}
