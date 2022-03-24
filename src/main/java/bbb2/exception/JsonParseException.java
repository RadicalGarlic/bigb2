package bbb2.exception;

public class JsonParseException extends Bbb2Exception
{
    public JsonParseException(String msg)
    {
        super(msg);
    }

    public JsonParseException(String msg, Throwable cause)
    {
        super(msg, cause);
    }

    public JsonParseException(Throwable cause)
    {
        super(cause);
    }
}
