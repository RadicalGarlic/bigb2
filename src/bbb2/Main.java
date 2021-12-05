package bbb2;

import java.io.StringReader;
import java.net.URI;
import java.net.URISyntaxException;

public class Main
{
    public static void main(String[] args)
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
        else
        {
            System.err.println("Bad args.");
            System.exit(ExitCode.FAILURE);
        }
    }
}
