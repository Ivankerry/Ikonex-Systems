// sidebar.js
// Renders sidebar HTML and handles active link states.

/**
 * Render the sidebar HTML into the sidebar element.
 */
export function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar__logo">
      <span></span>
      <span>Ikonex Academy</span>
    </div>
    <ul class="sidebar__nav">
      <li class="sidebar__nav-item" data-path="/" data-link>
        <span></span> Dashboard
      </li>
      <li class="sidebar__nav-item" data-path="/streams" data-link>
        <span></span> Class Streams
      </li>
      <li class="sidebar__nav-item" data-path="/students" data-link>
        <span></span> Students
      </li>
      <li class="sidebar__nav-item" data-path="/subjects" data-link>
        <span></span> Subjects
      </li>
      <li class="sidebar__nav-item" data-path="/scores" data-link>
        <span></span> Scores
      </li>
      <li class="sidebar__nav-item" data-path="/results" data-link>
        <span></span> Results
      </li>
    </ul>
    <div style="padding: 20px; font-size: 0.75rem; color: rgba(255,255,255,0.4); text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.06);">
      © 2026 Admin Panel
    </div>
  `;
}

// Automatically render sidebar when this module is loaded
if (typeof document !== 'undefined') {
  renderSidebar();
}
