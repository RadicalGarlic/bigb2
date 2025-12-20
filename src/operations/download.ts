import * as fsPromises from 'node:fs/promises';
import * as path from 'node:path';

import {
  Bucket,
  ListBucketsRequest,
  ListBucketsResponse
} from 'b2-api/calls/list-buckets';
import {
  B2FileType,
  ListFileNamesRequest,
  ListFileNamesResponseType
} from 'b2-api/calls/list-file-names';
import {
  ByteRange,
  DownloadFileByIdRequest,
  DownloadFileByIdResponseType
} from 'b2-api/calls/download-file-by-id';
import { filePathExists } from 'utils/file-path-exists';
import { DownloadChunkType, DownloadProgress } from 'utils/download-progress';
import { B2ApiError } from 'b2-api/b2-api-error';
import { Bigb2Error } from 'bigb2-error';

export async function downloadOperation(
  bucketName: string,
  srcFilePath: string,
  dstFilePath: string
) {
  // const auths: AuthorizeResult = await authorize();

  // const buckets: ListBucketsResponse = await (new ListBucketsRequest(
  //   new URL(auths.apiUrl),
  //   auths.authorizationToken,
  //   auths.accountId,
  //   bucketName)
  // ).send();
  // if (buckets.buckets.length <= 0) {
  //   throw new Bigb2Error(`No buckets found for bucket name ${bucketName}`);
  // }
  // if (buckets.buckets.length > 1) {
  //   console.warn(`Multiple buckets found for bucket name ${bucketName}. Using bucket "${buckets.buckets[0].bucketName}".`);
  // }
  // const bucket: Bucket = buckets.buckets[0];

  // const files: ListFileNamesResponseType = await (new ListFileNamesRequest(
  //   new URL(auths.apiUrl),
  //   auths.authorizationToken,
  //   bucket.bucketId,
  //   1,
  //   srcFilePath
  // )).send();
  // if ((files.files.length < 1) || (files.files[0].fileName !== srcFilePath)) {
  //   throw new Bigb2Error(`File "${srcFilePath}" not found in bucket "${bucketName}"`);
  // }
  // const file: B2FileType = files.files[0];

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
