const errorHandler = (err, req, res) => {
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
