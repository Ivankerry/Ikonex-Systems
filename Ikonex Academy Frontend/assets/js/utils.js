// utils.js
// Pure utility functions shared across pages. No DOM manipulation, no API calls.

/**
 * Format a date string to DD/MM/YYYY
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'N/A';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Determine letter grade from a numeric score using the grading scale.
 * Scale: 70-100 = A, 60-69 = B, 50-59 = C, 40-49 = D, 0-39 = F
 * @param {number} score
 * @returns {{ letter: string, cssClass: string }}
 */
export function formatGrade(score) {
  const numScore = parseFloat(score);
  if (isNaN(numScore)) return { letter: 'N/A', cssClass: '' };
  
  if (numScore >= 70 && numScore <= 100) return { letter: 'A', cssClass: 'badge--success' };
  if (numScore >= 60 && numScore < 70)   return { letter: 'B', cssClass: 'badge--info' };
  if (numScore >= 50 && numScore < 60)   return { letter: 'C', cssClass: 'badge--warning' };
  if (numScore >= 40 && numScore < 50)   return { letter: 'D', cssClass: 'badge--warning' };
  return { letter: 'F', cssClass: 'badge--danger' };
}

/**
 * Ordinal suffix: 1 -> "1st", 2 -> "2nd", 3 -> "3rd"
 * @param {number} n
 * @returns {string}
 */
export function ordinal(n) {
  const num = parseInt(n);
  if (isNaN(num)) return '';
  const s = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} delay ms
 * @returns {Function}
 */
export function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * Truncate a string to maxLen characters with ellipsis.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(str, maxLen) {
  if (!str) return '';
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen) + '...';
}

/**
 * Capitalise first letter of each word.
 * @param {string} str
 * @returns {string}
 */
export function titleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
