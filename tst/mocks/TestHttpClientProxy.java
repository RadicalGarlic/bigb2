package mocks;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Optional;
import javax.net.ssl.SSLSession;

import bbb2.api.Api;
import bbb2.util.http.HttpClientProxy;
import bbb2.util.http.HttpStatusCodes;

public class TestHttpClientProxy implements HttpClientProxy
{
    public static class MockResponse<String> implements HttpResponse<String>
    {
        public MockResponse(HttpHeaders inHeaders, String inBody,
                            HttpRequest inReq)
        {
            varHeaders = inHeaders;
            varBody = inBody;
            req = inReq;
        }

        public String body()
        {
            return varBody;
        }

        public HttpHeaders headers()
        {
            return varHeaders;
        }

        public HttpClient.Version version()
        {
            return null;
        }

        public URI uri()
        {
            return null;
        }

        public Optional<SSLSession> sslSession()
        {
            return null;
        }

        public Optional<HttpResponse<String>> previousResponse()
        {
            return null;
        }

        public HttpRequest request()
        {
            return req;
        }

        public int statusCode()
        {
            return HttpStatusCodes.OK.getInt();
        }

        private HttpHeaders varHeaders;
        private String varBody;
        private HttpRequest req;
    }

    public HttpResponse<String> send(HttpRequest req)
    throws InterruptedException, IOException
    {
        if ("/b2api/v2/b2_authorize_account".equals(req.uri().getPath()))
        {
            return new MockResponse<String>(null, RESPONSE_AUTH_BODY, req);
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
