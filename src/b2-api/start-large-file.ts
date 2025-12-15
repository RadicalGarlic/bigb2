import * as https from 'node:https';
import * as http from 'node:http';
import { B2Error } from 'b2-iface/b2-error';

import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import { UrlProvider } from 'b2-iface/url-provider';

export class StartLargeFileRequest {
  constructor(
    private apiUrl: URL,
    private authToken: string,
    private bucketId: string,
    private dstFilePath: string
  ) {}

  async send(): Promise<StartLargeFileResponseType> {
    return new Promise<StartLargeFileResponseType>(
      (resolve, reject) => {
        const url: URL = UrlProvider.startLargeFileUrl(this.apiUrl);
        const req: http.ClientRequest = https.request(
          url,
          {
            headers: { Authorization: this.authToken },
            method: 'POST'
          }
        );
        req.on('response', (res: http.IncomingMessage) => {
          const resChunks: string[] = [];
          res.on('error', (err: Error) => { reject(err); });
          res.on('data', (chunk: string) => { resChunks.push(chunk); });
          res.on('end', () => {
            const resBody: string = resChunks.join('');
            const decoded = StartLargeFileResponse.decode(JSON.parse(resBody));
            if (isLeft(decoded)) {
              reject(new Error(`Could not validate data: ${PathReporter.report(decoded).join('\n')}`));
            } else {
              resolve(decoded.right);
            }
          });
        });
        req.on('error', (err: Error) => { reject(err); });
        req.write(JSON.stringify({
          bucketId: this.bucketId,
          fileName: this.dstFilePath,
          contentType: 'application/octet-stream'
        }));
        req.end();
      }
    )
  }
}

const StartLargeFileResponse = t.type({
  bucketId: t.string,
  fileId: t.string,
});
export type StartLargeFileResponseType = t.TypeOf<
  typeof StartLargeFileResponse
>;
