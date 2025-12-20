import * as https from 'node:https';
import * as http from 'node:http';
import * as path from 'node:path';

import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import { UrlProvider } from 'b2-iface/url-provider';

export class GetFileInfoRequest {
  constructor(
    private apiUrl: URL,
    private authToken: string,
    private fileId: string
  ) { }

  async send(): Promise<GetFileInfoResponseType> {
    return new Promise<GetFileInfoResponseType>((resolve, reject) => {
      const url: URL = UrlProvider.getFileInfo(this.apiUrl);
      url.searchParams.append('fileId', this.fileId);
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
              const decoded = GetFileInfoResponse.decode(resBody);
              if (isLeft(decoded)) {
                reject(new Error(`Could not validate data: ${PathReporter.report(decoded).join('\n')}`));
              } else {
                resolve(decoded.right);
              }
            }
          });
        })
      );
      req.on('error', (err: Error) => { reject(err); });
    });
  }
}

const GetFileInfoResponse = t.type({
  contentLength: t.number,
  accountId: t.string
});
export type GetFileInfoResponseType = t.TypeOf<typeof GetFileInfoResponse>;
