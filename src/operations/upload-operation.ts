import * as fsPromises from 'node:fs/promises';

import { fileFullRead, getFileLength } from "utils/files";
import { Operation } from "./operation";
import { UsageError } from "./usage-error";
import { B2Api } from "b2-api/b2-api";
import { Bucket, getBucketByName } from "b2-iface/buckets";
import { getAllUnfinishedLargeFileParts, getAllUnfinishedLargeFiles, UnfinishedLargeFile, UnfinishedLargeFilePart } from "b2-iface/unfinished-large-files";
import { Bigb2Error } from "bigb2-error";
import { hash } from 'utils/hasher';

interface SyncResult {
  startByte: number;
  startUploadPartNum: number;
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
    // check if file already present on B2
    // check if small or large upload
    // upload


    return 0;
  }

  private async smallUpload(): Promise<void> {
  }

  private async largeUpload(bucketId: string): Promise<void> {
    const startByte = this.syncWithPartiallyUploadedFile(bucketId);
    // check against max part num of 10,000
  }

  private async syncWithPartiallyUploadedFile(bucketId: string): Promise<SyncResult> {
    const unfinishedUploads: UnfinishedLargeFile[] = await getAllUnfinishedLargeFiles(
      this.b2Api!,
      bucketId,
      this.srcFilePath,
    );
    if (unfinishedUploads.length === 0) {
      return { startByte: 0, startUploadPartNum: 0 };
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
      for (const uploadPart of uploadParts) {
        if (uploadPart.partNumber !== (lastPartNumVerified + 1)) {
          return {
            startByte: bytesVerified,
            startUploadPartNum: lastPartNumVerified + 1,
          }
        }
        const srcFilePartHash: string = hash(
          await fileFullRead(srcFileHandle, bytesVerified, uploadPart.contentLength),
          'sha1'
        ).toString('hex');
        if (srcFilePartHash !== uploadPart.contentSha1) {
          return {
            startByte: bytesVerified,
            startUploadPartNum: lastPartNumVerified + 1,
          }
        }
        bytesVerified += uploadPart.contentLength;
        lastPartNumVerified = uploadPart.partNumber;
      }
      return {
        startByte: bytesVerified,
        startUploadPartNum: lastPartNumVerified + 1,
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
