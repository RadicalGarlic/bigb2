package mocks;

import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.util.Optional;
import javax.net.ssl.SSLSession;

import bbb2.util.http.HttpStatusCodes;

public class MockHttpResponse<String> implements HttpResponse<String>
{
    public MockHttpResponse(HttpHeaders inHeaders, String inBody,
                            HttpRequest inReq)
    {
        varHeaders = inHeaders;
        varBody = inBody;
        req = inReq;
    }

    public String body()
    {
        return varBody;
    }

    public HttpHeaders headers()
    {
        return varHeaders;
    }

    public HttpClient.Version version()
    {
        return null;
    }

    public URI uri()
    {
        return null;
    }

    public Optional<SSLSession> sslSession()
    {
        return null;
    }

    public Optional<HttpResponse<String>> previousResponse()
    {
        return null;
    }

    public HttpRequest request()
    {
        return req;
    }

    public int statusCode()
    {
        return HttpStatusCodes.OK.getInt();
    }

    private HttpHeaders varHeaders;
    private String varBody;
    private HttpRequest req;
}
