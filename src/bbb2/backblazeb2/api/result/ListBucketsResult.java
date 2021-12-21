package bbb2.backblazeb2.api.result;

import java.util.List;

public class ListBucketsResult
{
    public static class Bucket
    {
        public String bucketName;
        public String bucketId;
    }

    public List<ListBucketsResult.Bucket> buckets;
}
