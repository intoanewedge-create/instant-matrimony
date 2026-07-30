import { NextResponse } from "next/server";
import { loggerService } from "../services/logger.service";

export class ValidationError extends Error {
  code = "VALIDATION_ERROR";
  status = 400;
  constructor(message: string, public details?: any) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  code = "AUTHENTICATION_ERROR";
  status = 401;
  constructor(message: string = "Authentication required.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  code = "AUTHORIZATION_ERROR";
  status = 403;
  constructor(message: string = "Permission denied.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class BusinessRuleError extends Error {
  code = "BUSINESS_RULE_ERROR";
  status = 422;
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}

export class ConflictError extends Error {
  code = "CONFLICT_ERROR";
  status = 409;
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class NotFoundError extends Error {
  code = "NOT_FOUND_ERROR";
  status = 404;
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ExternalProviderError extends Error {
  code = "EXTERNAL_PROVIDER_ERROR";
  status = 502;
  constructor(message: string, public provider?: string) {
    super(message);
    this.name = "ExternalProviderError";
  }
}

export class DatabaseError extends Error {
  code = "DATABASE_ERROR";
  status = 500;
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

export class UnexpectedError extends Error {
  code = "UNEXPECTED_ERROR";
  status = 500;
  constructor(message: string = "An unexpected error occurred.") {
    super(message);
    this.name = "UnexpectedError";
  }
}

export class GlobalExceptionHandler {
  static handle(error: any): NextResponse {
    const isDev = process.env.NODE_ENV === "development";
    
    let status = 500;
    let code = "INTERNAL_SERVER_ERROR";
    let message = "An internal server error occurred.";
    let details: any = undefined;

    loggerService.error("Exception caught by global handler", {
      name: error?.name,
      message: error?.message,
    }, error);

    if (error instanceof ValidationError) {
      status = error.status;
      code = error.code;
      message = error.message;
      details = error.details;
    } else if (error instanceof AuthenticationError) {
      status = error.status;
      code = error.code;
      message = error.message;
    } else if (error instanceof AuthorizationError) {
      status = error.status;
      code = error.code;
      message = error.message;
    } else if (error instanceof BusinessRuleError) {
      status = error.status;
      code = error.code;
      message = error.message;
    } else if (error instanceof ConflictError) {
      status = error.status;
      code = error.code;
      message = error.message;
    } else if (error instanceof NotFoundError) {
      status = error.status;
      code = error.code;
      message = error.message;
    } else if (error instanceof ExternalProviderError) {
      status = error.status;
      code = error.code;
      message = error.message;
      details = { provider: error.provider };
    } else if (error instanceof DatabaseError) {
      status = error.status;
      code = error.code;
      message = isDev ? error.message : "A database operation failed.";
    } else if (error instanceof UnexpectedError) {
      status = error.status;
      code = error.code;
      message = error.message;
    } else if (error?.name === "PrismaClientKnownRequestError" || error?.name === "PrismaClientUnknownRequestError") {
      status = 500;
      code = "DATABASE_ERROR";
      message = isDev ? error.message : "Database request failed.";
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
          ...(details ? { details } : {}),
          ...(isDev && error?.stack ? { stack: error.stack } : {}),
        },
      },
      { status }
    );
  }
}
