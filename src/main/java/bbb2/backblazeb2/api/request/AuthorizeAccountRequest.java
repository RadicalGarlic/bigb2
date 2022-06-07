package bbb2.backblazeb2.api.request;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpRequest;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import bbb2.backblazeb2.api.ApiUrlUtil;
import bbb2.backblazeb2.client.AppKey;
import bbb2.exception.Bbb2Exception;
import bbb2.json.JsonProxy;

public class AuthorizeAccountRequest extends Request
{
    public AuthorizeAccountRequest(AppKey appKey)
    {
        this.appKey = appKey;
    }
    
    @Override
    public HttpRequest toHttpRequest() throws Bbb2Exception
    {
        try
        {
            String key = this.appKey.getKeyId() + ":" + this.appKey.getAppKey();
            byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
            String keyBase64 = Base64.getEncoder().encodeToString(keyBytes);
            String auth = "Basic" + keyBase64;
            return HttpRequest.newBuilder()
                              .uri(ApiUrlUtil.getAuthUrl())
                              .GET()
                              .header(Request.AUTHORIZATION, auth)
                              .build();
        }
        catch (URISyntaxException e)
        {
            throw new Bbb2Exception(e);
        }
    }

    private static URI getAuthUri() throws URISyntaxException
    {
        return new URI(
            "https://api.backblazeb2.com/b2api/v2/b2_authorize_account"
        );
    }

    private AppKey appKey;
}
