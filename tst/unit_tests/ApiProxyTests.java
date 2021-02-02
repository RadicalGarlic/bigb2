import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import bbb2.api.ApiProxy;
import bbb2.api.results.AuthorizeAccountResult;
import bbb2.util.http.HttpClientProxyBuilder;

import mocks.TestHttpClientProxy;

public class ApiProxyTests
{
    @BeforeAll
    public static void setup()
    {
        HttpClientProxyBuilder.mock = new TestHttpClientProxy();
    }

    @Test
    public void authorizeAccountTest()
    {
        try
        {
            AuthorizeAccountResult result = ApiProxy.authorizeAccount("", "");
            Assertions.assertEquals("YOUR_ACCOUNT_ID", result.accountId);
            Assertions.assertEquals("4_0022623512fc8f80000000001_0186e431_d18d02_acct_tH7VW03boebOXayIc43-sxptpfA=",
                                    result.authToken);
            Assertions.assertEquals("https://apiNNN.backblazeb2.com",
                                    result.apiUrl.toString());
            Assertions.assertEquals("https://f002.backblazeb2.com",
                                    result.downloadUrl.toString());
            Assertions.assertEquals(5000000, result.minPartSizeBytes);
            Assertions.assertEquals(100000000, result.recPartSizeBytes);
        }
        catch (Exception e)
        {
            e.printStackTrace();
            Assertions.fail();
        }
    }
}
