/**
 * Utility helper functions
 */

/**
 * Format date to localized string
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

module.exports = {
  formatDate,
  isValidEmail,
};
