export class UseCaseError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
  ) {
    super(message)
    this.name = new.target.name
  }
}
