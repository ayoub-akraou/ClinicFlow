const dashboardService = require('../services/dashboardService');

async function get(req, res) {
  res.json({ data: await dashboardService.getDashboard() });
}

module.exports = { get };
