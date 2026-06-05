// scores.controller.js
// HTTP layer for score operations. Duplicate checking is handled by scores.service.js.

const service  = require('../services/scores.service');
const { success, created, noContent } = require('../utils/apiResponse');

exports.getAll = async (req, res, next) => {
  try {
    const scores = await service.getScores(req.query);
    success(res, scores);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const score = await service.createScore(req.body);
    created(res, score);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const score = await service.updateScore(Number(req.params.id), req.body);
    if (!score) return next(Object.assign(new Error('Score not found'), { statusCode: 404 }));
    success(res, score);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteScore(Number(req.params.id));
    noContent(res);
  } catch (err) { next(err); }
};
