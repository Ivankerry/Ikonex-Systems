// subjects.controller.js
// HTTP layer for subject operations. Delegates business logic to subjects.service.js.

const service = require('../services/subjects.service');
const { success, created, noContent } = require('../utils/apiResponse');

exports.getAll = async (req, res, next) => {
  try {
    const subjects = await service.getAllSubjects();
    success(res, subjects);
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const subject = await service.getSubjectById(Number(req.params.id));
    if (!subject) return next(Object.assign(new Error('Subject not found'), { statusCode: 404 }));
    success(res, subject);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const subject = await service.createSubject(req.body);
    created(res, subject);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const subject = await service.updateSubject(Number(req.params.id), req.body);
    if (!subject) return next(Object.assign(new Error('Subject not found'), { statusCode: 404 }));
    success(res, subject);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteSubject(Number(req.params.id));
    noContent(res);
  } catch (err) { next(err); }
};
