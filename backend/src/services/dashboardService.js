const prisma = require('../config/prisma');

async function getDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalPatients, appointmentsToday, pendingAppointments, confirmedAppointments, cancelledAppointments] = await Promise.all([
    prisma.patient.count(),
    prisma.appointment.count({ where: { appointmentDate: { gte: today, lt: tomorrow } } }),
    prisma.appointment.count({ where: { status: 'pending' } }),
    prisma.appointment.count({ where: { status: 'confirmed' } }),
    prisma.appointment.count({ where: { status: 'cancelled' } }),
  ]);

  return {
    totalPatients,
    appointmentsToday,
    appointmentsByStatus: {
      pending: pendingAppointments,
      confirmed: confirmedAppointments,
      cancelled: cancelledAppointments,
    },
  };
}

module.exports = { getDashboard };
