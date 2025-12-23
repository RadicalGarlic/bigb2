import * as fsPromises from 'node:fs/promises';

import { Bigb2Error } from 'bigb2-error';

export async function filePathExists(filePath: string): Promise<boolean> {
  try {
    await fsPromises.stat(filePath);
    return true;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}

export async function fileFullRead(
  file: fsPromises.FileHandle,
  offset: number,
  length: number
): Promise<Buffer> {
  const buf: Buffer = Buffer.alloc(length);
  let bytesRead = 0;
  while (bytesRead < length) {
    const read: number = (await file.read(
      buf,
      bytesRead,
      length - bytesRead,
      offset + bytesRead
    )).bytesRead;
    bytesRead += read;
  }
  if ((bytesRead !== length) || (bytesRead != buf.length)) {
    throw new Bigb2Error(`Full read length mismatch. bytesRead=${bytesRead}, length=${length}, buf.length=${buf.length}`);
  }
  return buf;
}

export async function getFileLength(filePath: string): Promise<number> {
  let fileHandle: fsPromises.FileHandle | null = null;
  try {
    fileHandle = await fsPromises.open(filePath, 'r');
    return (await fileHandle.stat()).size;
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw new Bigb2Error(`Failed to get length for file "${filePath}"`, { cause: e });
    }
    throw e;
  } finally {
    if (fileHandle) {
      await fileHandle.close();
    }
  }
}
