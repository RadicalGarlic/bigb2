package bbb2.backblazeb2.api.request;

import java.net.http.HttpRequest;

import com.fasterxml.jackson.annotation.JsonProperty;

import bbb2.backblazeb2.api.response.AuthorizeAccountResponse;
import bbb2.backblazeb2.api.ApiUrlUtil;
import bbb2.exception.Bbb2Exception;
import bbb2.json.JsonProxy;

public class ListBucketsRequest extends Request
{
    public ListBucketsRequest(AuthorizeAccountResponse auth)
    {
        this.auth = auth;
        this.accountId = auth.accountId;
    }

    @Override
    public HttpRequest toHttpRequest() throws Bbb2Exception
    {
        return HttpRequest.newBuilder()
                          .uri(ApiUrlUtil.getListBucketsUrl(auth.apiUrl))
                          .header(Request.AUTHORIZATION,
                                  this.auth.authorizationToken)
                          .POST(Request.toHttpRequestBodyPublisher(this))
                          .build();
    }

    @JsonProperty(value = "accountId")
    public String getAccountId() { return this.accountId; }

    private AuthorizeAccountResponse auth;
    private String accountId;
}
