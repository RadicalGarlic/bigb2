package bbb2.api.results;

import java.net.http.HttpResponse;
import java.net.URI;
import java.net.URISyntaxException;

import bbb2.api.ApiErrorException;
import bbb2.api.ApiResponseParseException;
import bbb2.util.http.HttpStatusCodes;
import bbb2.util.http.Stringer;
import bbb2.util.json.JsonParseException;
import bbb2.util.json.JsonValueProxy;

public class AuthorizeAccountResult
{
    public AuthorizeAccountResult(HttpResponse<String> res)
    throws ApiErrorException, ApiResponseParseException
    {
        try
        {
            if (res.statusCode() == HttpStatusCodes.OK.getInt())
            {
                JsonValueProxy json = new JsonValueProxy(res.body());
                accountId = json.get("accountId").asString();
                authToken = json.get("authorizationToken").asString();
                apiUrl = new URI(json.get("apiUrl").asString());
                downloadUrl = new URI(json.get("downloadUrl").asString());
                minPartSizeBytes = json.get("absoluteMinimumPartSize").asInt();
                recPartSizeBytes = json.get("recommendedPartSize").asInt();
            }
            else
            {
                throw new ApiErrorException(Stringer.toString(res));
            }
        }
        catch (JsonParseException e)
        {
            throw new ApiResponseParseException(Stringer.toString(res), e);
        }
        catch (URISyntaxException e)
        {
            throw new ApiResponseParseException(Stringer.toString(res), e);
        }
    }

    public String accountId;
    public String authToken;
    public URI apiUrl;
    public URI downloadUrl;
    public int minPartSizeBytes;
    public int recPartSizeBytes;
}
