// router.js
// Handles client-side navigation between pages.
// Each route maps a path to: an HTML partial URL + an init function from the pages/ folder.

import { initDashboard } from './pages/dashboard.js';
import { initStreams }   from './pages/streams.js';
import { initStudents }  from './pages/students.js';
import { initSubjects }  from './pages/subjects.js';
import { initScores }    from './pages/scores.js';
import { initResults }   from './pages/results.js';

const routes = {
  '/':          { partial: '/pages/dashboard.html', init: initDashboard, title: 'Dashboard' },
  '/streams':   { partial: '/pages/streams.html',   init: initStreams,   title: 'Class Streams' },
  '/students':  { partial: '/pages/students.html',  init: initStudents,  title: 'Students' },
  '/subjects':  { partial: '/pages/subjects.html',  init: initSubjects,  title: 'Subjects' },
  '/scores':    { partial: '/pages/scores.html',    init: initScores,    title: 'Scores' },
  '/results':   { partial: '/pages/results.html',   init: initResults,   title: 'Results' },
};

/**
 * Navigate to a specific path in the SPA
 * @param {string} path
 * @param {boolean} pushState Whether to push state to history
 */
export async function navigate(path, pushState = true) {
  const route = routes[path] || routes['/'];
  const pageContent = document.getElementById('page-content');
  
  if (!pageContent) return;
  
  // Show loading skeleton states or spinner
  pageContent.innerHTML = `
    <div class="skeleton-container" style="display: flex; flex-direction: column; gap: 20px;">
      <div class="skeleton skeleton-title"></div>
      <div class="stats-grid">
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
      </div>
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
    </div>
  `;

  try {
    const res = await fetch(route.partial);
    if (!res.ok) throw new Error(`Failed to load page: ${res.statusText}`);
    const html = await res.text();
    
    // Inject HTML
    pageContent.innerHTML = html;
    
    // Update active sidebar item
    updateActiveSidebar(path);

    // Update Topbar Title and Breadcrumb
    const topbarTitle = document.getElementById('topbar-title');
    if (topbarTitle) {
      topbarTitle.textContent = route.title;
    }
    
    // Call page initializer
    await route.init();
    
    // Push state
    if (pushState) {
      window.history.pushState({ path }, '', path);
    }
    
    // Close sidebar on mobile after navigation
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.remove('sidebar--open');
    }
  } catch (err) {
    console.error(`Navigation error: ${err.message}`);
    pageContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <div class="empty-state__text">Failed to load content: ${err.message}</div>
        <button class="btn btn--primary" id="retry-nav-btn">Retry</button>
      </div>
    `;
    document.getElementById('retry-nav-btn')?.addEventListener('click', () => navigate(path, false));
  }
}

/**
 * Highlight active nav item in sidebar
 * @param {string} path 
 */
function updateActiveSidebar(path) {
  const navItems = document.querySelectorAll('.sidebar__nav-item');
  navItems.forEach(item => {
    const itemPath = item.getAttribute('data-path');
    if (itemPath === path || (path === '/' && itemPath === '/')) {
      item.classList.add('sidebar__nav-item--active');
    } else {
      item.classList.remove('sidebar__nav-item--active');
    }
  });
}

/**
 * Initialize the SPA router and handle popstate and link hijacking
 */
export function initRouter() {
  // Intercept nav clicks
  document.body.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if (link) {
      e.preventDefault();
      const path = link.getAttribute('data-path') || link.getAttribute('href');
      navigate(path);
    }
  });

  // Handle back/forward button clicks
  window.addEventListener('popstate', e => {
    const path = e.state?.path || window.location.pathname;
    navigate(path, false);
  });

  // Navigate to current path on load
  const initialPath = window.location.pathname;
  navigate(initialPath, false);
}

// Automatically initialize router when DOM loads (if inside browser environment)
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initRouter);
}
