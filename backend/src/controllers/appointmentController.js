const appointmentService = require('../services/appointmentService');

async function list(req, res) {
  res.json(await appointmentService.listAppointments(req.query));
}

async function create(req, res) {
  const appointment = await appointmentService.createAppointment(req.body, req.user.id);
  res.status(201).json({ data: appointment });
}

async function updateStatus(req, res) {
  const appointment = await appointmentService.updateAppointmentStatus(
    Number(req.params.id),
    req.body.status,
  );
  res.json({ data: appointment });
}

module.exports = { list, create, updateStatus };
