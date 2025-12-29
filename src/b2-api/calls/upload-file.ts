import * as https from 'node:https';
import * as http from 'node:http';

import { B2ApiError } from 'b2-api/b2-api-error';
import { assertPrimitiveField } from 'utils/assert-primitive-field';

export interface UploadFileResponse {
  fileId: string;
  bucketId: string;
  contentLength: number;
  contentSha1: string;
  fileName: string;
}

export class UploadFileRequest {
  constructor(private args: {
    uploadUrl: URL,
    uploadAuthToken: string,
    fileName: string,
    contentType: string,
    contentLength: number,
    contentSha1: string,
    payload: Buffer,
  }) { }

  async send(): Promise<UploadFileResponse> {
    return new Promise<UploadFileResponse>(
      (resolve, reject) => {
        const req: http.ClientRequest = https.request(
          this.args.uploadUrl,
          {
            headers: {
              Authorization: this.args.uploadAuthToken,
              'X-Bz-File-Name': encodeURIComponent(this.args.fileName),
              'Content-Type': this.args.contentType,
              'Content-Length': String(this.args.contentLength),
              'X-Bz-Content-Sha1': this.args.contentSha1,
            },
            method: 'POST'
          }
        );
        req.on('error', (err: Error) => {
          return reject(new B2ApiError('UploadFile failed', { cause: err }));
        });
        req.on('response', (res: http.IncomingMessage) => {
          const resChunks: Buffer[] = [];
          res.on('error', (err: Error) => {
            return reject(new B2ApiError('UploadFile error', { cause: err }));
          });
          res.on('data', (chunk: Buffer) => { resChunks.push(chunk); });
          res.on('end', () => {
            if (!res.complete) {
              return reject(new B2ApiError('UploadFile interrupted'));
            }
            const resBodyJson: string = Buffer.concat(resChunks).toString('utf-8');
            try {
              const resBodyObj = JSON.parse(resBodyJson);
              if (B2ApiError.isB2ApiError(resBodyObj) || res.statusCode !== 200) {
                return reject(B2ApiError.fromObj(resBodyObj, 'UploadFile failed'));
              }
              return resolve({
                fileId: String(assertPrimitiveField(resBodyObj, 'fileId', 'string')),
                fileName: String(assertPrimitiveField(resBodyObj, 'fileName', 'string')),
                bucketId: String(assertPrimitiveField(resBodyObj, 'bucketId', 'string')),
                contentLength: Number(assertPrimitiveField(resBodyObj, 'contentLength', 'number')),
                contentSha1: String(assertPrimitiveField(resBodyObj, 'contentSha1', 'string')),
              });
            } catch (err: unknown) {
              if (err instanceof Error) {
                return reject(new B2ApiError(
                  `Failed to parse UploadFile response. JSON=${resBodyJson}`,
                  { cause: err }
                ));
              }
              return reject(err);
            }
          });
        });
        req.write(this.args.payload, (err: Error | null | unknown) => {
          if (err instanceof Error) {
            return reject(new B2ApiError('UploadFile failed', { cause: err }));
          }
          // success!
        });
        req.end();
      }
    )
  }
}
