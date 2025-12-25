import * as https from 'node:https';
import * as http from 'node:http';

import { UrlProvider } from 'b2-iface/url-provider';
import { B2ApiError } from 'b2-api/b2-api-error';
import { throwExpression } from 'utils/throw-expression';
import { Bigb2Error } from 'bigb2-error';

export interface StartLargeFileResponse {
  bucketId: string,
  fileId: string,
}

export class StartLargeFileRequest {
  constructor(private args: {
    apiUrl: URL,
    authToken: string,
    bucketId: string,
    dstFilePath: string,
    contentType?: string,
  }) { }

  async send(): Promise<StartLargeFileResponse> {
    return new Promise<StartLargeFileResponse>(
      (resolve, reject) => {
        const url: URL = UrlProvider.startLargeFileUrl(this.args.apiUrl);
        const req: http.ClientRequest = https.request(
          url,
          {
            headers: { Authorization: this.args.authToken },
            method: 'POST'
          }
        );
        req.on('response', (res: http.IncomingMessage) => {
          const resChunks: Buffer[] = [];
          res.on('error', (err: Error) => { reject(new B2ApiError('StartLargeFile failed', { cause: err })); });
          res.on('data', (chunk: Buffer) => { resChunks.push(chunk); });
          res.on('end', () => {
            if (!res.complete) {
              return reject(new B2ApiError('StartLargeFile interrupted'));
            }
            const resBodyJson: string = Buffer.concat(resChunks).toString('utf-8');
            const resBodyObj = JSON.parse(resBodyJson);
            if (res.statusCode !== 200 || B2ApiError.isB2ApiError(resBodyJson)) {
              return reject(B2ApiError.fromJson(resBodyJson));
            }
            return resolve({
              bucketId: resBodyObj.bucketId ?? throwExpression(new Bigb2Error(`No bucketId on StartLargeFile response. JSON=${resBodyJson}`)),
              fileId: resBodyObj.fileId ?? throwExpression(new Bigb2Error(`No fileId on StartLargeFile response. JSON=${resBodyJson}`)),
            });
          });
        });
        req.on('error', (err: Error) => { reject(new B2ApiError('StartLargeFile failed', { cause: err })); });
        req.write(
          JSON.stringify({
            bucketId: this.args.bucketId,
            fileName: this.args.dstFilePath,
            contentType: this.args.contentType ?? 'application/octet-stream',
          }),
          (err: Error | null | undefined) => {
            return reject(new B2ApiError('StartLargeFile', err ? { cause: err } : undefined));
          }
        );
        req.end();
      }
    )
  }
}
