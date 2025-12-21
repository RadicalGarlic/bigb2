import {
  ListBucketsResponse,
} from 'b2-api/calls/list-buckets';
import { B2Api } from 'b2-api/b2-api';
import { Operation } from './operation';

export class ListBuckets extends Operation {
  public parseCliArgs(cliArgs: string[]): void { }

  public async run() {
    const b2Api = await B2Api.fromKeyFile();
    const bucketsRes: ListBucketsResponse = await b2Api.listBuckets();
    console.log(JSON.stringify(bucketsRes, undefined, 2));
    return 0;
  }
}
