import * as fsPromises from 'node:fs/promises';
import * as path from 'path';

import * as t from 'io-ts';
import { PathReporter } from 'io-ts/lib/PathReporter';
import { isLeft } from 'fp-ts/lib/Either';

import {
  AuthorizeAccountRequest,
  AuthorizeAccountResponseType
} from './api/authorize-account';

const AccountKey = t.type({
  keyId: t.string,
  appKey: t.string
});
export type AccountKeyType = t.TypeOf<typeof AccountKey>;

export async function getAccountKeyFromFile(filePath?: string)
  : Promise<AccountKeyType>
{
  if (!filePath) {
    filePath = path.join(process.env['HOME'] ?? '', '.myb2', 'key.json');
  }
  const json: string = await fsPromises.readFile(
    filePath,
    { encoding: 'utf-8' }
  );
  const decoded = AccountKey.decode(JSON.parse(json));
  if (isLeft(decoded)) {
    throw new Error(`Could not validate data: ${PathReporter.report(decoded).join('\n')}`);
  }
  return decoded.right;
}

export async function authorize(key?: AccountKeyType)
  : Promise<AuthorizeAccountResponseType>
{
  return new AuthorizeAccountRequest(
    key ?? await getAccountKeyFromFile()
  ).send();
}
