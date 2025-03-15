**Reusing projects with CMake**

- [Disclaimer](#disclaimer)
- [What does `find_package` do?](#what-does-find_package-do)
  - [Search modes](#search-modes)
    - [Module mode](#module-mode)
    - [Config mode](#config-mode)
  - [How do the `<pkg>Config.cmake` files look like?](#how-do-the-pkgconfigcmake-files-look-like)
  - [What are the `*_export.cmake` files?](#what-are-the-_exportcmake-files)
- [How to generate all of these files?](#how-to-generate-all-of-these-files)
- [Installing a package](#installing-a-package)
  - [1. Copying headers](#1-copying-headers)
  - [2. Copying all the binaries](#2-copying-all-the-binaries)
  - [3. Setting up CMake files in the `install` folder](#3-setting-up-cmake-files-in-the-install-folder)
  - [4. Create the config files](#4-create-the-config-files)
- [How to use the installed package](#how-to-use-the-installed-package)
- [Summary](#summary)


<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

<!-- TODO: don't forget to show the diagram

find_package -> configs -> export -> headers and binaries
 -->

We talked about [CMake](cmake.md) before, why we use it, what it is and how to create various libraries and binaries using it. That all was very useful for developing a single, potentially even large project. But what happens if we want to develop multiple interdependent projects or even simply make sure that some other CMake project can reuse the functionality from our own CMake project?

One way of doing this within the CMake infrastructure is the `find_package` machinery which allows us to find previously-installed CMake packages and use their libraries in a new project. As an example, we can create a new `dependent_project` that uses an already-installed `core_project`:

```cmake
cmake_minimum_required(VERSION 3.16..3.24)
project(dependent_project
    VERSION 0.0.1
    DESCRIPTION "Sample project that uses the core project"
    LANGUAGES CXX)

# Set CMAKE_BUILD_TYPE if user did not provide it.
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release CACHE INTERNAL "Build type")
endif()
message(STATUS "CMAKE_BUILD_TYPE: ${CMAKE_BUILD_TYPE}")

find_package(core_project REQUIRED)

add_executable(print_hello print_hello.cpp)
target_link_libraries(print_hello PRIVATE core_project::some_library)
```

Here, the `print_hello` executable uses the functionality from `some_library` which is part of the `core_project`. Oh and the `REQUIRED` option just makes sure CMake fails if it cannot find the project we ask it to find.

For completeness, the file `print_hello.cpp` looks as one would expect -- it includes the necessary header and calls a function `core_project::PrintHello`:

```cpp
#include "core_project/some_library.hpp"

int main() {
  core_project::PrintHello();
  return 0;
}
```

<!-- org: use travolta animation -->
Note how we do not create the `some_library` before linking it to our new executable `print_hello`. That's because the `some_library` target is created and installed in the `core_project` and we can use it after finding the `core_project` project with `find_package`.

So let's see how all of this works!

<!-- Intro -->

## Disclaimer

Before we go into this, I'd like to mention that there are many ways to structure a CMake project and even more ways to make these projects talk to each other. I aim to show the *concept* here and not to cover *all* the possible details. As a result, I show just one way that works for me to keep things short. I'm sure there are other ways equally good if not better to achieve very similar behavior. I am, of course, super interested to know what worked for you!

<!-- So please comment below this video and let's discuss it! -->

## What does `find_package` do?

I believe the best start for our deep dive into this topic is to first understand what the `find_package` does under the hood. And, just as in all the other topics we've already covered, there is of course **no black magic** here.
<!-- org: Show the no black magic animation from before -->

<!-- org: Show the code again -->

It is logical that in order to use the `core_project::some_library` target `find_package` must somehow provide us with it. This, in simple terms, means that this `find_package` command must somehow include all the code that creates the needed `some_library` target and sets the required compiler and linker flags for it so that these can be propagated further.

Finding the code that sets all the `core_project` targets is not too hard, provided we know where to look for it. So let us assume that `core_project` has been installed before and try to understand all of the steps that `find_package` takes to make sure we can use the `core_project`'s targets.

### Search modes

<!-- org: show wiki excerpt -->
If we read CMake docs, there are two modes in which [`find_package`](https://cmake.org/cmake/help/v3.16/command/find_package.html) operates: the **module mode** and **config mode**. And the defaults of what happens here are a bit confusing due to CMake being a 25-year-old program with a lot of legacy.

#### Module mode

By default when we call `find_package(core_project)` in our `CMakeLists.txt`, CMake first tries to use the **module mode** and looks for a file `Findcore_project.cmake` in the path stored under the `CMAKE_MODULE_PATH` CMake variable as well as among the default modules provided with the CMake installation. Once found, CMake `include`s that file, which, in CMake world, means that it executes all the code from that file.

If CMake is unable to find the required `Find*.cmake` file, or if we explicitly provide `CONFIG` or `NO_MODULE` as part of the `find_package` signature, it switches to the **config mode** instead.

<!-- org: show drake meme -->

> 🚨 The confusing part is that despite **module mode** being the default one, in modern CMake we want to use **config mode** most of the time.

#### Config mode

On the surface **config mode** works in a very similar manner to the **module mode**. For a call `find_package(core_project CONFIG)` or `find_package(core_project NO_MODULE)` CMake looks for a file `core_projectConfig.cmake` or for `core_project-config.cmake` using a [search procedure](https://cmake.org/cmake/help/v3.16/command/find_package.html#search-procedure) starting with the path specified in the `CMAKE_PREFIX_PATH` CMake variable.

However, the similarities end on this surface level. The [full command](https://cmake.org/cmake/help/v3.16/command/find_package.html#full-signature-and-config-mode) has many more settings, and, even more importantly, it is possible to generate the needed config files during the normal CMake package installation procedure mostly automatically. This was not the case in the module mode, where all the `Find*.cmake` files had to be written by hand. So the config mode setup is much more maintainable and versatile.

So in today's tutorial, I'm going to focus exclusively on the **config mode** as a more modern way, but please let me know if you'd like to hear about the module mode too, which might be useful to know when working with legacy code, and I'll try to make it happen.

### How do the `<pkg>Config.cmake` files look like?

Now that we know which files `find_package` looks for, we can take a peek inside these files. As we've mentioned before, because we call `find_package(core_project)`, we expect to find a file `core_projectConfig.cmake` in a subfolder of the `CMAKE_PREFIX_PATH` folder. In our case, we are able to find the needed file in the folder `${CMAKE_PREFIX_PATH}/share/cmake/core_projectConfig.cmake`. This file is not very large, but the most important part of it is that it includes another CMake file:

```cmake
include ( "${CMAKE_CURRENT_LIST_DIR}/some_library_export.cmake" )
```

Looking around the same folder, we are then also able to find the `some_library_export.cmake` file, which has a lot more auto-generated code in it. Today, we don't care about most of this code, but the relevant part is the creation of an `IMPORTED` library:

```cmake
# Create imported target core_project::some_library
add_library(core_project::some_library STATIC IMPORTED)
```

The keyword `IMPORTED` simply indicates that an existing binary file will be provided for this library at a later point. A bit later, we'll also talk about how this changes if our library has dependencies or is a different kind of library altogether, like a header-only one.

A bit lower within the same `some_library_export.cmake` file, there is another relevant part of code:

```cmake
# Load information for each installed configuration.
get_filename_component(_DIR "${CMAKE_CURRENT_LIST_FILE}" PATH)
file(GLOB CONFIG_FILES "${_DIR}/some_library_export-*.cmake")
foreach(f ${CONFIG_FILES})
  include(${f})
endforeach()
```

### What are the `*_export.cmake` files?

Here, CMake is instructed to look for additional CMake files to include and if we look around the folder that contains the `some_library_export.cmake` file we will find more files that look similar, for example `some_library_export-release.cmake`. This name depends on the configuration we used during build, having a `release` suffix in our case as we use `Release` configuration by default. If we look into this new file, we'll eventually find the code that sets all the relevant properties of our `IMPORTED` library target, including its language, its binary file location, and the location of its headers:

```cmake
# Import target "core_project::some_library" for configuration "Release"
set_property(TARGET core_project::some_library APPEND PROPERTY IMPORTED_CONFIGURATIONS RELEASE)
set_target_properties(core_project::some_library PROPERTIES
  IMPORTED_LINK_INTERFACE_LANGUAGES_RELEASE "CXX"
  IMPORTED_LOCATION_RELEASE "${_IMPORT_PREFIX}/lib/libsome_library.a"
  INTERFACE_INCLUDE_DIRECTORIES "${_IMPORT_PREFIX}/include/"
)
```

The rest of the code in these files is not as relevant to us as it mostly performs some checks so that CMake is sure that all the necessary files are actually present on the system. Feel free to read into it when you get the time.

So, you see, these files create the targets that we require and set their relevant properties. As a final piece of the puzzle, if we examine the `lib` and `include` folders in our `CMAKE_PREFIX_PATH`, we'll eventually find the files `libsome_library.a` as well as `core_project/some_library.hpp`.

## How to generate all of these files?

So far so good. We now understand how our own library is able to use the library from the `core_project` by loading all of those `*_export.cmake` files through the `find_package` call. Now is a great time to figure out how these export files are actually created as well as how the header files and all the binary files land into the install folder in the first place.

Clearly, `core_project` must contain the needed library `some_library` and we'll start with this library.

The library lives then in a file `core_project/core_project/some_library.hpp`:

```cpp
#pragma once

namespace core_project {

void PrintHello() noexcept;

} // namespace core_project
```

With the implementation of this library living in the corresponding source file:
`core_project/core_project/some_library.cpp`

```cpp
#include "core_project/some_library.hpp"

#include <iostream>

namespace core_project {

void PrintHello() noexcept {
    std::cout << "Hello, world!" << std::endl;
 }

} // namespace core_project
```

And the whole project is a pretty standard CMake project:

`core_project/CMakeLists.txt`:

```cmake
cmake_minimum_required(VERSION 3.16..3.24)
project(core_project
    VERSION 0.0.1
    DESCRIPTION "Project to illustrate installation"
    LANGUAGES CXX)

# Set CMAKE_BUILD_TYPE if user did not provide it.
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release CACHE STRING "" FORCE)
endif()
message(STATUS "CMAKE_BUILD_TYPE: ${CMAKE_BUILD_TYPE}")

add_subdirectory(core_project)
add_subdirectory(examples)
```

With most of the actual library setup being hidden away into its own `CMakeLists.txt` file, where we use a `LIBRARY_NAME` variable for convenience, add our library, set its C++ standard to C++17, indicate to it and its descendants where to look for the includes, and, finally, create an alias for this library that is prefixed by the `${PROJECT_NAME}`.

`core_project/core_project/CMakeLists.txt`:

```cmake
set(LIBRARY_NAME some_library)
add_library(${LIBRARY_NAME} ${LIBRARY_NAME}.cpp)
target_compile_features(${LIBRARY_NAME} PUBLIC cxx_std_17)
target_include_directories(${LIBRARY_NAME} PUBLIC
  $<BUILD_INTERFACE:${CMAKE_SOURCE_DIR}>
  $<INSTALL_INTERFACE:include/>
)
add_library(${PROJECT_NAME}::${LIBRARY_NAME} ALIAS ${LIBRARY_NAME})
```

And just to test that our library actually works, let's also add an `examples` folder that holds a single executable `print_hello`:

`core_project/examples/CMakeLists.txt`:

```cmake
add_executable(print_hello print_hello.cpp)
target_link_libraries(print_hello PRIVATE core_project::some_library)
```

For now we have done nothing new, we've already done very similar things before in the previous lectures on CMake. So we already know that we can easily configure and build our project with CMake as follows:

```bash
# Requires relatively modern CMake TODO: which version?
cmake -S . -B build
cmake --build build -j 12
```

Once it builds, we can run the example binaries without any issues:

```bash
./build/examples/print_hello
```

So far so good. But we are still unable to use this library from our `dependent_project` aren't we? Our `core_project` does not know how to install itself! So how do we make it all work?

## Installing a package

For this we must **install** the package. We can install our CMake package by building it first and then running `cmake --install` providing the folder where we want it to be installed:

```bash
# The package needs to be build as before
cmake -S . -B build
cmake --build build -j 12
# New command for installing the package
cmake --install build --prefix /tmp/test_install
```

This process of installing a package involved a couple of steps.
We must:

1. copy all the needed headers into some `include` folder
2. copy all of the binary libraries into a `lib` folder and all executables into a `bin` folder
3. create the appropriate `*_export.cmake` files that configure the imported libraries
4. copy these `*_export.cmake` files into folders where CMake expects to find them when we call the `find_package` command

So let's do all of these actions.

There is a built-in CMake command `install` that will help us in most of these steps.

### 1. Copying headers

Our first step is to copy the headers over. To this end, let's add the following code to the end of `core_project/core_project/CMakeLists.txt` file:

```cmake
install(
    DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
    DESTINATION include
    FILES_MATCHING PATTERN "*.hpp"
)
```

This finds all the `*.hpp` files in the current folder, i.e., `core_project/core_project` for this library, and copies them into the `include` folder, as the `DESTINATION` option specifies.

So if we add the above code, and install our package after building it

We're getting a file `/tmp/test_install/include/core_project/some_library.hpp` inside of our install folder `/tmp/test_install/include/`.

```cmd
λ › tree /tmp/test_install
/tmp/test_install
└── include
    └── core_project
        └── some_library.hpp
```

We only have one library for now but we would want to do this for any library we want to install.

### 2. Copying all the binaries

Now that the headers are all installed, we need to do the same for all the binary files. We do this by adding another `install` command to `core_project/core_project/CMakeLists.txt`:

```cmake
install(TARGETS ${LIBRARY_NAME})
```

As well as one more to `core_project/examples/CMakeLists.txt` for installing our example binaries:

```cmake
install(TARGETS print_hello)
```

This will automatically install all executables to a `bin` folder and all of the binary libraries to a `lib` folder.

After running the install command again, we'll see that we now also have all of the binaries installed:

```cmd
λ › tree /tmp/test_install
/tmp/test_install
├── bin
│   └── print_hello
├── include
│   └── core_project
│       └── some_library.hpp
└── lib
    └── libsome_library.a
```

This is all great, all of our binary and header files are where we want them to be. But we still need to somehow tell CMake where to find them!

### 3. Setting up CMake files in the `install` folder

As a final step, we need to create and install all those `*export` files we've talked about at the start of this tutorial.

For that, we need to change all those `install(TARGETS ...)` commands (one in our case) to add an `EXPORT` entry to them:

```cmake
install(
    TARGETS ${LIBRARY_NAME}
    EXPORT ${LIBRARY_NAME}_export  # <-- this one
)
```

But this is incomplete without actually copying this file to the install folder, which we add right after:

```cmake
install(
    TARGETS ${LIBRARY_NAME}
    EXPORT ${LIBRARY_NAME}_export
)

install(EXPORT ${LIBRARY_NAME}_export
    FILE ${LIBRARY_NAME}_export.cmake
    NAMESPACE ${PROJECT_NAME}::
    DESTINATION share/cmake/${PROJECT_NAME}
)
```

We need to unpack this a bit. The first command associates the installed target files with **an export**. The second installs the resulting export into a folder `share/cmake/${PROJECT_NAME}` within the install folder. Note also the `NAMESPACE` option that will add the required prefix to all targets that we export. Super handy to disambiguate our targets from any other ones. Also, this matches our own `ALIAS` that we created before.

```cmd
λ › tree /tmp/test_install
/tmp/test_install
├── bin
│   └── print_hello
├── include
│   └── core_project
│       └── some_library.hpp
└── lib
    ├── cmake
    │   └── core_project
    │       ├── some_library_export-release.cmake
    │       └── some_library_export.cmake
    └── libsome_library.a
```

### 4. Create the config files

Finally, with the export files in-place we are just left with creating the missing config files so that `find_package` could find all of the export files we've just created.

```cmake
include(CMakePackageConfigHelpers)

# Create a config file that CMake looks for when we call FindPackage(core_project)
configure_package_config_file(${CMAKE_CURRENT_SOURCE_DIR}/cmake/Config.cmake.in
 "${CMAKE_CURRENT_BINARY_DIR}/${PROJECT_NAME}Config.cmake"
 INSTALL_DESTINATION "share/cmake/${PROJECT_NAME}"
)

# Create a versioned config file that CMake uses to compare version of the package.
write_basic_package_version_file(
 ${PROJECT_NAME}ConfigVersion.cmake
 VERSION ${PACKAGE_VERSION}
 COMPATIBILITY AnyNewerVersion
)

# Copy these files into the install directory.
install(
 FILES
 ${CMAKE_CURRENT_BINARY_DIR}/${PROJECT_NAME}Config.cmake
 ${CMAKE_CURRENT_BINARY_DIR}/${PROJECT_NAME}ConfigVersion.cmake
 DESTINATION
 share/cmake/${PROJECT_NAME}
)
```

There is quite some stuff to unpack here. First of all, we need to include the `CMakePackageConfigHelpers` in order to allow using the `configure_package_config_file` and `write_basic_package_version_file` cmake macros.

Then, CMake requires us to create a template file that will *actually* include all of our targets:

`${CMAKE_CURRENT_SOURCE_DIR}/cmake/Config.cmake.in`

```cmake
@PACKAGE_INIT@

# Automatically include all exported library files
file(GLOB EXPORT_FILES "${CMAKE_CURRENT_LIST_DIR}/*_export.cmake")
foreach(EXPORT_FILE ${EXPORT_FILES})
    include(${EXPORT_FILE})
endforeach()

check_required_components(core_project)
```

The aim of this file is to `include` all of the `_export.cmake` files that we created. We can specify them by hand but we can also use a glob expression that matches *any* file that ends in `*_export.cmake`.

Passing this `cmake.in` file into `configure_package_config_file` we create `${CMAKE_CURRENT_BINARY_DIR}/${PROJECT_NAME}Config.cmake`. Note that, confusingly, this call **does not install the config file**! The `INSTALL_DESTINATION` that we provide to it must correspond to the place where it will be installed once we call the necessary `install` command as our last step. Confusing!

The next call to `write_basic_package_version_file` is needed if we want to specify a version of our package. We can select a version to match our project version as well as what the compatibility of this version is. I will not go into more details here to keep this tutorial from completely blowing up but I'm sure after this tutorial everyone should be able to look it up in the docs.

Finally, our last step is to copy the just-generated config files into the install folder, which we can do with yet another `install(FILES ...)` command.

And now we're done with installing!

It does seem like a lot of hassle, but we can mitigate this by providing custom CMake macros should we want to simplify this but I'll leave it for the future.

## How to use the installed package

## Summary

There was quite some content here but we've now covered everything one needs to know about installing packages and this, as far as I am concerned, summarizes what we should know about CMake.
