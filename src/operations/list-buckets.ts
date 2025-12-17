import { authorize, AuthorizeResult } from 'b2-iface/auth';
import {
  ListBucketsRequest,
  ListBucketsResponseType
} from 'b2-api/list-buckets';

export async function listBucketsOperation() {
  const auths: AuthorizeResult = await authorize();
  const bucketsRes: ListBucketsResponseType = await new ListBucketsRequest(
    new URL(auths.apiUrl),
    auths.authorizationToken,
    auths.accountId
  ).send();
  console.log(JSON.stringify(bucketsRes, undefined, 2));
}
