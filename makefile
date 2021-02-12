.PHONY: clean

SRC = src/main.kt

OUT = bin/bbb2.kexe

$(OUT): $(SRC)
	kotlinc -o $@ $<

clean:
	rm -rf $(OUT)
