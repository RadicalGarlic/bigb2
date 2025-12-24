import * as https from 'node:https';
import * as http from 'node:http';

import { UrlProvider } from 'b2-iface/url-provider';
import { B2ApiError } from 'b2-api/b2-api-error';

export interface Part {
  fileId: string;
  partNumber: number;
  contentLength: number;
  contentSha1: string;
}

export interface ListPartsResponse {
  parts: Part[];
  nextPartNumber: number;
}

export class ListPartsRequest {
  constructor(private args: {
    apiUrl: URL,
    authToken: string,
    fileId: string,
    startPartNumber?: number,
    maxPartCount?: number,
  }) { }

  async send(): Promise<ListPartsResponse> {
    return new Promise<ListPartsResponse>(
      (resolve, reject) => {
        const url: URL = UrlProvider.listPartsUrl(this.args.apiUrl);
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
            reject(new B2ApiError('ListParts error', { cause: err }));
          });
          res.on('data', (chunk: Buffer) => { resChunks.push(chunk); });
          res.on('end', () => {
            if (!res.complete) {
              return reject(new B2ApiError('ListParts interrupted'));
            }
            const resBodyJson: string = Buffer.concat(resChunks).toString('utf-8');
            const resBodyObj = JSON.parse(resBodyJson);
            if (B2ApiError.isB2ApiError(resBodyJson) || res.statusCode !== 200) {
              return reject(B2ApiError.fromJson(resBodyJson));
            }
            try {
              return resolve({
                parts: resBodyObj!.files!.map((value: any) => {
                  return {
                    fileId: value!.fileId,
                    partNumber: value!.partNumber,
                    contentLength: value!.contentLength,
                    contentSha1: value!.contentSha1,
                  }
                }),
                nextPartNumber: resBodyObj!.nextPartNumber,
              });
            } catch (err: unknown) {
              if (err instanceof Error) {
                return reject(new B2ApiError(
                  `Failed to parse ListParts. JSON=${resBodyJson}`,
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
