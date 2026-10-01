const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const appError = require('../utils/appError');

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw appError(401, 'Email ou mot de passe incorrect.');
  }

  const token = jwt.sign(
    { role: user.role },
    process.env.JWT_SECRET,
    { subject: String(user.id), expiresIn: '2h' },
  );

  return {
    token,
    user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
  };
}

async function getCurrentUser(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, fullName: true, email: true, role: true },
  });
  if (!user) throw appError(401, 'Utilisateur introuvable.');
  return user;
}

module.exports = { login, getCurrentUser };
