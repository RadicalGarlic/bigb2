import * as fsPromises from 'node:fs/promises';
import * as path from 'node:path';

import { fullRead } from 'utils/file-full-read';
import { hash } from 'utils/hasher';
import { filePathExists } from '../../utils/file-path-exists';

export interface DownloadProgressChunk {
  startByte: number;
  length: number;
  hash: string;
}

export interface DownloadProgressChunks {
  absoluteFilePath: string,
  chunks: DownloadProgressChunk[],
}

export class DownloadProgress {
  constructor(public chunks: DownloadProgressChunks, public progressFilePath: string) { }

  public static async initFromFiles(
    downloadFilePath: string,
    downloadProgressFilePath?: string
  ): Promise<DownloadProgress> {
    downloadProgressFilePath = downloadProgressFilePath ?? `.${downloadProgressFilePath}.download-progress.json`;
    if (!downloadProgressFilePath || !filePathExists(downloadProgressFilePath)) {
      return new DownloadProgress(
        {
          absoluteFilePath: path.resolve(downloadFilePath),
          chunks: []
        },
        downloadProgressFilePath,
      );
    }
    const downloadProgressChunksJson: string = await fsPromises.readFile(
      downloadProgressFilePath,
      { encoding: 'utf-8' }
    );
    return new DownloadProgress(JSON.parse(downloadProgressChunksJson), downloadProgressFilePath);
  }

  public async writeToFile(filePath?: string) {
    await fsPromises.writeFile(
      filePath ?? this.progressFilePath,
      JSON.stringify(this.chunks)
    );
  }

  public recordChunk(startByte: number, chunk: Buffer) {
    this.chunks.chunks.push({
      startByte,
      length: chunk.length,
      hash: hash(chunk, 'sha1').toString('hex'),
    });
  }

  public async syncPartiallyDownloadedFile(): Promise<number> {
    if (this.chunks.chunks.length <= 0) {
      return 0;
    }
    let curVerified = 0;
    const partialDownloadFile: fsPromises.FileHandle = await fsPromises.open(
      this.chunks.absoluteFilePath,
      'r'
    );
    try {
      const partialDownloadFileLen = (await partialDownloadFile.stat()).size;
      for (let chunkIdx = 0; chunkIdx < this.chunks.chunks.length; chunkIdx++) {
        const curChunk: DownloadProgressChunk = this.chunks.chunks[chunkIdx];
        if (
          ((curChunk.startByte + curChunk.length) > partialDownloadFileLen)
          || (curChunk.startByte != curVerified)
        ) {
          this.chunks.chunks = this.chunks.chunks.slice(0, chunkIdx);
          await partialDownloadFile.truncate(curVerified);
          return curVerified;
        }
        const buf: Buffer = await fullRead(
          partialDownloadFile,
          curChunk.startByte,
          curChunk.length
        );
        const testHash: string = hash(buf, 'sha1').toString('hex');
        if (testHash !== curChunk.hash) {
          this.chunks.chunks = this.chunks.chunks.slice(0, chunkIdx);
          await partialDownloadFile.truncate(curVerified);
          return curVerified;
        }
        curVerified += curChunk.length;
      }

      if (curVerified !== partialDownloadFileLen) {
        await partialDownloadFile.truncate(curVerified);
      }

      return curVerified;
    } finally {
      await partialDownloadFile.close();
    }
  }
}
