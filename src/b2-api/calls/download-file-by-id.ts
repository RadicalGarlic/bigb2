import * as https from 'node:https';
import * as http from 'node:http';

import { UrlProvider } from 'b2-iface/url-provider';
import { B2ApiError } from 'b2-api/b2-api-error';

export class DownloadFileByIdRequest {
  constructor(
    private downloadUrl: URL,
    private authToken: string,
    private fileId: string,
    private range: ByteRange
  ) { }

  async send(): Promise<DownloadFileByIdResponseType> {
    return new Promise<DownloadFileByIdResponseType>((resolve, reject) => {
      const url: URL = UrlProvider.downloadFileByIdUrl(this.downloadUrl);
      url.searchParams.append('fileId', this.fileId);
      const req: http.ClientRequest = https.get(
        url,
        {
          headers: {
            Authorization: this.authToken,
            Range: this.range?.toString() ?? undefined
          }
        },
        (res: http.IncomingMessage) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => { chunks.push(chunk); });
          res.on('error', (err: Error) => {
            console.log(`IncomingMessage error callback`);
            reject(err);
          });
          res.on('end', () => {
            if (!res.complete) {
              reject(new Error('API call interrupted'));
            } else {
              const resBodyBuffer: Buffer = Buffer.concat(chunks);
              const resBodyString: string = resBodyBuffer.toString('utf-8');
              if (B2ApiError.isB2ApiError(resBodyString)) {
                reject(B2ApiError.fromJson(resBodyString));
              }
              resolve({ payload: resBodyBuffer });
            }
          });
        }
      );
      req.on('error', (err: Error) => { reject(err); });
    });
  }
}

export interface DownloadFileByIdResponseType {
  payload: Buffer;
}

export class ByteRange {
  constructor(public start: number, public end: number) {
  }

  toString(): string {
    return `bytes=${this.start}-${this.end}`;
  }
}
