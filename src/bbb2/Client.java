package bbb2;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;

import bbb2.api.ApiErrorException;
import bbb2.api.ApiProxy;
import bbb2.api.ApiResponseParseException;
import bbb2.api.results.ListBucketsResult;
import bbb2.api.results.AuthorizeAccountResult;
import bbb2.util.json.JsonParseException;
import bbb2.util.json.JsonValueProxy;

public class Client
{
    public final String DEFAULT_APPKEY_FILE_PATH = "~/.bbb2.json";

    public Client(String appKeyFilePath)
    throws FileNotFoundException, JsonParseException
    {
        appKey = readAppKey(appKeyFilePath);
    }

    public void authorize()
    throws ApiErrorException, ApiResponseParseException, FileNotFoundException,
           InterruptedException, IOException, JsonParseException
    {
        if (null == appKey)
        {
            appKey = readAppKey(DEFAULT_APPKEY_FILE_PATH);
        }

        auth = ApiProxy.authorizeAccount(appKey.getId(), appKey.getKey());
    }

    /*
    public ListBucketsResult listBuckets(String bucketName)
    {
        return ApiProxy.listBuckets(bucketName);
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

    private AppKey readAppKey(String filePath) throws FileNotFoundException,
                                                      JsonParseException
    {
        return new AppKey(filePath);
    }

    private AppKey appKey = null;
    private AuthorizeAccountResult auth = null;
}
