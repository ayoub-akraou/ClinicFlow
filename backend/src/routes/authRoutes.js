const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/authController');
const { loginBody } = require('../validation/schemas');

const router = express.Router();

router.post('/login', validate(loginBody), asyncHandler(controller.login));
router.get('/me', requireAuth, asyncHandler(controller.me));

module.exports = router;
