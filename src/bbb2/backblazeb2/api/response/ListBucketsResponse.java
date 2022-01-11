package bbb2.backblazeb2.api.response;

import java.util.List;

import com.google.gson.annotations.Expose;

public class ListBucketsResponse
{
    public static class Bucket
    {
        @Expose public String bucketName;
        @Expose public String bucketId;
    }

    @Expose
    public List<ListBucketsResponse.Bucket> buckets;
}
