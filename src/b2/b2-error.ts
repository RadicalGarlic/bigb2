import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

export class B2Error extends Error {
  constructor(public message: string, public b2ErrorBody: B2ErrorBodyType) {
    super(message);
  }

  static fromJson(json: string): B2Error {
    const decoded = B2ErrorBody.decode(JSON.parse(json));
    if (isLeft(decoded)) {
      throw new Error(`Could not validate data: ${PathReporter.report(decoded).join('\n')}`);
    }
    return new B2Error(json, decoded.right);
  }

  static isB2Error(json: string): boolean {
    let body = {};
    try {
      body = JSON.parse(json);
      if (!body || ((typeof body) !== 'object')) {
        return false;
      }
    } catch (e) {
      return false;
    }

    const decoded = B2ErrorBody.decode(body);
    return !isLeft(decoded);
  }
}

const B2ErrorBody = t.type({
  code: t.string,
  message: t.string,
  status: t.number
});
export type B2ErrorBodyType = t.TypeOf<typeof B2ErrorBody>;
