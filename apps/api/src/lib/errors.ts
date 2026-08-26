export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado") {
    super(404, message, "NOT_FOUND");
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Requisição inválida") {
    super(400, message, "BAD_REQUEST");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflito") {
    super(409, message, "CONFLICT");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Usuário não informado") {
    super(401, message, "UNAUTHORIZED");
  }
}
