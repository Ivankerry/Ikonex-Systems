// students.controller.js
// HTTP layer for student operations. Delegates business logic to students.service.js.

const service = require('../services/students.service');
const { success, created, noContent } = require('../utils/apiResponse');

exports.getAll = async (req, res, next) => {
  try {
    const students = await service.getAllStudents(req.query);
    success(res, students);
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const student = await service.getStudentById(Number(req.params.id));
    if (!student) return next(Object.assign(new Error('Student not found'), { statusCode: 404 }));
    success(res, student);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const student = await service.createStudent(req.body);
    created(res, student);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const student = await service.updateStudent(Number(req.params.id), req.body);
    if (!student) return next(Object.assign(new Error('Student not found'), { statusCode: 404 }));
    success(res, student);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteStudent(Number(req.params.id));
    noContent(res);
  } catch (err) { next(err); }
};
