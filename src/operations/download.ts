import * as fsPromises from 'node:fs/promises';
import * as path from 'node:path';

import {
  AuthorizeAccountResponseType
} from '#internal/b2/api/authorize-account';
import { authorize } from '#internal/b2/auth';
import {
  BucketType,
  ListBucketsRequest,
  ListBucketsResponseType
} from '#internal/b2/api/list-buckets';
import {
  B2FileType,
  ListFileNamesRequest,
  ListFileNamesResponseType
} from '#internal/b2/api/list-file-names';
import {
  ByteRange,
  DownloadFileByIdRequest,
  DownloadFileByIdResponseType
} from '#internal/b2/api/download-file-by-id';
import { filePathExists } from '#internal/utils/file-path-exists';
import { DownloadChunkType, DownloadProgress } from '#internal/utils/download-progress';

export async function downloadOperation(
  bucketName: string,
  srcFilePath: string,
  dstFilePath: string)
{
  const auths: AuthorizeAccountResponseType = await authorize();

  const buckets: ListBucketsResponseType = await (new ListBucketsRequest(
    new URL(auths.apiUrl),
    auths.authorizationToken,
    auths.accountId,
    bucketName)
  ).send();
  if (buckets.buckets.length <= 0) {
    throw new Error(`No buckets found for bucket name ${bucketName}`);
  }
  if (buckets.buckets.length > 1) {
    console.warn(`Multiple buckets found for bucket name ${bucketName}. Using bucket "${buckets.buckets[0].bucketName}".`);
  }
  const bucket: BucketType = buckets.buckets[0];

  const files: ListFileNamesResponseType = await (new ListFileNamesRequest(
    new URL(auths.apiUrl),
    auths.authorizationToken,
    bucket.bucketId,
    1,
    srcFilePath
  )).send();
  if ((files.files.length < 1) || (files.files[0].fileName !== srcFilePath)) {
    throw new Error(`File "${srcFilePath}" not found in bucket "${bucketName}"`);
  }
  const file: B2FileType = files.files[0];

  if (file.contentLength <= auths.recommendedPartSize) {
    const req = new DownloadFileByIdRequest(
      new URL(auths.downloadUrl),
      auths.authorizationToken,
      file.fileId,
      new ByteRange(0, file.contentLength - 1)
    );
    const res: DownloadFileByIdResponseType = await req.send();
    await fsPromises.writeFile(dstFilePath, res.payload);
  } else {
    downloadLargeFile(
      new URL(auths.downloadUrl),
      auths.authorizationToken,
      file.fileId,
      dstFilePath,
      file.contentLength,
      auths.recommendedPartSize
    );
  }
}

async function downloadLargeFile(
  downloadUrl: URL,
  authToken: string,
  fileId: string,
  dstFilePath: string,
  fileLen: number,
  chunkSize: number
) {
  let progress = new DownloadProgress({
    absoluteFilePath: path.resolve(dstFilePath),
    chunks: []
  });
  let curDownloaded = 0;
  if (await filePathExists(dstFilePath)) {
    progress = await DownloadProgress.fromJsonFile(dstFilePath);
    curDownloaded = await progress.syncPartiallyDownloadedFile();
    console.log(`curDownloaded=${curDownloaded}`);
  }
  const dstFile: fsPromises.FileHandle = await fsPromises.open(
    dstFilePath,
    'a'
  );
  try {
    let consecutiveAuthFailures = 0;
    while (curDownloaded < fileLen) {
      try {
        if (consecutiveAuthFailures >= 3) {
          throw new Error('Consecutive auth failures');
        }
        const req = new DownloadFileByIdRequest(
          downloadUrl,
          authToken,
          fileId,
          new ByteRange(
            curDownloaded,
            Math.min(curDownloaded + chunkSize - 1, fileLen)
          )
        );
        const res: DownloadFileByIdResponseType = await req.send();
        await dstFile.appendFile(res.payload);
        progress.recordChunk(curDownloaded, res.payload);
        await progress.writeToFile();
        curDownloaded += res.payload.length;
        consecutiveAuthFailures = 0;
        console.log(`${curDownloaded}/${fileLen} (%${curDownloaded / fileLen})`);
      } catch (err: any) {
        if ((err?.b2ErrorBody?.code === 'expired_auth_token')) {
          const auths: AuthorizeAccountResponseType = await authorize();
          downloadUrl = new URL(auths.downloadUrl);
          authToken = auths.authorizationToken;
          consecutiveAuthFailures += 1;
          continue;
        } else if (err?.code === 'ECONNRESET') {
          console.log('ECONNRESET, try again');
          continue;
        }
        throw err;
      }
    }
    await fsPromises.rm(
      DownloadProgress.DEFAULT_PROGRESS_FILE_NAME,
      { force: true }
    );
  } finally {
    await dstFile.close();
  }
}
