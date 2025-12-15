import * as https from 'node:https';
import { IncomingMessage } from 'node:http';
import { URL } from 'node:url';

import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import { UrlProvider } from '#internal/b2/url-provider';

export class ListBucketsRequest {
  constructor(
    private apiUrl: URL,
    private authToken: string,
    private accountId: string,
    private bucketName?: string
  ) {

  }

  async send(): Promise<ListBucketsResponseType> {
    return new Promise<ListBucketsResponseType>((resolve, reject) => {
      const url: URL = UrlProvider.listBucketsUrl(this.apiUrl);
      url.searchParams.append('accountId', this.accountId);
      if (this.bucketName) {
        url.searchParams.append('bucketName', this.bucketName);
      }
      const messageChunks: string[] = [];
      https.get(
        url,
        {
          headers: { Authorization: this.authToken },
        },
        ((res: IncomingMessage) => {
          res.on('data', (chunk: string) => {
            messageChunks.push(chunk);
          });
          res.on('end', () => {
            if (!res.complete) {
              reject(new Error('Request interrupted'));
            }
            const json: string = messageChunks.join('');
            const decoded = ListBucketsResponse.decode(JSON.parse(json));
            if (isLeft(decoded)) {
              reject(new Error(`Could not validate data: ${PathReporter.report(decoded).join('\n')}`));
            } else {
              resolve(decoded.right);
            }
          });
          res.on('error', (err: Error) => {
            reject(err);
          });
        })
      );
    });
  }
}

const Bucket = t.type({
  bucketId: t.string,
  bucketName: t.string
});
export type BucketType = t.TypeOf<typeof Bucket>;

const ListBucketsResponse = t.type({
  buckets: t.array(Bucket),
});
export type ListBucketsResponseType = t.TypeOf<typeof ListBucketsResponse>;
