const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/patients', require('./patientRoutes'));
router.use('/appointments', require('./appointmentRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));

module.exports = router;
