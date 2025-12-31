import * as https from 'node:https';
import * as http from 'node:http';

import { B2ApiError } from 'b2-api/b2-api-error';

export const MAX_UPLOAD_PARTS = 10000;

export interface UploadPartResponse {
  fileId: string;
  partNumber: number;
  contentLength: number;
  contentSha1: string;
}

export class UploadPartRequest {
  constructor(private args: {
    uploadPartUrl: URL,
    authToken: string,
    partNumber: number,
    contentLength: number,
    sha1Hex: string,
    payload: Buffer,
  }) { }

  async send(): Promise<UploadPartResponse> {
    return new Promise<UploadPartResponse>(
      (resolve, reject) => {
        const req: http.ClientRequest = https.request(
          this.args.uploadPartUrl,
          {
            headers: {
              Authorization: this.args.authToken ,
              'Content-Length': this.args.contentLength,
              'X-Bz-Part-Number': this.args.partNumber,
              'X-Bz-Content-Sha1': this.args.sha1Hex,
            },
            method: 'POST'
          }
        );
        req.on('response', (res: http.IncomingMessage) => {
          const resChunks: Buffer[] = [];
          res.on('error', (err: Error) => {
            return reject(new B2ApiError('UploadPart error', { cause: err }));
          });
          res.on('data', (chunk: Buffer) => { resChunks.push(chunk); });
          res.on('end', () => {
            if (!res.complete) {
              return reject(new B2ApiError('UploadPart interrupted'));
            }
            const resBodyJson: string = Buffer.concat(resChunks).toString('utf-8');
            const resBodyObj = JSON.parse(resBodyJson);
            if (B2ApiError.isB2ApiError(resBodyJson) || res.statusCode !== 200) {
              return reject(B2ApiError.fromJson(resBodyJson));
            }
            try {
              return resolve({
                fileId: resBodyObj!.fileId,
                partNumber: resBodyObj!.partNumber,
                contentLength: resBodyObj!.contentLength,
                contentSha1: resBodyObj!.contentSha1,
              });
            } catch (err: unknown) {
              if (err instanceof Error) {
                return reject(new B2ApiError(
                  `Failed to parse UploadPart response. JSON=${resBodyJson}`,
                  { cause: err }
                ));
              }
              return reject(err);
            }
          });
        });
        req.write(this.args.payload, (err: Error | null | undefined) => {
          if (err instanceof Error) {
            return reject(new B2ApiError(`Failed send UploadPart`, { cause: err }));
          }
          // success!
        });
        req.end();
      }
    )
  }
}
