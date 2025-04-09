// app/utils/validation.js

/**
 * Validate the password against specific criteria.
 * @param {string} password - The password to validate.
 * @return {boolean} - Returns true if valid, otherwise false.
 */
function validatePassword(password) {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password); // <-- New requirement
  const minLength = 8;

  // Password must be at least 8 characters long.
  if (password.length < minLength) {
    return false;
  }

  // Password must include uppercase, lowercase letters, numbers, and special characters.
  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    return false;
  }

  return true; // Valid password
}

module.exports = {
  validatePassword,
};
