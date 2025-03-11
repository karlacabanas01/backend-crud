class CustomError extends Error {
  constructor (msg, statusCode, error = null) {
    super(msg)
    this.statusCode = statusCode
    this.error = error
  }
}

module.exports = { CustomError }
