import { Bigb2Error } from "bigb2-error";
import { assertPrimitiveField } from "utils/assert-primitive-field";
import { isNum } from "utils/num-check";

export interface B2ApiErrorBody {
  code: string;
  message: string;
  status: number;
}

export class B2ApiError extends Bigb2Error {
  constructor(message: string, options?: { cause: Error }, public readonly b2ApiErrorBody?: B2ApiErrorBody, ) {
    const fullMsg = [
      message,
      b2ApiErrorBody ? `B2ApiErrorBody=${JSON.stringify(b2ApiErrorBody)}` : ''
    ].filter((s: string) => s).join(' ');
    super(fullMsg, options);
  }

  public static fromObj(errBody: object, message?: string): B2ApiError {
    try {
      return new B2ApiError(
        message ? message : 'B2 API error',
        undefined,
        {
          code: String(assertPrimitiveField(errBody, 'code', 'string')),
          message: String(assertPrimitiveField(errBody, 'message', 'string')),
          status: Number(assertPrimitiveField(errBody, 'status', 'number')),
        },
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Bigb2Error(`Failed to parse B2ApiError body ${JSON.stringify(errBody)}`, { cause: err });
      }
      throw err;
    }
  }

  public static fromJson(json: string, message?: string): B2ApiError {
    try {
      return B2ApiError.fromObj(JSON.parse(json));
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Bigb2Error(`Failed to parse B2ApiError body ${json}`, { cause: err });
      }
      throw err;
    }
  }

  public static isB2ApiError(test: any): boolean {
    let obj = null;
    if ((typeof test) === 'string') {
      try {
        obj = JSON.parse(test);
      } catch (err: unknown) {
        return false;
      }
    } else if ((typeof test) === 'object') {
      obj = test;
    } else {
      throw new Bigb2Error(`Unexpected type for B2ApiError ${test}`);
    }

    return obj.code
      && obj.message
      && isNum(obj.status);
  }

  public isExpiredAuthError(): boolean {
    return (this.b2ApiErrorBody?.status === 401) && (this.b2ApiErrorBody?.code === 'expired_auth_token');
  }

  public isServiceUnavailableError503(): boolean {
    return (this.b2ApiErrorBody?.status === 503) && (this.b2ApiErrorBody?.code === 'service_unavailable');
  }
}
