// subjects.js
// Subject management and stream assignment.

import { getSubjects, createSubject, updateSubject, deleteSubject, assignSubjectToStream, getStreams, getSubjectsByStream } from '../api.js';
import { openModal, openConfirmDialog, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

let allSubjects = [];
let allStreams = [];

/**
 * Initialize subjects page: load subjects, streams filter dropdown, and bind add action.
 */
export async function initSubjects() {
  const addBtn = document.getElementById('add-subject-btn');
  const streamFilter = document.getElementById('subject-stream-filter');

  // Load streams for the filter dropdown
  try {
    const streamsRes = await getStreams();
    allStreams = streamsRes.success ? streamsRes.data : [];

    if (streamFilter) {
      streamFilter.innerHTML = '<option value="">All Streams</option>';
      allStreams.forEach(s => {
        streamFilter.innerHTML += `<option value="${s.id}">${s.name}</option>`;
      });
      streamFilter.onchange = handleStreamFilterChange;
    }
  } catch (err) {
    console.error('Failed to load streams for filter:', err);
  }

  // Load and display subjects list
  await loadSubjects();

  // Bind Add Button
  if (addBtn) {
    addBtn.onclick = () => {
      openModal('Add Subject', buildSubjectForm(), handleSaveSubject);
    };
  }
}

/**
 * Fetch subjects list from API and display it
 * @param {number|null} streamId Filter subjects by stream
 */
async function loadSubjects(streamId = null) {
  const container = document.getElementById('subjects-table-container');
  if (!container) return;

  container.innerHTML = `
    <div class="skeleton-container" style="display: flex; flex-direction: column; gap: 10px;">
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
    </div>
  `;

  try {
    let res;
    if (streamId) {
      res = await getSubjectsByStream(streamId);
    } else {
      res = await getSubjects();
    }

    if (!res.success) throw new Error(res.message);
    allSubjects = res.data;
    renderSubjectsTable(allSubjects);
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon"></div>
        <div class="empty-state__text">Failed to load subjects: ${err.message}</div>
      </div>
    `;
  }
}

/**
 * Render subjects table
 * @param {Array} subjects 
 */
function renderSubjectsTable(subjects) {
  const container = document.getElementById('subjects-table-container');
  if (!container) return;

  if (subjects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon"></div>
        <div class="empty-state__text">No subjects found. Add a subject to get started.</div>
      </div>
    `;
    return;
  }

  let html = `
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Subject Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  subjects.forEach(subject => {
    html += `
      <tr>
        <td><strong>${subject.code}</strong></td>
        <td>${subject.name}</td>
        <td><span style="color:var(--color-text-muted); font-size:0.825rem;">${subject.description || 'No description'}</span></td>
        <td class="actions-cell">
          <button class="btn btn--secondary btn--sm edit-btn" data-id="${subject.id}">Edit</button>
          <button class="btn btn--secondary btn--sm assign-btn" data-id="${subject.id}">Assign Class</button>
          <button class="btn btn--danger btn--sm delete-btn" data-id="${subject.id}">Delete</button>
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

  // Bind edit action
  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      const subject = allSubjects.find(s => s.id === id);
      if (subject) {
        openModal('Edit Subject', buildSubjectForm(subject), () => handleSaveSubject(id));
      }
    });
  });

  // Bind assign action
  container.querySelectorAll('.assign-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      const subject = allSubjects.find(s => s.id === id);
      if (subject) {
        openAssignModal(subject);
      }
    });
  });

  // Bind delete action
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      const subject = allSubjects.find(s => s.id === id);
      if (subject) {
        openConfirmDialog(`Are you sure you want to delete subject "${subject.name}"? This will delete all associated grades.`, () => handleDeleteSubject(id));
      }
    });
  });
}

/**
 * Handle filtering when stream dropdown changes
 */
function handleStreamFilterChange(e) {
  const streamId = e.target.value;
  if (streamId) {
    loadSubjects(Number(streamId));
  } else {
    loadSubjects();
  }
}

/**
 * Build subject modal form
 * @param {object} existing 
 * @returns {string} HTML string
 */
function buildSubjectForm(existing = null) {
  return `
    <form id="subject-form" onsubmit="event.preventDefault();">
      <div class="form-group">
        <label class="form-label" for="subject-code">Subject Code</label>
        <input class="form-input" type="text" id="subject-code" value="${existing ? existing.code : ''}" placeholder="e.g. MATH01" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="subject-name">Subject Name</label>
        <input class="form-input" type="text" id="subject-name" value="${existing ? existing.name : ''}" placeholder="e.g. Mathematics" required />
      </div>
      <div class="form-group">
        <label class="form-label" for="subject-desc">Description</label>
        <textarea class="form-input" id="subject-desc" rows="3" placeholder="Optional description...">${existing ? existing.description || '' : ''}</textarea>
      </div>
    </form>
  `;
}

/**
 * Handle subject save (Add/Edit)
 * @param {number|null} id 
 */
async function handleSaveSubject(id = null) {
  const name = document.getElementById('subject-name')?.value;
  const code = document.getElementById('subject-code')?.value;
  const description = document.getElementById('subject-desc')?.value;

  const data = {
    name,
    code,
    description
  };

  const err = validateSubjectForm(data);
  if (err) {
    showToast(err, 'error');
    throw new Error(err);
  }

  try {
    let res;
    if (id) {
      res = await updateSubject(id, data);
      showToast('Subject updated successfully', 'success');
    } else {
      res = await createSubject(data);
      showToast('Subject created successfully', 'success');
    }
    if (!res.success) throw new Error(res.message);
    
    // Refresh table (keep stream filter if active)
    const streamFilter = document.getElementById('subject-stream-filter');
    const activeStreamId = streamFilter ? streamFilter.value : '';
    await loadSubjects(activeStreamId ? Number(activeStreamId) : null);
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
}

/**
 * Delete subject from system
 * @param {number} id 
 */
async function handleDeleteSubject(id) {
  try {
    const res = await deleteSubject(id);
    if (!res.success) throw new Error(res.message);
    showToast('Subject deleted successfully', 'success');
    
    const streamFilter = document.getElementById('subject-stream-filter');
    const activeStreamId = streamFilter ? streamFilter.value : '';
    await loadSubjects(activeStreamId ? Number(activeStreamId) : null);
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
}

/**
 * Subject fields validations
 */
function validateSubjectForm(data) {
  if (!data.name || data.name.trim().length < 2)
    return 'Subject name is required and must be at least 2 characters';
  if (/\d/.test(data.name)) {
    return 'Subject name cannot contain numbers';
  }
  if (!data.code || data.code.trim().length < 2)
    return 'Subject code is required and must be at least 2 characters';
  return null;
}

/**
 * Open assign subject to streams dialog (multiselect list)
 * @param {object} subject 
 */
async function openAssignModal(subject) {
  // We need to fetch which streams this subject is currently assigned to.
  // We don't have a direct "get streams by subject" api, but we can query each stream's subjects or simply display all streams and let the user make selections.
  // Let's draw checkable streams.
  
  let streamsHTML = '';
  allStreams.forEach(stream => {
    streamsHTML += `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
        <input type="checkbox" id="stream-chk-${stream.id}" class="stream-assign-chk" value="${stream.id}" style="width: 18px; height: 18px; cursor:pointer;" />
        <label for="stream-chk-${stream.id}" style="font-size: 0.9rem; cursor:pointer;">${stream.name} (${stream.year})</label>
      </div>
    `;
  });

  openModal(`Assign "${subject.name}" to Class Streams`, `
    <div style="margin-bottom: 12px; font-size: 0.85rem; color: var(--color-text-muted);">
      Select which class streams study this subject.
    </div>
    <div style="max-height: 250px; overflow-y: auto; padding: 4px;">
      ${allStreams.length === 0 ? '<p>No streams available. Create streams first.</p>' : streamsHTML}
    </div>
  `, async () => {
    // Collect selected stream IDs
    const checkedBoxes = document.querySelectorAll('.stream-assign-chk:checked');
    const selectedStreamIds = Array.from(checkedBoxes).map(cb => Number(cb.value));

    if (selectedStreamIds.length === 0) {
      showToast('Please select at least one class stream', 'warning');
      throw new Error('No streams selected');
    }

    try {
      // Loop assignments in parallel
      await Promise.all(selectedStreamIds.map(stream_id => 
        assignSubjectToStream({ stream_id, subject_id: subject.id })
      ));

      showToast(`Assigned subject to ${selectedStreamIds.length} stream(s)`, 'success');
    } catch (err) {
      showToast('Failed to complete stream assignments: ' + err.message, 'error');
      throw err;
    }
  });
}
