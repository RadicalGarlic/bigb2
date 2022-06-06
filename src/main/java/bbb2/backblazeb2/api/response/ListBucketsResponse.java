package bbb2.backblazeb2.api.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ListBucketsResponse
{
    public static class Bucket
    {
        @JsonCreator
        public Bucket(
            @JsonProperty(required = true, value = "bucketName") String bucketName,
            @JsonProperty(required = true, value = "bucketId") String bucketId)
        {
            this.bucketName = bucketName;
            this.bucketId = bucketId;
        }

        public String bucketName;
        public String bucketId;
    }

    @JsonCreator
    public ListBucketsResponse(
        @JsonProperty(required = true, value = "buckets") List<ListBucketsResponse.Bucket> buckets)
    {
        this.buckets = buckets;
    }

    public List<ListBucketsResponse.Bucket> buckets;
}
