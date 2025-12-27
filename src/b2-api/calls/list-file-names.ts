import * as https from 'node:https';
import * as http from 'node:http';

import { UrlProvider } from 'b2-iface/url-provider';
import { B2ApiError } from 'b2-api/b2-api-error';
import { assertPrimitiveField } from 'utils/assert-primitive-field';

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
        url.searchParams.append('startFileName', this.startFilePath);
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
            if (res.statusCode !== 200 || B2ApiError.isB2ApiError(resBodyString)) {
              throw new B2ApiError('ListFileNamesRequest error', undefined, resBodyObj);
            }
            try {
              return resolve({
                nextFileName: resBodyObj.nextFileName ?? null,
                files: resBodyObj.files!.map((file: any) => {
                  return {
                    accountId: String(assertPrimitiveField(file, 'accountId', 'string')),
                    bucketId: String(assertPrimitiveField(file, 'bucketId', 'string')),
                    fileId: String(assertPrimitiveField(file, 'fileId', 'string')),
                    fileName: String(assertPrimitiveField(file, 'fileName', 'string')),
                    contentLength: Number(assertPrimitiveField(file, 'contentLength', 'number')),
                  };
                }),
              });
            } catch (err: unknown) {
              if (err instanceof Error) {
                throw new B2ApiError(`ListFileNames response parse error. JSON=${resBodyString}`, { cause: err });
              }
              throw err;
            }
          });
        }
      );
    });
  }
}
