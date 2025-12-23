import * as fsPromises from 'node:fs/promises';

import { Bigb2Error } from 'bigb2-error';

export async function fullRead(
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
