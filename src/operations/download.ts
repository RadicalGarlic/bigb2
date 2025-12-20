import * as fsPromises from 'node:fs/promises';
import * as path from 'node:path';

import { B2Api } from 'b2-api/b2-api';
import { Bucket, getBucketByName } from 'b2-iface/buckets';
import { File, getFileByPath } from 'b2-iface/files';


import {
  ByteRange,
  DownloadFileByIdRequest,
  DownloadFileByIdResponseType
} from 'b2-api/calls/download-file-by-id';
import { Bigb2Error } from 'bigb2-error';

export async function downloadOperation(
  bucketName: string,
  srcFilePath: string,
  dstFilePath: string
) {
  const b2Api: B2Api = await B2Api.fromKeyFile();
  const bucket: Bucket = await getBucketByName(b2Api, bucketName);
  const file: File = await getFileByPath(b2Api, bucket.bucketId, srcFilePath);








  // if (file.contentLength <= auths.recommendedPartSize) {
  //   const req = new DownloadFileByIdRequest(
  //     new URL(auths.downloadUrl),
  //     auths.authorizationToken,
  //     file.fileId,
  //     new ByteRange(0, file.contentLength - 1)
  //   );
  //   const res: DownloadFileByIdResponseType = await req.send();
  //   await fsPromises.writeFile(dstFilePath, res.payload);
  // } else {
  //   largeDownload(
  //     new URL(auths.downloadUrl),
  //     auths.authorizationToken,
  //     file.fileId,
  //     dstFilePath,
  //     file.contentLength,
  //     auths.recommendedPartSize
  //   );
  // }
}

async function smallDownload() {
}

async function largeDownload(
  downloadUrl: URL,
  authToken: string,
  fileId: string,
  dstFilePath: string,
  fileLen: number,
  chunkSize: number
) {
  // let progress = new DownloadProgress({
  //   absoluteFilePath: path.resolve(dstFilePath),
  //   chunks: []
  // });
  // let curDownloaded = 0;
  // if (await filePathExists(dstFilePath)) {
  //   progress = await DownloadProgress.fromJsonFile(dstFilePath);
  //   curDownloaded = await progress.syncPartiallyDownloadedFile();
  //   console.log(`curDownloaded=${curDownloaded}`);
  // }
  // const dstFile: fsPromises.FileHandle = await fsPromises.open(
  //   dstFilePath,
  //   'a'
  // );
  // try {
  //   let consecutiveAuthFailures = 0;
  //   let consecutiveConnResetErrors = 0;
  //   while (curDownloaded < fileLen) {
  //     try {
  //       if (consecutiveAuthFailures >= 3) {
  //         throw new Bigb2Error(`Max (${consecutiveAuthFailures}) consecutive auth failures reached. Aborting.`);
  //       }
  //       if (consecutiveConnResetErrors >= 3) {
  //         throw new Bigb2Error(`Max (${consecutiveConnResetErrors}) consecutive connection reset errors reached. Aborting.`);
  //       }
  //       if (consecutiveAuthFailures > 0) {
  //         console.log(`Auth expired, re-authing`)
  //         const auths: AuthorizeResult = await authorize();
  //         downloadUrl = new URL(auths.downloadUrl);
  //         authToken = auths.authorizationToken;
  //       }

  //       const req = new DownloadFileByIdRequest(
  //         downloadUrl,
  //         authToken,
  //         fileId,
  //         new ByteRange(
  //           curDownloaded,
  //           Math.min(curDownloaded + chunkSize - 1, fileLen)
  //         )
  //       );
  //       const res: DownloadFileByIdResponseType = await req.send();
  //       await dstFile.appendFile(res.payload);
  //       progress.recordChunk(curDownloaded, res.payload);
  //       await progress.writeToFile();
  //       curDownloaded += res.payload.length;
  //       consecutiveAuthFailures = 0;
  //       console.log(`${curDownloaded}/${fileLen} (%${curDownloaded / fileLen})`);
  //     } catch (err: unknown) {
  //       if (err instanceof B2ApiError) {
  //         if ((err as B2ApiError).isExpiredAuthError()) {
  //           consecutiveAuthFailures += 1;
  //           continue;
  //         }
  //         throw err;
  //       } else if ((err as NodeJS.ErrnoException)?.code === 'ECONNRESET') {
  //         consecutiveConnResetErrors += 1;
  //         console.log(`Connection reset error (${consecutiveConnResetErrors}). Retrying.`);
  //         continue;
  //       }
  //       throw err;
  //     }
  //   }
  //   await fsPromises.rm(
  //     DownloadProgress.DEFAULT_PROGRESS_FILE_NAME,
  //     { force: true }
  //   );
  // } finally {
  //   await dstFile.close();
  // }
}
