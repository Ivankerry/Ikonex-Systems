# Ikonex Academy — Student Management System
## Frontend Build Prompt (HTML + CSS + Vanilla JavaScript)

---

## Overview

You are building the **frontend** for the Ikonex Academy Student Management System. This is a web-based admin panel for managing class streams, students, subjects, scores, results, and PDF reports.

**Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+). No frameworks, no React, no Vue. Plain files.

**Critical rule:** Keep UI and logic completely separate. JavaScript files must never contain raw HTML strings or inline styles. CSS files must never embed logic. HTML files must never contain `<script>` blocks with business logic — only a `<script src="...">` tag at the bottom pointing to the correct JS file.

**Design inspiration:** Dribbble's ClassSync and Smansys school management dashboards, Figma Community's "School Management Admin Dashboard UI" (file/1219642652767985298). The aesthetic to target is a clean, professional sidebar-based admin panel with:
- A deep navy/indigo sidebar (`#1E2A4A`) with white icons and text
- A light grey main content area (`#F4F6FB`)
- White cards with subtle box-shadow for data panels
- A vibrant accent colour: `#4F6EF7` (indigo-blue) for primary buttons, active states, and chart accents
- Secondary accent: `#22C55E` (green) for success states, passing grades
- Warning: `#F59E0B` (amber) for average grades
- Danger: `#EF4444` (red) for failing grades, delete actions
- Clean sans-serif typography: use **Inter** from Google Fonts
- Smooth hover transitions (150ms ease) on all interactive elements
- Fully responsive layout that collapses the sidebar into a hamburger menu on screens below 768px

---

## Folder Structure

Maintain this exact structure. Do not deviate:

```
frontend/
├── index.html                  # Entry point — redirects to dashboard
├── assets/
│   ├── css/
│   │   ├── base.css            # CSS reset, variables, typography
│   │   ├── layout.css          # Sidebar, topbar, main-content grid
│   │   ├── components.css      # Cards, tables, modals, buttons, forms, badges
│   │   └── responsive.css      # Media queries only
│   ├── js/
│   │   ├── api.js              # ALL fetch calls to the backend. Nothing else.
│   │   ├── router.js           # SPA-style page switching logic
│   │   ├── utils.js            # Shared helpers: formatDate, formatGrade, debounce, showToast
│   │   ├── components/
│   │   │   ├── sidebar.js      # Renders sidebar HTML, handles active link state
│   │   │   ├── topbar.js       # Renders topbar, breadcrumb
│   │   │   ├── modal.js        # Generic modal open/close/confirm logic
│   │   │   └── toast.js        # Toast notification system
│   │   └── pages/
│   │       ├── dashboard.js    # Dashboard summary page logic
│   │       ├── streams.js      # Class streams page logic
│   │       ├── students.js     # Students page logic
│   │       ├── subjects.js     # Subjects page logic
│   │       ├── scores.js       # Score entry and viewing logic
│   │       └── results.js      # Results, rankings, report cards logic
│   └── icons/                  # SVG icons (inline or referenced)
└── pages/
    ├── dashboard.html
    ├── streams.html
    ├── students.html
    ├── subjects.html
    ├── scores.html
    └── results.html
```

---

## CSS Architecture

### `base.css`
- CSS custom properties (variables) at `:root`:
  ```css
  :root {
    --color-sidebar:     #1E2A4A;
    --color-sidebar-hover: #2D3F6B;
    --color-accent:      #4F6EF7;
    --color-accent-hover:#3B5BDB;
    --color-bg:          #F4F6FB;
    --color-surface:     #FFFFFF;
    --color-text:        #1A202C;
    --color-text-muted:  #718096;
    --color-border:      #E2E8F0;
    --color-success:     #22C55E;
    --color-warning:     #F59E0B;
    --color-danger:      #EF4444;
    --sidebar-width:     240px;
    --topbar-height:     64px;
    --radius-sm:         6px;
    --radius-md:         10px;
    --radius-lg:         16px;
    --shadow-card:       0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-modal:      0 20px 60px rgba(0,0,0,0.18);
    --transition:        150ms ease;
    --font-sans:         'Inter', system-ui, sans-serif;
  }
  ```
- Full CSS reset (box-sizing, margin/padding zero, list-style none)
- Base body styles: `font-family: var(--font-sans)`, `background: var(--color-bg)`, `color: var(--color-text)`
- Heading scale: h1–h4 with consistent weights and line-heights
- Link reset

### `layout.css`
- `.app-shell`: CSS Grid layout — sidebar fixed left, main area takes remaining width
- `.sidebar`: fixed, `width: var(--sidebar-width)`, `background: var(--color-sidebar)`, full height, flex column
- `.sidebar__logo`: top logo area with school name "Ikonex Academy" in white
- `.sidebar__nav`: vertical nav list
- `.sidebar__nav-item`: flex row, icon + label, `padding: 12px 20px`, `border-radius: var(--radius-sm)`, `color: rgba(255,255,255,0.7)`, hover → `background: var(--color-sidebar-hover)`, `color: white`
- `.sidebar__nav-item--active`: `background: var(--color-accent)`, `color: white`
- `.topbar`: fixed top, `height: var(--topbar-height)`, `background: var(--color-surface)`, `border-bottom: 1px solid var(--color-border)`, flex row space-between, contains page title + search + user avatar placeholder
- `.main-content`: `margin-left: var(--sidebar-width)`, `margin-top: var(--topbar-height)`, `padding: 24px`, `min-height: calc(100vh - var(--topbar-height))`

### `components.css`
Define reusable component classes. No page-specific styles here:

**Cards:**
```css
.card { background: var(--color-surface); border-radius: var(--radius-md); box-shadow: var(--shadow-card); padding: 24px; }
.card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.card__title { font-size: 1rem; font-weight: 600; color: var(--color-text); }
```

**Stat cards (dashboard):**
```css
.stat-card { ... } /* Icon left, value large, label below, colored left border accent */
```

**Tables:**
```css
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: var(--color-bg); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-muted); padding: 10px 16px; text-align: left; }
.data-table td { padding: 14px 16px; border-bottom: 1px solid var(--color-border); font-size: 0.9rem; }
.data-table tbody tr:hover { background: #F8FAFF; }
```

**Buttons:**
```css
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: var(--radius-sm); font-size: 0.875rem; font-weight: 500; cursor: pointer; border: none; transition: var(--transition); }
.btn--primary { background: var(--color-accent); color: white; }
.btn--primary:hover { background: var(--color-accent-hover); }
.btn--danger { background: var(--color-danger); color: white; }
.btn--ghost { background: transparent; color: var(--color-accent); border: 1px solid var(--color-accent); }
.btn--sm { padding: 6px 12px; font-size: 0.8rem; }
```

**Forms:**
```css
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-label { font-size: 0.85rem; font-weight: 500; color: var(--color-text); }
.form-input, .form-select { padding: 10px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); font-size: 0.9rem; transition: var(--transition); }
.form-input:focus, .form-select:focus { outline: none; border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(79,110,247,0.12); }
.form-error { font-size: 0.8rem; color: var(--color-danger); }
```

**Badges:**
```css
.badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.badge--success { background: #DCFCE7; color: #166534; }
.badge--warning { background: #FEF3C7; color: #92400E; }
.badge--danger  { background: #FEE2E2; color: #991B1B; }
.badge--info    { background: #EFF6FF; color: #1E40AF; }
```

**Modal:**
```css
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; opacity: 0; pointer-events: none; transition: opacity var(--transition); }
.modal-overlay.is-open { opacity: 1; pointer-events: all; }
.modal { background: var(--color-surface); border-radius: var(--radius-lg); padding: 32px; width: 520px; max-width: 95vw; box-shadow: var(--shadow-modal); transform: translateY(16px); transition: transform var(--transition); }
.modal-overlay.is-open .modal { transform: translateY(0); }
.modal__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.modal__title { font-size: 1.1rem; font-weight: 700; }
.modal__close { cursor: pointer; background: none; border: none; font-size: 1.4rem; color: var(--color-text-muted); }
```

**Toast:**
```css
.toast-container { position: fixed; bottom: 24px; right: 24px; display: flex; flex-direction: column; gap: 10px; z-index: 2000; }
.toast { padding: 14px 20px; border-radius: var(--radius-md); color: white; font-size: 0.875rem; font-weight: 500; box-shadow: var(--shadow-card); animation: slideIn 200ms ease; }
.toast--success { background: var(--color-success); }
.toast--error   { background: var(--color-danger); }
.toast--info    { background: var(--color-accent); }
@keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
```

**Pagination:**
```css
.pagination { display: flex; gap: 6px; align-items: center; justify-content: flex-end; margin-top: 16px; }
.page-btn { width: 34px; height: 34px; border-radius: var(--radius-sm); border: 1px solid var(--color-border); background: white; cursor: pointer; font-size: 0.85rem; }
.page-btn--active { background: var(--color-accent); color: white; border-color: var(--color-accent); }
```

**Empty state:**
```css
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 24px; color: var(--color-text-muted); gap: 12px; }
.empty-state__icon { font-size: 3rem; opacity: 0.4; }
.empty-state__text { font-size: 0.95rem; }
```

### `responsive.css`
Handle only breakpoints here:
- `@media (max-width: 768px)`: sidebar hidden by default, toggled by `.sidebar--open` class, hamburger button visible in topbar, `.main-content` margin-left resets to 0
- `@media (max-width: 480px)`: stat card grid becomes single column, modal becomes full-width bottom sheet

---

## JavaScript Architecture

### `api.js` — The only file that talks to the backend

Define a base URL constant and export async functions for every endpoint. Nothing else lives here.

```js
// api.js
// Central API layer. All fetch calls go here. No DOM manipulation.

const BASE_URL = 'http://localhost:5000/api'; // Update to production URL when deployed

// ---- Generic request helper ----
async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

// ---- Streams ----
export const getStreams       = ()             => request('GET',    '/streams');
export const getStream        = (id)           => request('GET',    `/streams/${id}`);
export const createStream     = (data)         => request('POST',   '/streams', data);
export const updateStream     = (id, data)     => request('PUT',    `/streams/${id}`, data);
export const deleteStream     = (id)           => request('DELETE', `/streams/${id}`);

// ---- Students ----
export const getStudents      = ()             => request('GET',    '/students');
export const getStudent       = (id)           => request('GET',    `/students/${id}`);
export const getStudentsByStream = (streamId)  => request('GET',    `/students?stream_id=${streamId}`);
export const createStudent    = (data)         => request('POST',   '/students', data);
export const updateStudent    = (id, data)     => request('PUT',    `/students/${id}`, data);
export const deleteStudent    = (id)           => request('DELETE', `/students/${id}`);

// ---- Subjects ----
export const getSubjects      = ()             => request('GET',    '/subjects');
export const getSubject       = (id)           => request('GET',    `/subjects/${id}`);
export const createSubject    = (data)         => request('POST',   '/subjects', data);
export const updateSubject    = (id, data)     => request('PUT',    `/subjects/${id}`, data);
export const deleteSubject    = (id)           => request('DELETE', `/subjects/${id}`);
export const assignSubjectToStream = (data)    => request('POST',   '/streams/subjects', data);
export const getSubjectsByStream = (streamId)  => request('GET',    `/streams/${streamId}/subjects`);

// ---- Scores ----
export const getScores        = (filters = {}) => request('GET',    `/scores?${new URLSearchParams(filters)}`);
export const createScore      = (data)         => request('POST',   '/scores', data);
export const updateScore      = (id, data)     => request('PUT',    `/scores/${id}`, data);
export const deleteScore      = (id)           => request('DELETE', `/scores/${id}`);

// ---- Results ----
export const getStudentResults   = (studentId) => request('GET', `/results/student/${studentId}`);
export const getStreamResults    = (streamId)  => request('GET', `/results/stream/${streamId}`);
export const getReportCardPDF    = (studentId) => `${BASE_URL}/reports/student/${studentId}/pdf`;
export const getClassReportPDF   = (streamId)  => `${BASE_URL}/reports/stream/${streamId}/pdf`;

// ---- Dashboard ----
export const getDashboardStats   = ()          => request('GET', '/dashboard/stats');
```

### `utils.js` — Pure helper functions, no DOM, no API calls

```js
// utils.js
// Pure utility functions shared across pages.

/**
 * Format a date string to DD/MM/YYYY
 * @param {string} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) { ... }

/**
 * Determine letter grade from a numeric score using the grading scale.
 * Scale: 70-100 = A, 60-69 = B, 50-59 = C, 40-49 = D, 0-39 = F
 * @param {number} score
 * @returns {{ letter: string, cssClass: string }}
 */
export function formatGrade(score) { ... }

/**
 * Ordinal suffix: 1 -> "1st", 2 -> "2nd", 3 -> "3rd"
 * @param {number} n
 * @returns {string}
 */
export function ordinal(n) { ... }

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} delay ms
 * @returns {Function}
 */
export function debounce(fn, delay) { ... }

/**
 * Truncate a string to maxLen characters with ellipsis.
 * @param {string} str
 * @param {number} maxLen
 * @returns {string}
 */
export function truncate(str, maxLen) { ... }

/**
 * Capitalise first letter of each word.
 * @param {string} str
 * @returns {string}
 */
export function titleCase(str) { ... }
```

### `router.js` — SPA page navigation

This file handles switching between pages by loading the correct HTML partial into `#page-content` and calling the corresponding page JS initialiser.

```js
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
  '/':          { partial: '/pages/dashboard.html', init: initDashboard },
  '/streams':   { partial: '/pages/streams.html',   init: initStreams   },
  '/students':  { partial: '/pages/students.html',  init: initStudents  },
  '/subjects':  { partial: '/pages/subjects.html',  init: initSubjects  },
  '/scores':    { partial: '/pages/scores.html',    init: initScores    },
  '/results':   { partial: '/pages/results.html',   init: initResults   },
};

export async function navigate(path) {
  const route = routes[path] || routes['/'];
  // 1. Fetch the HTML partial
  // 2. Inject into #page-content
  // 3. Update active sidebar link
  // 4. Call route.init()
  // 5. Push to history
}

export function initRouter() {
  // Handle nav link clicks
  // Handle popstate
  // Navigate to current path on load
}
```

### `components/modal.js`

```js
// modal.js
// Generic modal manager. Controls open/close/confirm dialogs.
// Does NOT know about any specific entity (students, streams etc.).

export function openModal(title, bodyHTML, onConfirm) {
  // Set modal title
  // Set modal body innerHTML
  // Set confirm button handler
  // Add is-open class to overlay
}

export function closeModal() {
  // Remove is-open class
  // Clear body and handlers
}

export function openConfirmDialog(message, onConfirm) {
  // Specialised confirm modal for delete actions
}
```

### `components/toast.js`

```js
// toast.js
// Toast notification system.

/**
 * Show a toast message.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration ms (default 3500)
 */
export function showToast(message, type = 'info', duration = 3500) {
  // Create toast element
  // Append to .toast-container
  // Auto-remove after duration
}
```

### `pages/dashboard.js`

```js
// dashboard.js
// Dashboard page: summary stats and overview.

import { getDashboardStats } from '../api.js';
import { showToast } from '../components/toast.js';

export async function initDashboard() {
  // 1. Call getDashboardStats()
  // 2. Populate stat cards: Total Students, Total Streams, Total Subjects, Avg Score
  // 3. Render a simple top-performers table (top 5 students by average score)
  // 4. Handle loading and error states
}
```

### `pages/streams.js`

```js
// streams.js
// Class stream management: list, create, edit, delete, view detail.

import { getStreams, createStream, updateStream, deleteStream } from '../api.js';
import { openModal, openConfirmDialog, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

export async function initStreams() {
  // 1. Load and render streams table
  // 2. "Add Stream" button → openModal with form (name, year)
  // 3. Edit button per row → openModal pre-filled
  // 4. Delete button per row → openConfirmDialog → deleteStream → refresh
  // 5. Row click → navigate to stream detail view (filtered students + subjects)
  // 6. Handle empty state if no streams exist
}

// Internal helpers (not exported):
function renderStreamsTable(streams) { ... }
function buildStreamForm(existing = null) { ... }  // Returns HTML string for the form
function validateStreamForm(data) { ... }           // Returns null or error message
```

### `pages/students.js`

```js
// students.js
// Student management: list all, filter by stream, register, edit, delete, view detail.

import { getStudents, getStudentsByStream, createStudent, updateStudent, deleteStudent, getStreams } from '../api.js';
import { openModal, openConfirmDialog, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { formatDate } from '../utils.js';

export async function initStudents() {
  // 1. Load streams for the filter dropdown and the "Assign to Stream" select in the form
  // 2. Load and render students table (name, admission no., stream, date registered, actions)
  // 3. Search input (debounced 300ms) filters table client-side by name or admission number
  // 4. Stream filter dropdown filters by stream_id
  // 5. "Register Student" button → openModal with form
  //    Fields: first_name, last_name, admission_number, date_of_birth, gender, stream_id
  // 6. Edit per row → openModal pre-filled
  // 7. Delete per row → openConfirmDialog → deleteStudent → refresh
  // 8. View per row → navigate to student detail panel (scores + results)
}

function renderStudentsTable(students) { ... }
function buildStudentForm(streams, existing = null) { ... }
function validateStudentForm(data) { ... }
```

### `pages/subjects.js`

```js
// subjects.js
// Subject management and stream assignment.

import { getSubjects, createSubject, updateSubject, deleteSubject, assignSubjectToStream, getStreams, getSubjectsByStream } from '../api.js';
import { openModal, openConfirmDialog, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';

export async function initSubjects() {
  // 1. Load and render subjects table (name, code, description, actions)
  // 2. "Add Subject" button → openModal with form (name, code, description)
  // 3. Edit per row → openModal pre-filled
  // 4. Delete per row → openConfirmDialog → deleteSubject → refresh
  // 5. "Assign to Stream" button per row → openModal with stream multiselect
  // 6. Stream filter: show subjects assigned to a selected stream
}

function renderSubjectsTable(subjects) { ... }
function buildSubjectForm(existing = null) { ... }
function validateSubjectForm(data) { ... }
```

### `pages/scores.js`

```js
// scores.js
// Score entry, editing, and per-student/per-class viewing.

import { getScores, createScore, updateScore, deleteScore, getStreams, getSubjectsByStream, getStudentsByStream } from '../api.js';
import { openModal, openConfirmDialog, closeModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { formatGrade } from '../utils.js';

export async function initScores() {
  // 1. Filter panel: select Stream → select Subject → load scores grid
  // 2. Scores grid: table of students in that stream with score columns (CA score, Exam score, Total)
  //    Each cell is editable inline OR via modal
  // 3. "Record Score" button → openModal with:
  //    Fields: student_id, subject_id, ca_score (0–40), exam_score (0–60), term, year
  // 4. Validation: ca_score max 40, exam_score max 60, total auto-calculated and displayed
  // 5. Duplicate prevention: if score already exists for student+subject+term+year, show error toast
  // 6. Edit existing score → openModal pre-filled
  // 7. Delete score → openConfirmDialog
  // 8. Grade badge displayed next to total using formatGrade()
}

function renderScoresTable(scores) { ... }
function buildScoreForm(streams, existing = null) { ... }
function validateScoreForm(data) { ... }
```

### `pages/results.js`

```js
// results.js
// Results, rankings, and report card PDF generation.

import { getStreamResults, getStudentResults, getReportCardPDF, getClassReportPDF } from '../api.js';
import { showToast } from '../components/toast.js';
import { formatGrade, ordinal } from '../utils.js';

export async function initResults() {
  // 1. Two tabs: "Class Results" and "Individual Student Results"
  //
  // --- Class Results tab ---
  // 2. Select Stream → load ranked results table
  //    Columns: Position, Student Name, Total Marks, Average, Grade, subject scores...
  // 3. Rows sorted by total marks descending, position calculated server-side
  // 4. Grade badges coloured by formatGrade()
  // 5. "Download Class Report PDF" button → opens getClassReportPDF(streamId) URL in new tab
  //
  // --- Individual Results tab ---
  // 6. Select Stream → then select Student within that stream
  // 7. Load student's per-subject table: Subject | CA | Exam | Total | Grade | Position in class
  // 8. Show summary card: Total Marks, Average Score, Overall Grade, Class Position
  // 9. "Download Report Card PDF" button → opens getReportCardPDF(studentId) URL in new tab
}

function renderClassResultsTable(results) { ... }
function renderStudentResultsCard(result) { ... }
```

---

## Page HTML Structure

Each `.html` file in `pages/` is a **partial** — it contains only the inner content, not a full HTML document. The shell (`index.html`) injects these into `#page-content`.

### `index.html` (full document shell)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ikonex Academy — Student Management</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/css/base.css" />
  <link rel="stylesheet" href="/assets/css/layout.css" />
  <link rel="stylesheet" href="/assets/css/components.css" />
  <link rel="stylesheet" href="/assets/css/responsive.css" />
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar" id="sidebar">
      <!-- Rendered by sidebar.js -->
    </aside>
    <div class="main-wrapper">
      <header class="topbar" id="topbar">
        <!-- Rendered by topbar.js -->
      </header>
      <main class="main-content" id="page-content">
        <!-- Page partials injected here by router.js -->
      </main>
    </div>
  </div>
  <div class="modal-overlay" id="modal-overlay">
    <div class="modal" id="modal">
      <div class="modal__header">
        <h3 class="modal__title" id="modal-title"></h3>
        <button class="modal__close" id="modal-close">&times;</button>
      </div>
      <div class="modal__body" id="modal-body"></div>
      <div class="modal__footer">
        <button class="btn btn--ghost" id="modal-cancel">Cancel</button>
        <button class="btn btn--primary" id="modal-confirm">Save</button>
      </div>
    </div>
  </div>
  <div class="toast-container" id="toast-container"></div>
  <script type="module" src="/assets/js/components/sidebar.js"></script>
  <script type="module" src="/assets/js/components/topbar.js"></script>
  <script type="module" src="/assets/js/router.js"></script>
</body>
</html>
```

### Example: `pages/dashboard.html`

```html
<!-- Dashboard page partial. Injected into #page-content by router.js -->
<!-- Logic is handled entirely by assets/js/pages/dashboard.js -->

<section class="page-section">
  <div class="stats-grid" id="stats-grid">
    <!-- Populated by dashboard.js -->
    <div class="stat-card skeleton"></div>
    <div class="stat-card skeleton"></div>
    <div class="stat-card skeleton"></div>
    <div class="stat-card skeleton"></div>
  </div>
  <div class="card" style="margin-top: 24px;">
    <div class="card__header">
      <h2 class="card__title">Top Performers</h2>
    </div>
    <div id="top-performers-container">
      <!-- Populated by dashboard.js -->
    </div>
  </div>
</section>
```

Each page partial follows the same pattern: semantic HTML containers with IDs, no inline styles, no inline scripts, no hardcoded data.

---

## Dashboard Page Design

The dashboard shows 4 stat cards in a 2×2 grid (or 4-column on desktop):

| Card | Icon | Accent colour |
|------|------|---------------|
| Total Students | 👨‍🎓 | `--color-accent` |
| Total Streams | 🏫 | `#7C3AED` |
| Total Subjects | 📚 | `#0EA5E9` |
| Average Score | 📊 | `--color-success` |

Below: "Top Performers" table (top 5 students by average, columns: Rank, Name, Stream, Average, Grade badge).

---

## Sidebar Navigation Items

```
🏠  Dashboard          /
🏫  Class Streams      /streams
👨‍🎓  Students          /students
📚  Subjects           /subjects
📝  Scores             /scores
📊  Results            /results
```

---

## Error and Loading States

Every page JS must handle three states before rendering:

1. **Loading**: show skeleton loaders (`.skeleton` CSS class with animated shimmer) while fetch is in-flight
2. **Error**: catch API errors, call `showToast(error.message, 'error')`, show `.empty-state` in the table area
3. **Empty**: if API returns an empty array, render `.empty-state` with a helpful message and a primary CTA button

---

## Grading Scale

Apply this consistently via `formatGrade()` in `utils.js`:

| Score Range | Grade | Badge Class |
|-------------|-------|-------------|
| 70 – 100 | A | `badge--success` |
| 60 – 69  | B | `badge--info` |
| 50 – 59  | C | `badge--warning` |
| 40 – 49  | D | `badge--warning` |
| 0 – 39   | F | `badge--danger` |

---

## PDF Report Download

Do not attempt to generate PDFs in the frontend. The backend returns a PDF stream at:
- `GET /api/reports/student/:id/pdf`
- `GET /api/reports/stream/:id/pdf`

Open these URLs in a new browser tab:
```js
window.open(getReportCardPDF(studentId), '_blank');
```

---

## Code Quality Rules

- Every JS file must have a one-line comment at the top describing its purpose
- Every exported function must have a JSDoc comment with `@param` and `@returns`
- No `var`. Use `const` by default, `let` only when the value changes
- No `innerHTML` manipulation inside loop callbacks — build HTML strings outside then set once
- No magic numbers — define as named constants at the top of the file
- No `console.log` left in production code — use `console.warn` or `console.error` for real issues only
- All async functions must be wrapped in `try/catch`
- Form validation runs client-side before any API call is made

---

## Deployment Notes

- The frontend is static files — deploy to **Vercel**, **Netlify**, or serve via Nginx on VPS
- Set `BASE_URL` in `api.js` to the production backend URL before deploying
- If deploying to Netlify/Vercel, add a `_redirects` or `vercel.json` file to handle SPA routing (all routes → `index.html`)
- No build step required — plain HTML/CSS/JS, no bundler needed
