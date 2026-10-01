const prisma = require('../config/prisma');
const appError = require('../utils/appError');
const { paginationFromQuery, paginationResult } = require('../utils/pagination');

async function listPatients(query) {
  const { page, limit, skip } = paginationFromQuery(query);
  const search = query.search?.trim();
  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { cin: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: [{ fullName: 'asc' }, { id: 'asc' }],
      skip,
      take: limit,
    }),
    prisma.patient.count({ where }),
  ]);

  return { data: patients, pagination: paginationResult(page, limit, total) };
}

async function getPatient(id) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: { appointmentDate: 'desc' },
        include: { creator: { select: { id: true, fullName: true } } },
      },
    },
  });
  if (!patient) throw appError(404, 'Patient introuvable.');
  return patient;
}

function patientFields(input) {
  return {
    fullName: input.fullName,
    cin: input.cin,
    phone: input.phone,
    birthDate: input.birthDate,
    address: input.address ?? null,
  };
}

async function createPatient(input) {
  return prisma.patient.create({ data: patientFields(input) });
}

async function updatePatient(id, input) {
  const data = {};
  for (const field of ['fullName', 'cin', 'phone', 'birthDate', 'address']) {
    if (Object.hasOwn(input, field)) data[field] = input[field];
  }
  return prisma.patient.update({ where: { id }, data });
}

async function deletePatient(id) {
  return prisma.patient.delete({ where: { id } });
}

module.exports = { listPatients, getPatient, createPatient, updatePatient, deletePatient };
