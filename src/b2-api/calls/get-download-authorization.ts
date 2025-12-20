import * as https from 'node:https';
import * as http from 'node:http';
import { IncomingMessage } from 'node:http';
import { URL } from 'node:url';

import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import { UrlProvider } from 'b2-iface/url-provider';

export class GetDownloadAuthorizationRequest {
  constructor(
    private apiUrl: URL,
    private authToken: string,
    private bucketId: string,
    private fileNamePrefix: string
  ) { }

  async send(): Promise<GetDownloadAuthorizationResponseType> {
    return new Promise<GetDownloadAuthorizationResponseType>(
      (resolve, reject) => {
        const url: URL = UrlProvider.getDownloadAuthorizationUrl(this.apiUrl);
        const req: http.ClientRequest = https.request(
          url,
          {
            headers: { Authorization: this.authToken },
            method: 'POST'
          },
        );
        req.on('response', (res: http.IncomingMessage) => {
          const resChunks: string[] = [];
          res.on('error', (err: Error) => { reject(err); });
          res.on('data', (chunk: string) => { resChunks.push(chunk); });
          res.on('end', () => {
            const resBody: string = resChunks.join('');
            const decoded = GetDownloadAuthorizationResponse.decode(
              JSON.parse(resBody)
            );
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
          fileNamePrefix: this.fileNamePrefix,
          validDurationInSeconds: 432000 // 5 days in seconds
        }));
        req.end();
      }
    );
  }
}

const GetDownloadAuthorizationResponse = t.type({
  bucketId: t.string,
  fileNamePrefix: t.string,
  authorizationToken: t.string
});
export type GetDownloadAuthorizationResponseType = t.TypeOf<
  typeof GetDownloadAuthorizationResponse
>;
