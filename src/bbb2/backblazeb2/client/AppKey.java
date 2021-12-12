package bbb2.backblazeb2.client;

import java.io.File;
import java.io.FileNotFoundException;

import bbb2.exception.Bbb2Exception;
import bbb2.json.JsonValueProxy;

public class AppKey
{
    public AppKey(String filePath) throws Bbb2Exception
    {
        try
        {
            JsonValueProxy json = new JsonValueProxy(new File(filePath));
            this.id = json.get("keyId").asString();
            this.key = json.get("appKey").asString();
        }
        catch (FileNotFoundException e)
        {
            throw new Bbb2Exception(e);
        }
    }

    public String getId() { return this.id; }
    public String getKey() { return this.key; }

    private String id;
    private String key;
}
