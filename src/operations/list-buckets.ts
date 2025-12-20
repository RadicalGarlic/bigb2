import {
  ListBucketsResponse,
} from 'b2-api/calls/list-buckets';
import { B2Api } from 'b2-api/b2-api';

export async function listBucketsOperation() {
  const b2Api = await B2Api.fromKeyFile();
  const bucketsRes: ListBucketsResponse = await b2Api.listBuckets();
  console.log(JSON.stringify(bucketsRes, undefined, 2));
}
