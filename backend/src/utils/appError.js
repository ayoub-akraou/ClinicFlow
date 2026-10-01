function appError(status, message) {
  const error = new Error(message);
  error.status = status;
  error.isAppError = true;
  return error;
}

module.exports = appError;
