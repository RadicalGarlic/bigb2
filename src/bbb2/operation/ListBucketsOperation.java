package bbb2.operation;

import bbb2.backblazeb2.client.BackblazeB2Client;
import bbb2.exception.Bbb2Exception;

public class ListBucketsOperation implements Operation
{
    public ListBucketsOperation(String[] args)
    {
    }

    @Override
    public int execute() throws Bbb2Exception
    {
        BackblazeB2Client client = new BackblazeB2Client();
        client.listBuckets();
        return 1;
    }
}
