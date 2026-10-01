function validate(schema, source = 'body') {
  return function validateRequest(req, res, next) {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      convert: true,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: {
          message: 'Les données envoyées sont invalides.',
          details: error.details.map((detail) => detail.message),
        },
      });
    }

    req[source] = value;
    return next();
  };
}

module.exports = validate;
