.PHONY: clean

SRC = src/main.kt

OUT = bin/bbb2.jar

$(OUT): $(SRC)
	kotlinc -include-runtime -d $@ $<

clean:
	rm -rf $(OUT)
