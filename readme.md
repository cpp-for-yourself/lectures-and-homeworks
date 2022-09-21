# Lectures and homeworks


This is a list of lectures from the [C++ for yourself](https://youtube.com/playlist?list=PLwhKb0RIaIS1sJkejUmWj-0lk7v_xgCuT) course.

## How to follow this course
The course is designed to be consumed from top to bottom, so start at the beginning and you will always have enough knowledge for the next video.

That being said, I aim to leave links in the videos so that one could watch them out of order without much hassle. 

Enjoy! 😎

## C++ for yourself

- <details>
  <summary>
  Hello world program dissection: 
  </summary>

  [`[video]`](https://youtu.be/t2h1geGSww4)
  [`[slides]`](lectures/hello_world_dissection.md)

  - First keywords
  - What brackets mean
  - What do different signs mean
  - Intro to "scopes"
  - Intro to functions
  - Intro to includes
  </details>
- <details>
  <summary><code>Homework</code>: hello world program</summary>

  [`[homework]`](homeworks/homework_1/homework.md)

  - Write a simple program that prints `Hello World!`
  - Learn to compile and run simple programs
  </details>
- <details>
  <summary>
  Variables of fundamental types: 
  </summary>

  [`[video]`](https://youtu.be/0z0gvv_Tb_U)
  [`[slides]`](lectures/cpp_basic_types_and_variables.md)

  - How to create variables of fundamental types
  - Naming variables
  - Using `const`, `constexpr` with variables
  - References to variables
  </details>
- <details>
  <summary>
  Namespaces for variables: 
  </summary>

  [`[video]`](https://youtu.be/cP2IDg4_BRk)
  [`[slides]`](lectures/namespaces_using.md)

  - Namespaces with variables
  - The word `using` with variables
  </details>
- <details>
  <summary>
  Input/output streams: 
  </summary>

  [`[video]`](https://youtu.be/hy3eOpZmxbY)
  [`[slides]`](lectures/io_streams.md)

  - `std::cout`, `std::cerr`, `std::cin`
  </details>
- <details>
  <summary>
  Sequence and utility containers: 
  </summary>

  [`[video]`](https://youtu.be/dwkSVkGsvFk)
  [`[slides]`](lectures/more_useful_types.md)

  - Sequence containers: `std::array`, `std::vector`, their usage and some caveats
  - Pair container: `std::pair`
  - Strings from STL: `std::string`
  - Conversion to/from strings: `to_string`, `stoi`, `stod`, `stof`, etc.
  - Aggregate initialization
  </details>
- <details>
  <summary>
  Associative containers: 
  </summary>

  [`[video]`](https://youtu.be/TCu76SYmVCg)
  [`[slides]`](lectures/associative_containers.md)

  - `std::map` and `std::unordered_map`
  - Touch up on `std::set` and `std::unordered_set`
  </details>
- <details>
  <summary><code>Homework</code>: fortune teller program</summary>

  [`[homework]`](homeworks/homework_2/homework.md)

  - Write a program that tells your C++ fortune
  - It reads and writes data from and to terminal
  - Stores and accesses these data in containers
  </details>
- <details>
  <summary>
  Control structures: 
  </summary>

  [`[video]`](https://youtu.be/jzgTxosgGIA)
  [`[slides]`](lectures/control_structures.md)

  - `if`, `switch` and ternary operator
  - `for`, `while` and `do ... while`
  </details>
- <details>
  <summary>
  Random number generation: 
  </summary>

  [`[video]`](https://youtu.be/IUoqMTGGo6k)
  [`[slides]`](lectures/random_numbers.md)

  - What are random numbers
  - How to generate them in modern C++
  - Why not to use `rand()`
  </details>
- <details>
  <summary><code>Homework</code>: the guessing game</summary>
  
  [`[video]`](https://youtu.be/TYs_xwihCNc)
  [`[homework]`](homeworks/homework_3/homework.md)

  - A program that generates a number
  - The user guesses this number
  - The program tells the user if they are above or below with their guess (or if they've won)
  </details>
- <details>
  <summary>
  Compilation flags and debugging
  </summary>

  [`[video]`](https://youtu.be/NTlcDv7W2-c)
  [`[slides]`](lectures/compilation_debugging.md)

  - Useful compilation flags
  - Debugging a program with:
    - Print statements
    - `lldb` debugger
  </details>
- <details>
  <summary>
  Functions 
  </summary>

  [`[video]`](blah)
  [`[slides]`](lectures/functions.md)

  - What is a function
  - Declaration and definition
  - Passing by reference
  - Overloading
  - Using default arguments
  </details>

## PS :wink:
Most of the code snippets are validated automatically. If you do find an error in some of those, please open an issue in this repo!
