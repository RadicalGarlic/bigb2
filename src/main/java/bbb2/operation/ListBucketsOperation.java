package bbb2.operation;

import bbb2.backblazeb2.client.BackblazeB2Client;
// import bbb2.backblazeb2.client.response.ListBucketsResponse;
import bbb2.backblazeb2.api.response.ListBucketsResponse;
import bbb2.exception.Bbb2Exception;

import bbb2.json.JsonProxy;

public class ListBucketsOperation extends Operation
{
    public ListBucketsOperation(String[] args)
    {}

    @Override
    public int execute() throws Bbb2Exception
    {
        // BackblazeB2Client client = new BackblazeB2Client();
        // for (ListBucketsResponse.Bucket bucket : client.listBuckets().buckets)
        // {
        //     System.out.println("BucketName=\"" + bucket.name + "\""
        //                        + ", BucketID=\"" + bucket.id + "\"");
        // }

        // ListBucketsResponse test = JsonProxy.fromJson("{ \"buckets\":[{\"bucketName\":\"someName\", \"bucketId\":\"someId\"}] }", ListBucketsResponse.class);
        ListBucketsResponse test = JsonProxy.fromJson("{ \"buckets\":[{\"bucketName\":\"someName\"}] }", ListBucketsResponse.class);
        // ListBucketsResponse test = JsonProxy.fromJson("{ \"buckets\":[] }", ListBucketsResponse.class);
        System.out.println(JsonProxy.toJson(test));

        return 0;
    }
}
