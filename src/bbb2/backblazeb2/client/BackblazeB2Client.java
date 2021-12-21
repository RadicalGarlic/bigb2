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
    public BackblazeB2Client() throws Bbb2Exception
    {
        this(BackblazeB2Client.getDefaultAppKeyFilePath());
    }

    public BackblazeB2Client(Path appKeyFilePath) throws Bbb2Exception
    {
        this.appKey = JsonProxy.fromJson(appKeyFilePath, AppKey.class);
        this.auth = BackblazeB2ApiProxy.authorizeAccount(this.appKey);
    }

    public void authorize() throws Bbb2Exception
    {
        this.auth = BackblazeB2ApiProxy.authorizeAccount(this.appKey);
    }

    public ListBucketsResult listBuckets(String bucketName)
    {
        return null;
    }

    private static Path getDefaultAppKeyFilePath()
    {
        return Paths.get(System.getProperty("user.home")).resolve(".bbb2.json");
    }

    private AppKey appKey = null;
    private AuthorizeAccountResult auth = null;
}
