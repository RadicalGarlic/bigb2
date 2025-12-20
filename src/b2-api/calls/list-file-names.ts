import * as https from 'node:https';
import * as http from 'node:http';

import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import { UrlProvider } from 'b2-iface/url-provider';

export class ListFileNamesRequest {
  constructor(
    private apiUrl: URL,
    private authToken: string,
    private bucketId: string,
    private maxFileCount?: number,
    private startFileName?: string
  ) { }

  async send(): Promise<ListFileNamesResponseType> {
    return new Promise<ListFileNamesResponseType>((resolve, reject) => {
      const url: URL = UrlProvider.listFileNamesUrl(this.apiUrl);
      url.searchParams.append('bucketId', this.bucketId);
      if (this.maxFileCount) {
        url.searchParams.append('maxFileCount', `${this.maxFileCount}`);
      }
      if (this.startFileName) {
        url.searchParams.append('startFileName', this.startFileName);
      }
      const req: http.ClientRequest = https.get(
        url,
        {
          headers: { Authorization: this.authToken }
        },
        ((res: http.IncomingMessage) => {
          const chunks: string[] = [];
          res.on('data', (chunk: string) => { chunks.push(chunk); });
          res.on('error', (err: Error) => { reject(err); });
          res.on('end', () => {
            if (!res.complete) {
              reject(new Error('API call interrupted'));
            } else {
              const resBody: string = JSON.parse(chunks.join(''));
              const decoded = ListFileNamesResponse.decode(resBody);
              if (isLeft(decoded)) {
                reject(new Error(`Could not validate data: ${PathReporter.report(decoded).join('\n')}`));
              } else {
                resolve(decoded.right);
              }
            }
          });
        })
      );
      req.on('error', (err: Error) => {
        reject(err);
      });
    });
  }
}

const B2File = t.type({
  accountId: t.string,
  bucketId: t.string,
  fileId: t.string,
  fileName: t.string,
  contentLength: t.number
});
export type B2FileType = t.TypeOf<typeof B2File>;

const ListFileNamesResponse = t.type({
  files: t.array(B2File),
  nextFileName: t.union([t.string, t.null])
});
export type ListFileNamesResponseType = t.TypeOf<typeof ListFileNamesResponse>;
