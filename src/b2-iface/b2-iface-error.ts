import { Bigb2Error } from "bigb2-error";

export class B2IfaceError extends Bigb2Error {
  constructor(public msg: string, public options?: { cause: Error }) {
    super(msg, options);
  }
}
