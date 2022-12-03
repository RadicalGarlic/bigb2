package bbb2.backblazeb2.api;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.util.Arrays;

import bbb2.util.HttpsUrl;

public class ApiUrlUtil
{
    public static URI getAuthUrl() throws URISyntaxException
    {
        return new HttpsUrl(Arrays.asList("api", "backblazeb2", "com"),
                            Arrays.asList(B2API,
                                          CUR_VERSION,
                                          "b2_authorize_account")).toUri();
    }

    public static URI getListBucketsUrl(URI domain)
    {
        return HttpsUrl.addPath(domain,
                                Arrays.asList(B2API,
                                              CUR_VERSION,
                                              "b2_list_buckets"));
    }

    public static URI getCancelLargeFileUrl(URI domain)
    {
        return HttpsUrl.addPath(domain,
                                Arrays.asList(B2API,
                                              CUR_VERSION,
                                              "b2_cancel_large_file"));
    }

    public static URI getGetFileInfoUrl(URI domain)
    {
        return HttpsUrl.addPath(
            domain,
            Arrays.asList(B2API, CUR_VERSION, "b2_get_file_info")
        );
    }

    private static final String CUR_VERSION = "v2";
    private static final String B2API = "b2api";
}
