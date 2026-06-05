let BASE_URL = 'http://localhost:5000/api'; // Default fallback

// Asynchronously load the API base URL from the git-ignored config.json
async function loadConfig() {
  try {
    const res = await fetch('/config.json');
    if (res.ok) {
      const config = await res.json();
      if (config.api_url) {
        BASE_URL = config.api_url;
      }
    }
  } catch (err) {
    // Falls back silently to default localhost URL
  }
}

// Kick off config loading immediately on file load
const configPromise = loadConfig();

// ---- Generic request helper ----
async function request(method, path, body = null) {
  // Wait for config loading promise to complete
  await configPromise;

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
export const getStudentResults   = (studentId, filters = {}) => request('GET', `/results/student/${studentId}?${new URLSearchParams(filters)}`);
export const getStreamResults    = (streamId, filters = {})  => request('GET', `/results/stream/${streamId}?${new URLSearchParams(filters)}`);
export const getReportCardPDF    = (studentId, filters = {}) => `${BASE_URL}/reports/student/${studentId}/pdf?${new URLSearchParams(filters)}`;
export const getClassReportPDF   = (streamId, filters = {})  => `${BASE_URL}/reports/stream/${streamId}/pdf?${new URLSearchParams(filters)}`;

// ---- Dashboard ----
export const getDashboardStats   = ()          => request('GET', '/dashboard/stats');
