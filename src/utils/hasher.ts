import * as crypto from 'node:crypto';

export function sha1Hex(buf: Buffer): string {
  const hash: crypto.Hash = crypto.createHash('sha1');
  hash.update(buf);
  return hash.digest('hex');
}
