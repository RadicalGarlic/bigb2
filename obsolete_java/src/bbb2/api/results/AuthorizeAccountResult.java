package bbb2.api.results;

import java.net.http.HttpResponse;
import java.net.MalformedURLException;
import java.net.URL;

import bbb2.api.ApiErrorException;
import bbb2.api.ApiResponseParseException;
import bbb2.util.http.HttpStatusCodes;
import bbb2.util.http.Stringer;
import bbb2.util.json.JsonObjectProxy;
import bbb2.util.json.JsonParseException;

public class AuthorizeAccountResult
{
    public AuthorizeAccountResult(HttpResponse<String> res)
    throws ApiErrorException, ApiResponseParseException
    {
        try
        {
            if (res.statusCode() == HttpStatusCodes.OK.getInt())
            {
                JsonObjectProxy json = new JsonObjectProxy(res.body());
                accountId = json.getString("accountId");
                authToken = json.getString("authorizationToken");
                apiUrl = new URL(json.getString("apiUrl"));
                downloadUrl = new URL(json.getString("downloadUrl"));
                minPartSizeBytes = json.getInt("absoluteMinimumPartSize");
                recPartSizeBytes = json.getInt("recommendedPartSize");
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
        catch (MalformedURLException e)
        {
            throw new ApiResponseParseException(Stringer.toString(res), e);
        }
    }

    public String accountId;
    public String authToken;
    public URL apiUrl;
    public URL downloadUrl;
    public int minPartSizeBytes;
    public int recPartSizeBytes;
}
