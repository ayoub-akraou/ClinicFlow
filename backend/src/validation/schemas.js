const Joi = require('joi');

const idParams = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const loginBody = Joi.object({
  email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(255).required(),
  password: Joi.string().min(8).max(100).required(),
});

const patientBody = Joi.object({
  fullName: Joi.string().trim().min(2).max(120).required(),
  cin: Joi.string().trim().min(2).max(30).required(),
  phone: Joi.string().trim().min(3).max(30).required(),
  birthDate: Joi.date().iso().max('now').required(),
  address: Joi.string().trim().max(255).allow('', null),
});

const patientUpdateBody = Joi.object({
  fullName: Joi.string().trim().min(2).max(120),
  cin: Joi.string().trim().min(2).max(30),
  phone: Joi.string().trim().min(3).max(30),
  birthDate: Joi.date().iso().max('now'),
  address: Joi.string().trim().max(255).allow('', null),
}).min(1);

const paginationQuery = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
};

const patientListQuery = Joi.object({
  ...paginationQuery,
  search: Joi.string().trim().max(100).allow(''),
});

const dateFilter = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .custom((value, helpers) => {
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
      return helpers.error('date.invalid');
    }
    return value;
  });

const appointmentListQuery = Joi.object({
  ...paginationQuery,
  date: dateFilter,
  status: Joi.string().valid('pending', 'confirmed', 'cancelled'),
});

const appointmentBody = Joi.object({
  patientId: Joi.number().integer().positive().required(),
  appointmentDate: Joi.date().iso().required(),
  status: Joi.string().valid('pending', 'confirmed', 'cancelled').default('pending'),
  reason: Joi.string().trim().min(2).max(500).required(),
  notes: Joi.string().allow('', null),
});

const appointmentStatusBody = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'cancelled').required(),
});

module.exports = {
  idParams,
  loginBody,
  patientBody,
  patientUpdateBody,
  patientListQuery,
  appointmentListQuery,
  appointmentBody,
  appointmentStatusBody,
};
