import * as https from 'node:https';
import * as http from 'node:http';

import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import { AccountKeyType } from '#internal/b2/auth';
import { UrlProvider } from '#internal/b2/url-provider';

export class AuthorizeAccountRequest {
  private readonly accountKey: AccountKeyType;

  constructor(accountKey: AccountKeyType) {
    this.accountKey = accountKey;
  }

  async send(): Promise<AuthorizeAccountResponseType> {
    const base64: string
      = Buffer
        .from(`${this.accountKey.keyId}:${this.accountKey.appKey}`)
        .toString('base64');
    const auth = `Basic ${base64}`;

    return new Promise<AuthorizeAccountResponseType>((resolve, reject) => {
      const req: http.ClientRequest = https.get(
        UrlProvider.authorizeUrl(),
        {
          headers: { AUTHORIZATION: auth }
        },
        ((res: http.IncomingMessage) => {
          const chunks: string[] = [];
          res.on('data', (chunk: string) => { chunks.push(chunk); });
          res.on('error', (err: Error) => { reject(err); });
          res.on('end', () => {
            if (!res.complete) {
              reject(new Error('Request interrupted'));
            } else {
              const resBody: string = JSON.parse(chunks.join(''));
              const decoded = AuthorizeAccountResponse.decode(resBody);
              if (isLeft(decoded)) {
                reject(new Error(`Could not validate data: ${PathReporter.report(decoded).join('\n')}`));
              } else {
                resolve(decoded.right);
              }
            }
          });
        })
      );
      req.on('error', (err: Error) => { reject(err); });
    });
  }
}

const AuthorizeAccountResponse = t.type({
  accountId: t.string,
  authorizationToken: t.string,
  apiUrl: t.string,
  downloadUrl: t.string,
  recommendedPartSize: t.number,
  absoluteMinimumPartSize: t.number
});
export type AuthorizeAccountResponseType
  = t.TypeOf<typeof AuthorizeAccountResponse>;
