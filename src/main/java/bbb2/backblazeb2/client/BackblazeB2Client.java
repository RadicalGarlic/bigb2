package bbb2.backblazeb2.client;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import bbb2.backblazeb2.api.response.AuthorizeAccountResponse;
import bbb2.backblazeb2.api.BackblazeB2ApiProxy;
import bbb2.backblazeb2.client.response.ListBucketsResponse;
import bbb2.exception.Bbb2Exception;
import bbb2.exception.JsonParseException;
import bbb2.json.JsonProxy;

public class BackblazeB2Client
{
    public static Path getDefaultAppKeyFilePath()
    {
        return Paths.get(System.getProperty("user.home")).resolve(".bbb2.json");
    }

    public BackblazeB2Client() throws Bbb2Exception
    {
        this(BackblazeB2Client.getDefaultAppKeyFilePath(), true);
    }

    public BackblazeB2Client(Path appKeyFilePath, boolean authorize)
    throws Bbb2Exception
    {
        this.appKey = JsonProxy.fromJson(appKeyFilePath, AppKey.class);
        if (authorize)
        {
            this.authorize();
        }
    }

    public void authorize() throws Bbb2Exception
    {
        this.auth = BackblazeB2ApiProxy.authorizeAccount(this.appKey);
    }

    public ListBucketsResponse listBuckets() throws Bbb2Exception
    {
        return new ListBucketsResponse(
            BackblazeB2ApiProxy.listBuckets(this.auth)
        );
    }

    private AppKey appKey = null;
    private AuthorizeAccountResponse auth = null;
}
