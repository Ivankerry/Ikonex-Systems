// reports.service.js
// PDF report generation for individual student report cards and class performance reports.
// Uses pdfkit for PDF creation.

const PDFDocument = require('pdfkit');
const resultsService  = require('./results.service');
const studentQueries  = require('../db/queries/students.queries');
const streamQueries   = require('../db/queries/streams.queries');
const { GRADE_SCALE } = require('../utils/gradingScale');

/**
 * Generate a PDF report card for a single student.
 * Writes the PDF to the provided writable stream (res object from Express).
 *
 * @param {number} studentId
 * @param {string} term
 * @param {number} year
 * @param {object} res - Express response object (writable stream)
 */
exports.generateStudentReportCard = async (studentId, term, year, res) => {
  const student = await studentQueries.findById(studentId);
  if (!student) throw Object.assign(new Error('Student not found'), { statusCode: 404 });

  const stream  = await streamQueries.findById(student.stream_id);
  const result  = await resultsService.getStudentResults(studentId, term, year);

  // Get class position by running full stream results
  const streamResults = await resultsService.getStreamResults(student.stream_id, term, year);
  const studentRank   = streamResults.find(r => r.student_id === studentId);

  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Pipe PDF to response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="report_card_${student.admission_number}.pdf"`);
  doc.pipe(res);

  // --- PDF Layout ---
  // Header: School name, term, year
  doc.fontSize(20).font('Helvetica-Bold').text('IKONEX ACADEMY', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(`Student Report Card - ${term} ${year}`, { align: 'center' });
  doc.moveDown();

  // Student details box
  doc.fontSize(11).text(`Name:             ${student.first_name} ${student.last_name}`);
  doc.text(`Admission No.:    ${student.admission_number}`);
  doc.text(`Class Stream:     ${stream?.name || 'N/A'}`);
  doc.text(`Class Position:   ${studentRank?.position ?? 'N/A'} of ${streamResults.length}`);
  doc.moveDown();

  // Scores table header
  const cols = { subject: 50, ca: 280, exam: 340, total: 400, grade: 460 };
  doc.font('Helvetica-Bold').text('Subject',    cols.subject, doc.y);
  doc.text('CA (40)',   cols.ca,      doc.y);
  doc.text('Exam (60)', cols.exam,    doc.y);
  doc.text('Total',     cols.total,   doc.y);
  doc.text('Grade',     cols.grade,   doc.y);
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Score rows
  doc.font('Helvetica');
  for (const score of result.scores) {
    doc.text(score.subject_name,              cols.subject, doc.y, { width: 220 });
    doc.text(String(score.ca_score),          cols.ca,      doc.y);
    doc.text(String(score.exam_score),        cols.exam,    doc.y);
    doc.text(String(score.total_score),       cols.total,   doc.y);
    doc.text(result.grade,                    cols.grade,   doc.y);
    doc.moveDown(0.5);
  }

  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // Summary
  doc.font('Helvetica-Bold').text(`Total Marks: ${result.total_marks}`);
  doc.text(`Average Score: ${result.average}`);
  doc.text(`Overall Grade: ${result.grade} - ${result.grade_label}`);

  // Grading scale reference
  doc.moveDown(2);
  doc.font('Helvetica').fontSize(9).text('Grading Scale:', { underline: true });
  for (const g of GRADE_SCALE) {
    doc.text(`${g.grade}: ${g.min} – ${g.max} (${g.label})`);
  }

  doc.end();
};

/**
 * Generate a PDF class performance report for a stream.
 *
 * @param {number} streamId
 * @param {string} term
 * @param {number} year
 * @param {object} res - Express response object
 */
exports.generateClassReport = async (streamId, term, year, res) => {
  const stream  = await streamQueries.findById(streamId);
  if (!stream) throw Object.assign(new Error('Stream not found'), { statusCode: 404 });

  const results = await resultsService.getStreamResults(streamId, term, year);

  const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="class_report_${stream.name.replace(/\s/g,'_')}.pdf"`);
  doc.pipe(res);

  // Header
  doc.fontSize(18).font('Helvetica-Bold').text('IKONEX ACADEMY', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(`Class Performance Report - ${stream.name} | ${term} ${year}`, { align: 'center' });
  doc.moveDown();

  // Ranked table
  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Pos', 50);  doc.text('Student', 90); doc.text('Adm. No.', 260);
  doc.text('Total', 340); doc.text('Average', 400); doc.text('Grade', 460);
  doc.moveDown(0.3);
  doc.moveTo(50, doc.y).lineTo(760, doc.y).stroke();
  doc.moveDown(0.3);

  doc.font('Helvetica').fontSize(10);
  for (const r of results) {
    doc.text(String(r.position),     50);
    doc.text(r.name,                 90,  doc.y, { width: 160 });
    doc.text(r.admission_no,         260, doc.y);
    doc.text(String(r.total_marks),  340, doc.y);
    doc.text(String(r.average),      400, doc.y);
    doc.text(r.grade,                460, doc.y);
    doc.moveDown(0.5);
  }

  doc.end();
};
