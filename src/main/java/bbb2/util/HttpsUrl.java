package bbb2.util;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

public class HttpsUrl
{
    public static URI addPath(URI domain, List<String> path)
    {
        return domain.resolve(path.stream()
                                  .collect(HttpsUrl.getPathCollector()));
    }

    public HttpsUrl(List<String> domain, List<String> path)
    {
        this.domain = domain;
        this.path = path;
    }

    public URI toUri() throws URISyntaxException
    {
        return new URI("https",
                       domain.stream().collect(Collectors.joining(".")),
                       path.stream().collect(HttpsUrl.getPathCollector()),
                       null);
    }

    @Override
    public String toString()
    {
        try
        {
            return this.toUri().toString();
        }
        catch (URISyntaxException e)
        {
            return domain.toString() + ", " + path.toString();
        }
    }

    private static Collector<CharSequence, ?, String> getPathCollector()
    {
        return Collectors.joining("/", "/","");
    }

    private List<String> domain;
    private List<String> path;
}
