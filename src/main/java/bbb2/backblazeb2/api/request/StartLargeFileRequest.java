package bbb2.backblazeb2.api.request;

import java.net.http.HttpRequest;

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
            .header(Request.AUTHORIZATION,
                    this.auth.authorizationToken)
            .POST(Request.toHttpRequestBodyPublisher(this))
            .build();
    }

    private static final String contentType = "application/octet-stream";
    private String bucketId;
    private String fileName;
    private AuthorizeAccountResponse auth;
}
