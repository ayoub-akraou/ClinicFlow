const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/dashboardController');

const router = express.Router();

router.get('/', requireAuth, asyncHandler(controller.get));

module.exports = router;
