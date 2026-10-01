require('dotenv').config();

const bcrypt = require('bcryptjs');
const prisma = require('../src/config/prisma');

const demoPassword = 'ClinicFlow123!';

async function main() {
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  const users = [
    { fullName: 'Clinic Administrator', email: 'admin@clinicflow.local', role: 'admin' },
    { fullName: 'Clinic Staff One', email: 'staff1@clinicflow.local', role: 'staff' },
    { fullName: 'Clinic Staff Two', email: 'staff2@clinicflow.local', role: 'staff' },
  ];

  const savedUsers = [];
  for (const user of users) {
    savedUsers.push(await prisma.user.upsert({
      where: { email: user.email },
      update: { fullName: user.fullName, role: user.role, passwordHash },
      create: { ...user, passwordHash },
    }));
  }

  const patientRecords = [
    { fullName: 'Amine Example', cin: 'CF100001', phone: '+212600000001', birthDate: new Date('1990-04-12'), address: 'Rabat' },
    { fullName: 'Salma Example', cin: 'CF100002', phone: '+212600000002', birthDate: new Date('1987-09-23'), address: 'Sale' },
    { fullName: 'Youssef Example', cin: 'CF100003', phone: '+212600000003', birthDate: new Date('2001-01-08'), address: null },
    { fullName: 'Nadia Example', cin: 'CF100004', phone: '+212600000004', birthDate: new Date('1978-11-30'), address: 'Temara' },
    { fullName: 'Karim Example', cin: 'CF100005', phone: '+212600000005', birthDate: new Date('1995-06-17'), address: null },
  ];

  const patients = [];
  for (const patient of patientRecords) {
    patients.push(await prisma.patient.upsert({
      where: { cin: patient.cin },
      update: patient,
      create: patient,
    }));
  }

  const appointmentCount = await prisma.appointment.count();
  if (appointmentCount === 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const statuses = [
      'confirmed', 'pending', 'confirmed', 'cancelled', 'pending',
      'pending', 'confirmed', 'pending', 'cancelled', 'confirmed',
    ];
    const reasons = [
      'Consultation générale', 'Suivi médical', 'Consultation', 'Contrôle', 'Consultation générale',
      'Suivi médical', 'Consultation générale', 'Contrôle', 'Consultation', 'Suivi médical',
    ];

    await prisma.appointment.createMany({
      data: statuses.map((status, index) => {
        const dayOffset = index < 5 ? 0 : 1;
        const hour = 9 + (index % 5) * 2;
        const appointmentDate = new Date(today);
        appointmentDate.setDate(appointmentDate.getDate() + dayOffset);
        appointmentDate.setHours(hour, 0, 0, 0);

        return {
          patientId: patients[index % patients.length].id,
          createdBy: savedUsers[index % savedUsers.length].id,
          appointmentDate,
          status,
          reason: reasons[index],
        };
      }),
    });
  }

  console.log('Données de démonstration créées. Comptes : admin@clinicflow.local, staff1@clinicflow.local, staff2@clinicflow.local.');
  console.log(`Mot de passe de démonstration : ${demoPassword}`);
}

main()
  .catch((error) => {
    console.error('Échec du remplissage de la base :', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
