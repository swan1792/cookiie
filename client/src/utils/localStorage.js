/**
 * Save state to localStorage
 */
export function saveState(key, value) {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

/**
 * Load state from localStorage
 */
export function loadState(key) {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) return null;
    try {
      return JSON.parse(serialized);
    } catch {
      return serialized;
    }
  } catch (err) {
    console.error('Error loading from localStorage:', err);
    return null;
  }
}

/**
 * Remove state from localStorage
 */
export function removeState(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Error removing from localStorage:', err);
  }
}
