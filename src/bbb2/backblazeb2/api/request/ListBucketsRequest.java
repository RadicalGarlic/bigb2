package bbb2.backblazeb2.api.request;

import java.net.http.HttpRequest;

import com.google.gson.annotations.Expose;

import bbb2.backblazeb2.api.response.AuthorizeAccountResponse;
import bbb2.json.JsonProxy;

public class ListBucketsRequest extends Request
{
    public ListBucketsRequest(AuthorizeAccountResponse auth)
    {
        this.auth = auth;
        this.accountId = auth.accountId;
    }

    @Override
    public HttpRequest toHttpRequest()
    {
        return HttpRequest.newBuilder()
                          .uri(auth.apiUrl.resolve("/b2api/v2/b2_list_buckets"))
                          .POST(Request.toHttpRequestBodyPublisher(this))
                          .header(Request.AUTHORIZATION,
                                  this.auth.authorizationToken)
                          .build();
    }

    @Expose
    private String accountId;

    private AuthorizeAccountResponse auth;
}
