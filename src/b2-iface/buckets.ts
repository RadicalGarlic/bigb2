import { Bigb2Error } from "bigb2-error";
import { B2Api } from "b2-api/b2-api";
import { ListBucketsResponse } from "b2-api/calls/list-buckets";

export interface Bucket {
  accountId: string;
  bucketId: string;
  bucketName: string;
}

export async function getBucketByName(b2Api: B2Api, bucketName: string): Promise<Bucket> {
  const buckets: ListBucketsResponse = await b2Api.listBuckets(bucketName);
  if (buckets.buckets.length <= 0) {
    throw new Bigb2Error(`No buckets found for bucket name ${bucketName}`);
  }
  if (buckets.buckets.length > 1) {
    throw new Bigb2Error(`Multiple buckets found for bucket name ${bucketName}`);
  }
  return {
    accountId: buckets.buckets[0].accountId,
    bucketId: buckets.buckets[0].bucketId,
    bucketName: buckets.buckets[0].bucketName,
  };
}
