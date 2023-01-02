# Writing a string processing library

<!-- Talking head -->
It's time for the next homework. We now know a lot about writing functions, putting them into header and source files and organizing all of those into libraries, so it's about time we put it to the test.

Today we will write a small library for string processing with an unassuming name `"no_strings_attached"` :wink:

<!-- Screen record -->
Speaking about putting to the test, you will have to write tests for your library.


<!-- Talking head -->
We'll also implement a couple of examples to show how this library works.

<!-- Screen record -->
They all live in the examples folder and allow to:
- Split string by running: `examples/split_strings`
- Trim strings by running: `examples/trim_strings`
- Check if they contain a substring by running `examples/string_contains`

<!-- Talking head -->
That's about it. As always, follow to the description of this video for a link to a formal definition of the homework. And good luck!

## Formal homework definition

### The expected project structure
The project has to follow the template described in the [CMake](../../lectures/cmake.md) and [Googletest](../../lectures/googletest.md) lectures. Here is how it will look inside of the `homework_4` folder in your homework repository (that you can [create from this template](https://github.com/cpp-for-yourself/homeworks)).

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
    ├── build/  # All generated build files. Don't modify manually!
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

> Such small libraries are a bit excessive for the real world use, but we are learning how to write libraries here, so it'll do :wink:

#### Expected functionality
- Splitting strings library `string_split` should have the following functions:
  - A function to split a given string into a vector of strings from the right given a delimiter:
    ```cpp
    std::vector<std::string> Split(const std::string& str, const std::string& delimiter);
    ```
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
    > Think where you want to put this enumeration. Should it live in a separate header?
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

For validating the right functionality, the homework checking system will inject another folder `validation_test` into your project and run the custom-designed tests on your code. This will show up as a separate line in the output from the homework checker bot.

#### Example binaries
To show off the functionality we will also have binaries that use this functionality. These should be reachable after building the project under these paths and behave as follows:
- An example for splitting strings: `build/examples/split_strings`
  - It should behave as follows:
