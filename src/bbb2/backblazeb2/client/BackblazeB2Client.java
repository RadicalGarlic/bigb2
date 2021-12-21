package bbb2.backblazeb2.client;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import bbb2.backblazeb2.api.result.AuthorizeAccountResult;
import bbb2.backblazeb2.api.result.ListBucketsResult;
import bbb2.backblazeb2.api.BackblazeB2ApiProxy;
import bbb2.exception.Bbb2Exception;
import bbb2.exception.JsonParseException;
import bbb2.json.JsonProxy;

public class BackblazeB2Client
{
    public final static Path DEFAULT_APPKEY_FILE_PATH
        = Paths.get("/home/user/.bbb2.json");

    public BackblazeB2Client() throws Bbb2Exception
    {
        this(BackblazeB2Client.DEFAULT_APPKEY_FILE_PATH);
    }

    public BackblazeB2Client(Path appKeyFilePath) throws Bbb2Exception
    {
        this.appKey = JsonProxy.fromJson(appKeyFilePath, AppKey.class);
    }

    public void authorize() throws Bbb2Exception
    {
        this.auth = BackblazeB2ApiProxy.authorizeAccount(this.appKey);
        System.out.println(JsonProxy.toJson(this.auth));
    }

    public ListBucketsResult listBuckets(String bucketName)
    {
        //return ApiProxy.listBuckets(bucketName);
        return null;
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
