package bbb2.backblazeb2.api.request;

import java.net.http.HttpRequest;

import com.google.gson.annotations.Expose;

import bbb2.backblazeb2.api.response.AuthorizeAccountResponse;
import bbb2.exception.Bbb2Exception;

public class StartLargeFileRequest extends Request
{
    public StartLargeFileRequest(AuthorizeAccountResponse auth,
                                 String bucketId,
                                 String fileName)
    {
        this.auth = auth;
        this.bucketId = bucketId;
        this.fileName = fileName;
    }

    @Override
    public HttpRequest toHttpRequest() throws Bbb2Exception
    {
        return HttpRequest.newBuilder()
                  .uri(auth.apiUrl.resolve("/b2api/v2/b2_start_large_file"))
                  .POST(Request.toHttpRequestBodyPublisher(this))
                  .header(Request.AUTHORIZATION,
                          this.auth.authorizationToken)
                  .build();
    }

    @Expose
    private static final String CONTENT_TYPE = "application/octet-stream";

    private AuthorizeAccountResponse auth;
    @Expose private String bucketId;
    @Expose private String fileName;
}
