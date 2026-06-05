// reports.controller.js
// Streams PDF directly to the response - does NOT return JSON.

const reportsService = require('../services/reports.service');

exports.studentReportCard = async (req, res, next) => {
  try {
    const { term, year } = req.query;
    if (!term || !year) {
      return next(Object.assign(new Error('term and year query params are required'), { statusCode: 400 }));
    }
    await reportsService.generateStudentReportCard(Number(req.params.id), term, Number(year), res);
  } catch (err) { next(err); }
};

exports.classReport = async (req, res, next) => {
  try {
    const { term, year } = req.query;
    if (!term || !year) {
      return next(Object.assign(new Error('term and year query params are required'), { statusCode: 400 }));
    }
    await reportsService.generateClassReport(Number(req.params.id), term, Number(year), res);
  } catch (err) { next(err); }
};
