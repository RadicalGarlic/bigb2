package bbb2.backblazeb2.api.request;

import java.net.http.HttpRequest;

import bbb2.backblazeb2.api.response.AuthorizeAccountResponse;
import bbb2.exception.Bbb2Exception;
import bbb2.json.JsonProxy;

public abstract class Request
{
    public static final String AUTHORIZATION = "Authorization";

    public abstract HttpRequest toHttpRequest() throws Bbb2Exception;

    public static HttpRequest.BodyPublisher toHttpRequestBodyPublisher(Object o)
    {
        return HttpRequest.BodyPublishers.ofString(JsonProxy.toJson(o));
    }
}
