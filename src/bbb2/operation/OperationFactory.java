package bbb2.operation;

import java.util.Arrays;

import bbb2.exception.Bbb2Exception;

public class OperationFactory
{
    public static Operation getOperation(String[] args) throws Bbb2Exception
    {
        if ("--upload".equals(args[0]))
        {
            throw new Bbb2Exception("unimplemented");
        }
        else if ("--list-buckets".equals(args[0]))
        {
            return new ListBucketsOperation(
                Arrays.copyOfRange(args, 1, args.length)
            );
        }
        else if ("--download".equals(args[0]))
        {
            return new DownloadOperation(
                Arrays.copyOfRange(args, 1, args.length)
            );
        }
        else
        {
            throw new Bbb2Exception("Bad args.");
        }
    }
}
