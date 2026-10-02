const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/authController');
const { loginBody, registerBody } = require('../validation/schemas');

const router = express.Router();

router.post('/login', validate(loginBody), asyncHandler(controller.login));
router.post('/register', validate(registerBody), asyncHandler(controller.register));
router.get('/me', requireAuth, asyncHandler(controller.me));

module.exports = router;
