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

export interface AuthorizeResult {
  accountId: string;
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
  recommendedPartSize: number;
  absoluteMinimumPartSize: number;
}

export async function authorize(key?: AccountKey)
  : Promise<AuthorizeResult>
{
  const resPromise: Promise<AuthorizeAccountResponse> = new AuthorizeAccountRequest(
    key ?? await getAccountKeyFromFile()
  ).send();
  const res: AuthorizeAccountResponse = await resPromise;
  return {
    accountId: res.accountId,
    authorizationToken: res.authorizationToken,
    apiUrl: res.apiUrl,
    downloadUrl: res.downloadUrl,
    recommendedPartSize: res.recommendedPartSize,
    absoluteMinimumPartSize: res.absoluteMinimumPartSize,
  };
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
