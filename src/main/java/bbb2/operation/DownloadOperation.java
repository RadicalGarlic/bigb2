package bbb2.operation;

import java.nio.file.Path;
import java.util.NoSuchElementException;
import java.util.Scanner;

import bbb2.exception.Bbb2Exception;

public class DownloadOperation extends Operation
{
    public DownloadOperation(String[] args) throws Bbb2Exception
    {
        try
        {
            for (int i = 0; i < args.length; ++i)
            {
                if (DownloadOperation.SRC_ARG.equals(args[i]))
                {
                    Scanner srcArg = new Scanner(Operation.getNext(i, args));
                    srcArg.useDelimiter(":");
                    this.bucketName = srcArg.next();
                    this.bucketFilePath = srcArg.next();
                    ++i;
                }
                else if (DownloadOperation.DST_ARG.equals(args[i]))
                {
                    this.dstFilePath = Path.of(Operation.getNext(i, args));
                    ++i;
                }
            }

            if (this.bucketName == null
                || this.bucketFilePath == null
                || this.dstFilePath == null)
            {
                throw new Bbb2Exception("Bad args.");
            }
        }
        catch (NoSuchElementException e)
        {
            throw new Bbb2Exception(e);
        }
    }

    @Override
    public int execute() throws Bbb2Exception
    {
        throw new Bbb2Exception("unimplemented");
    }

    private static final String SRC_ARG = "--src";
    private static final String DST_ARG = "--dst";

    private String bucketName;
    private String bucketFilePath;
    private Path dstFilePath;
}
