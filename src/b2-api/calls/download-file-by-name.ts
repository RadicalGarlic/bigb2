import * as https from 'node:https';
import * as http from 'node:http';
import * as path from 'node:path';

export class DownloadFileByNameRequest {
  constructor(
    private downloadUrl: URL,
    private authToken: string,
    private bucketName: string,
    private filePath: string
  ) { }

  async send(): Promise<DownloadFileByNameResponseType> {
    return new Promise<DownloadFileByNameResponseType>((resolve, reject) => {
      const url: URL = new URL(
        `${this.bucketName}${path.sep}${this.filePath}`,
        this.downloadUrl
      );
      const req: http.ClientRequest = https.get(
        url,
        {
          headers: { Authorization: this.authToken }
        },
        ((res: http.IncomingMessage) => {
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => {
            chunks.push(chunk);
          });
          res.on('error', (err: Error) => {
            reject(err);
          });
          res.on('end', () => {
            if (!res.complete) {
              reject(new Error('API call interrupted'));
            } else {
              resolve({ payload: Buffer.concat(chunks) });
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

export interface DownloadFileByNameResponseType {
  payload: Buffer;
};
