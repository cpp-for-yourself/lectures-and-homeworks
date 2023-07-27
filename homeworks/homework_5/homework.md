# Pixelating images in terminal

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/0.jpg" alt="Video" align="right" width=40%></a>
</p>

<!-- Intro -->

## Formal homework definition


### Prerequisites
Please make sure you've done the previous homework and that you're comfortable with all lectures since that homework until this one. The [Readme](../../readme.md) is a convenient way to check this.

### The expected project structure
The project has to be implemented in the `homework_5` folder in your homework repository (that you can [create from this template](https://github.com/cpp-for-yourself/homeworks)). Otherwise automatic checking won't work.

The project must follow the template described in the [CMake](../../lectures/cmake.md) and [GoogleTest](../../lectures/googletest.md) lectures.

Here is how the structure of the project folder will look like:
```bash
homework_5/
└── tui_pixelator/
    ├── CMakeLists.txt
    ├── external
    │   ├── CMakeLists.txt
    │   ├── stb/         # Stb library as a submodule
    │   ├── ftxui/       # Ftxui library as a submodule
    │   └── googletest/  # Googletest library as a submodule
    ├── examples
    │   ├── CMakeLists.txt
    │   ├── pixelate.cpp
    ├── tui_pixelator/
    │   ├── test_data/
    │   │   └── test.png    # Test data, see below
    │   ├── CMakeLists.txt  # Defines all libraries
    │   ├── pixelate.hpp
    │   ├── pixelate.cpp
    │   ├── pixelate_test.cpp
    │   └── # rest of your files
    ├── .clang-format
    └── readme.md  # Description of your project. Go nuts!
```

For your convenience, I am also providing an [empty carcass](tui_pixelator) of the project that you will have to fill in with the following:
- All the `CMakeLists.txt` files are empty, it is part of the task to write them
- There are no header and source files present, it is part of the task to add them
- The needed submodules are missing but the way to build them is present, see below for more details

### Submodules and the `external` folder
To add all the submodules, navigate to the `homework_5/tui_pixelator/` folder and execute the following:
```bash
git submodule add https://github.com/ArthurSonzogni/FTXUI.git external/ftxui
git submodule add https://github.com/google/googletest.git external/googletest
git submodule add https://github.com/nothings/stb.git external/stb
```
<!-- TODO: actually provide the folder and link it here -->
For your convenience, I am providing the rest of the `external` folder in the empty [project skeleton](tui_pixelator).

### Test data
We will require some test data to properly test parts of our code. This test data consists of a single image (that can be found here <!-- TODO -->) which _must_ live under the following path: `homework_5/tui_pixelator/test_data/test.png`

Note that it is already in the correct place in the provided [project skeleton](tui_pixelator).

### The libraries

#### Namespace
All functions in this project must live in the `pixelator` namespace.

#### CMake targets
There will be 4 libraries (more concretely, library CMake targets):
- `stb_image` - A library that encapsulates the work with the external STB image library and makes using the data loaded from disk nicer
- `drawer` - A library that implements a drawer - a class capable of drawing a pixelated image to the terminal
- `pixelated_image` - A library that encapsulates an image that is created by the `Pixelate` function
- `pixelate_image` - A library that provides the function `Pixelate` that pixelates a provided `StbImage`

These libraries must all be defined in the `tui_pixelator/CMakeLists.txt` so that the binaries in the `examples` folder and the tests could be linked to those.

#### Header files
They also should have header files so that they can be included with:
- `#include "tui_pixelator/stb_image.hpp"`
- `#include "tui_pixelator/drawer.hpp"`
- `#include "tui_pixelator/pixelated_image.hpp"`
- `#include "tui_pixelator/pixelate.hpp"`

> :bulb: Such small libraries are a bit excessive for the real world use, but we are learning how to write libraries here, so it'll do :wink:

#### Expected functionality


#### Tests for libraries
All of the libraries must have unit tests using the `googletest` framework available as a submodule in the project's `external` folder, just like it is presented in the [Googletest](../../lectures/googletest.md) lecture. All of the tests must live in the same folder as the file that contains the code that they test and must be registered through `ctest`.

For validating the right functionality, the homework checking system will inject an additional folder `validation_test` into your project and run the custom-designed tests on your code. This will show up as a separate line in the output from the homework checker in your PR and wiki.

#### Example binaries


## That's it!
Congratulations! You've implemented this relatively complex project in relatively modern C++! On to the next challenge! Do share your thoughts on the whole process in the [discussions page](https://github.com/orgs/cpp-for-yourself/discussions/categories/general) :pray:
