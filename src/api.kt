package bbb2.api

import io.ktor.client.HttpClient
import io.ktor.client.request.HttpRequestBuilder
import io.ktor.http.HeadersBuilder
import io.ktor.client.request.post

import io.ktor.http.URLBuilder
import io.ktor.http.URLProtocol
import java.util.Base64;
import io.ktor.client.request.headers

fun authorizeAccount(keyId: String, appKey: String)
{

    var req = HttpRequestBuilder()

    req.url()
    {
        URLBuilder(protocol = URLProtocol.HTTPS,
                   host = "api.backblazeb2.com",
                   encodedPath = "/b2api/v2/b2_authorize_account")
    }

    req.headers()
    {
        this.append("Authorization", "asdfadsf")
    }

    /*
        var client = HttpClient()
        client.post<String>()
    */
}

fun listBuckets(auth: String, accountId: String, bucketName: String = "")
{
}

fun startLargeFile(auth: String, bucketId: String, fileName: String)
{
}
