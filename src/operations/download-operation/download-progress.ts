import * as fsPromises from 'node:fs/promises';
import * as crypto from 'node:crypto';
import * as path from 'node:path';

import * as t from 'io-ts';
import { PathReporter } from 'io-ts/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import { fullRead } from '../../utils/file-full-read';
import { sha1Hex } from '../../utils/hasher';
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
  constructor(public chunks: DownloadProgressChunks) { }

  static async fromJsonFile(
    downloadFilePath: string,
    jsonFilePath?: string
  ): Promise<DownloadProgress> {
    jsonFilePath = jsonFilePath ?? DownloadProgress.DEFAULT_PROGRESS_FILE_NAME;
    if (!jsonFilePath || !filePathExists(jsonFilePath)) {
      return new DownloadProgress({
        absoluteFilePath: path.resolve(downloadFilePath),
        chunks: []
      });
    }
    const json: string = await fsPromises.readFile(
      jsonFilePath ?? DownloadProgress.DEFAULT_PROGRESS_FILE_NAME,
      { encoding: 'utf-8' }
    );

    const decoded = DownloadChunks.decode(JSON.parse(json));
    if (isLeft(decoded)) {
      throw new Error(`Could not validate data: ${PathReporter.report(decoded).join('\n')}`);
    }

    return new DownloadProgress(decoded.right);
  }

  async writeToFile(filePath?: string) {
    await fsPromises.writeFile(
      filePath ?? DownloadProgress.DEFAULT_PROGRESS_FILE_NAME,
      JSON.stringify(this.chunks)
    );
  }

  recordChunk(startByte: number, chunk: Buffer) {
    this.chunks.chunks.push({
      startByte,
      length: chunk.length,
      hash: sha1Hex(chunk)
    });
  }

  async syncPartiallyDownloadedFile(): Promise<number> {
    if (this.chunks.chunks.length <= 0) {
      console.log('syncPartiallyDownloadedFile no chunks');
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
        const curChunk: DownloadChunkType = this.chunks.chunks[chunkIdx];
        if (
          ((curChunk.startByte + curChunk.length) > partialDownloadFileLen)
          || (curChunk.startByte != curVerified)
        ) {
          console.log('syncPartiallyDownloadedFile reached end of chunks');
          this.chunks.chunks = this.chunks.chunks.slice(0, chunkIdx);
          await partialDownloadFile.truncate(curVerified);
          return curVerified;
        }
        const buf: Buffer = await fullRead(
          partialDownloadFile,
          curChunk.startByte,
          curChunk.length
        );
        const hash: string = sha1Hex(buf);
        console.log(`hash=${hash}`);
        if (hash !== curChunk.hash) {
          console.log(`syncPartiallyDownloadedFile mismatch hash, curVerified=${curVerified}`);
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
