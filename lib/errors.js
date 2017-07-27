'use strict';

class LibertyError extends Error {
  constructor(message = '') {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports.LibertyError = LibertyError;

class NoPermissionError extends LibertyError {
  constructor(message = 'The user has no permission') {
    super(message);
    this.status = 401;
  }
  handler(req, res, next) {
    res.status(this.status);
    res.json({
      type: 'error',
      name: this.name,
      message: this.message,
    });
  }
}

module.exports.NoPermissionError = NoPermissionError;
