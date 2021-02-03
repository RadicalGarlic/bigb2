package bbb2.api.results;

import java.net.http.HttpResponse;

import bbb2.api.ApiErrorException;
import bbb2.api.ApiResponseParseException;
import bbb2.util.http.HttpStatusCodes;
import bbb2.util.http.Stringer;
import bbb2.util.json.JsonObjectProxy;
import bbb2.util.json.JsonParseException;

public class StartLargeFileResult
{
    public StartLargeFileResult(HttpResponse<String> res)
    throws ApiErrorException, ApiResponseParseException
    {
        try
        {
            JsonObjectProxy json = new JsonObjectProxy(res.body());
            if (res.statusCode() == HttpStatusCodes.OK.getInt())
            {
                fileId = json.getString("fileId");
            }
            else
            {
                throw new ApiErrorException(Stringer.toString(res));
            }
        }
        catch (JsonParseException e)
        {
            throw new ApiResponseParseException(Stringer.toString(res));
        }
    }

    public String fileId;
}
