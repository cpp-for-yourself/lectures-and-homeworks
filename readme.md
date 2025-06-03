# Lectures and projects for the [C++ for yourself](https://youtube.com/playlist?list=PLwhKb0RIaIS1sJkejUmWj-0lk7v_xgCuT) course

<img alt="Icon" align="right" width=150 src="https://github.com/user-attachments/assets/2f72be25-d8b5-4bc8-ade5-c7167ac41324">

![Build status](https://img.shields.io/github/actions/workflow/status/cpp-for-yourself/supplementary-materials/action.yml?branch=main&label=Link%20and%20code%20validation&style=for-the-badge)
[![YouTube Channel Views](https://img.shields.io/youtube/channel/views/UCRm39hwBxsX-8yj2xs3OJjQ?style=for-the-badge&label=YouTube%20views)](https://www.youtube.com/code-for-yourself)
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
- 🤬 Don't like something? 🗣️ **Talk to me about it!** I am always eager to improve.

## :bulb: How to follow this course

The course is designed to be consumed from top to bottom, so start at the beginning and you will always have enough knowledge for the next video.

That being said, I aim to leave links in the videos so that one could watch them out of order without much hassle.

Enjoy! 😎

## 📕 C++ for yourself lectures

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
<summary><code>Project</code>: hello world program</summary>

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
<summary><code>Project</code>: fortune teller program</summary>

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
<summary><code>Project</code>: the guessing game</summary>

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
<summary>Installing projects and using <code>find_project</code> with CMake</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/OMx3cZj_hoo/maxresdefault.jpg)](https://youtu.be/OMx3cZj_hoo)

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

----------------------------------------------------------
</details>

<details>
<summary><code>Project</code>: string processing library</summary>

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
<summary><code>Project</code>: pixelate images in terminal</summary>

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
<summary>Templates: <b>why</b> would we want to use them?</summary>

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
<summary>Templates: <b>what</b> do they do under the hood?</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/NKvEbPVllRE/maxresdefault.jpg)](https://youtu.be/NKvEbPVllRE)

[Lecture script](lectures/templates_what.md)
- Compilation process recap
- Compiler uses templates to generate code
- Hands-on example
- Compiler is lazy

----------------------------------------------------------
</details>

<details>
<summary>How to write function templates</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/BZ626ZWPspc/maxresdefault.jpg)](https://youtu.be/BZ626ZWPspc)

[Lecture script](lectures/templates_how_functions.md)
- The basics of writing a function template
- Explicit template parameters
- Implicit template parameters
- Using both explicit and implicit template parameters at the same time
- Function overloading and templates
- Full function template specialization and why function overloading is better

----------------------------------------------------------
</details>

<details>
<summary>How to write class templates</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/IQ62tA51Vag/maxresdefault.jpg)](https://youtu.be/IQ62tA51Vag)

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

----------------------------------------------------------
</details>

</details>

<details>
<summary>Forwarding references</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/RW9KnqszYj4/maxresdefault.jpg)](https://youtu.be/RW9KnqszYj4)

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

----------------------------------------------------------
</details>

<details>
<summary>Header and source files for templated code</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/vjsr18XXMMQ/maxresdefault.jpg)](https://youtu.be/vjsr18XXMMQ)

- [Why linker fails](lectures/templates_and_headers.md#why-linker-fails)
  - [Compilation process for single `main.cpp` file](lectures/templates_and_headers.md#compilation-process-for-single-maincpp-file)
  - [Compilation process for multiple files](lectures/templates_and_headers.md#compilation-process-for-multiple-files)
- [How to fix the linker error](lectures/templates_and_headers.md#how-to-fix-the-linker-error)
- [More complex explicit instantiations](lectures/templates_and_headers.md#more-complex-explicit-instantiations)
- [Summary](lectures/templates_and_headers.md#summary)

----------------------------------------------------------
</details>

<details>
<summary>Almost everything about inheritance</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/oUALDqvCbWs/maxresdefault.jpg)](https://youtu.be/oUALDqvCbWs)

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


----------------------------------------------------------
</details>

<details>
<summary>Memory management and smart pointers</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/eHcdTytDZrI/maxresdefault.jpg)](https://youtu.be/eHcdTytDZrI)

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


----------------------------------------------------------
</details>

<details>
<summary>Lambdas in modern C++</summary>

----------------------------------------------------------
[![Video thumbnail](https://img.youtube.com/vi/l0BgadhkUL8/maxresdefault.jpg)](https://youtu.be/l0BgadhkUL8)

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

----------------------------------------------------------
</details>

## PS

### Most of the code snippets are validated automatically
If you **do** find an error in some of those, please open an issue in this repo!
