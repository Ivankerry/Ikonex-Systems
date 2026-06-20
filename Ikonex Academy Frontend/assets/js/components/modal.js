// modal.js
// Generic modal manager. Controls open/close/confirm dialogs.

let currentOnConfirm = null;

/**
 * Open the modal with custom title, body HTML, and confirm callback
 * @param {string} title 
 * @param {string} bodyHTML 
 * @param {Function} onConfirm 
 */
export function openModal(title, bodyHTML, onConfirm) {
  const overlay = document.getElementById('modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  const confirmBtn = document.getElementById('modal-confirm');

  if (!overlay || !titleEl || !bodyEl || !confirmBtn) return;

  titleEl.textContent = title;
  bodyEl.innerHTML = bodyHTML;
  
  // Handle form submission via Enter key
  const form = bodyEl.querySelector('form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      confirmBtn.click();
    });
  }
  
  // Set up confirm action
  currentOnConfirm = onConfirm;
  confirmBtn.textContent = 'Save';
  confirmBtn.className = 'btn btn--primary';
  confirmBtn.style.display = ''; // Reset display in case it was hidden by detail views

  overlay.classList.add('is-open');
}

/**
 * Close the open modal
 */
export function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  const bodyEl = document.getElementById('modal-body');
  
  if (!overlay) return;
  
  overlay.classList.remove('is-open');
  if (bodyEl) bodyEl.innerHTML = '';
  currentOnConfirm = null;
}

/**
 * Open a confirmation dialog (e.g. for deleting elements)
 * @param {string} message 
 * @param {Function} onConfirm 
 */
export function openConfirmDialog(message, onConfirm) {
  const overlay = document.getElementById('modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  const confirmBtn = document.getElementById('modal-confirm');

  if (!overlay || !titleEl || !bodyEl || !confirmBtn) return;

  titleEl.textContent = 'Confirm Action';
  bodyEl.innerHTML = `<p style="font-size: 0.95rem; color: var(--color-text);">${message}</p>`;

  currentOnConfirm = onConfirm;
  confirmBtn.textContent = 'Confirm';
  confirmBtn.className = 'btn btn--danger';
  confirmBtn.style.display = ''; // Reset display

  overlay.classList.add('is-open');
}

// Bind close events on load (only once in browser)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        if (currentOnConfirm) {
          // Trigger browser HTML5 input validations first if a form exists
          const bodyEl = document.getElementById('modal-body');
          if (bodyEl) {
            const form = bodyEl.querySelector('form');
            if (form && typeof form.reportValidity === 'function') {
              if (!form.reportValidity()) {
                return; // Stop execution if form validation failed
              }
            }
          }

          const originalText = confirmBtn.textContent;
          try {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Loading...';
            await currentOnConfirm();
            closeModal();
          } catch (err) {
            console.error(err);
          } finally {
            confirmBtn.disabled = false;
            confirmBtn.textContent = originalText;
          }
        }
      });
    }

    // Close modal when clicking overlay itself (not the modal box)
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeModal();
        }
      });
    }
  });
}
