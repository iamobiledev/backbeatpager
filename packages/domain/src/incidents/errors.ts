export type DomainErrorCode =
  | "INCIDENT_NOT_FOUND"
  | "INVALID_INCIDENT_TRANSITION"
  | "STALE_INCIDENT_GENERATION";

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly statusCode: number;

  constructor(code: DomainErrorCode, message: string, statusCode: number) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    this.statusCode = statusCode;
  }
}
