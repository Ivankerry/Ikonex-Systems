// streams.js
// Class stream management: list, create, edit, delete, view detail.

import { getStreams, createStream, updateStream, deleteStream, getSubjectsByStream, getStudentsByStream } from '../api.js';
import { openModal, openConfirmDialog, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

let allStreams = [];

/**
 * Initialize streams page: load and display streams list
 */
export async function initStreams() {
  const container = document.getElementById('streams-table-container');
  const addBtn = document.getElementById('add-stream-btn');

  if (addBtn) {
    // Unbind and rebind click listener to prevent multiples
    addBtn.onclick = () => {
      openModal('Add Stream', buildStreamForm(), handleSaveStream);
    };
  }

  await loadStreams();
}

/**
 * Fetch streams from API and render the table
 */
async function loadStreams() {
  const container = document.getElementById('streams-table-container');
  if (!container) return;

  container.innerHTML = `
    <div class="skeleton-container" style="display: flex; flex-direction: column; gap: 10px;">
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
    </div>
  `;

  try {
    const res = await getStreams();
    if (!res.success) throw new Error(res.message);
    allStreams = res.data;
    renderStreamsTable(allStreams);
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon"></div>
        <div class="empty-state__text">Failed to load class streams: ${err.message}</div>
      </div>
    `;
  }
}

/**
 * Render class streams list in a table
 * @param {Array} streams 
 */
function renderStreamsTable(streams) {
  const container = document.getElementById('streams-table-container');
  if (!container) return;

  if (streams.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon"></div>
        <div class="empty-state__text">No class streams found. Add one to get started!</div>
      </div>
    `;
    return;
  }

  let html = `
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Stream Name</th>
            <th>Academic Year</th>
            <th>Students Count</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  streams.forEach(stream => {
    html += `
      <tr style="cursor: pointer;" data-id="${stream.id}" class="stream-row">
        <td><strong>${stream.name}</strong></td>
        <td>${stream.year}</td>
        <td><span class="badge badge--info">${stream.student_count || 0} students</span></td>
        <td class="actions-cell">
          <button class="btn btn--secondary btn--sm edit-btn" data-id="${stream.id}">Edit</button>
          <button class="btn btn--danger btn--sm delete-btn" data-id="${stream.id}">Delete</button>
        </td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;

  // Bind Actions
  container.querySelectorAll('.stream-row').forEach(row => {
    row.addEventListener('click', (e) => {
      // Don't trigger if clicked on actions or buttons
      if (e.target.closest('.actions-cell') || e.target.closest('button')) return;
      const streamId = Number(row.getAttribute('data-id'));
      viewStreamDetail(streamId);
    });
  });

  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.getAttribute('data-id'));
      const stream = allStreams.find(s => s.id === id);
      if (stream) {
        openModal('Edit Stream', buildStreamForm(stream), () => handleSaveStream(id));
      }
    });
  });

  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.getAttribute('data-id'));
      const stream = allStreams.find(s => s.id === id);
      if (stream) {
        openConfirmDialog(`Are you sure you want to delete stream "${stream.name}"? All associated student records and scores will be deleted.`, () => handleDeleteStream(id));
      }
    });
  });
}

/**
 * Build stream modal form
 * @param {object} existing 
 * @returns {string} HTML string
 */
function buildStreamForm(existing = null) {
  return `
    <form id="stream-form" onsubmit="event.preventDefault();">
      <div class="form-group">
        <label class="form-label" for="stream-name">Stream Name</label>
        <input class="form-input" type="text" id="stream-name" value="${existing ? existing.name : ''}" placeholder="e.g. Form 1A" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="stream-year">Academic Year</label>
        <input class="form-input" type="number" id="stream-year" value="${existing ? existing.year : new Date().getFullYear()}" placeholder="e.g. 2026" required />
      </div>
    </form>
  `;
}

/**
 * Handle save stream action (Add/Edit)
 * @param {number|null} id 
 */
async function handleSaveStream(id = null) {
  const nameEl = document.getElementById('stream-name');
  const yearEl = document.getElementById('stream-year');
  if (!nameEl || !yearEl) return;

  const yearVal = yearEl.value.trim();
  const yearRegex = /^\d{4}$/;
  if (!yearRegex.test(yearVal)) {
    showToast('Academic Year must be a 4-digit number', 'error');
    throw new Error('Academic Year must be a 4-digit number');
  }

  const data = {
    name: nameEl.value,
    year: Number(yearVal)
  };

  const err = validateStreamForm(data);
  if (err) {
    showToast(err, 'error');
    throw new Error(err);
  }

  try {
    let res;
    if (id) {
      res = await updateStream(id, data);
      showToast('Stream updated successfully', 'success');
    } else {
      res = await createStream(data);
      showToast('Stream created successfully', 'success');
    }
    if (!res.success) throw new Error(res.message);
    await loadStreams();
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
}

/**
 * Handle delete stream action
 * @param {number} id 
 */
async function handleDeleteStream(id) {
  try {
    const res = await deleteStream(id);
    if (!res.success) throw new Error(res.message);
    showToast('Stream deleted successfully', 'success');
    await loadStreams();
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
}

/**
 * Validate stream form input
 * @param {object} data 
 * @returns {string|null} Error message or null
 */
function validateStreamForm(data) {
  if (!data.name || data.name.trim().length < 2)
    return 'Stream name is required and must be at least 2 characters';
  if (!data.year || isNaN(data.year) || data.year < 2000 || data.year > 2100)
    return 'A valid academic year is required (2000 - 2100)';
  return null;
}

/**
 * Open detail view modal showing subjects and students in a stream
 * @param {number} id 
 */
async function viewStreamDetail(id) {
  const stream = allStreams.find(s => s.id === id);
  if (!stream) return;

  openModal(`${stream.name} Details`, `
    <div style="min-height: 250px; display: flex; align-items: center; justify-content: center;">
      <p class="skeleton-text skeleton"></p>
    </div>
  `, () => {});

  // Remove save button from modal footer for readonly detail views
  const confirmBtn = document.getElementById('modal-confirm');
  if (confirmBtn) confirmBtn.style.display = 'none';

  try {
    const [subjectsRes, studentsRes] = await Promise.all([
      getSubjectsByStream(id),
      getStudentsByStream(id)
    ]);

    const subjects = subjectsRes.success ? subjectsRes.data : [];
    const students = studentsRes.success ? studentsRes.data : [];

    let subjectsHTML = subjects.map(s => `<li>${s.name} (${s.code})</li>`).join('');
    if (subjects.length === 0) subjectsHTML = '<li style="color: var(--color-text-muted);">No subjects assigned yet.</li>';

    let studentsHTML = students.map(s => `<li>${s.first_name} ${s.last_name} (${s.admission_number})</li>`).join('');
    if (students.length === 0) studentsHTML = '<li style="color: var(--color-text-muted);">No students registered in this stream.</li>';

    const bodyEl = document.getElementById('modal-body');
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div class="grid-split">
          <div>
            <h4 style="margin-bottom: 12px; border-bottom: 1px solid var(--color-border); padding-bottom: 6px;">Subjects Assigned</h4>
            <ul style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto;">
              ${subjectsHTML}
            </ul>
          </div>
          <div>
            <h4 style="margin-bottom: 12px; border-bottom: 1px solid var(--color-border); padding-bottom: 6px;">Students Registered</h4>
            <ul style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto;">
              ${studentsHTML}
            </ul>
          </div>
        </div>
      `;
    }
  } catch (err) {
    const bodyEl = document.getElementById('modal-body');
    if (bodyEl) bodyEl.innerHTML = `<p style="color: var(--color-danger);">Failed to load stream details: ${err.message}</p>`;
  }
}
