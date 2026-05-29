const roleMiddleware = (...perfisPermitidos) => (req, res, next) => {
  if (!perfisPermitidos.includes(req.user.perfil)) {
    return res.status(403).json({
      message: `Acesso restrito. Perfis permitidos: ${perfisPermitidos.join(', ')}.`
    });
  }
  next();
};

module.exports = roleMiddleware;
