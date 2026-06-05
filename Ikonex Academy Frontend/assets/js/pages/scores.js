// scores.js
// Score entry, editing, and viewing.

import { getScores, createScore, updateScore, deleteScore, getStreams, getSubjectsByStream, getStudentsByStream } from '../api.js';
import { openModal, openConfirmDialog, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { formatGrade } from '../utils.js';

let streams = [];
let streamSubjects = [];
let streamStudents = [];
let currentScores = [];

// Selected values
let selectedStreamId = '';
let selectedSubjectId = '';
let selectedTerm = 'Term 1';
let selectedYear = 2026;

/**
 * Initialize scores page: loads streams list, sets up dropdown listeners.
 */
export async function initScores() {
  const streamSelect = document.getElementById('score-stream-select');
  const subjectSelect = document.getElementById('score-subject-select');
  const termSelect = document.getElementById('score-term-select');
  const yearSelect = document.getElementById('score-year-select');
  const loadBtn = document.getElementById('load-scores-btn');

  // Load streams
  try {
    const streamsRes = await getStreams();
    streams = streamsRes.success ? streamsRes.data : [];

    if (streamSelect) {
      streamSelect.innerHTML = '<option value="">Select Stream</option>';
      streams.forEach(s => {
        streamSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
      });
      streamSelect.onchange = handleStreamChange;
    }
  } catch (err) {
    console.error('Failed to load streams:', err);
  }

  // Bind Term and Year changes
  if (termSelect) termSelect.onchange = (e) => { selectedTerm = e.target.value; clearScoresGrid(); };
  if (yearSelect) yearSelect.onchange = (e) => { selectedYear = Number(e.target.value); clearScoresGrid(); };
  if (subjectSelect) subjectSelect.onchange = (e) => { selectedSubjectId = e.target.value; clearScoresGrid(); };

  // Bind Load Button
  if (loadBtn) {
    loadBtn.onclick = handleLoadScores;
  }
}

/**
 * Handle stream selection change: loads subjects of this stream
 */
async function handleStreamChange(e) {
  selectedStreamId = e.target.value;
  selectedSubjectId = '';
  clearScoresGrid();

  const subjectSelect = document.getElementById('score-subject-select');
  if (!subjectSelect) return;

  if (!selectedStreamId) {
    subjectSelect.innerHTML = '<option value="">Select Subject</option>';
    subjectSelect.disabled = true;
    return;
  }

  subjectSelect.innerHTML = '<option value="">Loading...</option>';
  subjectSelect.disabled = true;

  try {
    const res = await getSubjectsByStream(Number(selectedStreamId));
    streamSubjects = res.success ? res.data : [];
    
    subjectSelect.innerHTML = '<option value="">Select Subject</option>';
    streamSubjects.forEach(sub => {
      subjectSelect.innerHTML += `<option value="${sub.id}">${sub.name} (${sub.code})</option>`;
    });
    subjectSelect.disabled = false;
  } catch (err) {
    console.error(err);
    showToast('Failed to load stream subjects', 'error');
    subjectSelect.innerHTML = '<option value="">Select Subject</option>';
  }
}

/**
 * Clear the grid when filters change
 */
function clearScoresGrid() {
  const container = document.getElementById('scores-grid-container');
  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📝</div>
        <div class="empty-state__text">Select filters above and click "Load Scores" to manage student results.</div>
      </div>
    `;
  }
}

/**
 * Fetch students and their scores for selected filters
 */
async function handleLoadScores() {
  if (!selectedStreamId) return showToast('Please select a Class Stream', 'warning');
  if (!selectedSubjectId) return showToast('Please select a Subject', 'warning');
  if (!selectedTerm) return showToast('Please select a Term', 'warning');
  if (!selectedYear) return showToast('Please select a Year', 'warning');

  const container = document.getElementById('scores-grid-container');
  if (!container) return;

  container.innerHTML = `
    <div class="skeleton-container" style="display: flex; flex-direction: column; gap: 10px;">
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
    </div>
  `;

  try {
    const [studentsRes, scoresRes] = await Promise.all([
      getStudentsByStream(Number(selectedStreamId)),
      getScores({
        stream_id: Number(selectedStreamId),
        subject_id: Number(selectedSubjectId),
        term: selectedTerm,
        year: selectedYear
      })
    ]);

    streamStudents = studentsRes.success ? studentsRes.data : [];
    currentScores = scoresRes.success ? scoresRes.data : [];

    renderScoresGrid(streamStudents, currentScores);
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">⚠️</div>
        <div class="empty-state__text">Failed to load scores data: ${err.message}</div>
      </div>
    `;
  }
}

/**
 * Render students list along with their scores (if any)
 */
function renderScoresGrid(students, scores) {
  const container = document.getElementById('scores-grid-container');
  if (!container) return;

  if (students.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">👨‍🎓</div>
        <div class="empty-state__text">No students registered in this class stream yet.</div>
      </div>
    `;
    return;
  }

  // Create score mapping by student_id
  const scoreMap = {};
  scores.forEach(s => {
    scoreMap[s.student_id] = s;
  });

  let html = `
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Admission No.</th>
            <th>CA Score (40)</th>
            <th>Exam Score (60)</th>
            <th>Total Score (100)</th>
            <th>Grade</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  `;

  students.forEach(student => {
    const score = scoreMap[student.id];

    if (score) {
      const grade = formatGrade(score.total_score);
      html += `
        <tr>
          <td><strong>${student.first_name} ${student.last_name}</strong></td>
          <td>${student.admission_number}</td>
          <td>${score.ca_score}</td>
          <td>${score.exam_score}</td>
          <td><strong>${score.total_score}</strong></td>
          <td><span class="badge ${grade.cssClass}">${grade.letter}</span></td>
          <td class="actions-cell">
            <button class="btn btn--secondary btn--sm edit-score-btn" data-id="${score.id}">Edit</button>
            <button class="btn btn--danger btn--sm delete-score-btn" data-id="${score.id}">Delete</button>
          </td>
        </tr>
      `;
    } else {
      html += `
        <tr style="background: rgba(244, 246, 251, 0.4);">
          <td>${student.first_name} ${student.last_name}</td>
          <td>${student.admission_number}</td>
          <td colspan="4" style="color: var(--color-text-muted); font-style: italic;">No score recorded</td>
          <td class="actions-cell">
            <button class="btn btn--primary btn--sm record-score-btn" data-student-id="${student.id}" data-student-name="${student.first_name} ${student.last_name}">Record Score</button>
          </td>
        </tr>
      `;
    }
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;

  // Bind edit score buttons
  container.querySelectorAll('.edit-score-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const scoreId = Number(btn.getAttribute('data-id'));
      const score = currentScores.find(s => s.id === scoreId);
      if (score) {
        openModal(`Edit Score — ${score.first_name} ${score.last_name}`, buildScoreForm(score), () => handleSaveScore(score.id));
      }
    });
  });

  // Bind delete score buttons
  container.querySelectorAll('.delete-score-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const scoreId = Number(btn.getAttribute('data-id'));
      const score = currentScores.find(s => s.id === scoreId);
      if (score) {
        openConfirmDialog(`Are you sure you want to delete this score record for "${score.first_name} ${score.last_name}" in ${score.subject_name}?`, () => handleDeleteScore(scoreId));
      }
    });
  });

  // Bind record score buttons
  container.querySelectorAll('.record-score-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const studentId = Number(btn.getAttribute('data-student-id'));
      const name = btn.getAttribute('data-student-name');
      openModal(`Record Score — ${name}`, buildScoreForm(null, studentId), () => handleSaveScore());
    });
  });
}

/**
 * Build score editing/recording modal form
 * @param {object} existing 
 * @param {number|null} studentId 
 * @returns {string} HTML string
 */
function buildScoreForm(existing = null, studentId = null) {
  const currentSubject = streamSubjects.find(s => s.id === Number(selectedSubjectId));
  const subjectName = currentSubject ? `${currentSubject.name} (${currentSubject.code})` : '';

  return `
    <form id="score-form" onsubmit="event.preventDefault();">
      <div class="form-group" style="background: var(--color-bg); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 16px;">
        <div style="font-size: 0.8rem; color: var(--color-text-muted);">Selected Filters</div>
        <div style="font-size: 0.9rem; font-weight: 600;">Subject: ${subjectName} | ${selectedTerm} (${selectedYear})</div>
      </div>
      
      <!-- Hidden fields for submission -->
      <input type="hidden" id="form-student-id" value="${existing ? existing.student_id : (studentId || '')}" />

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="form-group">
          <label class="form-label" for="ca-score">CA Score (Max 40)</label>
          <input class="form-input" type="number" step="0.01" id="ca-score" min="0" max="40" value="${existing ? existing.ca_score : ''}" placeholder="e.g. 28.5" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="exam-score">Exam Score (Max 60)</label>
          <input class="form-input" type="number" step="0.01" id="exam-score" min="0" max="60" value="${existing ? existing.exam_score : ''}" placeholder="e.g. 45" required />
        </div>
      </div>
      
      <div style="margin-top: 10px; padding: 10px 0; border-top: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.9rem; color: var(--color-text-muted);">Estimated Total:</span>
        <span id="score-total-preview" style="font-size: 1.15rem; font-weight: 700; color: var(--color-accent);">0.00</span>
      </div>
    </form>
    
    <script>
      // Live preview of total score
      const caInput = document.getElementById('ca-score');
      const examInput = document.getElementById('exam-score');
      const totalPreview = document.getElementById('score-total-preview');
      
      function updatePreview() {
        const ca = parseFloat(caInput.value) || 0;
        const exam = parseFloat(examInput.value) || 0;
        totalPreview.textContent = (ca + exam).toFixed(2);
      }
      
      caInput?.addEventListener('input', updatePreview);
      examInput?.addEventListener('input', updatePreview);
      if (caInput && examInput) updatePreview();
    </script>
  `;
}

/**
 * Handle recording/updating score
 * @param {number|null} id 
 */
async function handleSaveScore(id = null) {
  const studentId = document.getElementById('form-student-id')?.value;
  const caScore = document.getElementById('ca-score')?.value;
  const examScore = document.getElementById('exam-score')?.value;

  const data = {
    student_id: Number(studentId),
    subject_id: Number(selectedSubjectId),
    ca_score: parseFloat(caScore),
    exam_score: parseFloat(examScore),
    term: selectedTerm,
    year: selectedYear
  };

  const err = validateScoreForm(data, id !== null);
  if (err) {
    showToast(err, 'error');
    throw new Error(err);
  }

  try {
    let res;
    if (id) {
      res = await updateScore(id, { ca_score: data.ca_score, exam_score: data.exam_score });
      showToast('Score updated successfully', 'success');
    } else {
      res = await createScore(data);
      showToast('Score recorded successfully', 'success');
    }
    if (!res.success) throw new Error(res.message);
    await handleLoadScores();
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
}

/**
 * Delete scores record
 * @param {number} id 
 */
async function handleDeleteScore(id) {
  try {
    const res = await deleteScore(id);
    if (!res.success) throw new Error(res.message);
    showToast('Score record deleted', 'success');
    await handleLoadScores();
  } catch (error) {
    showToast(error.message, 'error');
    throw error;
  }
}

/**
 * Client-side validation for ca_score and exam_score limits
 */
function validateScoreForm(data, isUpdate = false) {
  if (!isUpdate) {
    if (!data.student_id || isNaN(data.student_id)) return 'A valid student is required';
    if (!data.subject_id || isNaN(data.subject_id)) return 'A valid subject is required';
    if (!data.term) return 'Term is required';
    if (!data.year || isNaN(data.year)) return 'A valid academic year is required';
  }
  
  if (data.ca_score == null || isNaN(data.ca_score) || data.ca_score < 0 || data.ca_score > 40)
    return 'CA score must be a number between 0 and 40';
  if (data.exam_score == null || isNaN(data.exam_score) || data.exam_score < 0 || data.exam_score > 60)
    return 'Exam score must be a number between 0 and 60';
  return null;
}
