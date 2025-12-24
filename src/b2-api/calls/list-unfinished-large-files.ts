import * as https from 'node:https';
import * as http from 'node:http';

import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import { UrlProvider } from 'b2-iface/url-provider';
import { Range } from 'b2-iface/range';
import { B2ApiError } from 'b2-api/b2-api-error';
import { B2Api } from 'b2-api/b2-api';

export interface UnfinishedLargeFile {
  accountId: string;
  action: string; // TODO: Restrict to documented values
  bucketId: string;
  fileId: string;
  fileName: string;
  contentLength: number;
}

export interface ListUnfinishedLargeFilesResponse {
  files: UnfinishedLargeFile[];
  nextFileId: string;
}

export class ListUnfinishedLargeFilesRequest {
  constructor(private args: {
    apiUrl: URL,
    authToken: string,
    bucketId: string,
    namePrefix?: string,
    startFileId?: Range,
    maxFileCount?: number,
  }) { }

  async send(): Promise<ListUnfinishedLargeFilesResponse> {
    return new Promise<ListUnfinishedLargeFilesResponse>(
      (resolve, reject) => {
        const url: URL = UrlProvider.listUnfinishedLargeFilesUrl(this.args.apiUrl);
        const req: http.ClientRequest = https.request(
          url,
          {
            headers: { Authorization: this.args.authToken },
            method: 'GET'
          }
        );
        req.on('response', (res: http.IncomingMessage) => {
          const resChunks: Buffer[] = [];
          res.on('error', (err: Error) => {
            reject(new B2ApiError('ListUnfinishedLargeFiles error', { cause: err }));
          });
          res.on('data', (chunk: Buffer) => { resChunks.push(chunk); });
          res.on('end', () => {
            if (!res.complete) {
              return reject(new B2ApiError('ListUnfinishedLargeFiles interrupted'));
            }
            const resBodyJson: string = Buffer.concat(resChunks).toString('utf-8');
            const resBodyObj = JSON.parse(resBodyJson);
            if (B2ApiError.isB2ApiError(resBodyJson) || res.statusCode !== 200) {
              return reject(B2ApiError.fromJson(resBodyJson));
            }
            try {
              return resolve({
                files: resBodyObj!.files!.map((value: any) => {
                  return {
                    accountId: value!.accountId,
                    action: value!.action,
                    bucketId: value!.bucketId,
                    fileId: value!.fileId,
                    fileName: value!.fileName,
                    contentLength: value!.contentLength,
                  }
                }),
                nextFileId: resBodyObj!.nextFileId,
              });
            } catch (err: unknown) {
              if (err instanceof Error) {
                return reject(new B2ApiError(
                  `Failed to parse ListUnfinishedLargeFilesResponse. JSON=${resBodyJson}`,
                  { cause: err }
                ));
              }
              return reject(err);
            }
          });
        });
        req.end();
      }
    )
  }
}
