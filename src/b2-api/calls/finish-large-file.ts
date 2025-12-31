import * as https from 'node:https';
import * as http from 'node:http';

import { B2ApiError } from 'b2-api/b2-api-error';
import { assertPrimitiveField } from 'utils/assert-primitive-field';
import { UrlProvider } from 'b2-iface/url-provider';

export interface FinishLargeFileResponse {
  fileId: string;
  bucketId: string;
  contentLength: number;
}

export class FinishLargeFileRequest {
  constructor(private args: {
    apiUrl: URL,
    authToken: string,
    fileId: string,
    partSha1Array: string[],
  }) { }

  async send(): Promise<FinishLargeFileResponse> {
    const url = UrlProvider.finishLargeFileUrl(this.args.apiUrl);
    return new Promise<FinishLargeFileResponse>(
      (resolve, reject) => {
        const req: http.ClientRequest = https.request(
          url,
          {
            headers: { Authorization: this.args.authToken },
            method: 'POST'
          }
        );
        req.on('error', (err: Error) => {
          return reject(new B2ApiError('FinishLargeFile failed', { cause: err }));
        });
        req.on('response', (res: http.IncomingMessage) => {
          const resChunks: Buffer[] = [];
          res.on('error', (err: Error) => {
            return reject(new B2ApiError('FinishLargeFile error', { cause: err }));
          });
          res.on('data', (chunk: Buffer) => { resChunks.push(chunk); });
          res.on('end', () => {
            if (!res.complete) {
              return reject(new B2ApiError('FinishLargeFile interrupted'));
            }
            const resBodyJson: string = Buffer.concat(resChunks).toString('utf-8');
            const resBodyObj = JSON.parse(resBodyJson);
            if (B2ApiError.isB2ApiError(resBodyObj) || res.statusCode !== 200) {
              return reject(B2ApiError.fromObj(resBodyObj, 'FinishLargeFile failed'));
            }
            try {
              return resolve({
                fileId: String(assertPrimitiveField(resBodyObj, 'fileId', 'string')),
                bucketId: String(assertPrimitiveField(resBodyObj, 'bucketId', 'string')),
                contentLength: Number(assertPrimitiveField(resBodyObj, 'contentLength', 'number')),
              });
            } catch (err: unknown) {
              if (err instanceof Error) {
                return reject(new B2ApiError(
                  `Failed to parse FinishLargeFile response. JSON=${resBodyJson}`,
                  { cause: err }
                ));
              }
              return reject(err);
            }
          });
        });
        req.write(
          JSON.stringify({
            fileId: this.args.fileId,
            partSha1Array: this.args.partSha1Array,
          }),
          (err: Error | null | undefined) => {
            if (err instanceof Error) {
              return reject(new B2ApiError(`Failed send UploadPart`, { cause: err }));
            }
            // success!
          }
        );
        req.end();
      }
    )
  }
}
