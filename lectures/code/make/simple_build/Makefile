all: main

clean:
	rm -f blah.o libblah.a main

main: main.cpp libblah.a
	c++ -std=c++17 main.cpp -I . -L . -lblah -o main

libblah.a: blah.o
	ar rcs libblah.a blah.o

blah.o: blah.cpp
	c++ -std=c++17 -c blah.cpp -I . -o blah.o
