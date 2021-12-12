package bbb2.json;

import com.google.json.Gson;

public class JsonProxy
{
    public static class Example
    {
        public Example(String s, int i)
        {
            this.s = s;
            this.i = i;
        }

        public String s;
        public int i;
    }

    public static Example toExample(String json)
    {
        return new Gson(json, Example.class).
    }
}
