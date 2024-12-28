/**
 * generateUniqueId: Utility function to generate a unique ID for each timer instance
 * @returns
 */
export default function generateUniqueId(): string {
  return `timer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
