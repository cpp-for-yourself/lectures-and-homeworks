# Lectures and projects for the [C++ for yourself](https://youtube.com/playlist?list=PLwhKb0RIaIS1sJkejUmWj-0lk7v_xgCuT) course

<a href="https://youtube.com/playlist?list=PLwhKb0RIaIS1sJkejUmWj-0lk7v_xgCuT"><img alt="Icon" align="right" width=150 src="https://github.com/user-attachments/assets/2f72be25-d8b5-4bc8-ade5-c7167ac41324"></a>

![Build status](https://img.shields.io/github/actions/workflow/status/cpp-for-yourself/supplementary-materials/action.yml?branch=main&label=Link%20and%20code%20validation&style=for-the-badge)
![Visitors](https://api.visitorbadge.io/api/visitors?path=code-for-yourself%2Fcode-for-yourself&labelColor=%23697689&countColor=%23263759)

This repository is a collection of Markdown scripts used for all the videos in the [C++ for yourself](https://youtube.com/playlist?list=PLwhKb0RIaIS1sJkejUmWj-0lk7v_xgCuT) course.

These can be used to follow-along the video or as a standalone learning material.

## 🙏 Support this work

[![GitHub Sponsors](https://img.shields.io/github/sponsors/niosus?style=for-the-badge&logo=github&label=Sponsor%20on%20github)](https://github.com/sponsors/niosus)
[![Audible trial](https://img.shields.io/badge/Audible_free_trial-orange?style=for-the-badge&logo=audible&logoColor=white&logoSize=auto&link=https%3A%2F%2Fwww.audibletrial.com%2FCodeForYourself)](https://www.audibletrial.com/CodeForYourself)
[![Amazon affiliate links](https://img.shields.io/badge/amazon_affiliate_links-orange?style=for-the-badge&logo=amazon&logoColor=white&logoSize=auto&color=black)](https://github.com/cpp-for-yourself/sponsor/blob/main/amazon.md)



Please remember that there is a human behind all of this work. I write scripts, create animations, record and edit videos at night after a full-time work day. It is at times hard.
But _you_ can make it easier. Here is what you can do:

- 💶 Become a [**sponsor on GitHub**](https://github.com/sponsors/niosus)!
- 💸 Can't support monetarily?
  + 👍 **Like** the videos and **watch them to the end**!
  + 💬 **Leave comments** on YouTube!
  + 📢 **Spread the word** among your friends!
  + ⭐️ **Star the repo** to help others find it!
- 🤬 Don't like something? 🗣️ **Talk to me about it!** I am always eager to improve.

## :bulb: How to follow this course

The course is designed to be consumed from top to bottom, so start at the beginning and you will always have enough knowledge for the next video.

That being said, I aim to leave links in the videos so that one could watch them out of order without much hassle.

Enjoy! 😎

## 📕 C++ for yourself lectures

<table>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/t2h1geGSww4">
        <img src="https://img.youtube.com/vi/t2h1geGSww4/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Hello world program dissection</b></summary>
        <br>
        [Lecture script](lectures/hello_world_dissection.md)
        - First keywords
        - What brackets mean
        - What do different signs mean
        - Intro to "scopes"
        - Intro to functions
        - Intro to includes
      </details>
    </td>
    <td width="50%" valign="top">
      <details>
        <summary><b><code>Project</code>: hello world program</b></summary>
        <br>
        [Homework script](homeworks/homework_1/homework.md)
        - Write a simple program that prints `Hello World!`
        - Learn to compile and run simple programs
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/0z0gvv_Tb_U">
        <img src="https://img.youtube.com/vi/0z0gvv_Tb_U/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Variables of fundamental types</b></summary>
        <br>
        [Lecture script](lectures/cpp_basic_types_and_variables.md)
        - How to create variables of fundamental types
        - Naming variables
        - Using `const`, `constexpr` with variables
        - References to variables
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/cP2IDg4_BRk">
        <img src="https://img.youtube.com/vi/cP2IDg4_BRk/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Namespaces for variables</b></summary>
        <br>
        [Lecture script](lectures/namespaces_using.md)
        - Namespaces with variables
        - The word `using` with variables
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/hy3eOpZmxbY">
        <img src="https://img.youtube.com/vi/hy3eOpZmxbY/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Input/output streams</b></summary>
        <br>
        [Lecture script](lectures/more_useful_types.md)
        - `std::cout`, `std::cerr`, `std::cin`
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/dwkSVkGsvFk">
        <img src="https://img.youtube.com/vi/dwkSVkGsvFk/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Sequence and utility containers</b></summary>
        <br>
        [Lecture script](lectures/more_useful_types.md)
        - Sequence containers: `std::array`, `std::vector`, their usage and some caveats
        - Pair container: `std::pair`
        - Strings from STL: `std::string`
        - Conversion to/from strings: `to_string`, `stoi`, `stod`, `stof`, etc.
        - Aggregate initialization
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/TCu76SYmVCg">
        <img src="https://img.youtube.com/vi/TCu76SYmVCg/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Associative containers</b></summary>
        <br>
        [Lecture script](lectures/associative_containers.md)
        - `std::map` and `std::unordered_map`
        - Touch up on `std::set` and `std::unordered_set`
      </details>
    </td>
    <td width="50%" valign="top">
      <details>
        <summary><b><code>Project</code>: fortune teller program</b></summary>
        <br>
        [Homework script](homeworks/homework_2/homework.md)
        - Write a program that tells your C++ fortune
        - It reads and writes data from and to terminal
        - Stores and accesses these data in containers
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/jzgTxosgGIA">
        <img src="https://img.youtube.com/vi/jzgTxosgGIA/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Control structures</b></summary>
        <br>
        [Lecture script](lectures/control_structures.md)
        - `if`, `switch` and ternary operator
        - `for`, `while` and `do ... while`
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/IUoqMTGGo6k">
        <img src="https://img.youtube.com/vi/IUoqMTGGo6k/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Random number generation</b></summary>
        <br>
        [Lecture script](lectures/random_numbers.md)
        - What are random numbers
        - How to generate them in modern C++
        - Why not to use `rand()`
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/TYs_xwihCNc">
        <img src="https://img.youtube.com/vi/TYs_xwihCNc/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b><code>Project</code>: the guessing game</b></summary>
        <br>
        [Homework script](homeworks/homework_3/homework.md)
        - A program that generates a number
        - The user guesses this number
        - The program tells the user if they are above or below with their guess (or if they've won)
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/NTlcDv7W2-c">
        <img src="https://img.youtube.com/vi/NTlcDv7W2-c/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Compilation flags and debugging</b></summary>
        <br>
        [Lecture script](lectures/compilation_debugging.md)
        - Useful compilation flags
        - Debugging a program with:
          - Print statements
          - `lldb` debugger
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/RaSw0g2aPig">
        <img src="https://img.youtube.com/vi/RaSw0g2aPig/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Functions</b></summary>
        <br>
        [Lecture script](lectures/functions.md)
        - What is a function
        - Declaration and definition
        - Passing by reference
        - Overloading
        - Using default arguments
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/4kZyQ-TwH00">
        <img src="https://img.youtube.com/vi/4kZyQ-TwH00/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Enumerations</b></summary>
        <br>
        [Lecture script](lectures/enums.md)
        - What are `enums`
        - How to use them?
        - Why not to use old style `enums`
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/Lxo8ftglwXE">
        <img src="https://img.youtube.com/vi/Lxo8ftglwXE/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Libraries and header files</b></summary>
        <br>
        [Lecture script](lectures/headers_and_libraries.md)
        - Different types of libraries
          - Header-only
          - Static
          - Dynamic
        - What is linking
        - When to use the keyword `inline`
        - Some common best practices
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/kbk4DphsYPU">
        <img src="https://img.youtube.com/vi/kbk4DphsYPU/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Build systems introduction</b></summary>
        <br>
        [Lecture script](lectures/build_systems.md)
        - Intro to build systems
        - Build commands as a script
        - Build commands in a `Makefile`
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/UH6F6ypdYbw">
        <img src="https://img.youtube.com/vi/UH6F6ypdYbw/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>CMake introduction</b></summary>
        <br>
        [Lecture script](lectures/cmake.md)
        - Build process with CMake
        - CMake Variables
        - Targets and their properties
        - Example CMake project
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/pxJoVRfpRPE">
        <img src="https://img.youtube.com/vi/pxJoVRfpRPE/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Using GoogleTest framework for testing code</b></summary>
        <br>
        [Lecture script](lectures/googletest.md)
        - Explain what testing is for
        - Explain what testing is
        - Show how to download and setup googletest
        - Show how to write a simple test
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/OMx3cZj_hoo">
        <img src="https://img.youtube.com/vi/OMx3cZj_hoo/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Installing projects and using <code>find_project</code> with CMake</b></summary>
        <br>
        - [Disclaimer](lectures/cmake_install.md#disclaimer)
        - [What does `find_package` do?](lectures/cmake_install.md#what-does-find_package-do)
          - [Search modes](lectures/cmake_install.md#search-modes)
            - [Module mode](lectures/cmake_install.md#module-mode)
            - [Config mode](lectures/cmake_install.md#config-mode)
          - [How do the config files look like?](lectures/cmake_install.md#how-do-the-config-files-look-like)
          - [What are the export files?](lectures/cmake_install.md#what-are-the-export-files)
          - [Summary of reusing targets](lectures/cmake_install.md#summary-of-reusing-targets)
        - [How to make `core_project` available to `dependent_project`](lectures/cmake_install.md#how-to-make-core_project-available-to-dependent_project)
          - [Project skeleton for `core_project`](lectures/cmake_install.md#project-skeleton-for-core_project)
          - [Installing a package](lectures/cmake_install.md#installing-a-package)
            - [1. Copying headers](lectures/cmake_install.md#1-copying-headers)
            - [2. Copying binaries](lectures/cmake_install.md#2-copying-binaries)
            - [3. Creating export files](lectures/cmake_install.md#3-creating-export-files)
            - [4. Creating config files](lectures/cmake_install.md#4-creating-config-files)
        - [How to use the installed package](lectures/cmake_install.md#how-to-use-the-installed-package)
        - [Summary](lectures/cmake_install.md#summary)
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/f0x2qcFgu5o">
        <img src="https://img.youtube.com/vi/f0x2qcFgu5o/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b><code>Project</code>: string processing library</b></summary>
        <br>
        [Homework script](homeworks/homework_4/homework.md)
        - You will write library that allows to split and trim strings
        - You will learn how to:
          - Write a CMake project from scratch
          - Write your own libraries
          - Test them with googletest
          - Link them to binaries
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/IijP--Xf5kQ">
        <img src="https://img.youtube.com/vi/IijP--Xf5kQ/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Simple custom types with classes and structs</b></summary>
        <br>
        [Lecture script](lectures/classes_intro.md)
        - Explain why the classes are needed
        - Implement an example game about a car
        - Define classes and structs more formally
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/pptRG345jnU">
        <img src="https://img.youtube.com/vi/pptRG345jnU/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Raw pointers</b></summary>
        <br>
        [Lecture script](lectures/raw_pointers.md)
        - The pointer type
        - Pointers = variables of pointer types
        - How to get the data?
        - Initialization and assignment
        - Using const with pointers
        - Non-const pointer to const data
        - Constant pointer to non-const data
        - Constant pointer to constant data
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/TFoav6vhgdg">
        <img src="https://img.youtube.com/vi/TFoav6vhgdg/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Object lifecycle</b></summary>
        <br>
        [Lecture script](lectures/object_lifecycle.md)
        - Creating a new object
        - What happens when an object dies
        - Full class lifecycle explained
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/kqQ90R0_GFI">
        <img src="https://img.youtube.com/vi/kqQ90R0_GFI/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Move semantics</b></summary>
        <br>
        [Lecture script](lectures/move_semantics.md)
        - Why we care about move semantics
        - Let’s re-design move semantics from scratch
        - How is it actually designed and called in Modern C++?
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/una89pkP9ms">
        <img src="https://img.youtube.com/vi/una89pkP9ms/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Constructors, operators, destructor - rule of all or nothing</b></summary>
        <br>
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
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/9MB1nHDIM64">
        <img src="https://img.youtube.com/vi/9MB1nHDIM64/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Headers with classes</b></summary>
        <br>
        [Lecture script](lectures/headers_with_classes.md)
        - What stays the same
        - What is different
        - Example to show it all
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/WsBdxq319OY">
        <img src="https://img.youtube.com/vi/WsBdxq319OY/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Const correctness</b></summary>
        <br>
        [Lecture script](lectures/const_correctness.md)
        - What is const correctness
        - Some rules and examples to follow in order to work with `const` correctly
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/Cj3x51iJdvM">
        <img src="https://img.youtube.com/vi/Cj3x51iJdvM/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b><code>Project</code>: pixelate images in terminal</b></summary>
        <br>
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
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/7cpPQunjv4s">
        <img src="https://img.youtube.com/vi/7cpPQunjv4s/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Keyword <code>static</code> <b>outside</b> of classes</b></summary>
        <br>
        [Lecture script](lectures/static_outside_classes.md)
        - Why we should not use `static` outside of classes
        - Relation to storage duration
        - Relation to linkage
        - Why we should use `inline` instead
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/ggNCjDPShrA">
        <img src="https://img.youtube.com/vi/ggNCjDPShrA/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Keyword <code>static</code> <b>inside</b> classes</b></summary>
        <br>
        [Lecture script](lectures/static_in_classes.md)
        - Using `static` class methods
        - Using `static` class data
        - What is `static` in classes useful for?
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/1Mrt1NM3KnI">
        <img src="https://img.youtube.com/vi/1Mrt1NM3KnI/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Templates: <b>why</b> would we want to use them?</b></summary>
        <br>
        [Lecture script](lectures/templates_why.md)
        - Templates provide abstraction and separation of concerns
        - Function templates
        - Class and struct templates
        - Generic algorithms and design patterns
        - Zero runtime cost (almost)
        - Compile-time meta-programming
        - Summary
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/NKvEbPVllRE">
        <img src="https://img.youtube.com/vi/NKvEbPVllRE/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Templates: <b>what</b> do they do under the hood?</b></summary>
        <br>
        [Lecture script](lectures/templates_what.md)
        - Compilation process recap
        - Compiler uses templates to generate code
        - Hands-on example
        - Compiler is lazy
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/BZ626ZWPspc">
        <img src="https://img.youtube.com/vi/BZ626ZWPspc/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>How to write function templates</b></summary>
        <br>
        [Lecture script](lectures/templates_how_functions.md)
        - The basics of writing a function template
        - Explicit template parameters
        - Implicit template parameters
        - Using both explicit and implicit template parameters at the same time
        - Function overloading and templates
        - Full function template specialization and why function overloading is better
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/IQ62tA51Vag">
        <img src="https://img.youtube.com/vi/IQ62tA51Vag/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>How to write class templates</b></summary>
        <br>
        - [How to use templates with classes in C++](lectures/templates_how_classes.md#how-to-use-templates-with-classes-in-c)
        - [Class method templates](lectures/templates_how_classes.md#class-method-templates)
          - [Prefer overloading to specialization of class method templates](lectures/templates_how_classes.md#prefer-overloading-to-specialization-of-class-method-templates)
          - [Sometimes overloading is not possible --- specialize in this case](lectures/templates_how_classes.md#sometimes-overloading-is-not-possible-----specialize-in-this-case)
        - [Class templates](lectures/templates_how_classes.md#class-templates)
        - [Class template argument deduction (min. C++17)](lectures/templates_how_classes.md#class-template-argument-deduction-min-c17)
          - [Class template specialization: implicit and explicit](lectures/templates_how_classes.md#class-template-specialization-implicit-and-explicit)
          - [Full explicit template specialization](lectures/templates_how_classes.md#full-explicit-template-specialization)
            - [How to fully specialize class templates](lectures/templates_how_classes.md#how-to-fully-specialize-class-templates)
            - [Make sure a specialization follows the expected interface](lectures/templates_how_classes.md#make-sure-a-specialization-follows-the-expected-interface)
            - [Historical reference for `std::vector<bool>`](lectures/templates_how_classes.md#historical-reference-for-stdvectorbool)
            - [Specialize just one method of a class](lectures/templates_how_classes.md#specialize-just-one-method-of-a-class)
            - [Specialize method templates of class templates](lectures/templates_how_classes.md#specialize-method-templates-of-class-templates)
            - [Type traits and how to implement them using template specialization](lectures/templates_how_classes.md#type-traits-and-how-to-implement-them-using-template-specialization)
            - [More generic traits using partial specialization](lectures/templates_how_classes.md#more-generic-traits-using-partial-specialization)
          - [Difference between partial and full specializations](lectures/templates_how_classes.md#difference-between-partial-and-full-specializations)
            - [How to tell partial template specialization apart from a new template class definition?](lectures/templates_how_classes.md#how-to-tell-partial-template-specialization-apart-from-a-new-template-class-definition)
            - [How to tell a partial template specialization apart from a full class template specialization?](lectures/templates_how_classes.md#how-to-tell-a-partial-template-specialization-apart-from-a-full-class-template-specialization)
          - [Partial template specialization with more types](lectures/templates_how_classes.md#partial-template-specialization-with-more-types)
        - [Summary](lectures/templates_how_classes.md#summary)
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/RW9KnqszYj4">
        <img src="https://img.youtube.com/vi/RW9KnqszYj4/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Forwarding references</b></summary>
        <br>
        - [The forwarding reference](lectures/forwarding_references.md#the-forwarding-reference)
        - [Why use forwarding references](lectures/forwarding_references.md#why-use-forwarding-references)
          - [Example setup](lectures/forwarding_references.md#example-setup)
          - [How forwarding references simplify things](lectures/forwarding_references.md#how-forwarding-references-simplify-things)
          - [When to prefer forwarding references](lectures/forwarding_references.md#when-to-prefer-forwarding-references)
        - [How forwarding references work](lectures/forwarding_references.md#how-forwarding-references-work)
          - [Reference collapsing](lectures/forwarding_references.md#reference-collapsing)
          - [Remove reference using `std::remove_reference_t`](lectures/forwarding_references.md#remove-reference-using-stdremove_reference_t)
          - [How `std::forward` works](lectures/forwarding_references.md#how-stdforward-works)
            - [Passing an lvalue](lectures/forwarding_references.md#passing-an-lvalue)
            - [Passing by rvalue](lectures/forwarding_references.md#passing-by-rvalue)
        - [Summary](lectures/forwarding_references.md#summary)
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/vjsr18XXMMQ">
        <img src="https://img.youtube.com/vi/vjsr18XXMMQ/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Header and source files for templated code</b></summary>
        <br>
        - [Why linker fails](lectures/templates_and_headers.md#why-linker-fails)
          - [Compilation process for single `main.cpp` file](lectures/templates_and_headers.md#compilation-process-for-single-maincpp-file)
          - [Compilation process for multiple files](lectures/templates_and_headers.md#compilation-process-for-multiple-files)
        - [How to fix the linker error](lectures/templates_and_headers.md#how-to-fix-the-linker-error)
        - [More complex explicit instantiations](lectures/templates_and_headers.md#more-complex-explicit-instantiations)
        - [Summary](lectures/templates_and_headers.md#summary)
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/oUALDqvCbWs">
        <img src="https://img.youtube.com/vi/oUALDqvCbWs/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Almost everything about inheritance</b></summary>
        <br>
        - [Inheritance enables dependency inversion](lectures/inheritance.md#inheritance-enables-dependency-inversion)
        - [The idea behind dependency inversion](lectures/inheritance.md#the-idea-behind-dependency-inversion)
        - [Similarity to static polymorphism with templates](lectures/inheritance.md#similarity-to-static-polymorphism-with-templates)
        - [How inheritance looks in C++](lectures/inheritance.md#how-inheritance-looks-in-c)
          - [Implementation inheritance](lectures/inheritance.md#implementation-inheritance)
            - [Access control with inheritance](lectures/inheritance.md#access-control-with-inheritance)
            - [Implicit upcasting](lectures/inheritance.md#implicit-upcasting)
            - [Real-world example of implementation inheritance](lectures/inheritance.md#real-world-example-of-implementation-inheritance)
          - [Using `virtual` for interface inheritance and proper polymorphism](lectures/inheritance.md#using-virtual-for-interface-inheritance-and-proper-polymorphism)
          - [How interface inheritance works](lectures/inheritance.md#how-interface-inheritance-works)
          - [Runtime and memory overhead of using virtual](lectures/inheritance.md#runtime-and-memory-overhead-of-using-virtual)
          - [Things to know about classes with `virtual` methods](lectures/inheritance.md#things-to-know-about-classes-with-virtual-methods)
            - [A `virtual` destructor](lectures/inheritance.md#a-virtual-destructor)
            - [Delete other special methods for polymorphic classes](lectures/inheritance.md#delete-other-special-methods-for-polymorphic-classes)
          - [Downcasting using the `dynamic_cast`](lectures/inheritance.md#downcasting-using-the-dynamic_cast)
          - [Don't mix implementation and interface inheritance](lectures/inheritance.md#dont-mix-implementation-and-interface-inheritance)
          - [Implement pure interfaces](lectures/inheritance.md#implement-pure-interfaces)
          - [Keyword `final`](lectures/inheritance.md#keyword-final)
        - [Simple polymorphic class example following best practices](lectures/inheritance.md#simple-polymorphic-class-example-following-best-practices)
        - [Multiple inheritance](lectures/inheritance.md#multiple-inheritance)
        - [Detailed `Image` example following best practices](lectures/inheritance.md#detailed-image-example-following-best-practices)
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/eHcdTytDZrI">
        <img src="https://img.youtube.com/vi/eHcdTytDZrI/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Memory management and smart pointers</b></summary>
        <br>
        - [Memory management and smart pointers](lectures/memory_and_smart_pointers.md#memory-management-and-smart-pointers)
        - [Memory management in C++](lectures/memory_and_smart_pointers.md#memory-management-in-c)
          - [Automatic memory management in other programming languages](lectures/memory_and_smart_pointers.md#automatic-memory-management-in-other-programming-languages)
          - [The C++ way](lectures/memory_and_smart_pointers.md#the-c-way)
        - [Memory allocation under the hood](lectures/memory_and_smart_pointers.md#memory-allocation-under-the-hood)
          - [The stack](lectures/memory_and_smart_pointers.md#the-stack)
          - [Why not keep persistent data on the stack](lectures/memory_and_smart_pointers.md#why-not-keep-persistent-data-on-the-stack)
          - [The heap](lectures/memory_and_smart_pointers.md#the-heap)
            - [Operators `new` and `delete`](lectures/memory_and_smart_pointers.md#operators-new-and-delete)
        - [Typical pitfalls with data allocated on the heap](lectures/memory_and_smart_pointers.md#typical-pitfalls-with-data-allocated-on-the-heap)
            - [Forgetting to call `delete`](lectures/memory_and_smart_pointers.md#forgetting-to-call-delete)
            - [Performing shallow copy by mistake](lectures/memory_and_smart_pointers.md#performing-shallow-copy-by-mistake)
          - [Performing shallow assignment by mistake](lectures/memory_and_smart_pointers.md#performing-shallow-assignment-by-mistake)
          - [Calling a wrong `delete`](lectures/memory_and_smart_pointers.md#calling-a-wrong-delete)
          - [Returning owning pointers from functions](lectures/memory_and_smart_pointers.md#returning-owning-pointers-from-functions)
        - [RAII for memory safety](lectures/memory_and_smart_pointers.md#raii-for-memory-safety)
          - [STL classes use RAII](lectures/memory_and_smart_pointers.md#stl-classes-use-raii)
          - [Smart pointers to the rescue!](lectures/memory_and_smart_pointers.md#smart-pointers-to-the-rescue)
            - [`std::unique_ptr`](lectures/memory_and_smart_pointers.md#stdunique_ptr)
            - [`std::shared_ptr`](lectures/memory_and_smart_pointers.md#stdshared_ptr)
              - [Prefer `std::unique_ptr`](lectures/memory_and_smart_pointers.md#prefer-stdunique_ptr)
          - [Smart pointers are polymorphic](lectures/memory_and_smart_pointers.md#smart-pointers-are-polymorphic)
        - [Summary](lectures/memory_and_smart_pointers.md#summary)
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/l0BgadhkUL8">
        <img src="https://img.youtube.com/vi/l0BgadhkUL8/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Lambdas in modern C++</b></summary>
        <br>
        - [Lambdas](lectures/lambdas.md#lambdas)
        - [Overview](lectures/lambdas.md#overview)
        - [What is a "callable"](lectures/lambdas.md#what-is-a-callable)
        - [A function pointer is sometimes enough](lectures/lambdas.md#a-function-pointer-is-sometimes-enough)
        - [Before lambdas we had function objects (or functors)](lectures/lambdas.md#before-lambdas-we-had-function-objects-or-functors)
        - [How to implement generic algorithms like `std::sort`](lectures/lambdas.md#how-to-implement-generic-algorithms-like-stdsort)
        - [Enter lambdas](lectures/lambdas.md#enter-lambdas)
        - [Lambda syntax](lectures/lambdas.md#lambda-syntax)
        - [When to use lambdas](lectures/lambdas.md#when-to-use-lambdas)
        - [Summary](lectures/lambdas.md#summary)
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/6DqX8OJKM1g">
        <img src="https://img.youtube.com/vi/6DqX8OJKM1g/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Error handling in C++</b></summary>
        <br>
        - [Disclaimer](#disclaimer)
        - [What Do We Mean by “Error”?](lectures/error_handling.md#what-do-we-mean-by-error)
        - [Setting up the example: **a comparison game**](lectures/error_handling.md#setting-up-the-example-a-comparison-game)
          - [Rules of the game](lectures/error_handling.md#rules-of-the-game)
          - [Initial code of the game](lectures/error_handling.md#initial-code-of-the-game)
        - [Unrecoverable errors: **fail early**](lectures/error_handling.md#unrecoverable-errors-fail-early)
          - [Our first unrecoverable error encounter](lectures/error_handling.md#our-first-unrecoverable-error-encounter)
          - [How to deal with unrecoverable errors](lectures/error_handling.md#how-to-deal-with-unrecoverable-errors)
            - [Catch them as early as possible](lectures/error_handling.md#catch-them-as-early-as-possible)
            - [Use `CHECK` macro to fail early](lectures/error_handling.md#use-check-macro-to-fail-early)
            - [Don't use `assert`](lectures/error_handling.md#dont-use-assert)
            - [Complete the `Game` class yourself](lectures/error_handling.md#complete-the-game-class-yourself)
          - [How to minimize number of unrecoverable errors](lectures/error_handling.md#how-to-minimize-number-of-unrecoverable-errors)
        - [Recoverable errors: **handle and proceed**](lectures/error_handling.md#recoverable-errors-handle-and-proceed)
          - [Exceptions](lectures/error_handling.md#exceptions)
            - [How to use exceptions](lectures/error_handling.md#how-to-use-exceptions)
            - [A case for exceptions for both "recoverable" and "unrecoverable" errors](lectures/error_handling.md#a-case-for-exceptions-for-both-recoverable-and-unrecoverable-errors)
            - [Why we might not want to use exceptions](lectures/error_handling.md#why-we-might-not-want-to-use-exceptions)
              - [Exceptions are (sometimes) expensive](lectures/error_handling.md#exceptions-are-sometimes-expensive)
              - [Exceptions hide the error path](lectures/error_handling.md#exceptions-hide-the-error-path)
              - [Exceptions are banned in many code bases](lectures/error_handling.md#exceptions-are-banned-in-many-code-bases)
          - [Returning errors explicitly can work better if done well](lectures/error_handling.md#returning-errors-explicitly-can-work-better-if-done-well)
            - [Returning a value indicating error does not always work 😱](lectures/error_handling.md#returning-a-value-indicating-error-does-not-always-work-)
            - [Returning an error code breaks "pure functions" 😱](lectures/error_handling.md#returning-an-error-code-breaks-pure-functions-)
            - [Using `std::optional`: **a better way**](lectures/error_handling.md#using-stdoptional-a-better-way)
            - [Using `std::expected`: **add context**](lectures/error_handling.md#using-stdexpected-add-context)
          - [Performance Considerations for `std::optional` and `std::expected`](lectures/error_handling.md#performance-considerations-for-stdoptional-and-stdexpected)
            - [Error type size matters](lectures/error_handling.md#error-type-size-matters)
            - [Return value optimization with `std::optional` and `std::expected`](lectures/error_handling.md#return-value-optimization-with-stdoptional-and-stdexpected)
          - [Summary](lectures/error_handling.md#summary)
          - [Other use of `std::optional`](lectures/error_handling.md#other-use-of-stdoptional)
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/mNeu4S0x3gA">
        <img src="https://img.youtube.com/vi/mNeu4S0x3gA/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Dynamic polymorphism with <code>std::variant</code></b></summary>
        <br>
        - [`std::variant` in Modern C++](lectures/variant.md#stdvariant-in-modern-c)
        - [Templates (and concepts) allow static polymorphism](lectures/variant.md#templates-and-concepts-allow-static-polymorphism)
        - [Until now dynamic polymorphism required reference semantics](lectures/variant.md#until-now-dynamic-polymorphism-required-reference-semantics)
        - [Use `std::variant` for dynamic polymorphism with value semantics](lectures/variant.md#use-stdvariant-for-dynamic-polymorphism-with-value-semantics)
          - [Basics of `std::variant`](lectures/variant.md#basics-of-stdvariant)
          - [Memory used by `std::variant`](lectures/variant.md#memory-used-by-stdvariant)
          - [Use `std::monostate` to allow for "empty" variants](lectures/variant.md#use-stdmonostate-to-allow-for-empty-variants)
          - [Storing values in a `std::variant`](lectures/variant.md#storing-values-in-a-stdvariant)
          - [Using `std::variant` with `std::visit`](lectures/variant.md#using-stdvariant-with-stdvisit)
          - [How `std::visit` selects the correct function](lectures/variant.md#how-stdvisit-selects-the-correct-function)
          - [Visitor must cover all variant types](lectures/variant.md#visitor-must-cover-all-variant-types)
        - [Back to the original example](lectures/variant.md#back-to-the-original-example)
        - [**Summary**](lectures/variant.md#summary)
      </details>
    </td>
    <td width="50%" valign="top">
      <a href="https://youtu.be/_qteFBrAKSM">
        <img src="https://img.youtube.com/vi/_qteFBrAKSM/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Storing callables with <code>std::function</code></b></summary>
        <br>
        - [`std::function`](lectures/std_function.md#stdfunction)
        - [Overview](lectures/std_function.md#overview)
        - [The problem: storing callables](lectures/std_function.md#the-problem-storing-callables)
        - [Enter `std::function`](lectures/std_function.md#enter-stdfunction)
        - [Performance considerations](lectures/std_function.md#performance-considerations)
        - [Type erasure (how it works under the hood)](lectures/std_function.md#type-erasure-how-it-works-under-the-hood)
        - [Summary](lectures/std_function.md#summary)
      </details>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <a href="https://youtu.be/-VWCEklRP6I">
        <img src="https://img.youtube.com/vi/-VWCEklRP6I/maxresdefault.jpg" alt="Video thumbnail" width="100%">
      </a>
      <details>
        <summary><b>Parallelism in modern C++</b></summary>
        <br>
        - [Parallelism in modern C++](lectures/parallelism.md#parallelism-in-modern-c)
        - [Disclaimer](lectures/parallelism.md#disclaimer)
        - [What is parallelism anyway?](lectures/parallelism.md#what-is-parallelism-anyway)
          - [No parallelism is always safer and often faster](lectures/parallelism.md#no-parallelism-is-always-safer-and-often-faster)
          - [High-level Task-Based Parallelism](lectures/parallelism.md#high-level-task-based-parallelism)
          - [Execution Strategies (`std::launch`)](lectures/parallelism.md#execution-strategies-stdlaunch)
          - [Parallel Algorithms](lectures/parallelism.md#parallel-algorithms)
          - [Execution Policies (`std::execution`)](lectures/parallelism.md#execution-policies-stdexecution)
          - [Raw TBB Parallelism](lectures/parallelism.md#raw-tbb-parallelism)
          - [Worker threads and thread pools](lectures/parallelism.md#worker-threads-and-thread-pools)
            - [Step 1: How to create a thread](lectures/parallelism.md#step-1-how-to-create-a-thread)
            - [Stopping threads cooperatively with `std::stop_token`](lectures/parallelism.md#stopping-threads-cooperatively-with-stdstop_token)
            - [Step 2: Adding another thread and a Mutex](lectures/parallelism.md#step-2-adding-another-thread-and-a-mutex)
            - [Step 3: Sleeping with Condition Variables](lectures/parallelism.md#step-3-sleeping-with-condition-variables)
              - [Optimizing by Swapping the Queue](lectures/parallelism.md#optimizing-by-swapping-the-queue)
            - [Step 4: Putting it all together into a Generic Thread Pool](lectures/parallelism.md#step-4-putting-it-all-together-into-a-generic-thread-pool)
          - [What if I don't have C++20?](lectures/parallelism.md#what-if-i-dont-have-c20)
          - [Deadlocks](lectures/parallelism.md#deadlocks)
        - [Summary](lectures/parallelism.md#summary)
      </details>
    </td>
    <td width="50%" valign="top"></td>
  </tr>
</table>

## PS

### Most of the code snippets are validated automatically
If you **do** find an error in some of those, please open an issue in this repo!

<a href="https://www.star-history.com/?repos=cpp-for-yourself%2Flectures-and-homeworks&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=cpp-for-yourself/lectures-and-homeworks&type=date&theme=dark&legend=top-left&sealed_token=xBT52D3Hsky-FoRjdi9pVo1yiucyrNEzhr3M3a0JeyRuuWF85M-it82Q3wNWvS42ZiHXGzicpB5JmmN-vW5THzBIIGVhM-l3oQ-7j_DHqjzOuJNpqaPoUMItMGeoH-saWndwWJ4FL7_cD5QcgCfmjnsOMkTb4Cgp6EFTq54NMIjSJOihxKF4nJtWSFGr" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=cpp-for-yourself/lectures-and-homeworks&type=date&legend=top-left&sealed_token=xBT52D3Hsky-FoRjdi9pVo1yiucyrNEzhr3M3a0JeyRuuWF85M-it82Q3wNWvS42ZiHXGzicpB5JmmN-vW5THzBIIGVhM-l3oQ-7j_DHqjzOuJNpqaPoUMItMGeoH-saWndwWJ4FL7_cD5QcgCfmjnsOMkTb4Cgp6EFTq54NMIjSJOihxKF4nJtWSFGr" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=cpp-for-yourself/lectures-and-homeworks&type=date&legend=top-left&sealed_token=xBT52D3Hsky-FoRjdi9pVo1yiucyrNEzhr3M3a0JeyRuuWF85M-it82Q3wNWvS42ZiHXGzicpB5JmmN-vW5THzBIIGVhM-l3oQ-7j_DHqjzOuJNpqaPoUMItMGeoH-saWndwWJ4FL7_cD5QcgCfmjnsOMkTb4Cgp6EFTq54NMIjSJOihxKF4nJtWSFGr" />
 </picture>
</a>
