TARGET = renderer

$(TARGET): makefile $(wildcard *.c *.h)
	gcc -Wall -Werror -O3 $(wildcard *.c) -lSDL2 -o $@

clean:
	rm $(TARGET)
