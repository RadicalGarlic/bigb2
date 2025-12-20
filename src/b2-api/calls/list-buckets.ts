import * as https from 'node:https';
import { IncomingMessage } from 'node:http';
import { URL } from 'node:url';

import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import { UrlProvider } from 'b2-iface/url-provider';
import { B2ApiError } from 'b2-api/b2-api-error';
import { throwExpression } from 'utils/throw-expression';
import { B2Api } from 'b2-api/b2-api';

export interface Bucket {
  accountId: string;
  bucketId: string;
  bucketName: string;
}

export interface ListBucketsResponse {
  buckets: Bucket[];
}

export class ListBucketsRequest {
  constructor(
    private apiUrl: URL,
    private authToken: string,
    private accountId: string,
    private bucketName?: string
  ) { }

  async send(): Promise<ListBucketsResponse> {
    return new Promise<ListBucketsResponse>((resolve, reject) => {
      const url: URL = UrlProvider.listBucketsUrl(this.apiUrl);
      url.searchParams.append('accountId', this.accountId);
      if (this.bucketName) {
        url.searchParams.append('bucketName', this.bucketName);
      }
      const chunks: Buffer[] = [];
      https.get(
        url,
        {
          headers: { Authorization: this.authToken },
        },
        (res: IncomingMessage) => {
          res.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
          });
          res.on('end', () => {
            if (!res.complete) {
              return reject(new B2ApiError('ListBucketsRequest interrupted'));
            }
            const resJson: string = Buffer.concat(chunks).toString('utf8');
            const resObj = JSON.parse(resJson);
            if (res.statusCode !== 200 || B2ApiError.isB2ApiError(resJson)) {
              return reject(new B2ApiError('ListBucketsRequest failed', undefined, resObj));
            }
            const buckets: Bucket[] = resObj?.buckets?.map((value: any): Bucket => {
              return {
                accountId: value?.accountId ?? throwExpression(new B2ApiError(`ListBucketsResponse parse error (accountId). JSON=${resJson}`)),
                bucketId: value?.bucketId ?? throwExpression(new B2ApiError(`ListBucketsResponse parse error (bucketId). JSON=${resJson}`)),
                bucketName: value?.bucketName ?? throwExpression(new B2ApiError(`ListBucketsResponse parse error (bucketName). JSON=${resJson}`)),
              };
            }) ?? throwExpression(new B2ApiError(`ListBucketsResponse parse error. JSON=${resJson}`));
            return resolve({ buckets });
          });
          res.on('error', (err: Error) => {
            return reject(new B2ApiError('ListBucketsRequest error', { cause: err }));
          });
        }
      );
    });
  }
}
