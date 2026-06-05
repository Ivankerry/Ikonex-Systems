// students.js
// Student management: list all, filter by stream, register, edit, delete, view detail.

import { getStudents, getStudentsByStream, createStudent, updateStudent, deleteStudent, getStreams, getStudentResults } from '../api.js';
import { openModal, openConfirmDialog, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { formatDate, debounce, formatGrade } from '../utils.js';

let allStudents = [];
let allStreams = [];
let filteredStudents = [];

/**
 * Initialize students page: loads streams, students, and binds filter/search actions.
 */
export async function initStudents() {
  const streamFilter = document.getElementById('student-stream-filter');
  const searchInput = document.getElementById('student-search-input');
  const registerBtn = document.getElementById('register-student-btn');

  // Load streams first
  try {
    const streamsRes = await getStreams();
    allStreams = streamsRes.success ? streamsRes.data : [];
    
    // Populate filter dropdown
    if (streamFilter) {
      streamFilter.innerHTML = '<option value="">All Streams</option>';
      allStreams.forEach(stream => {
        streamFilter.innerHTML += `<option value="${stream.id}">${stream.name}</option>`;
      });
      streamFilter.onchange = handleStreamFilterChange;
    }
  } catch (err) {
    console.error('Failed to load streams for filter:', err);
  }

  // Load students
  await loadStudents();

  // Bind Search (debounced 300ms)
  if (searchInput) {
    searchInput.oninput = debounce(() => {
      filterStudents(streamFilter ? streamFilter.value : '', searchInput.value);
    }, 300);
  }

  // Bind Register Button
  if (registerBtn) {
    registerBtn.onclick = () => {
      openModal('Register Student', buildStudentForm(allStreams), handleSaveStudent);
    };
  }
}

/**
 * Fetch students from API
 */
async function loadStudents() {
  const container = document.getElementById('students-table-container');
  if (!container) return;

  container.innerHTML = `
    <div class="skeleton-container" style="display: flex; flex-direction: column; gap: 10px;">
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
    </div>
  `;

  try {
    const res = await getStudents();
    if (!res.success) throw new Error(res.message);
    allStudents = res.data;
    filteredStudents = [...allStudents];
    renderStudentsTable(filteredStudents);
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon"></div>
        <div class="empty-state__text">Failed to load students: ${err.message}</div>
      </div>
    `;
  }
}

/**
 * Render students in a table
 * @param {Array} students 
 */
function renderStudentsTable(students) {
  const container = document.getElementById('students-table-container');
  if (!container) return;

  if (students.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon"></div>
        <div class="empty-state__text">No students found matching your criteria.</div>
      </div>
    `;
    return;
  }

  let html = `
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Admission No.</th>
            <th>Class Stream</th>
            <th>Gender</th>
            <th>Date Registered</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  students.forEach(student => {
    html += `
      <tr style="cursor: pointer;" data-id="${student.id}" class="student-row">
        <td><strong>${student.first_name} ${student.last_name}</strong></td>
        <td>${student.admission_number}</td>
        <td>${student.stream_name || '<span style="color:var(--color-text-muted);">Unassigned</span>'}</td>
        <td>${student.gender || 'N/A'}</td>
        <td>${formatDate(student.created_at)}</td>
        <td class="actions-cell">
          <button class="btn btn--secondary btn--sm edit-btn" data-id="${student.id}">Edit</button>
          <button class="btn btn--danger btn--sm delete-btn" data-id="${student.id}">Delete</button>
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

  // Bind detail view row clicks
  container.querySelectorAll('.student-row').forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.actions-cell') || e.target.closest('button')) return;
      const studentId = Number(row.getAttribute('data-id'));
      viewStudentDetail(studentId);
    });
  });

  // Bind Edit Actions
  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.getAttribute('data-id'));
      const student = allStudents.find(s => s.id === id);
      if (student) {
        openModal('Edit Student Details', buildStudentForm(allStreams, student), () => handleSaveStudent(id));
      }
    });
  });

  // Bind Delete Actions
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.getAttribute('data-id'));
      const student = allStudents.find(s => s.id === id);
      if (student) {
        openConfirmDialog(`Are you sure you want to delete student "${student.first_name} ${student.last_name}"? All associated score records will be permanently deleted.`, () => handleDeleteStudent(id));
      }
    });
  });
}

/**
 * Handle filtering when stream filter dropdown changes
 */
function handleStreamFilterChange(e) {
  const streamId = e.target.value;
  const searchInput = document.getElementById('student-search-input');
  filterStudents(streamId, searchInput ? searchInput.value : '');
}

/**
 * Filter student list client-side based on stream and search query
 * @param {string} streamId 
 * @param {string} search 
 */
function filterStudents(streamId, search) {
  const searchLower = search.trim().toLowerCase();
  
  filteredStudents = allStudents.filter(student => {
    const matchesStream = !streamId || String(student.stream_id) === String(streamId);
    
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const admNo = student.admission_number.toLowerCase();
    const matchesSearch = !searchLower || fullName.includes(searchLower) || admNo.includes(searchLower);
    
    return matchesStream && matchesSearch;
  });

  renderStudentsTable(filteredStudents);
}

/**
 * Build HTML modal form for student
 * @param {Array} streams 
 * @param {object} existing 
 * @returns {string} HTML string
 */
function buildStudentForm(streams, existing = null) {
  let dobVal = '';
  if (existing && existing.date_of_birth) {
    dobVal = new Date(existing.date_of_birth).toISOString().split('T')[0];
  }

  let optionsHTML = '<option value="">Select Stream</option>';
  streams.forEach(s => {
    const selected = existing && existing.stream_id === s.id ? 'selected' : '';
    optionsHTML += `<option value="${s.id}" ${selected}>${s.name}</option>`;
  });

  return `
    <form id="student-form" onsubmit="event.preventDefault();">
      <div class="grid-split">
        <div class="form-group">
          <label class="form-label" for="first-name">First Name</label>
          <input class="form-input" type="text" id="first-name" value="${existing ? existing.first_name : ''}" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="last-name">Last Name</label>
          <input class="form-input" type="text" id="last-name" value="${existing ? existing.last_name : ''}" required />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="admission-number">Admission Number</label>
        <input class="form-input" type="text" id="admission-number" value="${existing ? existing.admission_number : ''}" placeholder="e.g. ADM/2026/001" required />
      </div>
      <div class="grid-split">
        <div class="form-group">
          <label class="form-label" for="date-of-birth">Date of Birth</label>
          <input class="form-input" type="date" id="date-of-birth" value="${dobVal}" />
        </div>
        <div class="form-group">
          <label class="form-label" for="gender">Gender</label>
          <select class="form-select" id="gender">
            <option value="">Select Gender</option>
            <option value="Male" ${existing && existing.gender === 'Male' ? 'selected' : ''}>Male</option>
            <option value="Female" ${existing && existing.gender === 'Female' ? 'selected' : ''}>Female</option>
            <option value="Other" ${existing && existing.gender === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="student-stream">Assign Stream</label>
        <select class="form-select" id="student-stream" required>
          ${optionsHTML}
        </select>
      </div>
    </form>
  `;
}

/**
 * Handle student creation/editing
 * @param {number|null} id 
 */
async function handleSaveStudent(id = null) {
  const firstName = document.getElementById('first-name')?.value;
  const lastName = document.getElementById('last-name')?.value;
  const admissionNumber = document.getElementById('admission-number')?.value;
  const dateOfBirth = document.getElementById('date-of-birth')?.value;
  const gender = document.getElementById('gender')?.value;
  const streamId = document.getElementById('student-stream')?.value;

  const data = {
    first_name: firstName,
    last_name: lastName,
    admission_number: admissionNumber,
    date_of_birth: dateOfBirth || null,
    gender: gender || null,
    stream_id: Number(streamId)
  };

  const err = validateStudentForm(data);
  if (err) {
    showToast(err, 'error');
    throw new Error(err);
  }

  try {
    let res;
    if (id) {
      res = await updateStudent(id, data);
      showToast('Student details updated', 'success');
    } else {
      res = await createStudent(data);
      showToast('Student registered successfully', 'success');
    }
    if (!res.success) throw new Error(res.message);
    await loadStudents();
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
}

/**
 * Delete a student record
 * @param {number} id 
 */
async function handleDeleteStudent(id) {
  try {
    const res = await deleteStudent(id);
    if (!res.success) throw new Error(res.message);
    showToast('Student deleted successfully', 'success');
    await loadStudents();
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
}

/**
 * Client-side validation of student data
 */
function validateStudentForm(data) {
  if (!data.first_name?.trim())       return 'First name is required';
  if (!data.last_name?.trim())        return 'Last name is required';
  if (!data.admission_number?.trim()) return 'Admission number is required';
  if (data.gender && !['Male','Female','Other'].includes(data.gender))
    return 'Gender must be Male, Female, or Other';
  if (!data.stream_id || isNaN(data.stream_id)) return 'A valid stream is required';
  return null;
}

/**
 * View detailed scores and results card for a student
 * @param {number} studentId 
 */
async function viewStudentDetail(studentId) {
  const student = allStudents.find(s => s.id === studentId);
  if (!student) return;

  // Let's default to current term/year
  const term = 'Term 1';
  const year = 2026;

  openModal(`${student.first_name} ${student.last_name} — Score Overview`, `
    <div style="min-height: 200px; display: flex; align-items: center; justify-content: center;">
      <div class="skeleton skeleton-row" style="width: 100%;"></div>
    </div>
  `, () => {});

  const confirmBtn = document.getElementById('modal-confirm');
  if (confirmBtn) confirmBtn.style.display = 'none';

  try {
    const res = await getStudentResults(studentId, { term, year });
    if (!res.success) throw new Error(res.message);
    const results = res.data;

    let scoresHTML = '';
    if (results.scores && results.scores.length > 0) {
      results.scores.forEach(s => {
        const gradeObj = formatGrade(s.total_score);
        scoresHTML += `
          <tr>
            <td><strong>${s.subject_name}</strong></td>
            <td>${s.ca_score}</td>
            <td>${s.exam_score}</td>
            <td>${s.total_score}</td>
            <td><span class="badge ${gradeObj.cssClass}">${gradeObj.letter}</span></td>
          </tr>
        `;
      });
    } else {
      scoresHTML = `<tr><td colspan="5" style="text-align: center; color: var(--color-text-muted);">No scores recorded for this student in ${term} ${year}.</td></tr>`;
    }

    const bodyEl = document.getElementById('modal-body');
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="margin-bottom: 20px;">
          <table style="width:100%; border:none; margin-bottom: 12px; font-size: 0.9rem;">
            <tr>
              <td style="color:var(--color-text-muted); width: 30%;">Admission No.:</td>
              <td><strong>${student.admission_number}</strong></td>
            </tr>
            <tr>
              <td style="color:var(--color-text-muted);">Class Stream:</td>
              <td><strong>${student.stream_name || 'N/A'}</strong></td>
            </tr>
            <tr>
              <td style="color:var(--color-text-muted);">Date of Birth:</td>
              <td>${formatDate(student.date_of_birth)}</td>
            </tr>
          </table>
        </div>
        
        <h4 style="margin-bottom: 12px; border-bottom: 1px solid var(--color-border); padding-bottom: 6px;">Subject Scores (${term} ${year})</h4>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>CA (40)</th>
                <th>Exam (60)</th>
                <th>Total</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              ${scoresHTML}
            </tbody>
          </table>
        </div>

        ${results.scores && results.scores.length > 0 ? `
          <div style="display: flex; gap: 16px; margin-top: 20px; background: var(--color-bg); padding: 12px; border-radius: var(--radius-sm);">
            <div>Total: <strong>${results.total_marks}</strong></div>
            <div>Average: <strong>${results.average.toFixed(2)}%</strong></div>
            <div>Grade: <span class="badge badge--info">${results.grade} — ${results.grade_label}</span></div>
          </div>
        ` : ''}
      `;
    }
  } catch (error) {
    const bodyEl = document.getElementById('modal-body');
    if (bodyEl) bodyEl.innerHTML = `<p style="color: var(--color-danger);">Failed to load student results: ${error.message}</p>`;
  }
}
