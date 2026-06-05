// dashboard.controller.js
// HTTP layer for dashboard summary statistics.

const service = require('../services/dashboard.service');
const { success } = require('../utils/apiResponse');

exports.getStats = async (req, res, next) => {
  try {
    const stats = await service.getDashboardStats();
    success(res, stats);
  } catch (err) { next(err); }
};
