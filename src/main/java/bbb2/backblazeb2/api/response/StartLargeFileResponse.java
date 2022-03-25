package bbb2.backblazeb2.api.response;

import com.google.gson.annotations.Expose;

public class StartLargeFileResponse
{
    @Expose public String fileId;
    @Expose public String bucketId;
    @Expose public String fileName;

    @Override
    public String toString()
    {
        StringBuilder s = new StringBuilder();
        s.append("[" + this.getClass().getSimpleName());
        s.append(", fileId=\"" + String.valueOf(fileId) + "\"");
        s.append(", bucketId=\"" + String.valueOf(bucketId) + "\"");
        s.append(", fileName=\"" + String.valueOf(fileName) + "\"]");
        return s.toString();
    }
}
