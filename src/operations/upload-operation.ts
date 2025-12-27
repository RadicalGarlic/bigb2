import * as fsPromises from 'node:fs/promises';

import { fileFullRead, getFileLength, ScopedFileHandle } from "utils/files";
import { Operation } from "./operation";
import { UsageError } from "./usage-error";
import { B2Api } from "b2-api/b2-api";
import { Bucket, getBucketByName } from "b2-iface/buckets";
import {
  getAllUnfinishedLargeFileParts,
  getAllUnfinishedLargeFiles,
  UnfinishedLargeFile,
  UnfinishedLargeFilePart
} from "b2-iface/unfinished-large-files";
import { Bigb2Error } from "bigb2-error";
import { hash } from 'utils/hasher';
import { File, getFileByPath } from 'b2-iface/files';
import { MAX_UPLOAD_PARTS, UploadPartRequest } from 'b2-api/calls/upload-part';
import { StartLargeFileRequest, StartLargeFileResponse } from 'b2-api/calls/start-large-file';
import { GetUploadPartUrlRequest, GetUploadPartUrlResponse } from 'b2-api/calls/get-upload-part-url';
import { B2ApiError } from 'b2-api/b2-api-error';
import { sleep } from 'utils/sleep';
import { FinishLargeFileRequest, FinishLargeFileResponse } from 'b2-api/calls/finish-large-file';

interface UploadPart {
  partNum: number,
  contentLength: number,
  contentSha1: string,
}

interface UploadProgress {
  fileId: string;
  bytesUploaded: number;
  parts: UploadPart[];
}

interface SyncUploadProgressResult {
  uploadPartSize: number;
  fileId: string;
  bytesUploaded: number;
  srcFileLen: number;
  parts: UploadPart[];
}

interface UploadPartUrlAndAuth {
  url: string;
  authToken: string;
}

export class UploadOperation extends Operation {
  public parseCliArgs(cliArgs: string[]): void {
    if (cliArgs.length < 5) {
      throw new UsageError('Not enough args');
    }
    this.srcFilePath = cliArgs[3];
    const dstStringSplit: string[] = cliArgs[4].split(':');
    if (dstStringSplit.length <= 1) {
      throw new UsageError('Unexpected format for destination');
    }

    this.dstBucketName = dstStringSplit[0];
    this.dstFilePath = dstStringSplit[1];
  }

  public async run(): Promise<number> {
    console.log(`Uploading file "${this.srcFilePath}" to bucket "${this.dstBucketName}" at path "${this.dstFilePath}"`);
    this.b2Api = await B2Api.fromKeyFile();
    const bucket: Bucket = await getBucketByName(this.b2Api, this.dstBucketName);
    const file: File | null = await getFileByPath(this.b2Api, bucket.bucketId, this.dstFilePath);
    if (file) {
      throw new Bigb2Error(`Found existing file in bucket "${bucket.bucketName}" with path "${this.dstFilePath}". Refusing to upload`);
    }

    const uploadProgress: UploadProgress | null = await this.getUploadProgress(bucket.bucketId);
    const srcFileLen: number = await getFileLength(this.srcFilePath);
    if (uploadProgress || (srcFileLen > this.b2Api.auths!.recommendedPartSize)) {
      await this.largeUpload(bucket.bucketId, uploadProgress ?? undefined);
    } else {
      await this.smallUpload();
    }

    return 0;
  }

  private async smallUpload(): Promise<void> {
    throw new Bigb2Error('unimplemented');
  }

  private async largeUpload(
    bucketId: string,
    uploadProgress?: UploadProgress
  ): Promise<void> {
    const syncedUploadProgress: SyncUploadProgressResult = await this.syncUploadProgress(bucketId, uploadProgress);
    const uploadParts: UploadPart[] = await this.uploadParts(syncedUploadProgress);
    await this.finishLargeUpload(
      syncedUploadProgress.fileId,
      uploadParts.map((part: UploadPart) => part.contentSha1),
    );
  }

  private async finishLargeUpload(fileId: string, partSha1Array: string[]): Promise<void> {
    const req = new FinishLargeFileRequest({
      apiUrl: new URL(this.b2Api!.auths!.apiUrl),
      authToken: this.b2Api!.auths!.authorizationToken,
      fileId,
      partSha1Array,
    });
    const res: FinishLargeFileResponse = await req.send();
  }

  private async uploadParts(
    syncedUploadProgress: SyncUploadProgressResult
  ): Promise<UploadPart[]> {
    let bytesUploaded = syncedUploadProgress.bytesUploaded;
    let curPartNum = syncedUploadProgress.parts.length + 1;
    const uploadParts: UploadPart[] = syncedUploadProgress.parts;
    let urlAndAuth: UploadPartUrlAndAuth = await this.getUploadPartUrl(syncedUploadProgress.fileId);
    let consecutiveAuthFailures = 0;
    let consecutiveUploadAuthFailures = 0;
    let consecutiveBackoffErrors = 0;
    const MAX_FAILURES = 3;
    await using srcFileHandle = await ScopedFileHandle.fromPath(this.srcFilePath);
    while (bytesUploaded < syncedUploadProgress.srcFileLen) {
      if (consecutiveAuthFailures > MAX_FAILURES) {
        throw new Bigb2Error('Max consecutive auth failures reached. Aborting.');
      }
      if (consecutiveUploadAuthFailures > MAX_FAILURES) {
        throw new Bigb2Error('Max consecutive upload auth errors reached. Aborting');
      }
      if (consecutiveBackoffErrors > MAX_FAILURES) {
        throw new Bigb2Error('Max consecutive backoff errors reached. Aborting');
      }
      if (curPartNum > MAX_UPLOAD_PARTS) {
        throw new Bigb2Error(`curPartNum=${curPartNum} exceeds max (${MAX_UPLOAD_PARTS}). Aborting`);
      }
      if (bytesUploaded > syncedUploadProgress.srcFileLen) {
        throw new Bigb2Error('Bytes uploaded somehow exceeds source file length Aborting');
      }

      try {
        if (consecutiveBackoffErrors) {
          console.log('Backoff error. Backing off.');
          await sleep(5000);
        }
        if (consecutiveAuthFailures) {
          console.log('Expired auth failure. Re-authing.');
          this.b2Api = await B2Api.fromKeyFile();
        }
        if (consecutiveUploadAuthFailures) {
          console.log('Upload auth failure. Re-authing.');
          urlAndAuth = await this.getUploadPartUrl(syncedUploadProgress.fileId);
        }

        const fileChunk: Buffer = await fileFullRead(
          srcFileHandle.fileHandle,
          bytesUploaded,
          Math.min(
            syncedUploadProgress.uploadPartSize,
            syncedUploadProgress.srcFileLen - bytesUploaded,
          ),
        );
        const contentHash = hash(fileChunk, 'sha1').toString('hex');
        const req = new UploadPartRequest({
          uploadPartUrl: new URL(urlAndAuth.url),
          authToken: urlAndAuth.authToken,
          partNumber: curPartNum,
          contentLength: fileChunk.length,
          sha1Hex: contentHash,
          payload: fileChunk,
        });
        await req.send();
        consecutiveAuthFailures = 0;
        consecutiveUploadAuthFailures = 0;
        consecutiveBackoffErrors = 0;
        bytesUploaded += fileChunk.length;
        curPartNum += 1;
        uploadParts.push({
          partNum: curPartNum,
          contentLength: fileChunk.length,
          contentSha1: contentHash,
        })
      } catch (err: unknown) {
        if (err instanceof B2ApiError) {
          if (err.isExpiredAuthError()) {
            consecutiveAuthFailures += 1;
            continue;
          } else if (err.isServiceUnavailableError503()) {
            consecutiveUploadAuthFailures += 1;
            continue;
          } else if (err.shouldBackOffRetry()) {
            consecutiveBackoffErrors += 1;
            continue;
          } else {
            throw err;
          }
        } else if (err instanceof Error) {
          throw new Bigb2Error('Large upload failed', { cause: err });
        } else {
          throw err;
        }
      }
    }
    if (bytesUploaded !== syncedUploadProgress.srcFileLen) {
      throw new Bigb2Error('Finished uploading parts but bytesUploaded !== srcFileLen. Aborting.');
    }
    return uploadParts;
  }

  private async getUploadPartUrl(fileId: string): Promise<UploadPartUrlAndAuth> {
    const req = new GetUploadPartUrlRequest({
      apiUrl: new URL(this.b2Api!.auths!.apiUrl),
      authToken: this.b2Api!.auths!.authorizationToken,
      fileId,
    });
    const res: GetUploadPartUrlResponse = await req.send();
    return {
      url: res.uploadUrl,
      authToken: res.authorizationToken,
    };
  }

  private async syncUploadProgress(
    bucketId: string,
    uploadProgress?: UploadProgress
  ): Promise<SyncUploadProgressResult> {
    let bytesUploaded = 0;
    let uploadParts: UploadPart[] = [];
    if (uploadProgress) {
      bytesUploaded = uploadProgress.bytesUploaded;
      uploadParts = uploadProgress.parts;
    }
    if (uploadParts.length >= MAX_UPLOAD_PARTS) {
      throw new Bigb2Error(`${MAX_UPLOAD_PARTS} or more upload parts already uploaded. Max is ${MAX_UPLOAD_PARTS} per the docs. Aborting.`);
    }
    const srcFileLen = await getFileLength(this.srcFilePath);
    if (srcFileLen < bytesUploaded) {
      throw new Bigb2Error(`Detected more bytes uploaded than exist in source file. Aborting.`);
    }
    const bytesRemaining = srcFileLen - bytesUploaded;
    const numPartsRemaining = MAX_UPLOAD_PARTS - (uploadProgress?.parts.length ?? 0);
    const uploadPartSize = Math.max(this.b2Api!.auths!.recommendedPartSize, Math.ceil(bytesRemaining / numPartsRemaining));

    let fileId: string = '';
    if (uploadProgress) {
      fileId = uploadProgress.fileId;
    } else {
      const req = new StartLargeFileRequest({
        apiUrl: new URL(this.b2Api!.auths!.apiUrl),
        authToken: this.b2Api!.auths!.authorizationToken,
        bucketId: bucketId,
        dstFilePath: this.dstFilePath,
      });
      const res: StartLargeFileResponse = await req.send();
      fileId = res.fileId;
    }

    return {
      uploadPartSize,
      fileId,
      bytesUploaded,
      srcFileLen,
      parts: uploadParts,
    }
  }

  private async getUploadProgress(bucketId: string): Promise<UploadProgress | null> {
    const unfinishedUploads: UnfinishedLargeFile[] = await getAllUnfinishedLargeFiles(
      this.b2Api!,
      bucketId,
      this.srcFilePath,
    );
    if (unfinishedUploads.length === 0) {
      return null;
    }
    if (unfinishedUploads.length > 1) {
      throw new Bigb2Error(`Multiple unfinished uploads found for file "${this.srcFilePath}" in bucketId=${bucketId}`);
    }
    if (unfinishedUploads[0].fileName !== this.dstFilePath) {
      throw new Bigb2Error(`Name mismatch between unfinished upload (${unfinishedUploads[0].fileName}) and destination file (${this.dstFilePath})`);
    }

    const uploadParts: UnfinishedLargeFilePart[] = await getAllUnfinishedLargeFileParts(
      this.b2Api!,
      unfinishedUploads[0].fileId,
    );
    const srcFileHandle = await fsPromises.open(this.srcFilePath, 'r');
    try {
      let bytesVerified = 0;
      let lastPartNumVerified = 0;
      const verifiedUploadParts: UploadPart[] = [];
      for (const uploadPart of uploadParts) {
        if (uploadPart.partNumber !== (lastPartNumVerified + 1)) {
          return {
            fileId: unfinishedUploads[0].fileId,
            bytesUploaded: bytesVerified,
            parts: verifiedUploadParts,
          }
        }
        const srcFilePartHash: string = hash(
          await fileFullRead(srcFileHandle, bytesVerified, uploadPart.contentLength),
          'sha1'
        ).toString('hex');
        if (srcFilePartHash !== uploadPart.contentSha1) {
          return {
            fileId: unfinishedUploads[0].fileId,
            bytesUploaded: bytesVerified,
            parts: verifiedUploadParts,
          }
        }
        bytesVerified += uploadPart.contentLength;
        lastPartNumVerified = uploadPart.partNumber;
        verifiedUploadParts.push({
          partNum: uploadPart.partNumber,
          contentLength: uploadPart.contentLength,
          contentSha1: uploadPart.contentSha1,
        });
      }
      return {
        fileId: unfinishedUploads[0].fileId,
        bytesUploaded: bytesVerified,
        parts: verifiedUploadParts,
      };
    } finally {
      await srcFileHandle.close();
    }
  }

  private b2Api: B2Api | null = null;
  public srcFilePath: string = '';
  public dstBucketName: string = '';
  public dstFilePath: string = '';
}
