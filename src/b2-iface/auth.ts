import * as fsPromises from 'node:fs/promises';
import * as path from 'path';

import {
  AuthorizeAccountRequest,
  AuthorizeAccountResponse,
} from 'b2-api/authorize-account';
import { throwExpression } from 'utils/throw-expression';

export interface AccountKey {
  keyId: string;
  appKey: string;
}

async function getAccountKeyFromFile(filePath?: string)
  : Promise<AccountKey>
{
  if (!filePath) {
    filePath = path.join(process.env['HOME'] ?? '', '.bigb2', 'key.json');
  }
  const json: string = await fsPromises.readFile(
    filePath,
    { encoding: 'utf-8' }
  );
  const obj = JSON.parse(json);
  return {
    keyId: obj.keyId ?? throwExpression(new Error(`Missing "keyId", ${json}`)),
    appKey: obj.appKey ?? throwExpression(new Error(`Missing "appKey", ${json}`)),
  };
}

export async function authorize(key?: AccountKey)
  : Promise<AuthorizeAccountResponse>
{
  return new AuthorizeAccountRequest(
    key ?? await getAccountKeyFromFile()
  ).send();
}
