import * as https from 'https';
import * as http from 'http';

import { UrlProvider } from 'b2-iface/url-provider';
import { B2ApiError } from 'b2-api/b2-api-error';
import { throwExpression } from 'utils/throw-expression';

export interface GetUploadPartUrlResponse {
  authorizationToken: string,
  uploadUrl: string,
  fileId: string,
}

export class GetUploadPartUrlRequest {
  constructor(private args: {
    apiUrl: URL,
    authToken: string,
    fileId: string
  }) { }

  async send(): Promise<GetUploadPartUrlResponse> {
    return new Promise<GetUploadPartUrlResponse>((resolve, reject) => {
      const req: http.ClientRequest = https.get(
        UrlProvider.getUploadPartUrl(this.args.apiUrl),
        {
          headers: { Authorization: this.args.authToken }
        },
        (res: http.IncomingMessage) => {
          const resChunks: Buffer[] = [];
          res.on('error', (err: Error) => {
            return reject(new B2ApiError('GetUploadPartUrl error', { cause: err }));
          });
          res.on('data', (chunk: Buffer) => { resChunks.push(chunk); });
          res.on('end', () => {
            if (!res.complete) {
              return reject(new B2ApiError('GetUploadPartUrl interrupted'));
            }
            const resBodyJson: string = Buffer.concat(resChunks).toString('utf-8');
            const resBodyObj = JSON.parse(resBodyJson);
            if (res.statusCode !== 200 || B2ApiError.isB2ApiError(resBodyJson)) {
              return reject(B2ApiError.fromJson(resBodyJson));
            }
            return resolve({
              authorizationToken: resBodyObj.authorizationToken ?? throwExpression(
                new B2ApiError(`No "authorizationToken" in GetUploadPartUrl response. JSON=${resBodyJson}`)
              ),
              uploadUrl: resBodyObj.uploadUrl ?? throwExpression(
                new B2ApiError(`No "uploadUrl" in GetUploadPartUrl response. JSON=${resBodyJson}`)
              ),
              fileId: resBodyObj.fileId ?? throwExpression(
                new B2ApiError(`No "fileId" in GetUploadPartUrl response. JSON=${resBodyJson}`)
              ),
            });
          });
        }
      );
      req.on('error', (err: Error) => {
        reject(new B2ApiError('GetUploadPartUrl failed', { cause: err }));
      });
      req.end();
    });
  }
}
