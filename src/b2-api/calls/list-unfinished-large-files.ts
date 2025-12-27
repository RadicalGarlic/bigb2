import * as https from 'node:https';
import * as http from 'node:http';

import { UrlProvider } from 'b2-iface/url-provider';
import { B2ApiError } from 'b2-api/b2-api-error';
import { B2Api } from 'b2-api/b2-api';
import { assertPrimitiveField } from 'utils/assert-primitive-field';

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
  nextFileId: string | null;
}

export class ListUnfinishedLargeFilesRequest {
  constructor(private args: {
    apiUrl: URL,
    authToken: string,
    bucketId: string,
    namePrefix?: string,
    startFileId?: string,
    maxFileCount?: number,
  }) { }

  async send(): Promise<ListUnfinishedLargeFilesResponse> {
    return new Promise<ListUnfinishedLargeFilesResponse>(
      (resolve, reject) => {
        const url: URL = UrlProvider.listUnfinishedLargeFilesUrl(this.args.apiUrl);
        url.searchParams.append('bucketId', this.args.bucketId);
        if (this.args.namePrefix) {
          url.searchParams.append('namePrefix', this.args.namePrefix);
        }
        if (this.args.startFileId) {
          url.searchParams.append('startFileId', this.args.startFileId);
        }
        if (this.args.maxFileCount) {
          url.searchParams.append('maxFileCount', String(this.args.maxFileCount));
        }
        const req: http.ClientRequest = https.request(
          url,
          {
            headers: { Authorization: this.args.authToken },
            method: 'GET',
          }
        );
        req.on('error', (err: Error) => {
          return reject(new B2ApiError('ListUnfinishedLargeFiles error', { cause: err }));
        })
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
              return reject(B2ApiError.fromObj(resBodyObj, 'ListUnfinishedLargeFiles failed'));
            }
            try {
              return resolve({
                nextFileId: resBodyObj.nextFileId ?? null,
                files: resBodyObj!.files!.map((value: any) => {
                  return {
                    accountId: String(assertPrimitiveField(value, 'accountId', 'string')),
                    action: String(assertPrimitiveField(value, 'action', 'string')),
                    fileId: String(assertPrimitiveField(value, 'fileId', 'string')),
                    fileName: String(assertPrimitiveField(value, 'fileName', 'string')),
                    contentLength: Number(assertPrimitiveField(value, 'contentLength', 'number')),
                  };
                }),
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
