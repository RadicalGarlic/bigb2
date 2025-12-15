import * as fsPromises from 'node:fs/promises';

export async function fullRead(
  file: fsPromises.FileHandle,
  offset: number,
  length: number
): Promise<Buffer> {
  const buf: Buffer = Buffer.alloc(length);
  let bytesRead = 0;
  console.log(`length=${length}`);
  while (bytesRead < length) {
    const read: number = (await file.read(
      buf,
      bytesRead,
      length - bytesRead,
      offset + bytesRead
    )).bytesRead;
    console.log(`read=${read}`);
    bytesRead += read;
  }
  if ((bytesRead !== length) || (bytesRead != buf.length)) {
    throw new Error(`Full read length mismatch ${bytesRead} ${length} ${buf.length}`);
  }
  return buf;
}
