package bbb2.backblazeb2.api.request;

import java.net.http.HttpRequest;

import bbb2.backblazeb2.api.ApiUrlUtil;
import bbb2.backblazeb2.api.response.AuthorizeAccountResponse;
import bbb2.exception.Bbb2Exception;

public class CancelLargeFileRequest extends Request
{
    public CancelLargeFileRequest(AuthorizeAccountResponse auth, String fileId)
    {
        this.auth = auth;
        this.fileId = fileId;
    }

    @Override
    public HttpRequest toHttpRequest() throws Bbb2Exception
    {
        return HttpRequest.newBuilder()
            .uri(ApiUrlUtil.getCancelLargeFileUrl(auth.apiUrl))
            .header(Request.AUTHORIZATION, this.auth.authorizationToken)
            .POST(Request.toHttpRequestBodyPublisher(this))
            .build();
    }

    private AuthorizeAccountResponse auth;
    private String fileId;
}
