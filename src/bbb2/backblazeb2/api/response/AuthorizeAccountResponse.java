package bbb2.backblazeb2.api.response;

import java.net.http.HttpResponse;
import java.net.URI;
import java.net.URISyntaxException;

import com.google.gson.annotations.Expose;

import bbb2.Util;
import bbb2.exception.Bbb2Exception;
import bbb2.exception.JsonParseException;
import bbb2.http.HttpStatusCodes;
import bbb2.json.JsonProxy;

public class AuthorizeAccountResponse
{
    @Expose public String accountId;
    @Expose public String authorizationToken;
    @Expose public URI apiUrl;
    @Expose public URI downloadUrl;
    @Expose public int recommendedPartSize;
}
