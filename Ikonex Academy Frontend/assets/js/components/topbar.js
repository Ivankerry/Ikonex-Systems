// topbar.js
// Renders topbar and handles breadcrumbs/mobile menu toggle.

/**
 * Render the topbar HTML and attach handlers
 */
export function renderTopbar() {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;

  topbar.innerHTML = `
    <div class="topbar__left">
      <button class="hamburger" id="hamburger-toggle" aria-label="Toggle Navigation Menu">☰</button>
      <h2 class="topbar__title" id="topbar-title">Dashboard</h2>
    </div>
    <div class="topbar__right">
      <div class="topbar__user">
        <span>Admin User</span>
        <div class="topbar__avatar">AD</div>
      </div>
    </div>
  `;

  // Attach mobile menu toggle logic
  const hamburger = document.getElementById('hamburger-toggle');
  const sidebar = document.getElementById('sidebar');

  if (hamburger && sidebar) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('sidebar--open');
    });

    // Close sidebar when clicking outside of it on mobile
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('sidebar--open') && !sidebar.contains(e.target) && e.target !== hamburger) {
        sidebar.classList.remove('sidebar--open');
      }
    });
  }
}

// Automatically render topbar when module loads
if (typeof document !== 'undefined') {
  renderTopbar();
}
