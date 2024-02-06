# Lectures and homeworks

![Build status](https://img.shields.io/github/actions/workflow/status/cpp-for-yourself/supplementary-materials/action.yml?branch=main&label=Link%20and%20code%20validation&style=for-the-badge)
![Visitors](https://api.visitorbadge.io/api/visitors?path=code-for-yourself%2Fcode-for-yourself&labelColor=%23697689&countColor=%23263759)

This is a list of lectures from the [C++ for yourself](https://youtube.com/playlist?list=PLwhKb0RIaIS1sJkejUmWj-0lk7v_xgCuT) course.

## How to follow this course
The course is designed to be consumed from top to bottom, so start at the beginning and you will always have enough knowledge for the next video.

That being said, I aim to leave links in the videos so that one could watch them out of order without much hassle.

Enjoy! 😎

## C++ for yourself

<details>
<summary>
Hello world program dissection
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/t2h1geGSww4/maxresdefault.jpg)](https://youtu.be/t2h1geGSww4)

[Lecture script](lectures/hello_world_dissection.md)
- First keywords
- What brackets mean
- What do different signs mean
- Intro to "scopes"
- Intro to functions
- Intro to includes
----------------------------------------------------------
</details>

<details>
<summary><code>Homework</code>: hello world program</summary>

----------------------------------------------------------
[Homework script](homeworks/homework_1/homework.md)
- Write a simple program that prints `Hello World!`
- Learn to compile and run simple programs
----------------------------------------------------------
</details>

<details>
<summary>
Variables of fundamental types
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/0z0gvv_Tb_U/maxresdefault.jpg)](https://youtu.be/0z0gvv_Tb_U)

[Lecture script](lectures/cpp_basic_types_and_variables.md)
- How to create variables of fundamental types
- Naming variables
- Using `const`, `constexpr` with variables
- References to variables
----------------------------------------------------------
</details>

<details>
<summary>
Namespaces for variables
</summary>

-----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/cP2IDg4_BRk/maxresdefault.jpg)](https://youtu.be/cP2IDg4_BRk)

[Lecture script](lectures/namespaces_using.md)
- Namespaces with variables
- The word `using` with variables
----------------------------------------------------------
</details>

<details>
<summary>
Input/output streams
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/hy3eOpZmxbY/maxresdefault.jpg)](https://youtu.be/hy3eOpZmxbY)

[Lecture script](lectures/more_useful_types.md)
- `std::cout`, `std::cerr`, `std::cin`
----------------------------------------------------------
</details>

<details>
<summary>
Sequence and utility containers
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/dwkSVkGsvFk/maxresdefault.jpg)](https://youtu.be/dwkSVkGsvFk)

[Lecture script](lectures/more_useful_types.md)
- Sequence containers: `std::array`, `std::vector`, their usage and some caveats
- Pair container: `std::pair`
- Strings from STL: `std::string`
- Conversion to/from strings: `to_string`, `stoi`, `stod`, `stof`, etc.
- Aggregate initialization
----------------------------------------------------------
</details>

<details>
<summary>
Associative containers
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/TCu76SYmVCg/maxresdefault.jpg)](https://youtu.be/TCu76SYmVCg)

[Lecture script](lectures/associative_containers.md)
- `std::map` and `std::unordered_map`
- Touch up on `std::set` and `std::unordered_set`
----------------------------------------------------------
</details>

<details>
<summary><code>Homework</code>: fortune teller program</summary>

----------------------------------------------------------
[Homework script](homeworks/homework_2/homework.md)
- Write a program that tells your C++ fortune
- It reads and writes data from and to terminal
- Stores and accesses these data in containers
----------------------------------------------------------
</details>

<details>
<summary>
Control structures
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/jzgTxosgGIA/maxresdefault.jpg)](https://youtu.be/jzgTxosgGIA)

[Lecture script](lectures/control_structures.md)
- `if`, `switch` and ternary operator
- `for`, `while` and `do ... while`
----------------------------------------------------------
</details>

<details>
<summary>
Random number generation
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/IUoqMTGGo6k/maxresdefault.jpg)](https://youtu.be/IUoqMTGGo6k)

[Lecture script](lectures/random_numbers.md)
- What are random numbers
- How to generate them in modern C++
- Why not to use `rand()`
----------------------------------------------------------
</details>

<details>
<summary><code>Homework</code>: the guessing game</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/TYs_xwihCNc/maxresdefault.jpg)](https://youtu.be/TYs_xwihCNc)

[Homework script](homeworks/homework_3/homework.md)
- A program that generates a number
- The user guesses this number
- The program tells the user if they are above or below with their guess (or if they've won)
----------------------------------------------------------
</details>

<details>
<summary>
Compilation flags and debugging
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/NTlcDv7W2-c/maxresdefault.jpg)](https://youtu.be/NTlcDv7W2-c)

[Lecture script](lectures/compilation_debugging.md)
- Useful compilation flags
- Debugging a program with:
  - Print statements
  - `lldb` debugger
----------------------------------------------------------
</details>

<details>
<summary>
Functions
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/RaSw0g2aPig/maxresdefault.jpg)](https://youtu.be/RaSw0g2aPig)

[Lecture script](lectures/functions.md)
- What is a function
- Declaration and definition
- Passing by reference
- Overloading
- Using default arguments
----------------------------------------------------------
</details>

<details>
<summary>
Enumerations
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/4kZyQ-TwH00/maxresdefault.jpg)](https://youtu.be/4kZyQ-TwH00)

[Lecture script](lectures/enums.md)
- What are `enums`
- How to use them?
- Why not to use old style `enums`
----------------------------------------------------------
</details>

<details>
<summary>
Libraries and header files
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/Lxo8ftglwXE/maxresdefault.jpg)](https://youtu.be/Lxo8ftglwXE)

[Lecture script](lectures/headers_and_libraries.md)
- Different types of libraries
  - Header-only
  - Static
  - Dynamic
- What is linking
- When to use the keyword `inline`
- Some common best practices
----------------------------------------------------------
</details>

<details>
<summary>
Build systems introduction
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/kbk4DphsYPU/maxresdefault.jpg)](https://youtu.be/kbk4DphsYPU)

[Lecture script](lectures/build_systems.md)
- Intro to build systems
- Build commands as a script
- Build commands in a `Makefile`
----------------------------------------------------------
</details>

<details>
<summary>
CMake introduction
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/UH6F6ypdYbw/maxresdefault.jpg)](https://youtu.be/UH6F6ypdYbw)

[Lecture script](lectures/cmake.md)
- Build process with CMake
- CMake Variables
- Targets and their properties
- Example CMake project
----------------------------------------------------------
</details>

<details>
<summary>
Using GoogleTest framework for testing code
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/pxJoVRfpRPE/maxresdefault.jpg)](https://youtu.be/pxJoVRfpRPE)

[Lecture script](lectures/googletest.md)
- Explain what testing is for
- Explain what testing is
- Show how to download and setup googletest
- Show how to write a simple test
----------------------------------------------------------
</details>

<details>
<summary><code>Homework</code>: string processing library</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/f0x2qcFgu5o/maxresdefault.jpg)](https://youtu.be/f0x2qcFgu5o)

[Homework script](homeworks/homework_4/homework.md)
- You will write library that allows to split and trim strings
- You will learn how to:
  - Write a CMake project from scratch
  - Write your own libraries
  - Test them with googletest
  - Link them to binaries
----------------------------------------------------------
</details>

<details>
<summary>
Simple custom types with classes and structs
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/IijP--Xf5kQ/maxresdefault.jpg)](https://youtu.be/IijP--Xf5kQ)

[Lecture script](lectures/classes_intro.md)
- Explain why the classes are needed
- Implement an example game about a car
- Define classes and structs more formally
----------------------------------------------------------
</details>

<details>
<summary>
Raw pointers
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/pptRG345jnU/maxresdefault.jpg)](https://youtu.be/pptRG345jnU)

[Lecture script](lectures/raw_pointers.md)
- The pointer type
- Pointers = variables of pointer types
- How to get the data?
- Initialization and assignment
- Using const with pointers
- Non-const pointer to const data
- Constant pointer to non-const data
- Constant pointer to constant data
----------------------------------------------------------
</details>

<details>
<summary>
Object lifecycle
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/TFoav6vhgdg/maxresdefault.jpg)](https://youtu.be/TFoav6vhgdg)

[Lecture script](lectures/object_lifecycle.md)
- Creating a new object
- What happens when an object dies
- Full class lifecycle explained
----------------------------------------------------------
</details>

<details>
<summary>
Move semantics
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/kqQ90R0_GFI/maxresdefault.jpg)](https://youtu.be/kqQ90R0_GFI)

[Lecture script](lectures/move_semantics.md)
- Why we care about move semantics
- Let’s re-design move semantics from scratch
- How is it actually designed and called in Modern C++?

----------------------------------------------------------
</details>

<details>
<summary>
Constructors, operators, destructor - rule of all or nothing
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/una89pkP9ms/maxresdefault.jpg)](https://youtu.be/una89pkP9ms)

[Lecture script](lectures/all_or_nothing.md)
- “Good style” as our guide
- What is “good style”
- Setting up the example
- Rule 1: destructor
- Rule 2: copy constructor
- Rule 3: copy assignment operator
- Rule 4: move constructor
- Rule 5: move assignment operator
- Now we (mostly) follow best practices
- Rule of 5 (and 3)
- The rule of “all or nothing”

----------------------------------------------------------
</details>

<details>
<summary>
Headers with classes
</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/9MB1nHDIM64/maxresdefault.jpg)](https://youtu.be/9MB1nHDIM64)

[Lecture script](lectures/headers_with_classes.md)
- What stays the same
- What is different
- Example to show it all

----------------------------------------------------------
</details>

<details>
<summary>Const correctness</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/WsBdxq319OY/maxresdefault.jpg)](https://youtu.be/WsBdxq319OY)

[Lecture script](lectures/const_correctness.md)
- What is const correctness
- Some rules and examples to follow in order to work with `const` correctly
----------------------------------------------------------
</details>

<details>
<summary><code>Homework</code>: pixelate images in terminal</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/Cj3x51iJdvM/maxresdefault.jpg)](https://youtu.be/Cj3x51iJdvM)

[Homework script](homeworks/homework_5/homework.md)
- You will write a library that allows to pixelate an image
- You will learn how to:
  - Work with classes
  - Use external libraries
    - Read images from disk using `stb_image.h`
    - Draw stuff in the terminal using `FTXUI` library
  - Manage memory allocated elsewhere correctly
  - Writing multiple libraries and binaries and linking them together
  - Manage a larger CMake project
----------------------------------------------------------
</details>

<details>
<summary>Keyword <code>static</code> <b>outside</b> of classes</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/7cpPQunjv4s/maxresdefault.jpg)](https://youtu.be/7cpPQunjv4s)

[Lecture script](lectures/static_outside_classes.md)
- Why we should not use `static` outside of classes
- Relation to storage duration
- Relation to linkage
- Why we should use `inline` instead

----------------------------------------------------------
</details>

<details>
<summary>Keyword <code>static</code> <b>inside</b> classes</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/ggNCjDPShrA/maxresdefault.jpg)](https://youtu.be/ggNCjDPShrA)

[Lecture script](lectures/static_in_classes.md)
- Using `static` class methods
- Using `static` class data
- What is `static` in classes useful for?

----------------------------------------------------------
</details>

<details>
<summary>Templates: **why** would we want to use them?</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/1Mrt1NM3KnI/maxresdefault.jpg)](https://youtu.be/1Mrt1NM3KnI)

[Lecture script](lectures/templates_why.md)
- Templates provide abstraction and separation of concerns
- Function templates
- Class and struct templates
- Generic algorithms and design patterns
- Zero runtime cost (almost)
- Compile-time meta-programming
- Summary

----------------------------------------------------------
</details>

<details>
<summary>Templates: **what** do they do under the hood?</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/NKvEbPVllRE/maxresdefault.jpg)](https://youtu.be/NKvEbPVllRE)

[Lecture script](lectures/templates_what.md)
- Compilation process recap
- Compiler uses templates to generate code
- Hands-on example
- Compiler is lazy

----------------------------------------------------------
</details>


## PS

### Most of the code snippets are validated automatically
If you **do** find an error in some of those, please open an issue in this repo!
