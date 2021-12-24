package bbb2.http;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import bbb2.backblazeb2.api.request.Request;
import bbb2.exception.Bbb2Exception;

public class HttpClientProxy
{
    public static HttpResponse<String> send(Request req) throws Bbb2Exception
    {
        HttpResponse<String> ret = HttpClientProxy.send(req.toHttpRequest());
        System.out.println(ret.body());
        return ret;
    }

    private static HttpResponse<String> send(HttpRequest req)
    throws Bbb2Exception
    {
        try
        {
            return HttpClientProxy.httpClient.send(
                req,
                HttpResponse.BodyHandlers.ofString()
            );
        }
        catch (IllegalArgumentException e)
        {
            throw new Bbb2Exception(e);
        }
        catch (InterruptedException e)
        {
            throw new Bbb2Exception(e);
        }
        catch (IOException e)
        {
            throw new Bbb2Exception(e);
        }
        catch (SecurityException e)
        {
            throw new Bbb2Exception(e);
        }
    }

    private static HttpClient httpClient = HttpClient.newHttpClient();
}
