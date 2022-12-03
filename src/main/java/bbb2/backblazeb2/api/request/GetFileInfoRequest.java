package bbb2.backblazeb2.api.request;

import java.net.http.HttpRequest;

import bbb2.backblazeb2.api.ApiUrlUtil;
import bbb2.backblazeb2.api.response.AuthorizeAccountResponse;
import bbb2.exception.Bbb2Exception;

public class GetFileInfoRequest extends Request
{
    public GetFileInfoRequest(AuthorizeAccountResponse auth, String fileId)
    {
        this.auth = auth;
        this.fileId = fileId;
    }

    @Override
    public HttpRequest toHttpRequest() throws Bbb2Exception
    {
        return HttpRequest.newBuilder()
            .uri(ApiUrlUtil.getGetFileInfoUrl(auth.apiUrl))
            .header(Request.AUTHORIZATION, this.auth.authorizationToken)
            .GET()
            .build();
    }

    private AuthorizeAccountResponse auth;
    private String fileId;
}
