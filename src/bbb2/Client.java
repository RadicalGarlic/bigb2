package bbb2;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.List;

import bbb2.api.results.ListBucketsResult;
import bbb2.util.json.JsonParseException;
import bbb2.util.json.JsonValueProxy;

public class Client
{
    public Client()
    {
    }

    /*
    public static ListBucketsResult listBuckets(String bucketName)
    {
        return Api.listBuckets(bucketName);
    }

    public static void upload(String dstBucketName, String dstFilePath,
                              String srcFilePath)
    {
    }
    */

    class AppKey
    {
        public AppKey(String filePath) throws FileNotFoundException,
                                              JsonParseException
        {
            JsonValueProxy json = new JsonValueProxy(new File(filePath));
            id = json.get("keyId").asString();
            key = json.get("appKey").asString();
        }

        public String getId() { return new String(id); }
        public String getKey() { return new String(key); }

        private String id;
        private String key;
    }

    private void readAppKey(String filePath) throws FileNotFoundException,
                                                    JsonParseException
    {
        appKey = new AppKey(filePath);
    }

    private final String defaultAppKeyFilePath = "~/.bbb2.json";

    private AppKey appKey;
}
