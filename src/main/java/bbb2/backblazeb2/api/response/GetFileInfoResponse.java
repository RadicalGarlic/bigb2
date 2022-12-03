package bbb2.backblazeb2.api.response;

import java.math.BigInteger;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class GetFileInfoResponse
{
    @JsonCreator
    public GetFileInfoResponse(
        @JsonProperty(required = true, value = "fileId")
        String fileId,
        @JsonProperty(required = true, value = "contentLength")
        String contentLength)
    {
        this.fileId = fileId;
        this.contentLength = new BigInteger(contentLength);

    }

    public String fileId;
    public BigInteger contentLength;
}
