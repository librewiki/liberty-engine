'use strict';

class Response {
  constructor() {
    this.code = 200;
    this.status = 'success';
  }

  send(res) {
    res.status(this.code);
    res.json(this.data);
  }
}

class ErrorResponse extends Response {
  constructor() {
    super();
    this.status = 'failure';
  }
}

class Success extends Response {
  constructor(data) {
    super();
    this.code = 200;
    this.data = data;
  }
}

class Created extends Response {
  constructor(data) {
    super();
    this.code = 201;
    this.data = data;
  }
}

class Failure extends ErrorResponse {
  constructor(message) {
    super();
    this.code = 400;
    this.data = { message };
  }
}

class BadRequest extends ErrorResponse {
  constructor({ name, message } = {}) {
    super();
    this.code = 400;
    this.data = {
      name: name || 'BadRequestError',
      message: message || 'bad request.',
    };
  }
}

class Blocked extends ErrorResponse {
  constructor(message) {
    super();
    this.code = 403;
    this.data = {
      name: 'BlockedError',
      message: message || 'You\'ve been blocked by admin.',
    };
  }
}

class ResourceNotFound extends ErrorResponse {
  constructor(data) {
    super();
    this.code = 404;
    this.data = {
      name: 'ResourceNotFoundError',
      message: 'Cannot find the resource.',
      ...data,
    };
  }
}

class Unauthorized extends ErrorResponse {
  constructor(message) {
    super();
    this.code = 401;
    this.data = {
      name: 'UnauthorizedError',
      message: message || 'You don\'t have permission to access it.',
    };
  }
}

class ApiNotFound extends ErrorResponse {
  constructor() {
    super();
    this.code = 404;
    this.data = {
      name: 'ApiNotFoundError',
      message: 'Cannot find the API endpoint.',
    };
  }
}

class Conflict extends ErrorResponse {
  constructor() {
    super();
    this.code = 409;
    this.data = {
      name: 'ConflictError',
      message: 'Resource already exists.',
    };
  }
}

class ServerError extends ErrorResponse {
  constructor(message) {
    super();
    this.code = 500;
    this.data = {
      name: 'ServerError',
      message: message || 'Internal Server Error',
    };
  }
}

module.exports = Response;
module.exports.Success = Success;
module.exports.Created = Created;
module.exports.Failure = Failure;
module.exports.BadRequest = BadRequest;
module.exports.Blocked = Blocked;
module.exports.Unauthorized = Unauthorized;
module.exports.ResourceNotFound = ResourceNotFound;
module.exports.ApiNotFound = ApiNotFound;
module.exports.Conflict = Conflict;
module.exports.ServerError = ServerError;
