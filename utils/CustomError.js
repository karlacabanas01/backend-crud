/**
 * Clase para errores personalizados con soporte de código de estado HTTP.
 * @extends Error
 * @param {string} msg - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP
 * @param {Error|null} error - Error original (opcional)
 */
class CustomError extends Error {
  constructor(msg, statusCode, error = null) {
    super(msg);
    this.statusCode = statusCode;
    this.originalError = error;
  }
}

module.exports = { CustomError };
