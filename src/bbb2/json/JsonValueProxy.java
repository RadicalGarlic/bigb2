package bbb2.json;

import java.io.File;
import java.io.FileReader;
import java.io.StringReader;
import java.io.FileNotFoundException;

import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonException;
import javax.json.JsonNumber;
import javax.json.JsonObject;
import javax.json.JsonValue;

import bbb2.json.JsonParseException;

public class JsonValueProxy
{
    public JsonValueProxy(File file) throws FileNotFoundException, 
                                            JsonParseException
    {
        try
        {
            internal = Json.createReader(new FileReader(file)).readObject();
        }
        catch (JsonException e)
        {
            StringBuilder s = new StringBuilder();
            s.append("Failed to parse JSON file.");
            throw new JsonParseException(s.toString(), e);
        }
    }

    public JsonValueProxy(String json) throws JsonParseException
    {
        try
        {
            internal = Json.createReader(new StringReader(json)).readObject();
        }
        catch (JsonException e)
        {
            StringBuilder s = new StringBuilder();
            s.append("Failed to parse JSON string.");
            s.append("String=\"" + json + "\".");
            throw new JsonParseException(s.toString(), e);
        }
    }

    public JsonValueProxy(JsonValue in) throws JsonParseException
    {
        if (null == in)
        {
            throw new JsonParseException("Input JsonValue was null.");
        }

        internal = in;
    }

    public int asInt() throws JsonParseException
    {
        try
        {
            JsonNumber num = (JsonNumber)internal;
            return num.intValue();
        }
        catch (ClassCastException e)
        {
            throw new JsonParseException("Failed number cast.", e);
        }
    }

    public String asString() throws JsonParseException
    {
        if (JsonValue.ValueType.STRING == internal.getValueType())
        {
            return new String(internal.toString());
        }
        else
        {
            throw new JsonParseException("Expected JSON string type.");
        }
    }

    public JsonValueProxy asJsonObject() throws JsonParseException
    {
        try
        {
            return new JsonValueProxy((JsonObject)internal);
        }
        catch (ClassCastException e)
        {
            throw new JsonParseException("Failed String cast.", e);
        }
    }

    public JsonValueProxy asArray() throws JsonParseException
    {
        try
        {
            return new JsonValueProxy((JsonArray)internal);
        }
        catch (ClassCastException e)
        {
            throw new JsonParseException("Failed array cast.", e);
        }
    }

    public JsonValueProxy get(int i) throws JsonParseException
    {
        try
        {
            JsonArray arr = (JsonArray)internal;
            return new JsonValueProxy(arr.get(i));
        }
        catch (ClassCastException e)
        {
            throw new JsonParseException("Failed array cast.", e);
        }
        catch (IndexOutOfBoundsException e)
        {
            throw new JsonParseException("Index=" + String.valueOf(i), e);
        }
    }

    public JsonValueProxy get(String key) throws JsonParseException
    {
        try
        {
            JsonObject obj = (JsonObject)internal;
            JsonValue val = obj.get(key);
            if (null == val)
            {
                StringBuilder s = new StringBuilder();
                s.append("Unable to find key \"" + s + "\".");
                throw new JsonParseException(s.toString());
            }

            return new JsonValueProxy(val);
        }
        catch (ClassCastException e)
        {
            throw new JsonParseException("Failed JsonObject cast.", e);
        }
    }

    public int getArrayLen() throws JsonParseException
    {
        try
        {
            JsonArray arr = (JsonArray)internal;
            return arr.size();
        }
        catch (ClassCastException e)
        {
            throw new JsonParseException("Failed array cast.", e);
        }
    }

    private JsonValue internal;
}
