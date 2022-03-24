package bbb2.http;

public enum HttpStatusCodes
{
    OK(200);

    HttpStatusCodes(int inCode)
    {
        code = inCode;
    }

    public int getInt()
    {
        return code;
    }

    private final int code;
}
