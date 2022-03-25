package bbb2.backblazeb2.api;

import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import bbb2.backblazeb2.api.request.AuthorizeAccountRequest;
import bbb2.backblazeb2.api.request.CancelLargeFileRequest;
import bbb2.backblazeb2.api.request.ListBucketsRequest;
import bbb2.backblazeb2.api.request.ListUnfinishedLargeFilesRequest;
import bbb2.backblazeb2.api.request.StartLargeFileRequest;
import bbb2.backblazeb2.api.response.AuthorizeAccountResponse;
import bbb2.backblazeb2.api.response.CancelLargeFileResponse;
import bbb2.backblazeb2.api.response.ListBucketsResponse;
import bbb2.backblazeb2.api.response.ListUnfinishedLargeFilesResponse;
import bbb2.backblazeb2.api.response.StartLargeFileResponse;
import bbb2.backblazeb2.client.AppKey;
import bbb2.exception.Bbb2Exception;
import bbb2.http.HttpClientProxy;
import bbb2.json.JsonProxy;

public class BackblazeB2ApiProxy
{
    public static AuthorizeAccountResponse authorizeAccount(AppKey appKey)
    throws Bbb2Exception
    {
        AuthorizeAccountRequest req = new AuthorizeAccountRequest(appKey);
        return JsonProxy.fromJson(HttpClientProxy.send(req).body(),
                                  AuthorizeAccountResponse.class);
    }

    public static ListBucketsResponse listBuckets(AuthorizeAccountResponse auth)
    throws Bbb2Exception
    {
        ListBucketsRequest req = new ListBucketsRequest(auth);
        return JsonProxy.fromJson(HttpClientProxy.send(req).body(),
                                  ListBucketsResponse.class);
    }

    public static StartLargeFileResponse startLargeFile(
        AuthorizeAccountResponse auth,
        String bucketId,
        String fileName)
    throws Bbb2Exception
    {
        StartLargeFileRequest req = new StartLargeFileRequest(auth,
                                                              bucketId,
                                                              fileName);
        return JsonProxy.fromJson(HttpClientProxy.send(req).body(),
                                  StartLargeFileResponse.class);
    }

    public static ListUnfinishedLargeFilesResponse listUnfinishedLargeFiles(
        AuthorizeAccountResponse auth,
        String bucketId)
    throws Bbb2Exception
    {
        ListUnfinishedLargeFilesRequest req
            = new ListUnfinishedLargeFilesRequest(auth, bucketId);
        return JsonProxy.fromJson(HttpClientProxy.send(req).body(),
                                  ListUnfinishedLargeFilesResponse.class);
    }

    public static CancelLargeFileResponse cancelLargeFile(
        AuthorizeAccountResponse auth,
        String fileId)
    throws Bbb2Exception
    {
        CancelLargeFileRequest req = new CancelLargeFileRequest(auth, fileId);
        return JsonProxy.fromJson(HttpClientProxy.send(req).body(),
                                  CancelLargeFileResponse.class);
    }
}
