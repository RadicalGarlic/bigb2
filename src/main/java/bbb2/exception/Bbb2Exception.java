package bbb2.exception;

public class Bbb2Exception extends Exception
{
    public Bbb2Exception(String msg)
    {
        super(msg);
    }

    public Bbb2Exception(String msg, Throwable cause)
    {
        super(msg, cause);
    }

    public Bbb2Exception(Throwable cause)
    {
        super("", cause);
    }
}
