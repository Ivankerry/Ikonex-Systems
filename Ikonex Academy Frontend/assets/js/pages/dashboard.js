// dashboard.js
// Dashboard page logic: summary stats and overview.

import { getDashboardStats } from '../api.js';
import { showToast } from '../components/toast.js';

/**
 * Initialize dashboard: fetches stats and renders them
 */
export async function initDashboard() {
  const statsGrid = document.getElementById('stats-grid');
  const performersContainer = document.getElementById('top-performers-container');

  try {
    const response = await getDashboardStats();
    if (!response.success) throw new Error(response.message || 'Failed to fetch stats');

    const stats = response.data;

    // 1. Render Stats Grid
    if (statsGrid) {
      statsGrid.innerHTML = `
        <div class="stat-card stat-card--students">
          <div class="stat-card__icon"></div>
          <div class="stat-card__info">
            <div class="stat-card__value">${stats.total_students}</div>
            <div class="stat-card__label">Total Students</div>
          </div>
        </div>
        <div class="stat-card stat-card--streams">
          <div class="stat-card__icon"></div>
          <div class="stat-card__info">
            <div class="stat-card__value">${stats.total_streams}</div>
            <div class="stat-card__label">Total Streams</div>
          </div>
        </div>
        <div class="stat-card stat-card--subjects">
          <div class="stat-card__icon"></div>
          <div class="stat-card__info">
            <div class="stat-card__value">${stats.total_subjects}</div>
            <div class="stat-card__label">Total Subjects</div>
          </div>
        </div>
        <div class="stat-card stat-card--avg-score">
          <div class="stat-card__icon"></div>
          <div class="stat-card__info">
            <div class="stat-card__value">${stats.average_score.toFixed(1)}%</div>
            <div class="stat-card__label">Average Score</div>
          </div>
        </div>
      `;
    }

    // 2. Render Top Performers
    if (performersContainer) {
      const topStudents = stats.top_students || [];
      if (topStudents.length === 0) {
        performersContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state__icon"></div>
            <div class="empty-state__text">No results recorded yet. Please register scores first.</div>
          </div>
        `;
        return;
      }

      let tableHTML = `
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Stream</th>
                <th>Average Score</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
      `;

      topStudents.forEach((student, index) => {
        let badgeClass = 'badge--info';
        if (student.grade === 'A') badgeClass = 'badge--success';
        else if (student.grade === 'B') badgeClass = 'badge--info';
        else if (student.grade === 'C' || student.grade === 'D') badgeClass = 'badge--warning';
        else if (student.grade === 'F') badgeClass = 'badge--danger';

        tableHTML += `
          <tr>
            <td><strong>#${index + 1}</strong></td>
            <td>${student.name}</td>
            <td>${student.stream}</td>
            <td>${student.average.toFixed(2)}%</td>
            <td><span class="badge ${badgeClass}">${student.grade}</span></td>
          </tr>
        `;
      });

      tableHTML += `
            </tbody>
          </table>
        </div>
      `;
      performersContainer.innerHTML = tableHTML;
    }

  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
    
    if (statsGrid) {
      statsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state__text">Failed to load statistics dashboard.</div>
        </div>
      `;
    }
  }
}
