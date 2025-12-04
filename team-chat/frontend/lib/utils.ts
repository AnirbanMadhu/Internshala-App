/**
 * Utility functions for the application
 */

/**
 * Format date/time to HH:MM format
 */
export const formatMessageTime = (date: Date | string) => {
  const d = new Date(date);
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Truncate long text with ellipsis
 */
export const truncate = (str: string, length: number) => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};
