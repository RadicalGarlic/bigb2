import {
  AuthorizeAccountResponseType
} from '#internal/b2/api/authorize-account';
import { authorize } from '#internal/b2/auth';
import {
  ListBucketsRequest,
  ListBucketsResponseType
} from '#internal/b2/api/list-buckets';

export async function listBucketsOperation() {
  const auths: AuthorizeAccountResponseType = await authorize();
  const bucketsRes: ListBucketsResponseType = await new ListBucketsRequest(
    new URL(auths.apiUrl),
    auths.authorizationToken,
    auths.accountId
  ).send();
  console.log(JSON.stringify(bucketsRes));
}
