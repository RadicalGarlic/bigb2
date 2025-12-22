import * as fsPromises from 'node:fs/promises';
import * as path from 'node:path';

import { B2Api } from 'b2-api/b2-api';
import { Bucket, getBucketByName } from 'b2-iface/buckets';
import { File, getFileByPath } from 'b2-iface/files';
import {
  ByteRange,
  DownloadFileByIdRequest,
  DownloadFileByIdResponse,
} from 'b2-api/calls/download-file-by-id';
import { Bigb2Error } from 'bigb2-error';
import { Operation } from 'operations/operation';
import { UsageError } from 'operations/usage-error';

export class DownloadOperation extends Operation {
  public parseCliArgs(cliArgs: string[]): void {
    if (cliArgs.length < 4) {
      throw new UsageError('Not enough args for download');
    }

    const downloadSrcArgs: string[] = cliArgs[3].split(':');
    if (downloadSrcArgs.length !== 2) {
      throw new UsageError('Unexpected format for download source');
    }
    this.bucketName = downloadSrcArgs[0];
    this.srcFilePath = downloadSrcArgs[1];

    if (cliArgs.length >= 5) {
      this.dstFilePath = cliArgs[4];
    } else {
      this.dstFilePath = path.parse(this.srcFilePath).base;
    }
  }

  public async run(): Promise<number> {
    if (!this.bucketName) {
      throw new UsageError('Failed to find bucket name for download');
    }
    if (!this.srcFilePath) {
      throw new UsageError('Failed to find source file path for download');
    }
    if (!this.dstFilePath) {
      throw new UsageError('Failed to find destination file path for download');
    }
    console.log(`Downloading file "${this.srcFilePath}" from bucket "${this.bucketName}" to "${this.dstFilePath}"`);

    this.b2Api = await B2Api.fromKeyFile();
    if (!this.b2Api.auths) {
      throw new Bigb2Error('Failed to auth B2Api');
    }
    const bucket: Bucket = await getBucketByName(this.b2Api, this.bucketName);
    const file: File = await getFileByPath(this.b2Api, bucket.bucketId, this.srcFilePath);
    if (file.contentLength <= this.b2Api.auths.recommendedPartSize) {
      this.smallDownload(file.fileId, this.dstFilePath);
    } else {
      console.log('largeDownload() not yet implemented');
      // this.largeDownload(
      //   new URL(this.b2Api.auths.downloadUrl),
      //   this.b2Api.auths.authorizationToken,
      //   file.fileId,
      //   this.dstFilePath,
      //   file.contentLength,
      //   this.b2Api.auths.recommendedPartSize
      // );
    }
    return 0;
  }

  private async smallDownload(srcFileId: string, dstFilePath: string) {
    if (!this.b2Api?.auths) {
      throw new Bigb2Error('Auth failed');
    }
    const req = new DownloadFileByIdRequest(
      new URL(this.b2Api.auths.downloadUrl),
      this.b2Api.auths.authorizationToken,
      srcFileId,
    );
    const res: DownloadFileByIdResponse = await req.send();
    await fsPromises.writeFile(dstFilePath, res.payload);
  }

  private async largeDownload(srcFile: File, dstFilePath: string) {
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
      let consecutiveConnResetErrors = 0;
      while (curDownloaded < fileLen) {
        try {
          if (consecutiveAuthFailures >= 3) {
            throw new Bigb2Error(`Max (${consecutiveAuthFailures}) consecutive auth failures reached. Aborting.`);
          }
          if (consecutiveConnResetErrors >= 3) {
            throw new Bigb2Error(`Max (${consecutiveConnResetErrors}) consecutive connection reset errors reached. Aborting.`);
          }
          if (consecutiveAuthFailures > 0) {
            console.log(`Auth expired, re-authing`)
            const auths: AuthorizeResult = await authorize();
            downloadUrl = new URL(auths.downloadUrl);
            authToken = auths.authorizationToken;
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
          consecutiveConnResetErrors = 0;
          console.log(`${curDownloaded}/${fileLen} (%${curDownloaded / fileLen})`);
        } catch (err: unknown) {
          if (err instanceof B2ApiError) {
            if ((err as B2ApiError).isExpiredAuthError()) {
              consecutiveAuthFailures += 1;
              continue;
            }
            throw err;
          } else if ((err as NodeJS.ErrnoException)?.code === 'ECONNRESET') {
            consecutiveConnResetErrors += 1;
            console.log(`Connection reset error (${consecutiveConnResetErrors}). Retrying.`);
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

  private bucketName: string | null = null;
  private srcFilePath: string | null = null;
  private dstFilePath: string | null = null;
  private b2Api: B2Api | null = null;
}
