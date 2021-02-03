package bbb2.api.results;

import bbb2.api.ApiResponseParseException;
import bbb2.util.json.JsonObjectProxy;
import bbb2.util.json.JsonParseException;

public class StartLargeFileResult
{
    public StartLargeFileResult(String jsonString)
    throws ApiResponseParseException
    {
        try
        {
            JsonObjectProxy json = new JsonObjectProxy(jsonString);
            fileId = json.getString("fileId");
        }
        catch (JsonParseException e)
        {
            StringBuilder s = new StringBuilder();
            s.append("ApiReponse=\"" + jsonString + "\".");
            throw new ApiResponseParseException(s.toString(), e);
        }
    }

    public String fileId;
}
