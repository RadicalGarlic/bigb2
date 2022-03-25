package bbb2.backblazeb2.api.response;

import com.google.gson.annotations.Expose;

public class CancelLargeFileResponse
{
    @Expose public String fileId;
    @Expose public String bucketId;
    @Expose public String accountId;
    @Expose public String fileName;
}
