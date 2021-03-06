package bbb2;

import java.net.http.HttpResponse;
import java.util.ArrayList;

import bbb2.api.ApiErrorException;
import bbb2.util.http.HttpStatusCodes;
import bbb2.util.http.Stringer;
import bbb2.util.json.JsonParseException;
import bbb2.util.json.JsonValueProxy;

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

    public ListBucketsResult(HttpResponse<String> res)
    throws ApiErrorException, JsonParseException
    {
        if (res.statusCode() == HttpStatusCodes.OK.getInt())
        {
            JsonValueProxy json = new JsonValueProxy(res.body());
            JsonValueProxy resBuckets = json.get("buckets");
            for (int i = 0; i < resBuckets.getArrayLen(); ++i)
            {
                ListBucketsResult.Bucket newBucket
                = new ListBucketsResult.Bucket(resBuckets.get(i));

                buckets.add(newBucket);
            }
        }
        else
        {
            throw new ApiErrorException(Stringer.toString(res));
        }
    }

    public ArrayList<ListBucketsResult.Bucket> buckets;
}
