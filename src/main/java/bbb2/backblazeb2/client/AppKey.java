package bbb2.backblazeb2.client;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

public class AppKey
{
    @JsonCreator
    public AppKey(
        @JsonProperty(required = true, value = "keyId")
        String keyId,
        @JsonProperty(required = true, value = "appKey")
        String appKey
    ) {
        this.keyId = keyId;
        this.appKey = appKey;
    }

    @Override
    public String toString()
    {
        return this.keyId + ":" + this.appKey;
    }

    public String getKeyId() { return this.keyId; }
    public String getAppKey() { return this.appKey; }

    private String keyId;
    private String appKey;
}
