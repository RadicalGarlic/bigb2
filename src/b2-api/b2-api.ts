import * as fsPromises from 'node:fs/promises';
import * as path from 'path';

import { Bigb2Error } from "bigb2-error";
import { AuthorizeAccountRequest, AuthorizeAccountResponse } from "./calls/authorize-account";
import { ListBucketsRequest, ListBucketsResponse } from "./calls/list-buckets";
import { throwExpression } from 'utils/throw-expression';

interface AccountKey {
  keyId: string;
  appKey: string;
}

export class B2Api {
  constructor() {
    this.auths = null;
  }

  public static async fromKeyFile(keyFilePath?: string): Promise<B2Api> {
    if (!keyFilePath) {
      keyFilePath = path.join(process.env['HOME'] ?? '', '.bigb2', 'key.json' );
    }
    const keyJson: string = await fsPromises.readFile(
      keyFilePath,
      { encoding: 'utf-8' }
    );
    const keyObj = JSON.parse(keyJson);
    const key = {
      keyId: keyObj.keyId ?? throwExpression(new Bigb2Error(`AccountKey parse error. JSON=${keyJson}`)),
      appKey: keyObj.appKey ?? throwExpression(new Bigb2Error(`AccountKey parse error. JSON=${keyJson}`)),
    };
    const b2Api = new B2Api();
    await b2Api.authorize(key);
    return b2Api;
  }

  async authorize(accountKey: AccountKey): Promise<AuthorizeAccountResponse> {
    const req = new AuthorizeAccountRequest(accountKey)
    this.auths = await req.send();
    return this.auths;
  }

  // async copyPart() {}

  async listBuckets(bucketName?: string): Promise<ListBucketsResponse> {
    if (!this.auths) {
      throw new Bigb2Error('B2Api not authed');
    }
    const req = new ListBucketsRequest(
      new URL(this.auths.apiUrl),
      this.auths.authorizationToken,
      this.auths.accountId,
      bucketName,
    );
    return req.send();
  }

  public auths: AuthorizeAccountResponse | null;
}
