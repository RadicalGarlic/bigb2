package bbb2.backblazeb2.client.response;

import java.util.ArrayList;
import java.util.List;

public class ListBucketsResponse
{
    public static class Bucket
    {
        public Bucket(String id, String name)
        {
            this.id = id;
            this.name = name;
        }

        public String id;
        public String name;
    }

    public ListBucketsResponse(
        bbb2.backblazeb2.api.response.ListBucketsResponse in
    ) {
        this.buckets = new ArrayList<Bucket>();
        for (bbb2.backblazeb2.api.response.ListBucketsResponse.Bucket inBucket
             : in.buckets)
        {
            this.buckets.add(new Bucket(inBucket.bucketId,
                                        inBucket.bucketName));
        }
    }

    public List<Bucket> buckets;
}
