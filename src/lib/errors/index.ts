export class AppError extends Error {
  constructor(
    public override message: string,
    public code: string = "INTERNAL_SERVER_ERROR",
    public status: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public errors?: any) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Unauthorized access") {
    super(message, "AUTHENTICATION_ERROR", 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Forbidden operation") {
    super(message, "AUTHORIZATION_ERROR", 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, "CONFLICT_ERROR", 409);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, "NOT_FOUND_ERROR", 404);
  }
}

export class PaymentError extends AppError {
  constructor(message: string) {
    super(message, "PAYMENT_ERROR", 402);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, "DATABASE_ERROR", 500);
  }
}
