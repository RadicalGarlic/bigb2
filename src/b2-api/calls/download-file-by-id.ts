import * as https from 'node:https';
import * as http from 'node:http';

import { UrlProvider } from 'b2-iface/url-provider';
import { B2ApiError } from 'b2-api/b2-api-error';

export interface DownloadFileByIdResponse {
  payload: Buffer;
}

export class ByteRange {
  constructor(public start: number, public end: number) { }

  toString(): string {
    return `bytes=${this.start}-${this.end}`;
  }
}

export class DownloadFileByIdRequest {
  constructor(
    private downloadUrl: URL,
    private authToken: string,
    private fileId: string,
    private range?: ByteRange
  ) { }

  async send(): Promise<DownloadFileByIdResponse> {
    return new Promise<DownloadFileByIdResponse>((resolve, reject) => {
      const url: URL = UrlProvider.downloadFileByIdUrl(this.downloadUrl);
      let headers = null;
      if (this.range) {
        headers = {
          Authorization: this.authToken,
          Range: this.range.toString(),
        }
      } else {
        headers = { Authorization: this.authToken };
      }
      url.searchParams.append('fileId', this.fileId);
      const req: http.ClientRequest = https.get(
        url,
        { headers },
        (res: http.IncomingMessage) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => { chunks.push(chunk); });
          res.on('error', (err: Error) => {
            return reject(new B2ApiError('DownloadFileById error', { cause: err }));
          });
          res.on('end', () => {
            if (!res.complete) {
              return reject(new B2ApiError('DownloadFileById interrupted'));
            }
            const resBodyBuffer: Buffer = Buffer.concat(chunks);
            const resBodyString: string = resBodyBuffer.toString('utf-8');
            if (B2ApiError.isB2ApiError(resBodyString)) {
              return reject(B2ApiError.fromJson(resBodyString));
            }
            return resolve({ payload: resBodyBuffer });
          });
        }
      );
      req.end();
    });
  }
}
