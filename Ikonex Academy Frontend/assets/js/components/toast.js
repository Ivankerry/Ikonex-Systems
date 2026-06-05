// toast.js
// Toast notification system.

/**
 * Show a toast notification on the screen
 * @param {string} message 
 * @param {'success'|'error'|'info'} type 
 * @param {number} duration 
 */
export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  
  // Set content and close button
  toast.innerHTML = `
    <span>${message}</span>
    <button style="background:none; border:none; color:white; font-size:1.1rem; cursor:pointer; margin-left:12px; line-height:1;">&times;</button>
  `;

  // Close toast on click of close button
  const closeBtn = toast.querySelector('button');
  closeBtn.addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.animation = 'slideOut 200ms ease forwards';
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }
  }, duration);
}

// Add CSS animation keyframe for slideOut if not in CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(40px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}
