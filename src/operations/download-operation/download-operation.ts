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
import { DownloadProgress } from './download-progress';
import { B2ApiError } from 'b2-api/b2-api-error';
import { filePathExists, getFileLength } from 'utils/files';

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

    this.b2Api = await B2Api.fromKeyFile();
    if (!this.b2Api.auths) {
      throw new Bigb2Error('Failed to auth B2Api');
    }
    const bucket: Bucket = await getBucketByName(this.b2Api, this.bucketName);
    const file: File = await getFileByPath(this.b2Api, bucket.bucketId, this.srcFilePath);
    if (await filePathExists(this.dstFilePath)) {
      if (file.contentLength === await getFileLength(this.dstFilePath)) {
        console.log(`Found existing file "${this.dstFilePath}" with same length as source file. Refusing to download.`);
        return 0;
      }
    }
    console.log(`Downloading file "${this.srcFilePath}" from bucket "${this.bucketName}" to "${this.dstFilePath}"`);
    if (file.contentLength <= this.b2Api.auths.recommendedPartSize) {
      this.smallDownload(file.fileId, this.dstFilePath);
    } else {
      this.largeDownload(file, this.dstFilePath);
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
    const progress = await DownloadProgress.initFromFiles(dstFilePath);
    let curDownloaded = await progress.syncPartiallyDownloadedFile();
    console.log(`Synced file download progress. ${curDownloaded} bytes verified.`);

    const dstFile: fsPromises.FileHandle = await fsPromises.open(
      dstFilePath,
      'a',
    );
    try {
      let consecutiveAuthFailures = 0;
      let consecutiveConnResetErrors = 0;
      while (curDownloaded < srcFile.contentLength) {
        try {
          if (consecutiveAuthFailures >= 3) {
            throw new Bigb2Error(`Max (${consecutiveAuthFailures}) consecutive auth failures reached. Aborting.`);
          }
          if (consecutiveConnResetErrors >= 3) {
            throw new Bigb2Error(`Max (${consecutiveConnResetErrors}) consecutive connection reset errors reached. Aborting.`);
          }
          if (consecutiveConnResetErrors > 0) {
            console.log(`Consecutive connection reset errors encountered (${consecutiveConnResetErrors})`);
          }
          if (consecutiveAuthFailures > 0) {
            console.log(`Auth expired. Re-authing.`);
            this.b2Api = await B2Api.fromKeyFile();
          }

          const req = new DownloadFileByIdRequest(
            new URL(this.b2Api!.auths!.downloadUrl),
            this.b2Api!.auths!.authorizationToken,
            srcFile.fileId,
            new ByteRange(
              curDownloaded,
              Math.min(
                curDownloaded + this.b2Api!.auths!.recommendedPartSize - 1,
                srcFile.contentLength
              ),
            )
          );
          const res: DownloadFileByIdResponse = await req.send();
          await dstFile.appendFile(res.payload);
          progress.recordChunk(curDownloaded, res.payload);
          await progress.writeToFile();
          curDownloaded += res.payload.length;
          consecutiveAuthFailures = 0;
          consecutiveConnResetErrors = 0;
          console.log(`${curDownloaded}/${srcFile.contentLength} (%${curDownloaded / srcFile.contentLength})`);
        } catch (err: unknown) {
          if (err instanceof B2ApiError) {
            if ((err as B2ApiError).isExpiredAuthError()) {
              consecutiveAuthFailures += 1;
              continue;
            }
            throw err;
          } else if ((err as NodeJS.ErrnoException)?.code === 'ECONNRESET') {
            consecutiveConnResetErrors += 1;
            continue;
          }
          throw err;
        }
      }
      await fsPromises.rm(
        progress.progressFilePath,
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
