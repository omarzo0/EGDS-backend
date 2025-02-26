const { i18next } = require("../utils/i18n");

const HttpStatus = {
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionRequired: 412,
  RequestEntryTooLarge: 413,
  RequestURITooLong: 414,
  UnsupportedMediaType: 415,
  RequestedRangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  TooManyRequests: 429,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HTTPVersionNotSupported: 505,
};

class ApiError extends Error {
  constructor(key, code = HttpStatus.InternalServerError) {
    const message = i18next.t(`error.${key}`);
    super(message.toString());
    this.code = code;
    this.status = "error";
  }

  static invalidLanguage() {
    return new ApiError("invalidLanguage", HttpStatus.BadRequest);
  }

  static unauthorized() {
    return new ApiError("unauthorized", HttpStatus.Unauthorized);
  }

  static invalidAccessToken() {
    return new ApiError("invalidAccessToken", HttpStatus.Unauthorized);
  }

  static pleaseTryAgain() {
    return new ApiError("pleaseTryAgain", HttpStatus.BadRequest);
  }

  static endPointNotFound() {
    return new ApiError("endPointNotFound", HttpStatus.NotFound);
  }

  static invalidEmailCredentials() {
    return new ApiError("invalidEmailCredentials", HttpStatus.BadRequest);
  }
}

module.exports = {
  HttpStatus,
  ApiError,
};
