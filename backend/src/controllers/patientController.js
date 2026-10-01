const patientService = require('../services/patientService');

async function list(req, res) {
  res.json(await patientService.listPatients(req.query));
}

async function getOne(req, res) {
  res.json({ data: await patientService.getPatient(Number(req.params.id)) });
}

async function create(req, res) {
  const patient = await patientService.createPatient(req.body);
  res.status(201).json({ data: patient });
}

async function update(req, res) {
  const patient = await patientService.updatePatient(Number(req.params.id), req.body);
  res.json({ data: patient });
}

async function remove(req, res) {
  await patientService.deletePatient(Number(req.params.id));
  res.status(204).send();
}

module.exports = { list, getOne, create, update, remove };
