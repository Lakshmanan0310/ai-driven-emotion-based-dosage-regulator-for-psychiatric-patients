/**
 * This utility file provides functions to fix text visibility issues when switching between light and dark themes
 */

/**
 * Applies theme-specific styles to input fields to ensure text remains visible in both light and dark modes
 * @param {string} selector - CSS selector for the input fields to update
 */
export function fixInputFieldVisibility() {
  // Get all input elements
  const inputFields = document.querySelectorAll('input[type="text"], input[type="password"], input[type="email"]');
  
  // Get the current theme from localStorage
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  // Apply appropriate styles based on the theme
  inputFields.forEach(input => {
    if (currentTheme === 'dark') {
      input.style.backgroundColor = '#374151'; // dark gray background
      input.style.color = '#f3f4f6'; // light text
      input.style.borderColor = '#4b5563'; // darker border
    } else {
      input.style.backgroundColor = '#ffffff'; // white background
      input.style.color = '#1f2937'; // dark text
      input.style.borderColor = '#e5e7eb'; // light border
    }
  });
}

/**
 * Applies theme-specific styles to card elements to ensure text remains visible in both light and dark modes
 */
export function fixCardVisibility() {
  // Get all card elements (assuming they have a common class or attribute)
  const cards = document.querySelectorAll('.card, [data-theme-card]');
  
  // Get the current theme from localStorage
  const currentTheme = localStorage.getItem('theme') || 'light';
  
  // Apply appropriate styles based on the theme
  cards.forEach(card => {
    if (currentTheme === 'dark') {
      card.style.backgroundColor = '#1f2937'; // dark background
    } else {
      card.style.backgroundColor = '#ffffff'; // white background
    }
  });
}

/**
 * Main function to fix all theme visibility issues
 * Call this function whenever the theme changes
 */
export function fixThemeVisibility() {
  fixInputFieldVisibility();
  fixCardVisibility();
}
