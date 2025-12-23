import * as fsPromises from 'node:fs/promises';
import * as path from 'node:path';

import { hash } from 'utils/hasher';
import { filePathExists, fileFullRead } from 'utils/files';
import { Bigb2Error } from 'bigb2-error';

export interface DownloadProgressChunk {
  startByte: number;
  length: number;
  hash: string;
}

interface DownloadProgressFile {
  downloadFilePath: string;
  chunks: DownloadProgressChunk[];
}

export class DownloadProgress {
  constructor(
    public downloadFilePath: string,
    public progressFilePath: string,
    public chunks: DownloadProgressChunk[],
  ) { }

  public static async initFromFiles(
    downloadFilePath: string,
    downloadProgressFilePath?: string
  ): Promise<DownloadProgress> {
    const downloadAbsFilePath = path.resolve(downloadFilePath)
    const downloadProgressAbsFilePath = path.resolve(downloadProgressFilePath ?? `.${downloadFilePath}.download-progress.json`);
    if (!filePathExists(downloadProgressAbsFilePath)) {
      return new DownloadProgress(downloadAbsFilePath, downloadProgressAbsFilePath, []);
    }

    const downloadProgressFileJson: string = await fsPromises.readFile(
      downloadProgressAbsFilePath,
      {
        encoding: 'utf-8',
        flag: 'a+',
      },
    );
    let downloadProgressFileObj: DownloadProgressFile | null = null;
    try {
      downloadProgressFileObj = JSON.parse(downloadProgressFileJson);
    } catch (e: unknown) {
      if (e instanceof SyntaxError) {
        return new DownloadProgress(downloadAbsFilePath, downloadProgressAbsFilePath, []);
      }
      throw e;
    }
    if (downloadAbsFilePath !== downloadProgressFileObj!.downloadFilePath) {
      throw new Bigb2Error(
        `Mismatch between given downloadFilePath "${downloadAbsFilePath}" and progress file (${downloadProgressAbsFilePath}) downloadFilePath "${downloadProgressFileObj!.downloadFilePath}"`
      );
    }
    return new DownloadProgress(downloadAbsFilePath, downloadProgressAbsFilePath, downloadProgressFileObj!.chunks);
  }

  public async writeToFile(filePath?: string) {
    const payload: DownloadProgressFile = {
      downloadFilePath: this.downloadFilePath,
      chunks: this.chunks,
    }
    await fsPromises.writeFile(
      filePath ?? this.progressFilePath,
      JSON.stringify(payload),
    );
  }

  public recordChunk(startByte: number, chunk: Buffer) {
    this.chunks.push({
      startByte,
      length: chunk.length,
      hash: hash(chunk, 'sha1').toString('hex'),
    });
  }

  public async syncPartiallyDownloadedFile(): Promise<number> {
    if ((this.chunks.length <= 0) || !filePathExists(this.downloadFilePath)) {
      this.chunks = [];
      return 0;
    }
    let curVerified = 0;
    const partiallyDownloadedFile: fsPromises.FileHandle = await fsPromises.open(
      this.downloadFilePath,
      'a+',
    );
    try {
      const partiallyDownloadedFileLen = (await partiallyDownloadedFile.stat()).size;
      for (let chunkIdx = 0; chunkIdx < this.chunks.length; chunkIdx++) {
        const curChunk: DownloadProgressChunk = this.chunks[chunkIdx];
        if (
          ((curChunk.startByte + curChunk.length) > partiallyDownloadedFileLen)
          || (curChunk.startByte != curVerified)
        ) {
          this.chunks = this.chunks.slice(0, chunkIdx);
          await partiallyDownloadedFile.truncate(curVerified);
          return curVerified;
        }
        const buf: Buffer = await fileFullRead(
          partiallyDownloadedFile,
          curChunk.startByte,
          curChunk.length
        );
        const testHash: string = hash(buf, 'sha1').toString('hex');
        if (testHash !== curChunk.hash) {
          this.chunks = this.chunks.slice(0, chunkIdx);
          await partiallyDownloadedFile.truncate(curVerified);
          return curVerified;
        }
        curVerified += curChunk.length;
      }

      if (curVerified !== partiallyDownloadedFileLen) {
        await partiallyDownloadedFile.truncate(curVerified);
      }

      return curVerified;
    } finally {
      await partiallyDownloadedFile.close();
    }
  }
}
