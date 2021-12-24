package bbb2.backblazeb2.api.response;

import java.util.List;

public class ListBucketsResponse
{
    public static class Bucket
    {
        public String bucketName;
        public String bucketId;
    }

    public List<ListBucketsResponse.Bucket> buckets;
}
