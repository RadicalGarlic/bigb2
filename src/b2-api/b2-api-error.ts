import { Bigb2Error } from "bigb2-error";
import { throwExpression } from "utils/throw-expression";
import { isNum } from "utils/num-check";

export interface B2ApiErrorBody {
  code: string;
  message: string;
  status: number;
}

export class B2ApiError extends Bigb2Error {
  constructor(message: string, options?: { cause: Error }, public readonly b2ApiErrorBody?: B2ApiErrorBody, ) {
    const fullMsg = [message, `B2ApiErrorBody=${JSON.stringify(b2ApiErrorBody)}`].filter((value: string) => value).join(' ');
    super(fullMsg, options);
  }

  public static fromJson(json: string): B2ApiError {
    const obj = JSON.parse(json);
    return new B2ApiError(
      "B2 API error",
      undefined,
      {
        code: obj.code ?? throwExpression(new Bigb2Error(`Malformed B2ApiError, missing "code", json=${json}`)),
        message: obj.message ?? throwExpression(new Bigb2Error(`Malformed B2ApiError, missing "message", json=${json}`)),
        status: isNum(obj.status) ? parseInt(obj.status) : throwExpression(new Bigb2Error(`Malformed B2ApiError, bad "status", json=${json}`)),
      },
    )
  }

  public static isB2ApiError(json: string): boolean {
    let obj = null;
    try {
      obj = JSON.parse(json);
    } catch (err: unknown) {
      return false;
    }
    return ((obj.code)
      && (obj.message)
      && (isNum(obj.status))
    );
  }

  public isExpiredAuthError(): boolean {
    return this.b2ApiErrorBody?.code === 'expired_auth_error';
  }
}
