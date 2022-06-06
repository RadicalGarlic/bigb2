#!/usr/bin/env bash
exec java -cp target/bbb2-1.0-SNAPSHOT.jar\
:target/dependency/gson-2.9.0.jar\
:target/dependency/jackson-annotations-2.13.3.jar\
:target/dependency/jackson-core-2.13.3.jar\
:target/dependency/jackson-databind-2.13.3.jar \
bbb2.Main "$@"
