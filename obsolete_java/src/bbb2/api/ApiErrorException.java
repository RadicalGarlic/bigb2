package bbb2.api;

public class ApiErrorException extends Exception
{
    public ApiErrorException(String msg)
    {
        super(msg);
    }

    public ApiErrorException(Throwable cause)
    {
        super(cause);
    }

    public ApiErrorException(String msg, Throwable cause)
    {
        super(msg, cause);
    }
}
