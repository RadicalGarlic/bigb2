package bbb2.operation;

import bbb2.exception.Bbb2Exception;

public abstract class Operation
{
    public abstract int execute() throws Exception;

    protected static <T> T getNext(int curIdx, T[] list) throws Bbb2Exception
    {
        try
        {
            return list[++curIdx];
        }
        catch (ArrayIndexOutOfBoundsException e)
        {
            throw new Bbb2Exception(e);
        }
    }
}
