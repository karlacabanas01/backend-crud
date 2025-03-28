/**
 * Middleware para manejo de errores.
 * Devuelve una respuesta con el código de error y mensaje correspondiente.
 *
 * @param {Error} err - Error capturado
 * @param {Response} res - Objeto de respuesta
 */
const errorHandler = (err, res) => {
  console.log("❌ Error:", err);

  const statusCode = err.statusCode || 500;
  const msg = err.message || "Error interno del servidor";

  res.status(statusCode).json({
    success: false,
    msg,
    error: err.error || "Error interno del servidor",
  });
};
module.exports = { errorHandler };
