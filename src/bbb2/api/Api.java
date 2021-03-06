package bbb2.api;

import java.io.IOException;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.nio.charset.IllegalCharsetNameException;
import java.nio.charset.UnsupportedCharsetException;
import java.util.Base64;

import javax.json.Json;

import bbb2.ExitCode;
import bbb2.api.results.AuthorizeAccountResult;
import bbb2.api.results.ListBucketsResult;
import bbb2.api.results.StartLargeFileResult;
import bbb2.util.http.HttpClientProxy;
import bbb2.util.http.HttpClientProxyBuilder;
import bbb2.util.json.JsonParseException;

import javax.json.JsonObjectBuilder;

public class Api
{
    public static AuthorizeAccountResult authorizeAccount(String keyId,
                                                          String appKey)
    throws ApiErrorException, ApiResponseParseException, InterruptedException,
           IOException
    {
        try
        {
            String key = keyId + ":" + appKey;
            byte[] keyBytes = key.getBytes(Charset.forName("US-ASCII"));
            String keyBase64 = Base64.getEncoder().encodeToString(keyBytes);
            String auth = "Basic" + keyBase64;

            HttpRequest.Builder reqBuilder = HttpRequest.newBuilder();
            HttpRequest req = reqBuilder.uri(getAuthUri())
                                        .GET()
                                        .header(AUTHORIZATION, auth)
                                        .build();

            HttpClientProxy client = HttpClientProxyBuilder.build();
            HttpResponse<String> res = client.send(req);

            return new AuthorizeAccountResult(res);
        }
        catch (UnsupportedCharsetException e)
        {
            e.printStackTrace();
            System.exit(ExitCode.FAILURE);
            return null;
        }
        catch (IllegalCharsetNameException e)
        {
            e.printStackTrace();
            System.exit(ExitCode.FAILURE);
            return null;
        }
        catch (IllegalArgumentException e)
        {
            // ...due to bad charset name.
            e.printStackTrace();
            System.exit(ExitCode.FAILURE);
            return null;
        }
    }

    public static ListBucketsResult listBuckets(AuthorizeAccountResult auth,
                                                String bucketName)
    throws ApiErrorException, InterruptedException, IOException,
           JsonParseException
    {
        JsonObjectBuilder bodyJson = Json.createObjectBuilder();
        bodyJson.add("accountId", auth.accountId);
        if ((null != bucketName) && !bucketName.isEmpty())
        {
            bodyJson.add("bucketName", bucketName);
        }

        HttpRequest.BodyPublisher body
        = HttpRequest.BodyPublishers.ofString(bodyJson.build().toString());

        HttpRequest.Builder reqBuilder = HttpRequest.newBuilder();
        HttpRequest req = reqBuilder.uri(auth.apiUrl)
                                    .POST(body)
                                    .header(AUTHORIZATION, auth.authToken)
                                    .build();

        HttpClientProxy client = HttpClientProxyBuilder.build();
        return new ListBucketsResult(client.send(req));
    }

    public static
    StartLargeFileResult startLargeFile(AuthorizeAccountResult auth,
                                        String bucketId, String fileName)
    throws ApiErrorException, ApiResponseParseException, InterruptedException,
           IOException
    {
        String reqBody = Json.createObjectBuilder()
                             .add("bucketId", bucketId)
                             .add("fileName", fileName)
                             .add("contentType", "application/octet-stream")
                             .build()
                             .toString();

        HttpRequest.Builder reqBuilder = HttpRequest.newBuilder();
        HttpRequest req = reqBuilder.uri(getAuthUri())
                                    .POST(HttpRequest.BodyPublishers
                                                     .ofString(reqBody))
                                    .header(AUTHORIZATION, auth.authToken)
                                    .build();

        HttpClientProxy client = HttpClientProxyBuilder.build();

        return new StartLargeFileResult(client.send(req));
    }

    private static final String AUTHORIZATION = "Authorization";

    private static URI getAuthUri()
    {
        try
        {
            String uriString
            = "https://api.backblazeb2.com/b2api/v2/b2_authorize_account";

            return new URI(uriString);
        }
        catch (URISyntaxException e)
        {
            e.printStackTrace();
            System.exit(ExitCode.FAILURE);
            return null;
        }
    }
}
