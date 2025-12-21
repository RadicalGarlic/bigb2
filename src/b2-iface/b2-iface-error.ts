import { Bigb2Error } from "bigb2-error";

export class B2IfaceError extends Bigb2Error {
  constructor(message: string, options?: { cause: Error }) {
    super(message, options);
  }
}
