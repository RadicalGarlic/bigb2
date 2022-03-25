package bbb2.backblazeb2.api.request;

import java.net.http.HttpRequest;

import com.google.gson.annotations.Expose;

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
            .uri(auth.apiUrl.resolve("/b2api/v2/b2_cancel_large_file"))
            .header(Request.AUTHORIZATION, this.auth.authorizationToken)
            .POST(Request.toHttpRequestBodyPublisher(this))
            .build();
    }

    private AuthorizeAccountResponse auth;
    @Expose private String fileId;
}
