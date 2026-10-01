const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { requireAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const controller = require('../controllers/patientController');
const {
  idParams,
  patientBody,
  patientUpdateBody,
  patientListQuery,
} = require('../validation/schemas');

const router = express.Router();

router.use(requireAuth);
router.get('/', validate(patientListQuery, 'query'), asyncHandler(controller.list));
router.post('/', validate(patientBody), asyncHandler(controller.create));
router.get('/:id', validate(idParams, 'params'), asyncHandler(controller.getOne));
router.patch('/:id', validate(idParams, 'params'), validate(patientUpdateBody), asyncHandler(controller.update));
router.delete('/:id', requireRole('admin'), validate(idParams, 'params'), asyncHandler(controller.remove));

module.exports = router;
