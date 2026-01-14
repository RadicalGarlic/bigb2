import * as https from 'node:https';
import * as http from 'node:http';

import { UrlProvider } from 'b2-iface/url-provider';
import { B2ApiError } from 'b2-api/b2-api-error';
import { peckFieldIs, peckPrimitiveField } from 'utils/peck';

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
    return new Promise<AuthorizeAccountResponse>((resolve, reject) => {
      const base64: string
        = Buffer
          .from(`${this.accountKey.keyId}:${this.accountKey.appKey}`)
          .toString('base64');
      const auth = `Basic ${base64}`;
      const req: http.ClientRequest = https.get(
        UrlProvider.authorizeUrl(),
        {
          headers: { AUTHORIZATION: auth }
        },
        ((res: http.IncomingMessage) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => { chunks.push(chunk); });
          res.on('error', (err: Error) => { reject(err); });
          res.on('end', () => {
            if (!res.complete) {
              return reject(new B2ApiError('AuthorizeAccount interrupted'));
            }
            try {
              const resBody = JSON.parse(chunks.join(''));
              return resolve({
                accountId: String(peckPrimitiveField(resBody, 'accountId', 'string')),
                authorizationToken: String(peckPrimitiveField(resBody, 'authorizationToken', 'string')),
                apiUrl: String(
                  peckPrimitiveField(
                    peckFieldIs(
                      peckFieldIs(resBody, 'apiInfo'),
                      'storageApi',
                    ),
                    'apiUrl',
                    'string'
                  )
                ),
                downloadUrl: String(
                  peckPrimitiveField(
                    peckFieldIs(
                      peckFieldIs(resBody, 'apiInfo'),
                      'storageApi',
                    ),
                    'downloadUrl',
                    'string'
                  )
                ),
                recommendedPartSize: Number(
                  peckPrimitiveField(
                    peckFieldIs(
                      peckFieldIs(resBody, 'apiInfo'),
                      'storageApi',
                    ),
                    'recommendedPartSize',
                    'number'
                  )
                ),
                absoluteMinimumPartSize: Number(
                  peckPrimitiveField(
                    peckFieldIs(
                      peckFieldIs(resBody, 'apiInfo'),
                      'storageApi',
                    ),
                    'absoluteMinimumPartSize',
                    'number'
                  )
                ),
              });
            } catch (err: unknown) {
              if (err instanceof Error) {
                return reject(new B2ApiError('AuthorizeAccount failed', { cause: err }));
              }
              return reject(err);
            }
          });
        })
      );
      req.on('error', (err: Error) => {
        return reject(new B2ApiError('AuthorizeAccount failed', { cause: err }));
      });
    });
  }
}
