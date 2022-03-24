package bbb2;

import java.net.http.HttpResponse;

public class Util
{
    public static String toString(HttpResponse<String> in)
    {
        StringBuilder s = new StringBuilder();
        s.append("StatusCode=" + String.valueOf(in.statusCode()));
        s.append(", Body=\"" + in.body() + "\".");
        return s.toString();
    }
}
