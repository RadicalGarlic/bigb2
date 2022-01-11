package bbb2.json;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import bbb2.exception.Bbb2Exception;

public class JsonProxy
{
    public static <T> T fromJson(String json, Class<T> type)
    {
        return JsonProxy.gson.fromJson(json, type);
    }

    public static <T> T fromJson(Path filePath, Class<T> type)
    throws Bbb2Exception
    {
        try
        {
            return JsonProxy.gson.fromJson(
                new InputStreamReader(new FileInputStream(filePath.toFile()),
                                      StandardCharsets.UTF_8),
                type
            );
        }
        catch (FileNotFoundException e)
        {
            throw new Bbb2Exception(e);
        }
    }

    public static String toJson(Object o)
    {
        return JsonProxy.gson.toJson(o);
    }

    private static Gson gson
        = new GsonBuilder().excludeFieldsWithoutExposeAnnotation().create();
}
