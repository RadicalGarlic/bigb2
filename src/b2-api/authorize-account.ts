import * as https from 'node:https';
import * as http from 'node:http';

import { UrlProvider } from 'b2-iface/url-provider';
import { throwExpression } from 'utils/throw-expression';

export interface AccountKey {
  keyId: string;
  appKey: string;
}

export interface AuthorizeAccountResponse {
  accountId: string;
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
  recommendedPartSize: number;
  absoluteMinimumPartSize: number;
}

export class AuthorizeAccountRequest {
  private readonly accountKey: AccountKey;

  constructor(accountKey: AccountKey) {
    this.accountKey = accountKey;
  }

  async send(): Promise<AuthorizeAccountResponse> {
    const base64: string
      = Buffer
        .from(`${this.accountKey.keyId}:${this.accountKey.appKey}`)
        .toString('base64');
    const auth = `Basic ${base64}`;

    return new Promise<AuthorizeAccountResponse>((resolve, reject) => {
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
              const resBody = JSON.parse(chunks.join(''));
              resolve({
                accountId: resBody['accountId'] ?? throwExpression(new Error(`Malformed body ${JSON.stringify(resBody)}`)),
                authorizationToken: resBody['authorizationToken'],
                apiUrl: resBody['apiUrl'] ?? throwExpression(new Error(`Malformed body ${JSON.stringify(resBody)}`)),
                downloadUrl: resBody['downloadUrl'],
                recommendedPartSize: Number(resBody['recommendedPartSize'] 
                  ?? throwExpression(new Error(`Malformed body ${JSON.stringify(resBody)}`))
                ),
                absoluteMinimumPartSize: Number(resBody['absoluteMinimumPartSize'] 
                  ?? throwExpression(new Error(`Malformed body ${JSON.stringify(resBody)}`))
                ),
              });
            }
          });
        })
      );
      req.on('error', (err: Error) => { reject(err); });
    });
  }
}
