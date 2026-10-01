function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof SyntaxError && error.status === 400 && Object.hasOwn(error, 'body')) {
    return res.status(400).json({ error: { message: 'Le JSON envoyé est invalide.' } });
  }

  if (error.isAppError) {
    return res.status(error.status).json({ error: { message: error.message } });
  }

  if (error.code === 'P2002') {
    return res.status(409).json({ error: { message: 'Cette valeur existe déjà.' } });
  }

  if (error.code === 'P2003') {
    return res.status(409).json({ error: { message: 'Cette action est bloquée par une relation existante.' } });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({ error: { message: 'Élément introuvable.' } });
  }

  console.error(error);
  return res.status(500).json({ error: { message: 'Une erreur interne est survenue.' } });
}

module.exports = errorHandler;
