/**
 * Universal & robust copy to clipboard helper function.
 * Handles modern navigator.clipboard API with fallback to document.execCommand('copy').
 * Works seamlessly across HTTP, HTTPS, desktop, and mobile devices.
 * 
 * @param {string} text - The text string to copy to clipboard
 * @returns {Promise<boolean>} - Resolves to true if successfully copied, false otherwise
 */
export async function copyToClipboard(text) {
  if (!text || typeof text !== 'string') return false;
  const cleanText = text.trim();
  if (!cleanText) return false;

  let copySuccess = false;

  // 1. Try Modern Navigator Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(cleanText);
      copySuccess = true;
    } catch (err) {
      console.warn('navigator.clipboard.writeText threw error/rejected, falling back to document.execCommand', err);
    }
  }

  // 2. Fallback: Hidden Textarea + document.execCommand('copy')
  if (!copySuccess && typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = cleanText;

      // Prevent zooming or scroll shifts on mobile devices
      textArea.style.position = 'fixed';
      textArea.style.top = '-9999px';
      textArea.style.left = '-9999px';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');

      document.body.appendChild(textArea);

      // Focus & Select content
      textArea.focus();
      textArea.select();

      // Extra selection for iOS Safari compatibility
      if (textArea.setSelectionRange) {
        textArea.setSelectionRange(0, 99999);
      }

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        copySuccess = true;
      }
    } catch (err) {
      console.error('Fallback document.execCommand copy failed:', err);
    }
  }

  return copySuccess;
}
