package bbb2.util.http;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import bbb2.ExitCode;
import bbb2.util.http.HttpClientProxy;

public class RealClient implements HttpClientProxy
{
    public RealClient()
    {
        internalClient = HttpClient.newHttpClient();
    }

    public HttpResponse<String> send(HttpRequest req)
    throws InterruptedException, IOException
    {
        try
        {
            return internalClient.send(req,
                                       HttpResponse.BodyHandlers.ofString());
        }
        catch (IllegalArgumentException e)
        {
            e.printStackTrace();
            System.exit(ExitCode.FAILURE);
            return null;
        }
        catch (SecurityException e)
        {
            e.printStackTrace();
            System.exit(ExitCode.FAILURE);
            return null;
        }
    }

    private HttpClient internalClient;
}
