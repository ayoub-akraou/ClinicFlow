const app = require('./app');
const prisma = require('./config/prisma');

const port = Number(process.env.PORT) || 3000;

async function start() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL est manquant. Copie .env.example vers .env et configure PostgreSQL.');
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET doit contenir au moins 32 caractères.');
  }

  await prisma.$connect();
  const server = app.listen(port, () => {
    console.log(`ClinicFlow API écoute sur http://localhost:${port}`);
  });

  async function stop() {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  }

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

start().catch(async (error) => {
  console.error(`Impossible de démarrer l'API : ${error.message}`);
  await prisma.$disconnect();
  process.exit(1);
});
