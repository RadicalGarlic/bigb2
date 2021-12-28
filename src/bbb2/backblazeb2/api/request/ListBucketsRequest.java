package bbb2.backblazeb2.api.request;

import java.net.http.HttpRequest;

import bbb2.backblazeb2.api.response.AuthorizeAccountResponse;
import bbb2.json.JsonProxy;

public class ListBucketsRequest extends Request
{
    public ListBucketsRequest(AuthorizeAccountResponse auth)
    {
        this.auth = auth;
        this.payload = new Payload(auth.accountId);
    }

    @Override
    public HttpRequest toHttpRequest()
    {
        return HttpRequest.newBuilder()
                          .uri(auth.apiUrl.resolve("/b2api/v2/b2_list_buckets"))
                          .POST(
                              Request.toHttpRequestBodyPublisher(this.payload)
                          )
                          .header(Request.AUTHORIZATION,
                                  this.auth.authorizationToken)
                          .build();
    }

    private static class Payload
    {
        public Payload(String accountId)
        {
            this.accountId = accountId;
        }

        private String accountId;
    }

    private AuthorizeAccountResponse auth;
    private Payload payload;
}
