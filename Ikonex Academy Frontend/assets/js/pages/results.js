// results.js
// Results, rankings, and report card PDF generation.

import { getStreamResults, getStudentResults, getReportCardPDF, getClassReportPDF, getStreams, getStudentsByStream } from '../api.js';
import { showToast } from '../components/toast.js';
import { formatGrade, ordinal } from '../utils.js';

let streams = [];
let classResults = [];

// Selection states
let activeTab = 'class'; // 'class' or 'student'
let selectedStreamId = '';
let selectedStudentId = '';
let selectedTerm = 'Term 1';
let selectedYear = 2026;

/**
 * Initialize results page: setup tabs, filters, and listeners.
 */
export async function initResults() {
  const classTabBtn = document.getElementById('tab-class-btn');
  const studentTabBtn = document.getElementById('tab-student-btn');
  
  const streamSelect = document.getElementById('results-stream-select');
  const studentSelect = document.getElementById('results-student-select');
  const termSelect = document.getElementById('results-term-select');
  const yearSelect = document.getElementById('results-year-select');
  
  const loadBtn = document.getElementById('load-results-btn');
  const dlClassPdfBtn = document.getElementById('dl-class-pdf-btn');
  const dlStudentPdfBtn = document.getElementById('dl-student-pdf-btn');

  // Tab switching
  if (classTabBtn && studentTabBtn) {
    classTabBtn.onclick = () => switchTab('class');
    studentTabBtn.onclick = () => switchTab('student');
  }

  // Load streams for dropdown
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
    console.error('Failed to load streams for results:', err);
  }

  // Bind Term and Year
  if (termSelect) termSelect.onchange = (e) => { selectedTerm = e.target.value; clearResultsView(); };
  if (yearSelect) yearSelect.onchange = (e) => { selectedYear = Number(e.target.value); clearResultsView(); };
  if (studentSelect) studentSelect.onchange = (e) => { selectedStudentId = e.target.value; clearResultsView(); };

  // Bind Load Results
  if (loadBtn) {
    loadBtn.onclick = handleLoadResults;
  }

  // Bind PDF Download links (open in new tab)
  if (dlClassPdfBtn) {
    dlClassPdfBtn.onclick = () => {
      if (!selectedStreamId) return showToast('Please load results first', 'warning');
      const url = getClassReportPDF(Number(selectedStreamId), { term: selectedTerm, year: selectedYear });
      window.open(url, '_blank');
    };
  }

  if (dlStudentPdfBtn) {
    dlStudentPdfBtn.onclick = () => {
      if (!selectedStudentId) return showToast('Please select a student first', 'warning');
      const url = getReportCardPDF(Number(selectedStudentId), { term: selectedTerm, year: selectedYear });
      window.open(url, '_blank');
    };
  }
}

/**
 * Switch tabs between Class Rankings and Individual Student results
 * @param {'class'|'student'} tab 
 */
function switchTab(tab) {
  activeTab = tab;
  
  const classTabBtn = document.getElementById('tab-class-btn');
  const studentTabBtn = document.getElementById('tab-student-btn');
  const studentSelectGroup = document.getElementById('results-student-select-group');
  
  const classSection = document.getElementById('class-results-section');
  const studentSection = document.getElementById('student-results-section');

  if (tab === 'class') {
    classTabBtn?.classList.add('page-btn--active');
    studentTabBtn?.classList.remove('page-btn--active');
    if (studentSelectGroup) studentSelectGroup.style.display = 'none';
    
    if (classSection) classSection.style.display = 'block';
    if (studentSection) studentSection.style.display = 'none';
  } else {
    classTabBtn?.classList.remove('page-btn--active');
    studentTabBtn?.classList.add('page-btn--active');
    if (studentSelectGroup) studentSelectGroup.style.display = 'flex';
    
    if (classSection) classSection.style.display = 'none';
    if (studentSection) studentSection.style.display = 'block';
    
    // Trigger loading students for dropdown if stream is selected
    if (selectedStreamId) {
      loadStudentsForDropdown(Number(selectedStreamId));
    }
  }

  clearResultsView();
}

/**
 * Handle stream dropdown changes: triggers student list load if in student tab
 */
async function handleStreamChange(e) {
  selectedStreamId = e.target.value;
  selectedStudentId = '';
  clearResultsView();

  const studentSelect = document.getElementById('results-student-select');
  if (studentSelect) {
    studentSelect.innerHTML = '<option value="">Select Student</option>';
  }

  if (!selectedStreamId) return;

  if (activeTab === 'student') {
    await loadStudentsForDropdown(Number(selectedStreamId));
  }
}

/**
 * Load students of a stream into dropdown
 * @param {number} streamId 
 */
async function loadStudentsForDropdown(streamId) {
  const studentSelect = document.getElementById('results-student-select');
  if (!studentSelect) return;

  studentSelect.innerHTML = '<option value="">Loading students...</option>';
  studentSelect.disabled = true;

  try {
    const res = await getStudentsByStream(streamId);
    const students = res.success ? res.data : [];
    
    studentSelect.innerHTML = '<option value="">Select Student</option>';
    students.forEach(st => {
      studentSelect.innerHTML += `<option value="${st.id}">${st.first_name} ${st.last_name}</option>`;
    });
    studentSelect.disabled = false;
  } catch (err) {
    console.error(err);
    showToast('Failed to load students for stream', 'error');
    studentSelect.innerHTML = '<option value="">Select Student</option>';
  }
}

/**
 * Clear results visual displays
 */
function clearResultsView() {
  const classContainer = document.getElementById('class-results-container');
  const studentContainer = document.getElementById('student-results-container');
  const dlClassPdfBtn = document.getElementById('dl-class-pdf-btn');
  const dlStudentPdfBtn = document.getElementById('dl-student-pdf-btn');

  if (classContainer) {
    classContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon"></div>
        <div class="empty-state__text">Select Stream, Term, and Year, and click "Load Results".</div>
      </div>
    `;
  }

  if (studentContainer) {
    studentContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon"></div>
        <div class="empty-state__text">Select Stream, Student, Term, and Year, and click "Load Results".</div>
      </div>
    `;
  }

  if (dlClassPdfBtn) dlClassPdfBtn.style.display = 'none';
  if (dlStudentPdfBtn) dlStudentPdfBtn.style.display = 'none';
}

/**
 * Fetch and load results based on active tab and filters
 */
async function handleLoadResults() {
  if (!selectedStreamId) return showToast('Please select a Class Stream', 'warning');
  if (activeTab === 'student' && !selectedStudentId) return showToast('Please select a Student', 'warning');

  const classContainer = document.getElementById('class-results-container');
  const studentContainer = document.getElementById('student-results-container');
  const dlClassPdfBtn = document.getElementById('dl-class-pdf-btn');
  const dlStudentPdfBtn = document.getElementById('dl-student-pdf-btn');

  const container = activeTab === 'class' ? classContainer : studentContainer;
  if (!container) return;

  container.innerHTML = `
    <div class="skeleton-container" style="display: flex; flex-direction: column; gap: 10px;">
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
      <div class="skeleton skeleton-row"></div>
    </div>
  `;

  try {
    if (activeTab === 'class') {
      const res = await getStreamResults(Number(selectedStreamId), { term: selectedTerm, year: selectedYear });
      if (!res.success) throw new Error(res.message);
      classResults = res.data;
      
      renderClassResultsTable(classResults);
      if (dlClassPdfBtn && classResults.length > 0) dlClassPdfBtn.style.display = 'inline-flex';
    } else {
      // Get student average, scores
      const res = await getStudentResults(Number(selectedStudentId), { term: selectedTerm, year: selectedYear });
      if (!res.success) throw new Error(res.message);
      
      // We also need their rank, which we can extract by running class results
      let rank = 'N/A';
      let totalClassSize = 0;
      try {
        const classRes = await getStreamResults(Number(selectedStreamId), { term: selectedTerm, year: selectedYear });
        if (classRes.success) {
          const studentRank = classRes.data.find(r => r.student_id === Number(selectedStudentId));
          if (studentRank) rank = studentRank.position;
          totalClassSize = classRes.data.length;
        }
      } catch (err) {
        console.warn('Failed to calculate class position:', err);
      }

      renderStudentResultsCard(res.data, rank, totalClassSize);
      if (dlStudentPdfBtn && res.data.scores.length > 0) dlStudentPdfBtn.style.display = 'inline-flex';
    }
  } catch (err) {
    console.error(err);
    showToast(err.message, 'error');
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon"></div>
        <div class="empty-state__text">Failed to compute results: ${err.message}</div>
      </div>
    `;
  }
}

/**
 * Render Class Rankings table
 * @param {Array} results 
 */
function renderClassResultsTable(results) {
  const container = document.getElementById('class-results-container');
  if (!container) return;

  if (results.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon"></div>
        <div class="empty-state__text">No results recorded in this class stream for the selected term/year.</div>
      </div>
    `;
    return;
  }

  let html = `
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student Name</th>
            <th>Adm. No.</th>
            <th>Total Marks</th>
            <th>Average</th>
            <th>Overall Grade</th>
          </tr>
        </thead>
        <tbody>
  `;

  results.forEach(r => {
    const gradeObj = formatGrade(r.average);
    html += `
      <tr>
        <td><strong>#${r.position}</strong></td>
        <td>${r.name}</td>
        <td>${r.admission_no}</td>
        <td>${r.total_marks.toFixed(2)}</td>
        <td><strong>${r.average.toFixed(2)}%</strong></td>
        <td><span class="badge ${gradeObj.cssClass}">${r.grade} — ${r.grade_label}</span></td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Render individual student report card view
 * @param {object} result 
 * @param {number|string} position 
 * @param {number} totalClassSize 
 */
function renderStudentResultsCard(result, position, totalClassSize) {
  const container = document.getElementById('student-results-container');
  if (!container) return;

  if (!result.scores || result.scores.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon"></div>
        <div class="empty-state__text">No scores registered for this student in the selected term/year.</div>
      </div>
    `;
    return;
  }

  let scoresRows = '';
  result.scores.forEach(s => {
    const grade = formatGrade(s.total_score);
    scoresRows += `
      <tr>
        <td><strong>${s.subject_name}</strong></td>
        <td>${s.ca_score}</td>
        <td>${s.exam_score}</td>
        <td><strong>${s.total_score}</strong></td>
        <td><span class="badge ${grade.cssClass}">${grade.letter}</span></td>
        <td>${s.subject_position ? ordinal(s.subject_position) : 'N/A'}</td>
      </tr>
    `;
  });

  const overallGrade = formatGrade(result.average);

  container.innerHTML = `
    <div class="results-stats-grid">
      <div class="card" style="border-left: 4px solid var(--color-accent); padding: 16px;">
        <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase;">Total Marks</div>
        <div style="font-size: 1.5rem; font-weight: 700; margin-top: 4px;">${result.total_marks.toFixed(2)}</div>
      </div>
      <div class="card" style="border-left: 4px solid var(--color-success); padding: 16px;">
        <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase;">Average Score</div>
        <div style="font-size: 1.5rem; font-weight: 700; margin-top: 4px;">${result.average.toFixed(2)}%</div>
      </div>
      <div class="card" style="border-left: 4px solid var(--color-warning); padding: 16px;">
        <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase;">Overall Grade</div>
        <div style="font-size: 1.5rem; font-weight: 700; margin-top: 4px;">
          ${result.grade} <span style="font-size: 0.85rem; font-weight: 500; color: var(--color-text-muted);">(${result.grade_label})</span>
        </div>
      </div>
      <div class="card" style="border-left: 4px solid #7C3AED; padding: 16px;">
        <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase;">Class Position</div>
        <div style="font-size: 1.5rem; font-weight: 700; margin-top: 4px;">
          ${position !== 'N/A' ? `${ordinal(position)}` : 'N/A'} 
          <span style="font-size: 0.85rem; font-weight: 500; color: var(--color-text-muted);">of ${totalClassSize}</span>
        </div>
      </div>
    </div>
    
    <div class="card">
      <div class="card__header">
        <h3 class="card__title">Subject-wise Performance</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>CA (40)</th>
              <th>Exam (60)</th>
              <th>Total Score</th>
              <th>Grade</th>
              <th>Subject Position</th>
            </tr>
          </thead>
          <tbody>
            ${scoresRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
