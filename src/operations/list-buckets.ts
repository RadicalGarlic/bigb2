import { AuthorizeAccountResponse } from 'b2-api/authorize-account';
import { authorize } from 'b2-iface/auth';
import {
  ListBucketsRequest,
  ListBucketsResponseType
} from 'b2-api/list-buckets';

export async function listBucketsOperation() {
  const auths: AuthorizeAccountResponse = await authorize();
  const bucketsRes: ListBucketsResponseType = await new ListBucketsRequest(
    new URL(auths.apiUrl),
    auths.authorizationToken,
    auths.accountId
  ).send();
  console.log(JSON.stringify(bucketsRes));
}
