const jwt = require("jsonwebtoken");
/**
 * Middleware para autenticar al usuario mediante token JWT en el header.
 *
 * @param {Request} req - Objeto de solicitud
 * @param {Response} res - Objeto de respuesta
 * @param {Function} next - Función next de middleware
 * @returns {void|Response}
 */
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "tu_secreto_jwt"
    );

    if (!decoded.id) {
      return res
        .status(403)
        .json({ error: "Token inválido - No contiene user_id" });
    }
    req.user = decoded;

    return next();
  } catch (error) {
    console.error("Error en autenticación:", error);
    res.status(403).json({ error: "Token inválido" });
  }
};

module.exports = { authenticateUser };
