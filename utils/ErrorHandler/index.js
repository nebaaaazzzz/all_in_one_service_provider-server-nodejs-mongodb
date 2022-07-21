class ErrorHandler extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = statusCode;
  }
}
module.exports = ErrorHandler;
