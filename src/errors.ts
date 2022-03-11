export class BaseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class InvalidResponseError<T> extends BaseError {
  constructor(missingFieldName: keyof T, fullBody: T) {
    super(
      `Missing field '${missingFieldName}' from body: ${JSON.stringify(
        fullBody
      )}`
    );
  }
}

export class ForceFailError extends BaseError {
  constructor(failureId: string) {
    super(`Failure forced for ${failureId}`);
  }
}
