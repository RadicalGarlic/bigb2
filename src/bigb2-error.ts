export class Bigb2Error extends Error {
  constructor(public msg: string, public options?: { cause: Error }) {
    super(msg, options);
  }
}
