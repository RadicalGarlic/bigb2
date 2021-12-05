package bbb2.backblazeb2;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import bbb2.backblazeb2.result.AuthorizeAccountResult;
import bbb2.exception.Bbb2Exception;
import bbb2.http.HttpClientProxy;

public class BackblazeB2Proxy
{
    public static AuthorizeAccountResult authorizeAccount(String appKeyId,
                                                          String appKey)
    throws Bbb2Exception
    {
        try
        {
            String key = appKeyId + ":" + appKey;
            byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
            String keyBase64 = Base64.getEncoder().encodeToString(keyBytes);
            String auth = "Basic" + keyBase64;

            HttpRequest.Builder reqBuilder = HttpRequest.newBuilder();
            HttpRequest req = reqBuilder.uri(BackblazeB2Proxy.getAuthUri())
                                        .GET()
                                        .header("Authorization", auth)
                                        .build();
            HttpResponse<String> reply = HttpClientProxy.send(req);
            return new AuthorizeAccountResult(reply);
        }
        catch (URISyntaxException e)
        {
            throw new Bbb2Exception(e);
        }
    }

    private static URI getAuthUri() throws URISyntaxException
    {
        String uriString
            = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
        return new URI(uriString);
    }
}
