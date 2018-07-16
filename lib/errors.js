'use strict';

const responses = require('./responses');

class LibertyError extends Error {
  constructor(message = '') {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports.LibertyError = LibertyError;

class UnauthorizedError extends LibertyError {
  constructor(message = 'You don\'t have permission to access it.') {
    super(message);
    this.status = 401;
  }

  handler(req, res, next) {
    new responses.Unauthorized(this.message).send(res);
  }
}

module.exports.UnauthorizedError = UnauthorizedError;

class MalformedTitleError extends LibertyError {
  constructor(message = 'Invalid title') {
    super(message);
    this.status = 400;
  }

  handler(req, res, next) {
    new responses.BadRequest(this.message).send(res);
  }
}

module.exports.MalformedTitleError = MalformedTitleError;
