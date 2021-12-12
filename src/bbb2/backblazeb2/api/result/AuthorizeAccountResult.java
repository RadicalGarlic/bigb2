package bbb2.backblazeb2.api.result;

import java.net.http.HttpResponse;
import java.net.URI;
import java.net.URISyntaxException;

import bbb2.Util;
import bbb2.exception.Bbb2Exception;
import bbb2.exception.JsonParseException;
import bbb2.http.HttpStatusCodes;
import bbb2.json.JsonValueProxy;

public class AuthorizeAccountResult
{
    public AuthorizeAccountResult(HttpResponse<String> reply) 
    throws Bbb2Exception
    {
        try
        {
            if (reply.statusCode() == HttpStatusCodes.OK.getInt())
            {
                JsonValueProxy json = new JsonValueProxy(reply.body());
                this.accountId = json.get("accountId").asString();
                this.authToken = json.get("authorizationToken").asString();
                this.apiUrl = new URI(json.get("apiUrl").asString());
                this.downloadUrl = new URI(json.get("downloadUrl").asString());
                this.recPartSizeBytes = json.get("recommendedPartSize").asInt();
            }
            else
            {
                throw new Bbb2Exception(
                    "Bad status code. " + Util.toString(reply)
                );
            }
        }
        catch (JsonParseException e)
        {
            throw new Bbb2Exception(Util.toString(reply), e);
        }
        catch (URISyntaxException e)
        {
            throw new Bbb2Exception(Util.toString(reply), e);
        }
    }

    public String accountId;
    public String authToken;
    public URI apiUrl;
    public URI downloadUrl;
    public int minPartSizeBytes;
    public int recPartSizeBytes;
}
