const { Prisma } = require('@prisma/client');
const prisma = require('../config/prisma');
const appError = require('../utils/appError');
const { paginationFromQuery, paginationResult } = require('../utils/pagination');

function getDateRange(dateText) {
  if (!dateText) return null;
  const [year, month, day] = dateText.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  const end = new Date(year, month - 1, day + 1);
  return { gte: start, lt: end };
}

async function ensureNoConfirmedConflict(db, patientId, appointmentDate, excludeId) {
  const halfHour = 30 * 60 * 1000;
  const conflict = await db.appointment.findFirst({
    where: {
      patientId,
      status: 'confirmed',
      appointmentDate: {
        gt: new Date(appointmentDate.getTime() - halfHour),
        lt: new Date(appointmentDate.getTime() + halfHour),
      },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });

  if (conflict) {
    throw appError(409, 'Ce patient a déjà un rendez-vous confirmé dans cette fenêtre de 30 minutes.');
  }
}

async function withConflictRetry(action) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(action, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (error.code !== 'P2034' || attempt === 2) throw error;
    }
  }
}

async function listAppointments(query) {
  const { page, limit, skip } = paginationFromQuery(query);
  const where = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.date ? { appointmentDate: getDateRange(query.date) } : {}),
  };

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: [{ appointmentDate: 'asc' }, { id: 'asc' }],
      skip,
      take: limit,
      include: {
        patient: { select: { id: true, fullName: true, cin: true, phone: true } },
        creator: { select: { id: true, fullName: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return { data: appointments, pagination: paginationResult(page, limit, total) };
}

async function createAppointment(input, userId) {
  return withConflictRetry(async (tx) => {
    if (input.status === 'confirmed') {
      await ensureNoConfirmedConflict(tx, input.patientId, input.appointmentDate);
    }
    return tx.appointment.create({
      data: {
        patientId: input.patientId,
        createdBy: userId,
        appointmentDate: input.appointmentDate,
        status: input.status || 'pending',
        reason: input.reason,
        notes: input.notes ?? null,
      },
      include: { patient: { select: { id: true, fullName: true, cin: true } } },
    });
  });
}

async function updateAppointmentStatus(id, status) {
  return withConflictRetry(async (tx) => {
    const appointment = await tx.appointment.findUnique({ where: { id } });
    if (!appointment) throw appError(404, 'Rendez-vous introuvable.');

    if (status === 'confirmed') {
      await ensureNoConfirmedConflict(tx, appointment.patientId, appointment.appointmentDate, id);
    }

    return tx.appointment.update({
      where: { id },
      data: { status },
      include: { patient: { select: { id: true, fullName: true, cin: true } } },
    });
  });
}

module.exports = { listAppointments, createAppointment, updateAppointmentStatus };
