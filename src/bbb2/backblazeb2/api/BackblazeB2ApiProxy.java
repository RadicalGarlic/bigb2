package bbb2.backblazeb2.api;

import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import bbb2.backblazeb2.api.result.AuthorizeAccountResult;
import bbb2.backblazeb2.api.result.ListBucketsResult;
import bbb2.backblazeb2.client.AppKey;
import bbb2.exception.Bbb2Exception;
import bbb2.http.HttpClientProxy;
import bbb2.json.JsonProxy;

public class BackblazeB2ApiProxy
{
    public static AuthorizeAccountResult authorizeAccount(AppKey appKey)
    throws Bbb2Exception
    {
        try
        {
            String key = appKey.keyId + ":" + appKey.appKey;
            byte[] keyBytes = key.getBytes(StandardCharsets.UTF_8);
            String keyBase64 = Base64.getEncoder().encodeToString(keyBytes);
            String auth = "Basic" + keyBase64;

            HttpRequest.Builder reqBuilder = HttpRequest.newBuilder();
            HttpRequest req
                = reqBuilder.uri(BackblazeB2ApiProxy.getAuthUri())
                            .GET()
                            .header(BackblazeB2ApiProxy.AUTHORIZATION, auth)
                            .build();
            HttpResponse<String> reply = HttpClientProxy.send(req);
            return JsonProxy.fromJson(reply.body(),
                                      AuthorizeAccountResult.class);
        }
        catch (URISyntaxException e)
        {
            throw new Bbb2Exception(e);
        }
    }

    public static ListBucketsResult listBuckets(AuthorizeAccountResult auth)
    {
        /*
        JsonObjectBuilder bodyJson = Json.createObjectBuilder();
        bodyJson.add("accountId", auth.accountId);
        HttpRequest.BodyPublisher body
            = HttpRequest.BodyPublishers.ofString(bodyJson.build().toString());

        HttpRequest.Builder reqBuilder = HttpRequest.newBuilder();
        HttpRequest req = reqBuilder.uri(apiUri)
                                    .POST(body)
                                    .header(BackblazeB2ApiProxy.AUTHORIZATION,
                                            authToken)
                                    .build();
        HttpResponse<String> reply = HttpClientProxy.send(req);
        return new ListBucketsResult(reply);
        */
        return null;
    }

    private static URI getAuthUri() throws URISyntaxException
    {
        String uriString
            = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";
        return new URI(uriString);
    }

    private static final String AUTHORIZATION = "Authorization";
}
