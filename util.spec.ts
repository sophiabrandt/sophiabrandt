import {
  RuntimeException,
  CheckedException,
  BlogFeedException,
  EmptyArrayException,
  WriteFileException,
  ImpossibleException,
  assertType,
} from './util';

describe('Exceptions', () => {
  describe('RuntimeException', () => {
    it('should create a RuntimeException with an error message from string', () => {
      const errorMessage = 'Test error message';
      const exception = new RuntimeException(errorMessage);
      expect(exception.message).toBe(errorMessage);
      expect(exception.name).toBe('RuntimeException');
    });

    it('should create a RuntimeException with an error message from an Error instance', () => {
      const exception = new RuntimeException(new Error('Error instance'));
      expect(exception.message).toBe('Error instance');
      expect(exception.name).toBe('RuntimeException');
    });
  });

  describe('CheckedException', () => {
    it('should create a CheckedException with an error message from string', () => {
      const errorMessage = 'Test error message';
      const exception = new CheckedException(errorMessage);
      expect(exception.message).toBe(errorMessage);
      expect(exception.name).toBe('CheckedException');
    });

    it('should create a CheckedException with an error message from Error instance', () => {
      const exception = new CheckedException(new Error('Error instance'));
      expect(exception.message).toBe('Error instance');
      expect(exception.name).toBe('CheckedException');
    });
  });

  describe('BlogFeedException', () => {
    it('should create a BlogFeedException with the provided input message', () => {
      const errorMessage = 'Test error message';
      const exception = new BlogFeedException(errorMessage);
      expect(exception.message).toBe(errorMessage);
      expect(exception.name).toBe('BlogFeedException');
    });

    it('should create a BlogFeedException with a default message if input is not provided', () => {
      const exception = new BlogFeedException();
      expect(exception.message).toBe(
        'There was an error parsing the blog feed',
      );
      expect(exception.name).toBe('BlogFeedException');
    });
  });

  describe('EmptyArrayException', () => {
    it('should create an EmptyArrayException with the provided input message', () => {
      const errorMessage = 'Test error message';
      const exception = new EmptyArrayException(errorMessage);
      expect(exception.message).toBe(errorMessage);
      expect(exception.name).toBe('EmptyArrayException');
    });

    it('should create an EmptyArrayException with a default message if input is not provided', () => {
      const exception = new EmptyArrayException();
      expect(exception.message).toBe('Empty array is not allowed as input');
      expect(exception.name).toBe('EmptyArrayException');
    });
  });

  describe('WriteFileException', () => {
    it('should create a WriteFileException with the provided input message', () => {
      const errorMessage = 'Test error message';
      const exception = new WriteFileException(errorMessage);
      expect(exception.message).toBe(errorMessage);
      expect(exception.name).toBe('WriteFileException');
    });

    it('should create a WriteFileException with a default message if input is not provided', () => {
      const exception = new WriteFileException();
      expect(exception.message).toBe(
        'There was an error writing to the file system',
      );
      expect(exception.name).toBe('WriteFileException');
    });
  });

  describe('ImpossibleException', () => {
    it('should create an ImpossibleException with the provided input message', () => {
      const errorMessage = 'Test error message';
      const exception = new ImpossibleException(errorMessage);
      expect(exception.message).toBe(errorMessage);
      expect(exception.name).toBe('ImpossibleException');
    });

    it('should create an ImpossibleException with a default message if input is not provided', () => {
      const exception = new ImpossibleException();
      expect(exception.message).toBe('This operation is impossible');
      expect(exception.name).toBe('ImpossibleException');
    });
  });
});

describe('assertType', () => {
  it('should return the input object as the specified type', () => {
    const inputObject = { prop: 'value' };
    const result = assertType<{ prop: string }>(inputObject);
    expect(result).toBe(inputObject);
  });

  it('should return undefined if no input object is provided', () => {
    const result = assertType<{ prop: string }>();
    expect(result).toBeUndefined();
  });
});
