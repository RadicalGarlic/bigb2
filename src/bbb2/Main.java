package bbb2;

import java.io.StringReader;
import java.net.URI;
import java.net.URISyntaxException;

import bbb2.backblazeb2.client.BackblazeB2Client;

public class Main
{
    public static void main(String[] args)
    {
        try
        {
            if (args.length == 0)
            {
                System.err.println("No args provided.");
                System.exit(ExitCode.FAILURE);
            }

            if ("--upload".equals(args[0]))
            {
                System.out.println("upload");
            }
            else if ("--list-buckets".equals(args[0]))
            {
                System.out.println("list buckets");
                BackblazeB2Client client = new BackblazeB2Client();
            }
            else
            {
                System.err.println("Bad args.");
                System.exit(ExitCode.FAILURE);
            }
        }
        catch (Exception e)
        {
            e.printStackTrace();
            System.exit(ExitCode.FAILURE);
        }
    }
}
