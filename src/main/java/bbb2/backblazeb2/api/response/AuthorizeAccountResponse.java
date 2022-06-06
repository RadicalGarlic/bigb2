package bbb2.backblazeb2.api.response;

import java.net.URI;
import java.net.URISyntaxException;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthorizeAccountResponse
{
    @JsonCreator
    public AuthorizeAccountResponse(
        @JsonProperty(required = true, value = "accountId")
        String accountId,
        @JsonProperty(required = true, value = "authorizationToken")
        String authorizationToken,
        @JsonProperty(required = true, value = "apiUrl")
        URI apiUrl,
        @JsonProperty(required = true, value = "downloadUrl")
        URI downloadUrl,
        @JsonProperty(required = true, value = "recommendedPartSize")
        int recommendedPartSize)
    {
        this.accountId = accountId;
        this.authorizationToken = authorizationToken;
        this.apiUrl = apiUrl;
        this.downloadUrl = downloadUrl;
        this.recommendedPartSize = recommendedPartSize;
    }

    public String accountId;
    public String authorizationToken;
    public URI apiUrl;
    public URI downloadUrl;
    public int recommendedPartSize;
}
