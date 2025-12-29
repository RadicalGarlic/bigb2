import * as https from 'https';
import * as http from 'http';

import { UrlProvider } from 'b2-iface/url-provider';
import { B2ApiError } from 'b2-api/b2-api-error';
import { assertPrimitiveField } from 'utils/assert-primitive-field';

export interface GetUploadUrlResponse {
  uploadUrl: string,
  uploadAuthorizationToken: string,
  bucketId: string,
}

export class GetUploadUrlRequest {
  constructor(private args: {
    apiUrl: URL,
    authToken: string,
    bucketId: string
  }) { }

  async send(): Promise<GetUploadUrlResponse> {
    return new Promise<GetUploadUrlResponse>((resolve, reject) => {
      const url: URL = UrlProvider.getUploadUrl(this.args.apiUrl);
      url.searchParams.append('bucketId', this.args.bucketId);
      const req: http.ClientRequest = https.get(
        url,
        {
          headers: { Authorization: this.args.authToken }
        },
        (res: http.IncomingMessage) => {
          const resChunks: Buffer[] = [];
          res.on('error', (err: Error) => {
            return reject(new B2ApiError('GetUploadUrl error', { cause: err }));
          });
          res.on('data', (chunk: Buffer) => { resChunks.push(chunk); });
          res.on('end', () => {
            if (!res.complete) {
              return reject(new B2ApiError('GetUploadUrl interrupted'));
            }
            const resBodyJson: string = Buffer.concat(resChunks).toString('utf-8');
            const resBodyObj = JSON.parse(resBodyJson);
            if (res.statusCode !== 200 || B2ApiError.isB2ApiError(resBodyJson)) {
              return reject(B2ApiError.fromJson(resBodyJson, 'GetUploadUrl failed'));
            }
            try {
              return resolve({
                uploadUrl: String(assertPrimitiveField(resBodyObj, 'uploadUrl', 'string')),
                uploadAuthorizationToken: String(assertPrimitiveField(resBodyObj, 'authorizationToken', 'string')),
                bucketId: String(assertPrimitiveField(resBodyObj, 'bucketId', 'string')),
              });
            } catch (err: unknown) {
              if (err instanceof Error) {
                return reject(new B2ApiError(
                  `Failed to parse GetUploadUrl response. JSON=${resBodyJson}`,
                  { cause: err }
                ));
              }
              return reject(err);
            }
          });
        }
      );
      req.on('error', (err: Error) => {
        return reject(new B2ApiError('GetUploadUrl failed', { cause: err }));
      });
      req.end();
    });
  }
}
