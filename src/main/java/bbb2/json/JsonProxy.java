package bbb2.json;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStreamReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import bbb2.exception.Bbb2Exception;


public class JsonProxy
{
    public static <T> T fromJson(String json, Class<T> type)
    throws Bbb2Exception
    {
        try
        {
            return JsonProxy.objectMapper.readValue(json, type);
        }
        catch (JsonProcessingException e)
        {
            throw new Bbb2Exception(e);
        }
        catch (IOException e)
        {
            throw new Bbb2Exception(e);
        }
    }

    public static <T> T fromJson(Path filePath, Class<T> type)
    throws Bbb2Exception
    {
        try
        {
            return JsonProxy.objectMapper.readValue(
                new InputStreamReader(new FileInputStream(filePath.toFile()),
                                      StandardCharsets.UTF_8),
                type);
        }
        catch (FileNotFoundException e)
        {
            throw new Bbb2Exception(e);
        }
        catch (JsonProcessingException e)
        {
            throw new Bbb2Exception(e);
        }
        catch (IOException e)
        {
            throw new Bbb2Exception(e);
        }
    }

    public static String toJson(Object o) throws Bbb2Exception
    {
        try
        {
            return JsonProxy.objectMapper.writeValueAsString(o);
        }
        catch (JsonProcessingException e)
        {
            throw new Bbb2Exception(e);
        }
    }

    private static ObjectMapper objectMapper = new ObjectMapper();
}
