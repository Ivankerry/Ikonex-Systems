// streams.controller.js
// HTTP layer for stream management. No business logic — delegates to streams.service.js.

const service    = require('../services/streams.service');
const { success, created, noContent } = require('../utils/apiResponse');

exports.getAll = async (req, res, next) => {
  try {
    const streams = await service.getAllStreams();
    success(res, streams);
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const stream = await service.getStreamById(Number(req.params.id));
    if (!stream) return next(Object.assign(new Error('Stream not found'), { statusCode: 404 }));
    success(res, stream);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const stream = await service.createStream(req.body);
    created(res, stream);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const stream = await service.updateStream(Number(req.params.id), req.body);
    if (!stream) return next(Object.assign(new Error('Stream not found'), { statusCode: 404 }));
    success(res, stream);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await service.deleteStream(Number(req.params.id));
    noContent(res);
  } catch (err) { next(err); }
};

exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await service.getStreamSubjects(Number(req.params.id));
    success(res, subjects);
  } catch (err) { next(err); }
};

exports.assignSubject = async (req, res, next) => {
  try {
    await service.assignSubjectToStream(req.body);
    success(res, { message: 'Subject assigned to stream' });
  } catch (err) { next(err); }
};
