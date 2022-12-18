# [Introduction to testing with googletest](https://youtu.be/pxJoVRfpRPE)

<p align="center">
  <a href="https://youtu.be/pxJoVRfpRPE"><img src="https://img.youtube.com/vi/pxJoVRfpRPE/0.jpg" alt="Video" align="right" width=50%></a>
</p>

## Why you should care about testing

<!-- Talking head -->
You already know how to write some C++ code. Furthermore, you also know that the code should be structured into bite-sized chunks and that you can write functions that you can put into libraries.

<!-- B-roll person typing ✅ -->
So, you write your next amazing project, you spend hours on writing out the code and thinking about how great everything's going to work.

<!-- B-roll person closing laptop ✅ -->
Finally, you're there, you run your code.

<!-- Explosion ✅ -->
And...

<!-- Talking head -->
Of course it crashes! At least my code would in such a scenario...

Wouldn't it be nice if there was some automated framework we could use to reduce the likelihood of this outcome?

<!-- B-roll Googletest running | ✅ -->
Well, of course such a framework exists! There are actually various testing libraries out there that combined become our first line of defense against the bugs. They all allow writing "test code" to test that our code does what we expect it to.

<!-- Talking head -->
So today we're talking about how to set up such a system and make it work for our purposes. 😉

## What does "testing" even mean
<!-- Talking head -->
Before we talk about a concrete framework, let's chat about what does it mean to "test" the code.

Well, essentially, testing our code means that we want to verify that it does what we expect it to do.

This testing can happen on many levels!

<!-- B-roll show on screen | voice ✅ -->
We won't go too deep into this, but largely speaking we usually have these layers:
- **Unit testing** --- test if each module works on its own
- **Integration testing** --- test how the modules work together
- **Regression testing** --- test that we did not break critical systems with new changes
- **Acceptance / system testing** --- test that the system as a whole works as expected

<!-- Talking head -->
In general, the first are done fully automatically, while the last one is a combination of automatic and manual validation.

However, today we're going to be talking about a framework that *mostly* allows us to address the first two - the unit testing and the integration testing.

## The usual automated testing frameworks
<!-- Talking head -->
Largely speaking there are 3 frameworks that I am aware of that are being used in the wild

<!-- Show their logos on screen -->
- [googletest](https://github.com/google/googletest)
- [Catch2](https://github.com/catchorg/Catch2)
- [Doctest](https://github.com/doctest/doctest)

All of these can be integrated into your CMake or bazel project. Also, they all follow relatively similar concepts, so once you learn one you'll easily use the other ones too.

<!-- B-roll scroll googletest website | voice ✅ -->
In this course, we're going to be using the [googletest](https://github.com/google/googletest) framework as this is the one I've seen most often in the industries I've been working in.

### How to get the googletest code
<!-- Talking head -->
There are multiple ways to include the googletest framework into your project.

<!-- B-roll highlight google statement | voice ✅ -->
Google recommends compiling their testing framework along with your project, so we won't install it as a dependency system-wide and will instead use the source code directly in our project

<!-- B-roll downloading manually | voice ✅ -->
For a start we'll just download it manually, unzip it and put it into the `external` subfolder of our project folder to be used by our build system. Let's put it to `my_project/external` folder.

<!-- Talking head -->
Even though we _do_ start with this manual way, but stick until the end of the video to find out why it's not what we want to do and what we should do instead.

### How to include googletest in our CMake project
<!-- B-roll write the cmake file | voice ✅ -->
Anyway, now that the code is in the project folder, we can use it in our CMake project by adding the necessary `add_subdirectory` command to the `CMakeLists.txt` file.
```cmd
mkdir my_project
cd my_project
code CMakeLists.txt
```
`CMakeLists.txt`
<!--
`CPP_SKIP_SNIPPET`
-->
```cmake
cmake_minimum_required(VERSION 3.16..3.24)
project(try_googletest VERSION 0.0.1
                       DESCRIPTION "Try googletest"
                       LANGUAGES CXX)
# Add subdirectory with external projects' code
add_subdirectory(external)
```
We then want to add a `CMakeLists.txt` to the `external` folder too:
```cmd
code external/CMakeLists.txt
```
`external/CMakeLists.txt`
<!--
`CPP_COPY_SNIPPET` my_project/external/CMakeLists.txt
-->
```cmake
# Setting this will only affect the folders down from the current one
set(CMAKE_CXX_STANDARD 17)
add_subdirectory(googletest)
```

<!-- B-roll build the code | voice ✅ -->
That's it! If we now build our project it will build the googletest code.

### How to use the googletest framework
<!-- Talking head -->
Building the code is a bit useless on its own. We want to use it!

<!-- **B-roll add code to cmake** -->
For that we have to add a couple of things to our CMake:
- We want to call `include(CTest)` in the main `CMakeLists.txt` file of the project to enable tests:

  `CMakeLists.txt`
  <!--
  `CPP_COPY_SNIPPET` my_project/CMakeLists.txt
  -->
  ```cmake
  cmake_minimum_required(VERSION 3.16..3.24)
  project(try_googletest VERSION 0.0.1
                      DESCRIPTION "Try googletest"
                      LANGUAGES CXX)
  # Enable testing for this project
  include(CTest)
  # Add subdirectories with code
  add_subdirectory(external)
  add_subdirectory(my_project)
  ```
- In the folder with your test files create test binaries and register them with CTest using the [gtest_discover_tests](https://cmake.org/cmake/help/latest/module/GoogleTest.html) command:

  `my_project/CMakeLists.txt`
  <!--
  `CPP_COPY_SNIPPET` my_project/my_project/CMakeLists.txt
  -->
  ```cmake
  # BUILD_TESTING variable is created by include(CTest)
  # It is set to ON by default
  if (BUILD_TESTING)
      add_executable(my_test my_test.cpp)
      target_link_libraries(my_test PRIVATE GTest::gtest_main)

      include(GoogleTest)
      # Finds all the Google tests associated with the executable
      gtest_discover_tests(my_test)
  endif()
  ```

That's all we need to integrate our tests with CMake.

### How to write your first test
<!-- Talking head -->
But wait! We don't have the actual test code there! Let's fix that right now!

<!-- B-roll live editor -->
We jump back into our editor, create a new file `my_project/my_test.cpp` and type away.

<!--
`CPP_COPY_SNIPPET` my_project/my_project/my_test.cpp
`CPP_RUN_CMD` CWD:my_project rm -rf external/googletest/ && git clone https://github.com/google/googletest.git external/googletest && cmake -S . -B build && cmake --build build
-->
```cpp
// Must include the gtest header to use the testing library
#include <gtest/gtest.h>

namespace {
  // We will test this dummy function but you can test
  // any function from any library that you write too.
  int GetMeaningOfLife() {  return 42; }
}

// All tests must live within TEST* blocks
// Inside of the TEST block is a standard C++ scope
// TestTopic defines a topic of our test, e.g. NameOfFunctionTest
// TrivialEquality represents the name of this particular test
// It should be descriptive and readable to the user
// TEST is a macro, i.e., preprocessor replaces it with some code
TEST(TestTopic, TrivialEquality) {
  // We can test for equality, inequality etc.
  // If the equality does not hold, the test fails.
  // EXPECT_* are macros, i.e., also replaced by the preprocessor.
  EXPECT_EQ(GetMeaningOfLife(), 42);
}

TEST(TestTopic, MoreEqualityTests) {
  // ASSERT_* is similar to EXPECT_* but stops the execution
  // of the test if fails.
  // EXPECT_* continues execution on failure too.
  ASSERT_EQ(GetMeaningOfLife(), 0) << "Oh no, a mistake!";
  EXPECT_FLOAT_EQ(23.23F, 23.23F);
}
```

### How to run a Google test?
<!-- Talking head -->
Now with these tests defined and our CMake configured to discover them, we can eventually actually run them!

<!-- B-roll building and executing -->
We now just need to build the project again and run `ctest`:
```cmd
cmake -S . -B build
cmake --build build -j 12
GTEST_COLOR=1 ctest --test-dir build --output-on-failure -j12
```

<!-- Talking head with error overlay -->
Unfortunately, one of our tests is failing!
It shows up in red and prints our custom error message too! Let's go back to the editor and fix it!

<!-- B-roll code -->
We can easily fix this error by changing the code in our test.
```diff
-ASSERT_EQ(GetMeaningOfLife(), 0) << "Oh no, a mistake!";
+ASSERT_EQ(GetMeaningOfLife(), 42) << "Oh no, a mistake!";
```
We now execute this again and see that all the tests have passed! Hooray! **(cheerful video)**

### Testing our own libraries
<!-- Talking head -->
For now we've only checked very trivial things in our tests. I mean, we've been testing a function that we wrote directly _in the test file_!
If we want to use other libraries here we can easily do that by adding those libraries as dependencies to the test CMake target and including the appropriate header files in the C++ test file.

If you don't know what I'm talking about then watch [this tutorial about libraries](headers_and_libraries.md) and then [this one about cmake](cmake.md).

## How to keep googletest in our project codebase correctly?

<!-- Talking head -->
Ok, remember how I told you to stick around?
<!-- show b/w part where I ask to stick around -->
Copying the code from GitHub like we did before into your project is not enough. Let me illustrate!

Imagine you're developing your project in a team (or, if you don't like people, imagine that you're developing your project on multiple machines). You've just copied the googletest code into your project and wrote some tests. You push your code changes into your git repository. You don't want to push the googletest code because it's not _your_ code, it is some _external_ code that you don't want to maintain.

Now, what will happen to your colleagues when they pull the changes and try to build?

<!-- B-roll failing to find the tests folder -->
This. CMake fails to find the googletest folder so now they would also need to manually download it into the external folder.

<!-- Talking head -->
And now you also need to sync on the version of the googletest library that all of you download. You can probably guess that this is not the way.
And you're right! There are multiple ways people deal with this:

<!-- show options on screen -->
- Installing googletest as a system dependency (deprecated, but still used)
- Using the CMake's [`FetchContent`](https://cmake.org/cmake/help/latest/module/FetchContent.html) to download the code on every build (you can read all about it in Googletest's [Quickstart](https://google.github.io/googletest/quickstart-cmake.html) section)
- Or adding Googletest as a submodule to your repository (this is my preference and I'll show you how to do it now) (adapted from [here](https://cliutils.gitlab.io/modern-cmake/chapters/projects/submodule.html))

<!-- B-roll terminal -->
We copy the link to the googletest library from GitHub and initialize a submodule with it:
```cmd
cd my_project
git submodule add https://github.com/google/googletest.git external/googletest
```

That's it, now the code linked to your repository as a submodule and anybody who clones it can run a command to update it:
```cmd
git submodule update --init --recursive
```
And get the latest changes from the submodule.

<!-- Talking head -->
The only issue with this is that people _will_ forget to do this, which will lead to people complaining and running different versions of the underlying libraries, so there is one final trick I want to show you to avoid this.

Remember how I told you that "CMake is just a scripting language"?

**We can bake the submodule update procedure into CMake directly!**

### Update the submodules automagically

<!-- B-roll editor -->
For that, create a new folder `cmake` in your project root and add the file `UpdateSubmodules.cmake` in it. Then copy the code linked in the description of this video into it. Here is what this code does roughly:
- check if `git` exists on the system
- check if we want to update the submodules
- list available submodules
- update them

`my_project/cmake/UpdateSubmodules.cmake`:
<!--
`CPP_SKIP_SNIPPET`
-->
```cmake
# Adapted from https://cliutils.gitlab.io/modern-cmake/chapters/projects/submodule.html
find_package(Git QUIET)
if(GIT_FOUND)
    option(UPDATE_SUBMODULES "Check submodules during build" ON)
    if(NOT UPDATE_SUBMODULES)
        return()
    endif()
    execute_process(COMMAND ${GIT_EXECUTABLE} submodule
                    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
                    OUTPUT_VARIABLE EXISTING_SUBMODULES
                    RESULT_VARIABLE RETURN_CODE)
    message(STATUS "Updating git submodules:\n${EXISTING_SUBMODULES}")
    execute_process(COMMAND ${GIT_EXECUTABLE} submodule update --init --recursive
                    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
                    RESULT_VARIABLE RETURN_CODE)
    if(NOT RETURN_CODE EQUAL "0")
        message(WARNING "Cannot update submodules. Git command failed with ${RETURN_CODE}.")
        return()
    endif()
    message(STATUS "Git submodules updated successfully.")
endif()
```

We can call this script by adding an additional line to our root `CMakeLists.txt` file:
<!--
`CPP_SKIP_SNIPPET`
-->
```cmake
cmake_minimum_required(VERSION 3.16..3.24)
project(try_googletest VERSION 0.0.1
                    DESCRIPTION "Try googletest"
                    LANGUAGES CXX)
# Update the submodules here
include(cmake/UpdateSubmodules.cmake)
# Enable testing for this project
include(CTest)
# Add subdirectories with code
add_subdirectory(external)
add_subdirectory(my_project)
```

<!-- B-roll terminal -->
Now if we run the cmake commands again, our submodules will be updated automagically.


## Conclusion

<!-- Talking head -->
Whoah, that was some amount of content. All in all, you now know that you should test your code and you know how to do that too using CMake and the googletest framework.

If you like this stuff you can subscribe to my channel and also go explore other videos on my channel! Bye!
