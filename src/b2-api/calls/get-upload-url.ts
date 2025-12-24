import * as https from 'https';
import * as http from 'http';

import { UrlProvider } from 'b2-iface/url-provider';
import { B2ApiError } from 'b2-api/b2-api-error';

export interface GetUploadUrlResponse {
  uploadUrl: string,
  fileId: string,
}

export class GetUploadUrlRequest {
  constructor(private args: {
    apiUrl: URL,
    authToken: string,
    fileId: string
  }) { }

  async send(): Promise<GetUploadUrlResponse> {
    return new Promise<GetUploadUrlResponse>((resolve, reject) => {
      const req: http.ClientRequest = https.get(
        UrlProvider.getUploadUrlUrl(this.args.apiUrl),
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
              return reject(B2ApiError.fromJson(resBodyJson));
            }
            try {
              return resolve({
                uploadUrl: resBodyObj!.uploadUrl,
                fileId: resBodyObj!.fileId,
              });
            } catch (err: unknown) {
              if (err instanceof Error) {
                return reject(new B2ApiError(`Failed to parse GetUploadUrl response. JSON=${resBodyJson}`));
              }
              return reject(err);
            }
          });
        }
      );
      req.end();
    });
  }
}
