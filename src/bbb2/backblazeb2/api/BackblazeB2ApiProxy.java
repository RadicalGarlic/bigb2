package bbb2.backblazeb2.api;

import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import bbb2.backblazeb2.api.request.ListBucketsRequest;
import bbb2.backblazeb2.api.request.AuthorizeAccountRequest;
import bbb2.backblazeb2.api.response.AuthorizeAccountResponse;
import bbb2.backblazeb2.api.response.ListBucketsResponse;
import bbb2.backblazeb2.client.AppKey;
import bbb2.exception.Bbb2Exception;
import bbb2.http.HttpClientProxy;
import bbb2.json.JsonProxy;

public class BackblazeB2ApiProxy
{
    public static AuthorizeAccountResponse authorizeAccount(AppKey appKey)
    throws Bbb2Exception
    {
        AuthorizeAccountRequest req = new AuthorizeAccountRequest(appKey);
        return JsonProxy.fromJson(HttpClientProxy.send(req).body(),
                                  AuthorizeAccountResponse.class);
    }

    public static ListBucketsResponse listBuckets(AuthorizeAccountResponse auth)
    throws Bbb2Exception
    {
        ListBucketsRequest req = new ListBucketsRequest(auth);
        return JsonProxy.fromJson(HttpClientProxy.send(req).body(),
                                  ListBucketsResponse.class);
    }
}
