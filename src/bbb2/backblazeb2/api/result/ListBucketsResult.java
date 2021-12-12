package bbb2.backblazeb2.api.result;

import java.net.http.HttpResponse;
import java.util.ArrayList;

import bbb2.Util;
import bbb2.exception.Bbb2Exception;
import bbb2.http.HttpStatusCodes;
import bbb2.json.JsonValueProxy;

public class ListBucketsResult
{
    public static class Bucket
    {
        public Bucket(JsonValueProxy json)
        throws JsonParseException
        {
            name = json.get("bucketName").asString();
            id = json.get("bucketId").asString();
        }

        public String getName() { return name; }
        public String getId() { return id; }

        private String name;
        private String id;
    }

    public ListBucketsResult(HttpResponse<String> reply) throws Bbb2Exception
    {
        this.buckets = new ArrayList<ListBucketsResult.Bucket>();
        if (reply.statusCode() == HttpStatusCodes.OK.getInt())
        {
            JsonValueProxy json = new JsonValueProxy(res.body());
            JsonValueProxy replyBuckets = json.get("buckets");
            for (int i = 0; i < replyBuckets.getArrayLen(); ++i)
            {
                ListBucketsResult.Bucket newBucket
                    = new ListBucketsResult.Bucket(resBuckets.get(i));
                this.buckets.add(newBucket);
            }
        }
        else
        {
            throw new Bbb2Exception(
                "Bad HTTP status code. " + Util.toString(reply)
            );
        }
    }

    public List<ListBucketsResult.Bucket> buckets;
}
