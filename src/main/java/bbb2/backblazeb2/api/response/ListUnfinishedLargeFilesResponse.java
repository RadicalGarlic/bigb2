package bbb2.backblazeb2.api.response;

import java.util.List;

public class ListUnfinishedLargeFilesResponse
{
    public static class File
    {
        public String accountId;
        public String bucketId;
        public String fileId;
        public String fileName;
    }

    public List<ListUnfinishedLargeFilesResponse.File> files;
}
