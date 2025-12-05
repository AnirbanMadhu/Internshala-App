/**
 * Utility helper functions
 */

/**
 * Format date to localized string
 */
export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString();
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
