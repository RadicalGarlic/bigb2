import { describe, beforeEach, expect, test, vi } from 'vitest'
vi.mock('node:fs');
vi.mock('node:fs/promises');
import { fs, vol } from 'memfs'

import { filePathExists } from './files';

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
