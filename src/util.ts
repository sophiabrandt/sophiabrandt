/* eslint-disable max-classes-per-file */
export class RuntimeException extends Error {
  constructor(input?: unknown) {
    super(input instanceof Error ? input.message : String(input));
    this.name = this.constructor.name;

    // This line is needed for correct typing of the error instance.
    // It ensures that 'instanceof' works correctly.
    Object.setPrototypeOf(this, RuntimeException.prototype);
  }
}

export class CheckedException extends Error {
  constructor(input?: unknown) {
    super(input instanceof Error ? input.message : String(input));
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, CheckedException.prototype);
  }
}

export class BlogFeedException extends CheckedException {
  constructor(input?: unknown) {
    super(input || 'There was an error parsing the blog feed');
    Object.setPrototypeOf(this, BlogFeedException.prototype);
  }
}

export class EmptyArrayException extends CheckedException {
  constructor(input?: unknown) {
    super(input || 'Empty array is not allowed as input');
    Object.setPrototypeOf(this, EmptyArrayException.prototype);
  }
}

export class WriteFileException extends CheckedException {
  constructor(input?: unknown) {
    super(input || 'There was an error writing to the file system');
    Object.setPrototypeOf(this, WriteFileException.prototype);
  }
}

export class ImpossibleException extends RuntimeException {
  constructor(input?: unknown) {
    super(input || 'This operation is impossible');
    Object.setPrototypeOf(this, ImpossibleException.prototype);
  }
}

export function assertType<T>(object: unknown = undefined): T {
  return object as T;
}
