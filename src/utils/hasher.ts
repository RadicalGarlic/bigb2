import { Bigb2Error } from 'bigb2-error';
import * as crypto from 'node:crypto';

export type HashAlgorithm = 'sha1';

export type HashOutputEncoding = 'hex';

export class HashOutput {
  constructor(public buf: Buffer, public alg: HashAlgorithm) { }
  public toString(encoding: HashOutputEncoding): string {
    let encodingConstant: BufferEncoding | null = null;
    if (encoding === 'hex') {
      encodingConstant = 'hex';
    } else {
      throw new Bigb2Error(`Unexpected hash output format "${encoding}"`);
    }
    return this.buf.toString(encodingConstant);
  }
}

export function hash(buf: Buffer, alg: HashAlgorithm): HashOutput {
  let algString = '';
  if (alg === 'sha1') {
    algString = 'sha1';
  } else {
    throw new Bigb2Error(`Unexpected hash algorithm "${alg}"`);
  }

  const hash: crypto.Hash = crypto.createHash(algString);
  hash.update(buf);
  return new HashOutput(hash.digest(), alg);
}
