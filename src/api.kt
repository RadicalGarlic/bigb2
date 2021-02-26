package bbb2.api

import io.ktor.client.HttpClient
import io.ktor.client.request.HttpRequestBuilder
import io.ktor.http.HeadersBuilder
import io.ktor.client.request.post

import io.ktor.http.URLBuilder
import io.ktor.http.URLProtocol
import java.util.Base64;
import io.ktor.client.request.header
import io.ktor.client.request.get
import kotlinx.coroutines.runBlocking

fun authorizeAccount(keyId: String, appKey: String)
{
    var keyBytes = (keyId + ":" + appKey).toByteArray(Charsets.UTF_8)
    var key = "Basic" + Base64.getEncoder().encodeToString(keyBytes)

    var req = HttpRequestBuilder()
    req.header("Authorization", key)
    
    req.url()
    {
        URLBuilder(protocol = URLProtocol.HTTPS,
                   host = "api.backblazeb2.com",
                   encodedPath = "/b2api/v2/b2_authorize_account")
    }

    var client = HttpClient()
    runBlocking {
        println(client.get<String>(req))
    }
}

fun listBuckets(auth: String, accountId: String, bucketName: String = "")
{
}

fun startLargeFile(auth: String, bucketId: String, fileName: String)
{
}
