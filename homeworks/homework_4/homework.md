# Writing a string processing library

<p align="center">
  <a href="blah"><img src="https://img.youtube.com/vi/blah/0.jpg" alt="Video" align="right" width=40%></a>
</p>

<!-- Talking head -->
It's time for the next homework. We now know a lot about writing functions, putting them into header and source files and organizing all of those into libraries, so it's about time we put it to the test.

Today we will write a small library for string processing with an unassuming name `"no_strings_attached"` :wink:

<!-- Screen record -->
Speaking about "putting to the test", you will have to write tests for your library.

<!-- Talking head -->
We'll also implement a couple of examples to show how this library works.

<!-- Screen record -->
They all live in the examples folder and allow to:
- Split strings by running: `examples/split_strings`
- Trim strings by running: `examples/trim_strings`

<!-- Talking head -->
That's about it. As always, follow to the description of this video for a link to a formal definition of the homework. And good luck!

## Formal homework definition
The main task of this homework is to write a library that splits and trims strings. It is checked in two ways:
1. Through tests using the `googletest` framework
2. Through binaries in the `examples` folder

Below we cover all the details that you might need for the implementation.

### Prerequisites
Please make sure you've done the previous homework and that you're comfortable with all lectures since that homework until this one. The [Readme](../../readme.md) is a convenient way to check this.

### The expected project structure
The project has to follow the template described in the [CMake](../../lectures/cmake.md) and [GoogleTest](../../lectures/googletest.md) lectures. Here is how it will look inside of the `homework_4` folder in your homework repository (that you can [create from this template](https://github.com/cpp-for-yourself/homeworks)).

```bash
homework_4/
└── no_strings_attached/
    ├── CMakeLists.txt
    ├── external
    │   ├── CMakeLists.txt
    │   └── googletest/  # Googletest library as a submodule
    ├── examples
    │   ├── CMakeLists.txt
    │   ├── split_strings.cpp
    │   └── trim_strings.cpp
    ├── no_strings_attached/
    │   ├── CMakeLists.txt  # Defines all libraries
    │   ├── split_string.cpp
    │   ├── split_string.h
    │   ├── split_string_test.cpp
    │   └── ... # Same for all other libraries
    ├── .clang-format
    └── readme.md  # Description of your project. Go nuts!
```

### The libraries
Here is a more formal definition about what the libraries must do and how they should be organized.

#### Namespace
Just as we discussed in the videos, make sure that the namespaces follow the project structure. Thus, all functions in this project must live in the `no_strings_attached` namespace.

#### CMake targets
There will be 2 libraries (more concretely, CMake targets), one per functionality:
- `string_split`
- `string_trim`

These libraries must all be defined in the `no_strings_attached/CMakeLists.txt` so that the binaries in the `examples` folder and the tests could be linked to those.

#### Header files
They also should have header files so that they can be included with:
- `#include <no_strings_attached/split_string.h>`
- `#include <no_strings_attached/string_trim.h>`

> :bulb: Such small libraries are a bit excessive for the real world use, but we are learning how to write libraries here, so it'll do :wink:

#### Expected functionality
- Splitting strings library `string_split` should have the following functions:
  - A function to split a given string into a vector of strings from the right given a delimiter:
    ```cpp
    std::vector<std::string> Split(const std::string& str, const std::string& delimiter);
    ```
    > :bulb: Hint: You might want to use the [`find`](https://en.cppreference.com/w/cpp/string/basic_string/find) method from `std::string` when implementing this function.

    Examples:
      - `Split("hello world", " ")` ➡️ `std::vector{"hello", "world"}`
      - `Split("aaabaaba", "aa")` ➡️ `std::vector{"", "ab", "ba"}`
  - An overload of the above function that allows keeping only part of the output:
    ```cpp
    std::vector<std::string> Split(const std::string& str, const std::string& delimiter, int number_of_chunks_to_keep);
    ```
    Examples:
      - `Split("hello world", " ", 1)` ➡️ `std::vector{"hello"}`
      - `Split("hello world", " ", 2)` ➡️ `std::vector{"hello", "world"}`
      - `Split("aaabaaba", "aa", 2)` ➡️ `std::vector{"", "ab"}`
- Trimming strings library `string_trim` should have the following things:
  - An `enum class` called `Side` that defines these options:
    - `Side::kLeft`
    - `Side::kRight`
    - `Side::kBoth`
    > :bulb: Think where you want to put this enumeration. Should it live in a separate header?
  - A function that allows trimming strings from a given direction:
    ```cpp
    std::string Trim(const std::string& str, char char_to_trim, Side side);
    ```
    Examples:
      - `Trim("  hello ", ' ', Side::kLeft)` ➡️ `std::string{"hello "}`
      - `Trim("  hello ", ' ', Side::kRight)` ➡️ `std::string{"  hello"}`
      - `Trim("  hello ", ' ', Side::kBoth)` ➡️ `std::string{"hello"}`
      - `Trim("hello", 'h', Side::kLeft)` ➡️ `std::string{"ello"}`
  - An overload of this function function that allows trimming spaces from both sides:
    ```cpp
    std::string Trim(const std::string& str);
    ```
    Examples:
      - `Trim("  hello ")` ➡️ `std::string{"hello"}`

#### Tests for libraries
All of the libraries must have unit tests using the `googletest` framework available as a submodule in the project's `external` folder, just like it is presented in the [Googletest](../../lectures/googletest.md) lecture. All of the tests must live in the same folder as the file that contains the code that they test and must be registered through `ctest`.

For validating the right functionality, the homework checking system will inject an additional folder `validation_test` into your project and run the custom-designed tests on your code. This will show up as a separate line in the output from the homework checker in your PR and wiki.

#### Example binaries
To show off the functionality we will also have binaries that use this functionality. These should be reachable after building the project under these paths and behave as follows:
- The binary to split string: `build/examples/split_strings`
  - It should ask the user for a string and print this string split on the `" "` character with every word surrounded in `'` characters
  - Example:
    ```
    echo "hello world" | ./build/examples/split_strings
    Example program that splits strings.
    Please enter a string:
    Your split string: 'hello' 'world'
    ```
- The binary to trim strings: `build/examples/trim_strings`
  - It should ask the user for a string and trim the spaces around it. It should then print this string to the terminal surrounded in `'` characters
  - Example:
    ```
    echo "  hello world  " | ./build/examples/trim_strings
    Example program that trims strings.
    Please enter a string:
    Your trimmed string: 'hello world'
    ```

> :bulb: In your binaries, you might want to use the [`std::getline`](https://en.cppreference.com/w/cpp/string/basic_string/getline) function instead of directly using `std::cin` as the latter splits input on the <kbd>space</kbd> character, while the former does not.

## That's it!
Congratulations! You've implemented your own library in relatively modern C++! On to the next challenge! Do share your thoughts on the whole process in the [discussions page](https://github.com/orgs/cpp-for-yourself/discussions/categories/general) :pray:.
