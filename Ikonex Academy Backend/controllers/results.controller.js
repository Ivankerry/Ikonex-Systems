// results.controller.js
// HTTP layer for result computation.

const service = require('../services/results.service');
const { success } = require('../utils/apiResponse');

exports.getStudentResults = async (req, res, next) => {
  try {
    const { term, year } = req.query;
    if (!term || !year) {
      return next(Object.assign(new Error('term and year query params are required'), { statusCode: 400 }));
    }
    const results = await service.getStudentResults(Number(req.params.id), term, Number(year));
    success(res, results);
  } catch (err) { next(err); }
};

exports.getStreamResults = async (req, res, next) => {
  try {
    const { term, year } = req.query;
    if (!term || !year) {
      return next(Object.assign(new Error('term and year query params are required'), { statusCode: 400 }));
    }
    const results = await service.getStreamResults(Number(req.params.id), term, Number(year));
    success(res, results);
  } catch (err) { next(err); }
};
