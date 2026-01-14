import * as http from 'node:http';
import * as https from 'node:https';

import { UrlProvider } from 'b2-iface/url-provider';
import { ByteRange } from 'b2-api/utils/byte-range';
import { B2ApiError } from 'b2-api/b2-api-error';
import { B2Api } from 'b2-api/b2-api';
import { peckPrimitiveField } from 'utils/peck';

export interface CopyPartResponse {
  fileId: string,
  partNumber: number,
  contentLength: number,
}

export class CopyPartRequest {
  constructor(private args: {
    apiUrl: URL,
    authToken: string,
    srcFileId: string,
    dstLargeFileId: string,
    range?: ByteRange,
    partNumber: number,
  }) { }

  async send(): Promise<CopyPartResponse> {
    return new Promise<CopyPartResponse>(
      (resolve, reject) => {
        const url: URL = UrlProvider.startLargeFileUrl(this.args.apiUrl);
        const req: http.ClientRequest = https.request(
          url,
          {
            headers: { Authorization: this.args.authToken },
            method: 'POST'
          }
        );
        req.on('error', (err: Error) => {
          return reject(new B2ApiError('CopyPart call failed', { cause: err }));
        });
        req.on('response', (res: http.IncomingMessage) => {
          const resChunks: Buffer[] = [];
          res.on('error', (err: Error) => {
            return reject(new B2ApiError('CopyPart call failed', { cause: err }));
          });
          res.on('data', (chunk: Buffer) => { resChunks.push(chunk); });
          res.on('end', () => {
            if (!res.complete) {
              return reject(new B2ApiError('CopyPart interrupted'));
            }
            const resBodyString: string = Buffer.concat(resChunks).toString('utf-8');
            const resBodyObj = JSON.parse(resBodyString);
            if (B2ApiError.isB2ApiError(resBodyString)) {
              return reject(B2ApiError.fromJson(resBodyString, 'CopyPart error'));
            }
            return resolve({
              fileId: String(peckPrimitiveField(resBodyObj, 'fileId', 'string')),
              partNumber: Number(peckPrimitiveField(resBodyObj, 'partNumber', 'number')),
              contentLength: Number(peckPrimitiveField(resBodyObj, 'contentLength', 'number')),
            });
          });
        });
        req.write(
          JSON.stringify({
            sourceFileId: this.args.srcFileId,
            largeFileId: this.args.dstLargeFileId,
            partNumber: this.args.partNumber,
            range: this.args.range ? this.args.range.toString() : undefined
          }),
          (err: Error | null | undefined) => {
            if (err instanceof Error) {
              return reject(new B2ApiError('CopyPart error', { cause: err }));
            }
            // success!
          }
        );
        req.end();
      }
    )
  }
}
