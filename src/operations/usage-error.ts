import { Bigb2Error } from "bigb2-error";

export class UsageError extends Bigb2Error {
  constructor(message: string, options?: { cause: Error }) {
    super(message, options);
  }
}
