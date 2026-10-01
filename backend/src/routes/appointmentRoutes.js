const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/appointmentController');
const {
  idParams,
  appointmentListQuery,
  appointmentBody,
  appointmentStatusBody,
} = require('../validation/schemas');

const router = express.Router();

router.use(requireAuth);
router.get('/', validate(appointmentListQuery, 'query'), asyncHandler(controller.list));
router.post('/', validate(appointmentBody), asyncHandler(controller.create));
router.patch('/:id/status', validate(idParams, 'params'), validate(appointmentStatusBody), asyncHandler(controller.updateStatus));

module.exports = router;
