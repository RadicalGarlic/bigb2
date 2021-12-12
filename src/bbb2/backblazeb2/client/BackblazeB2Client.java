package bbb2.backblazeb2.client;

import java.io.IOException;
import java.util.List;

import bbb2.backblazeb2.api.result.AuthorizeAccountResult;
import bbb2.backblazeb2.api.BackblazeB2ApiProxy;
import bbb2.exception.Bbb2Exception;
import bbb2.exception.JsonParseException;

public class BackblazeB2Client
{
    public final static String DEFAULT_APPKEY_FILE_PATH = "~/.bbb2.json";

    public BackblazeB2Client() throws Bbb2Exception
    {
        this(BackblazeB2Client.DEFAULT_APPKEY_FILE_PATH);
    }

    public BackblazeB2Client(String appKeyFilePath) throws Bbb2Exception
    {
        this.appKey = new AppKey(appKeyFilePath);
        this.authorize(this.appKey);
    }

    public void authorize() throws Bbb2Exception
    {
        this.auth = BackblazeB2ApiProxy.authorizeAccount(appKey.getId(),
                                                         appKey.getKey());
    }

    public ListBucketsResult listBuckets(String bucketName)
    {
        return ApiProxy.listBuckets(bucketName);
    }

    /*
        public static void upload(String dstBucketName, String dstFilePath,
                                  String srcFilePath)
        {
        }
    */

    private AppKey appKey = null;
    private AuthorizeAccountResult auth = null;
}
