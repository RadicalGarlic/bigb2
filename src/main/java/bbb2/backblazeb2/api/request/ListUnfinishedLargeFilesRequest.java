package bbb2.backblazeb2.api.request;

import java.net.http.HttpRequest;

import bbb2.backblazeb2.api.response.AuthorizeAccountResponse;
import bbb2.exception.Bbb2Exception;

public class ListUnfinishedLargeFilesRequest extends Request
{
    public ListUnfinishedLargeFilesRequest(AuthorizeAccountResponse auth,
                                           String bucketId)
    {
        this.auth = auth;
        this.bucketId = bucketId;
    }

    @Override
    public HttpRequest toHttpRequest() throws Bbb2Exception
    {
        return HttpRequest.newBuilder()
                          .uri(auth.apiUrl.resolve("/b2api/v2/b2_list_unfinished_large_files"))
                          .header(Request.AUTHORIZATION,
                                  this.auth.authorizationToken)
                          .POST(Request.toHttpRequestBodyPublisher(this))
                          .build();
    }

    private AuthorizeAccountResponse auth;
    private String bucketId;
}
