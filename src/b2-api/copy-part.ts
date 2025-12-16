import * as https from 'node:https';
import * as http from 'node:http';

import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import { UrlProvider } from 'b2-iface/url-provider';
import { Range } from 'b2-iface/range';

export class CopyPartRequest {
  constructor(private args: {
    apiUrl: URL,
    authToken: string,
    srcFileId: string,
    dstLargeFileId: string,
    range?: Range,
    partNumber: number,
  }) {}

  async send(): Promise<CopyPartResponseType> {
    return new Promise<CopyPartResponseType>(
      (resolve, reject) => {
        const url: URL = UrlProvider.startLargeFileUrl(this.args.apiUrl);
        const req: http.ClientRequest = https.request(
          url,
          {
            headers: { Authorization: this.args.authToken },
            method: 'POST'
          }
        );
        req.on('response', (res: http.IncomingMessage) => {
          const resChunks: string[] = [];
          res.on('error', (err: Error) => { reject(err); });
          res.on('data', (chunk: string) => { resChunks.push(chunk); });
          res.on('end', () => {
            const resBody: string = resChunks.join('');
            const decoded = CopyPartResponse.decode(JSON.parse(resBody));
            if (isLeft(decoded)) {
              reject(new Error(`Could not validate data: ${PathReporter.report(decoded).join('\n')}`));
            } else {
              resolve(decoded.right);
            }
          });
        });
        req.on('error', (err: Error) => { reject(err); });
        req.write(JSON.stringify({
          sourceFileId: this.args.srcFileId,
          largeFileId: this.args.dstLargeFileId,
          partNumber: this.args.partNumber,
          range: this.args.range ? this.args.range.toString() : undefined
        }));
        req.end();
      }
    )
  }
}

const CopyPartResponse = t.type({
  fileId: t.string,
  partNumber: t.Int,
  contentLength: t.Int,
});
export type CopyPartResponseType = t.TypeOf<
  typeof CopyPartResponse
>;
