.PHONY: all test clean

SRC = src/bbb2/Main.java\
      src/bbb2/ExitCode.java\
      src/bbb2/Util.java\
      src/bbb2/backblazeb2/api/BackblazeB2ApiProxy.java\
      src/bbb2/backblazeb2/api/request/AuthorizeAccountRequest.java\
      src/bbb2/backblazeb2/api/request/ListBucketsRequest.java\
      src/bbb2/backblazeb2/api/request/Request.java\
      src/bbb2/backblazeb2/api/response/AuthorizeAccountResponse.java\
      src/bbb2/backblazeb2/api/response/ListBucketsResponse.java\
      src/bbb2/backblazeb2/client/AppKey.java\
      src/bbb2/backblazeb2/client/BackblazeB2Client.java\
      src/bbb2/backblazeb2/client/response/ListBucketsResponse.java\
      src/bbb2/exception/Bbb2Exception.java\
      src/bbb2/exception/JsonParseException.java\
      src/bbb2/http/HttpClientProxy.java\
      src/bbb2/http/HttpStatusCodes.java\
      src/bbb2/json/JsonProxy.java\
      src/bbb2/operation/ListBucketsOperation.java\
      src/bbb2/operation/Operation.java\
      src/bbb2/operation/OperationFactory.java

TST = tst/unit_tests/ApiResultsTests.java\
      tst/unit_tests/ApiProxyTests.java\
      tst/unit_tests/StandardLibTests.java\
      tst/mocks/MockHttpClientProxy.java\
      tst/mocks/MockHttpResponse.java

JSON_JAR = lib/javax.json/javax.json.jar:lib/gson/gson-2.8.9.jar

JUNIT_JAR = lib/junit-platform-console-standalone-1.7.0.jar

all:
	javac -d bin -classpath $(JSON_JAR) $(SRC)
	jar cef bbb2.Main bin/bbb2.jar -C bin bbb2

#test: all
#javac -d tst/bin -classpath $(JUNIT_JAR):$(JSON_JAR) $(SRC) $(TST)
#java -jar $(JUNIT_JAR) --classpath tst/bin:bin:$(JSON_JAR) --scan-class-path --disable-ansi-colors

clean:
	rm -rf bin/*
	rm -rf tst/bin/*
