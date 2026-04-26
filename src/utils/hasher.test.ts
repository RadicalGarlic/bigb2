import { expect, test } from 'vitest'

import { hash, HashOutput } from './hasher';

test('hash empty buffer', () => {
  const out: HashOutput = hash(Buffer.from(''), 'sha1');
  expect(out.toString('hex')).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
});

test('hash string asdf', () => {
  const out: HashOutput = hash(Buffer.from('asdf', 'utf8'), 'sha1');
  expect(out.toString('hex')).toBe('3da541559918a808c2402bba5012f6c60b27661c');
});
