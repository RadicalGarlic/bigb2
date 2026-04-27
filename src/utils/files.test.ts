import { describe, beforeEach, expect, test, vi } from 'vitest'
vi.mock('node:fs');
vi.mock('node:fs/promises');
import { fs, vol } from 'memfs'
import * as fsPromises from 'node:fs/promises';

import { filePathExists, fileFullRead } from './files';

beforeEach(() => {
  // reset the state of in-memory fs
  vol.reset()
});

describe('filePathExists', () => {
  test('file does exist', async () => {
    const filename = '/file';
    await fs.promises.writeFile(filename, '');
    expect(await filePathExists(filename)).toBe(true);
  });

  test('file does not exist', async () => {
    const filename = '/not_found';
    await fs.promises.rm(filename, { force: true });
    expect(await filePathExists(filename)).toBe(false);
  });
});

describe('fileFullRead', () => {
  test('read nothing', async () => {
    const filename = '/file';
    await fs.promises.writeFile(filename, '');
    let fileHandle = null;
    try {
      fileHandle = await fs.promises.open(filename);

      // @ts-ignore: FileHandle objects don't line up exactly but still good enough for this test
      const buf: Buffer = await fileFullRead(fileHandle, 0, 0);

      expect(buf.length).toBe(0);
    } finally {
      if (fileHandle) {
        fileHandle.close();
      }
    }
  });

  test('read everything', async () => {
    const filename = '/file';
    await fs.promises.writeFile(filename, 'asdf');
    let fileHandle = null;
    try {
      fileHandle = await fs.promises.open(filename);

      // @ts-ignore: FileHandle objects don't line up exactly but still good enough for this test
      const buf: Buffer = await fileFullRead(fileHandle, 0, 4);

      expect(buf.toString('utf8')).toEqual('asdf');
    } finally {
      if (fileHandle) {
        fileHandle.close();
      }
    }
  });

  test('partial offset read', async () => {
    const filename = '/file';
    await fs.promises.writeFile(filename, 'asdf');
    let fileHandle = null;
    try {
      fileHandle = await fs.promises.open(filename);

      // @ts-ignore: FileHandle objects don't line up exactly but still good enough for this test
      const buf: Buffer = await fileFullRead(fileHandle, 3, 1);

      expect(buf.toString('utf8')).toEqual('f');
    } finally {
      if (fileHandle) {
        fileHandle.close();
      }
    }
  });
});
