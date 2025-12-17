import * as fsPromises from 'node:fs/promises';

export async function filePathExists(filePath: string): Promise<boolean> {
  try {
    await fsPromises.stat(filePath);
    return true;
  } catch (err: unknown) {
    const systemErr = err as NodeJS.ErrnoException;
    if (systemErr?.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
}
