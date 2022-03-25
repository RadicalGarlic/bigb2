package bbb2.backblazeb2.api.response;

import java.util.List;

import com.google.gson.annotations.Expose;

public class ListUnfinishedLargeFilesResponse
{
    public static class File
    {
        @Expose public String accountId;
        @Expose public String bucketId;
        @Expose public String fileId;
        @Expose public String fileName;
    }

    @Expose
    public List<ListUnfinishedLargeFilesResponse.File> files;
}
