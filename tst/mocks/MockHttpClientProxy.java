package mocks;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.net.URISyntaxException;

import bbb2.api.Api;
import bbb2.util.http.HttpClientProxy;
import bbb2.util.http.HttpStatusCodes;

import mocks.MockHttpResponse;

public class MockHttpClientProxy implements HttpClientProxy
{
    public HttpResponse<String> send(HttpRequest req)
    throws InterruptedException, IOException
    {
        if ("/b2api/v2/b2_authorize_account".equals(req.uri().getPath()))
        {
            return new MockHttpResponse<String>(null, RESPONSE_AUTH_BODY, req);
        }

        return null;
    }

    private final String RESPONSE_AUTH_BODY =
    "{" +
    "  \"absoluteMinimumPartSize\": 5000000," +
    "  \"accountId\": \"YOUR_ACCOUNT_ID\"," +
    "  \"allowed\": {" +
    "    \"bucketId\": \"BUCKET_ID\"," +
    "    \"bucketName\": \"BUCKET_NAME\"," +
    "    \"capabilities\": [" +
    "      \"listBuckets\"," +
    "      \"listFiles\"," +
    "      \"readFiles\"," +
    "      \"shareFiles\"," +
    "      \"writeFiles\"," +
    "      \"deleteFiles\"" +
    "    ]," +
    "    \"namePrefix\": null" +
    "  }," +
    "  \"apiUrl\": \"https://apiNNN.backblazeb2.com\"," +
    "  \"authorizationToken\": \"4_0022623512fc8f80000000001_0186e431_d18d02_acct_tH7VW03boebOXayIc43-sxptpfA=\"," +
    "  \"downloadUrl\": \"https://f002.backblazeb2.com\"," +
    "  \"recommendedPartSize\": 100000000" +
    "}";
}
