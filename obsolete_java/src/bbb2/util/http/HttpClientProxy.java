package bbb2.util.http;

import java.io.IOException;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public interface HttpClientProxy
{
    public HttpResponse<String> send(HttpRequest req)
    throws InterruptedException, IOException;
}
