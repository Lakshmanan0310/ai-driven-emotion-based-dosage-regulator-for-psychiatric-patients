// themeUtils.js
// Utility functions to apply consistent theming across the application

/**
 * Applies theme styles to input fields to ensure text visibility in both light and dark modes
 * @param {Object} theme - The current theme object from ThemeContext
 * @returns {string} - CSS classes for the input field
 */
export const getThemedInputClasses = (theme) => {
  return `${theme.inputBg} ${theme.inputText} border ${theme.border}`;
};

/**
 * Applies theme styles to select fields to ensure text visibility in both light and dark modes
 * @param {Object} theme - The current theme object from ThemeContext
 * @returns {string} - CSS classes for the select field
 */
export const getThemedSelectClasses = (theme) => {
  return `${theme.selectBg} ${theme.selectText} border ${theme.border}`;
};

/**
 * Applies theme styles to card elements
 * @param {Object} theme - The current theme object from ThemeContext
 * @returns {string} - CSS classes for card elements
 */
export const getThemedCardClasses = (theme) => {
  return `${theme.cardBg} ${theme.shadow}`;
};
