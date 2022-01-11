package bbb2;

import java.io.StringReader;
import java.net.URI;
import java.net.URISyntaxException;

import bbb2.backblazeb2.client.BackblazeB2Client;
import bbb2.operation.OperationFactory;

public class Main
{
    public static void main(String[] args)
    {
        try
        {
            if (args.length == 0)
            {
                System.err.println("No args provided.");
                System.err.println(Main.getUsageMessage());
                System.exit(ExitCode.FAILURE);
            }

            int exitStatus = OperationFactory.getOperation(args).execute();
            if (0 != exitStatus)
            {
                System.exit(exitStatus);
            }

            // Let main() end naturally if operation finishes with good status.
        }
        catch (Exception e)
        {
            e.printStackTrace();
            System.exit(ExitCode.FAILURE);
        }
    }

    private static String getUsageMessage()
    {
        StringBuilder msg = new StringBuilder();
        msg.append("bbb2 --list-buckets");
        return msg.toString();
    }
}
