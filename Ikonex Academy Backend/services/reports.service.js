// reports.service.js
// PDF report generation for individual student report cards and class performance reports.
// Uses pdfkit for PDF creation with premium layout design.

const PDFDocument = require('pdfkit');
const resultsService  = require('./results.service');
const studentQueries  = require('../db/queries/students.queries');
const streamQueries   = require('../db/queries/streams.queries');
const { GRADE_SCALE } = require('../utils/gradingScale');

/**
 * Helper to format date nicely
 */
function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

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

  // --- Theme Colors ---
  const primaryColor   = '#1e3a8a'; // Navy Blue
  const secondaryColor = '#0f172a'; // Slate / Dark Gray
  const textColor      = '#334155'; // Muted Slate
  const borderLight    = '#cbd5e1'; // Medium/Light gray
  const bgLight        = '#f8fafc'; // Background Light Tint

  // --- PDF Header ---
  doc.fontSize(24).font('Helvetica-Bold').fillColor(primaryColor).text('IKONEX ACADEMY', { align: 'center' });
  doc.fontSize(9).font('Helvetica-Oblique').fillColor(textColor).text('Student Management & Academic Records', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(13).font('Helvetica-Bold').fillColor(secondaryColor).text(`STUDENT REPORT CARD - ${term.toUpperCase()} ${year}`, { align: 'center' });
  doc.moveDown(0.5);
  doc.moveTo(50, 110).lineTo(545, 110).lineWidth(1.5).strokeColor(primaryColor).stroke();

  // --- Student Information Card Box ---
  const infoBoxY = 122;
  const infoBoxHeight = 84;
  doc.roundedRect(50, infoBoxY, 495, infoBoxHeight, 4)
     .fillColor(bgLight)
     .strokeColor(borderLight)
     .lineWidth(1)
     .fillAndStroke();

  // Draw values
  doc.fillColor(textColor).font('Helvetica').fontSize(10);
  
  // Left Column
  doc.font('Helvetica-Bold').text('Student Name:', 65, infoBoxY + 12)
     .font('Helvetica').text(`${student.first_name} ${student.last_name}`, 155, infoBoxY + 12);
  doc.font('Helvetica-Bold').text('Admission No:', 65, infoBoxY + 34)
     .font('Helvetica').text(student.admission_number, 155, infoBoxY + 34);
  doc.font('Helvetica-Bold').text('Date of Birth:', 65, infoBoxY + 56)
     .font('Helvetica').text(formatDate(student.date_of_birth), 155, infoBoxY + 56);

  // Right Column
  doc.font('Helvetica-Bold').text('Class Stream:', 310, infoBoxY + 12)
     .font('Helvetica').text(stream?.name || 'N/A', 400, infoBoxY + 12);
  doc.font('Helvetica-Bold').text('Class Position:', 310, infoBoxY + 34)
     .font('Helvetica').text(`${studentRank?.position ?? 'N/A'} of ${streamResults.length}`, 400, infoBoxY + 34);
  doc.font('Helvetica-Bold').text('Gender:', 310, infoBoxY + 56)
     .font('Helvetica').text(student.gender || 'N/A', 400, infoBoxY + 56);

  // --- Academic Performance Table ---
  const tableHeaderY = 222;
  doc.rect(50, tableHeaderY, 495, 24).fillColor(primaryColor).fill();

  // Header Titles
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9.5);
  doc.text('Academic Subject', 65, tableHeaderY + 7);
  doc.text('CA (40)', 260, tableHeaderY + 7, { width: 70, align: 'right' });
  doc.text('Exam (60)', 340, tableHeaderY + 7, { width: 70, align: 'right' });
  doc.text('Total (100)', 420, tableHeaderY + 7, { width: 70, align: 'right' });
  doc.text('Grade', 500, tableHeaderY + 7, { width: 35, align: 'center' });

  // Table rows
  let currentY = tableHeaderY + 24;
  const rowHeight = 22;
  
  for (let i = 0; i < result.scores.length; i++) {
    const score = result.scores[i];
    
    // Alternating Row Fills
    if (i % 2 === 0) {
      doc.rect(50, currentY, 495, rowHeight).fillColor(bgLight).fill();
    }
    
    doc.fillColor(textColor).font('Helvetica').fontSize(9.5);
    doc.text(score.subject_name, 65, currentY + 6, { width: 180, truncate: true });
    doc.text(String(score.ca_score), 260, currentY + 6, { width: 70, align: 'right' });
    doc.text(String(score.exam_score), 340, currentY + 6, { width: 70, align: 'right' });
    
    // Bold Total Score
    doc.font('Helvetica-Bold').fillColor(secondaryColor);
    doc.text(String(score.total_score), 420, currentY + 6, { width: 70, align: 'right' });

    // Determine color coding for grade
    let gradeLetter = 'F';
    let gradeColor = '#dc2626'; // Red
    const totScore = Number(score.total_score);

    for (const g of GRADE_SCALE) {
      if (totScore >= g.min && totScore <= g.max) {
        gradeLetter = g.grade;
        if (g.grade === 'A' || g.grade === 'B') gradeColor = '#16a34a'; // Green
        else if (g.grade === 'C') gradeColor = '#ca8a04'; // Dark Yellow
        else if (g.grade === 'D') gradeColor = '#ea580c'; // Orange
        else gradeColor = '#dc2626'; // Red
        break;
      }
    }

    doc.fillColor(gradeColor).font('Helvetica-Bold');
    doc.text(gradeLetter, 500, currentY + 6, { width: 35, align: 'center' });

    // Row separator line
    doc.moveTo(50, currentY + rowHeight).lineTo(545, currentY + rowHeight)
       .lineWidth(0.5).strokeColor('#e2e8f0').stroke();

    currentY += rowHeight;
  }

  // --- Summary Card ---
  currentY += 14;
  doc.roundedRect(50, currentY, 495, 48, 4)
     .fillColor('#eff6ff')
     .strokeColor('#bfdbfe')
     .lineWidth(1)
     .fillAndStroke();

  doc.fillColor('#1e40af').font('Helvetica-Bold').fontSize(10.5);
  doc.text(`Total Marks: ${result.total_marks.toFixed(2)}`, 68, currentY + 18);
  doc.text(`Average: ${result.average.toFixed(2)}%`, 220, currentY + 18);
  doc.text(`Overall Grade: ${result.grade} (${result.grade_label})`, 368, currentY + 18);

  // --- Grading Scale Grid Line ---
  currentY += 76;
  doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(8.5).text('GRADING SCALE REFERENCE', 50, currentY, { underline: true });
  doc.moveDown(0.3);
  const scaleText = GRADE_SCALE.map(g => `${g.grade}: ${g.min}-${g.max} (${g.label})`).join('  |  ');
  doc.font('Helvetica').fontSize(8).text(scaleText, 50, doc.y);

  // --- Signatures Footer ---
  const signaturesY = 705;
  doc.moveTo(80, signaturesY).lineTo(220, signaturesY).lineWidth(0.75).strokeColor(borderLight).stroke();
  doc.moveTo(375, signaturesY).lineTo(515, signaturesY).lineWidth(0.75).strokeColor(borderLight).stroke();
  
  doc.fillColor('#64748b').font('Helvetica').fontSize(8.5);
  doc.text("Class Teacher's Signature", 80, signaturesY + 7, { width: 140, align: 'center' });
  doc.text("Principal's Signature & Stamp", 375, signaturesY + 7, { width: 140, align: 'center' });

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

  // --- Theme Colors ---
  const primaryColor   = '#1e3a8a'; // Navy Blue
  const secondaryColor = '#0f172a'; // Slate / Dark Gray
  const textColor      = '#334155'; // Muted Slate
  const borderLight    = '#cbd5e1'; // Medium/Light gray
  const bgLight        = '#f8fafc'; // Background Light Tint

  // --- PDF Header ---
  doc.fontSize(22).font('Helvetica-Bold').fillColor(primaryColor).text('IKONEX ACADEMY', { align: 'center' });
  doc.fontSize(12).font('Helvetica-Bold').fillColor(secondaryColor).text('CLASS PERFORMANCE SUMMARY REPORT', { align: 'center' });
  doc.moveDown(0.2);
  doc.fontSize(9.5).font('Helvetica').fillColor(textColor)
     .text(`Class Stream: ${stream.name}   |   Term: ${term}   |   Academic Year: ${year}   |   Generated: ${formatDate(new Date())}`, { align: 'center' });
  doc.moveDown(0.4);
  doc.moveTo(50, 106).lineTo(792, 106).lineWidth(1.5).strokeColor(primaryColor).stroke();

  // --- Table Header ---
  let tableHeaderY = 120;
  doc.rect(50, tableHeaderY, 742, 24).fillColor(primaryColor).fill();

  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9.5);
  doc.text('Rank', 60, tableHeaderY + 7, { width: 40, align: 'center' });
  doc.text('Student Name', 110, tableHeaderY + 7);
  doc.text('Admission Number', 320, tableHeaderY + 7, { width: 120, align: 'center' });
  doc.text('Total Marks', 460, tableHeaderY + 7, { width: 90, align: 'right' });
  doc.text('Average (%)', 570, tableHeaderY + 7, { width: 90, align: 'right' });
  doc.text('Grade', 680, tableHeaderY + 7, { width: 90, align: 'center' });

  let currentY = tableHeaderY + 24;
  const rowHeight = 22;

  // Print records
  for (let i = 0; i < results.length; i++) {
    const r = results[i];

    // Paging logic: Page Height is 595. Check if row overflows bottom margin space (520)
    if (currentY + rowHeight > 520) {
      doc.addPage();
      
      // Top header band on continuation page
      doc.fontSize(9).fillColor(textColor).font('Helvetica-Bold')
         .text(`Class Performance Summary Report - ${stream.name} (Continued)`, 50, 32);
      doc.moveTo(50, 44).lineTo(792, 44).lineWidth(0.75).strokeColor(borderLight).stroke();
      
      currentY = 54;
      doc.rect(50, currentY, 742, 24).fillColor(primaryColor).fill();

      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9.5);
      doc.text('Rank', 60, currentY + 7, { width: 40, align: 'center' });
      doc.text('Student Name', 110, currentY + 7);
      doc.text('Admission Number', 320, currentY + 7, { width: 120, align: 'center' });
      doc.text('Total Marks', 460, currentY + 7, { width: 90, align: 'right' });
      doc.text('Average (%)', 570, currentY + 7, { width: 90, align: 'right' });
      doc.text('Grade', 680, currentY + 7, { width: 90, align: 'center' });

      currentY += 24;
    }

    // Alternating Row Fills
    if (i % 2 === 0) {
      doc.rect(50, currentY, 742, rowHeight).fillColor(bgLight).fill();
    }

    // Format top ranks beautifully
    let fontColor = textColor;
    let fontStyle = 'Helvetica';
    
    if (r.position === 1) { fontColor = '#d97706'; fontStyle = 'Helvetica-Bold'; }      // Gold
    else if (r.position === 2) { fontColor = '#475569'; fontStyle = 'Helvetica-Bold'; } // Silver
    else if (r.position === 3) { fontColor = '#b45309'; fontStyle = 'Helvetica-Bold'; } // Bronze

    doc.fillColor(fontColor).font(fontStyle).fontSize(9.5);
    doc.text(String(r.position), 60, currentY + 6, { width: 40, align: 'center' });
    
    doc.fillColor(textColor).font('Helvetica');
    doc.text(r.name, 110, currentY + 6, { width: 200, truncate: true });
    doc.text(r.admission_no, 320, currentY + 6, { width: 120, align: 'center' });
    doc.text(r.total_marks.toFixed(2), 460, currentY + 6, { width: 90, align: 'right' });
    doc.text(r.average.toFixed(2) + '%', 570, currentY + 6, { width: 90, align: 'right' });

    // Color code grade
    let gradeColor = '#dc2626';
    if (r.grade === 'A' || r.grade === 'B') gradeColor = '#16a34a';
    else if (r.grade === 'C') gradeColor = '#ca8a04';
    else if (r.grade === 'D') gradeColor = '#ea580c';

    doc.fillColor(gradeColor).font('Helvetica-Bold');
    doc.text(r.grade, 680, currentY + 6, { width: 90, align: 'center' });

    // Divider line
    doc.moveTo(50, currentY + rowHeight).lineTo(792, currentY + rowHeight)
       .lineWidth(0.5).strokeColor('#e2e8f0').stroke();

    currentY += rowHeight;
  }

  doc.end();
};
