import * as https from 'node:https';
import * as http from 'node:http';

import { UrlProvider } from 'b2-iface/url-provider';
import { B2ApiError } from 'b2-api/b2-api-error';
import { throwExpression } from 'utils/throw-expression';
import { assertNum } from 'utils/num-check';

export interface File {
  accountId: string;
  bucketId: string;
  fileId: string;
  fileName: string;
  contentLength: number;
}

export interface ListFileNamesResponse {
  files: File[];
  nextFileName: string | null;
};

export class ListFileNamesRequest {
  constructor(
    private apiUrl: URL,
    private authToken: string,
    private bucketId: string,
    private maxFileCount?: number,
    private startFilePath?: string
  ) { }

  async send(): Promise<ListFileNamesResponse> {
    return new Promise<ListFileNamesResponse>((resolve, reject) => {
      const url: URL = UrlProvider.listFileNamesUrl(this.apiUrl);
      url.searchParams.append('bucketId', this.bucketId);
      if (this.maxFileCount) {
        url.searchParams.append('maxFileCount', `${this.maxFileCount}`);
      }
      if (this.startFilePath) {
        url.searchParams.append('startFilePath', this.startFilePath);
      }
      https.get(
        url,
        {
          headers: { Authorization: this.authToken }
        },
        (res: http.IncomingMessage) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => { chunks.push(chunk); });
          res.on('error', (err: Error) => {
            return reject(new B2ApiError('ListFileNamesRequest error', { cause: err }));
          });
          res.on('end', () => {
            if (!res.complete) {
              return reject(new B2ApiError('ListFileNamesRequest interrupted'));
            }
            const resBodyString: string = Buffer.concat(chunks).toString('utf-8');
            const resBodyObj = JSON.parse(resBodyString);
            return resolve({
              files: resBodyObj?.files?.map((file: any) => {
                return {
                  accountId: file?.accountId
                    ?? throwExpression(new B2ApiError(`ListFileNamesRequest parse error (accountId). JSON=${resBodyString}`)),
                  bucketId: file?.bucketId
                    ?? throwExpression(new B2ApiError(`ListFileNamesRequest parse error (bucketId). JSON=${resBodyString}`)),
                  fileId: file?.fileId
                    ?? throwExpression(new B2ApiError(`ListFileNamesRequest parse error (fileId). JSON=${resBodyString}`)),
                  fileName: file?.fileName
                    ?? throwExpression(new B2ApiError(`ListFileNamesRequest parse error (fileName). JSON=${resBodyString}`)),
                  contentLength:
                    assertNum(file?.contentLength, new B2ApiError(`ListFileNamesRequest parse error (contentLength). JSON=${resBodyString}`)),
                };
              }),
              nextFileName: resBodyObj?.nextFileName,
            });
          });
        }
      );
    });
  }
}
