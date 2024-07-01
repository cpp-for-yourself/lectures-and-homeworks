**Templates in header and source files**

----

<p align="center">
  <a href="https://youtu.be/vjsr18XXMMQ"><img src="https://img.youtube.com/vi/vjsr18XXMMQ/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

- [Why linker fails](#why-linker-fails)
  - [Compilation process for single `main.cpp` file](#compilation-process-for-single-maincpp-file)
  - [Compilation process for multiple files](#compilation-process-for-multiple-files)
- [How to fix the linker error](#how-to-fix-the-linker-error)
- [More complex explicit instantiations](#more-complex-explicit-instantiations)
- [Summary](#summary)


In the previous videos, we talked quite extensively about templates and we should already know what they are, what they do under the hood and how to use templates in our code.

So, writing some simple templated code like this should come natural to us:
```cpp
// Function template.
template <typename T>
void Foo() {
  // Do something.
}

int main() {
  Foo<int>();
  Foo<float>();
  return 0;
}
```

With all of this knowledge, we might want to write some slightly more complicated software. Which means that we will eventually want to compile our code into *libraries* and *link* these libraries to executable files.

So we might try to split our files into header and source files just like we used to do with non-template code.

<table>
<tr>
<td>

`foo.hpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` template_library_simple/foo.hpp
-->
```cpp
#pragma once

// Function template declaration.
template <typename T>
void Foo();
```

`foo.cpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
template void Foo<int>();
template void Foo<float>();
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` template_library_simple/foo.cpp
`CPP_RUN_CMD` CWD:template_library_simple c++ -std=c++17 -c foo.cpp -o foo.o
-->
```cpp
#include "foo.hpp"

// Function template definition.
template <typename T>
void Foo() {
  // Do something.
}
```
</td>

<td>

`main.cpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` template_library_simple/main.cpp
`CPP_RUN_CMD` CWD:template_library_simple c++ -std=c++17 main.cpp foo.o -o main
-->
```cpp
#include "foo.hpp"

int main() {
  Foo<int>();
  Foo<float>();
  return 0;
}
```
For simplicity of this example, we compile both our `foo.cpp` and `main.cpp` into binary object files `foo.o` and `main.o` and provide these to our compiler (which passes it internally to the linker) when building our executable:
<!--
`CPP_SKIP_SNIPPET`
-->
```bash
# Create object file foo.o.
c++ -std=c++17 -c foo.cpp -o foo.o
# Create object file main.o.
c++ -std=c++17 -c main.cpp -o main.o
# Link object files to produce an executable
c++ -std=c++17 main.o foo.o -o main
```

</td>
</tr>
</table>


It all looks quite logical, but there is a problem: when we run it we get our linker complaining about undefined symbols that we reference in our `main` function:
```css
Undefined symbols for architecture arm64:
  "void Foo<float>()", referenced from:
      _main in main-cebf24.o
  "void Foo<int>()", referenced from:
      _main in main-cebf24.o
ld: symbol(s) not found for architecture arm64
clang: error: linker command failed with exit code 1 (use -v to see invocation)
```

The same would have happened if we would have packed our object file into a library and linked this library explicitly to our executable. See the lecture about [libraries](headers_and_libraries.md) if you find this confusing.

Anyway, today, we dive into why this linker error happens and what we can do about it. Because there **is** a way to compile templated code into libraries after all :wink:

<!-- Intro -->

## Why linker fails
Before we start, we should make sure we understand the compilation process, especially when templates are involved, well enough as this is crucial to understand why the linker fails. We talk about this extensively in the lecture about [what templates do under the hood](templates_what.md) and I urge you to look at that lecture before we continue here. It will make this lecture much easier to digest.

### Compilation process for single `main.cpp` file
That being said, we will now go through the whole compilation process, starting with the simple case of compiling a single `main.cpp` file that contains all of our code and progressively making our example more complicated.

Any compilation process consists really of 3 stages:
1. Preprocessor creates translation units, `main.s` in our case
2. Compiler compiles the code into binary object files, `main.o` in our case
3. Linker links various symbols, potentially across multiple binaries to produce the `main` executable file

<p align="center">
<img src="images/CompilationProcessEverything.png" alt="Video" style="width:100%;max-width:800;">
</p>

At this point, it is important to look a bit closer at what the **compiler** does here. When it sees the templates, it looks at which type we instantiate these templates with in our code and, well, creates implicit instantiations of these templates with the needed types. In our case, we use the function template `Foo` with the types `int` and `float`. These are then compiled directly into the object file alongside all the rest of the code as can be seen if we look at the **Symbol Table** of the resulting object file, which can be done by using either the `objdump` command.

These are the symbols we need in order to correctly compile our executable!

<p align="center">
<img src="images/CompilerIndepth.png" alt="Video" style="width:100%;max-width:800;">
</p>


### Compilation process for multiple files
Armed with this knowledge, we can look at what happens if we naively try to separate our template implementation into `foo.hpp` and `foo.cpp` files, away from the `main.cpp` file that now holds only the `main` function.

We start by compiling the `foo.cpp` file, which contains the definitions of our `Foo` function and includes the file `foo.hpp`, which contains the declaration of the function template `Foo`.

<p align="center">
<img src="images/CompilerFooNotKnowing.png" alt="Video" style="width:100%;max-width:800;">
</p>

As we already know, the preprocessor creates a **translation unit**, which essentially means that it just copies the contents of the `foo.hpp` into the `foo.cpp`, removes comments etc. As before, we will show this file as `foo.s` here. By default this file is not saved to disk but we _can_ save it using `--save-temps` flag that we can pass to the compiler.

Anyway, this translation unit is then passed into the compiler, which generates the `foo.o` object file.

The compiler sees our function template declaration and definition, however, this time around the compiler **does not see any code that asks it to instantiate our templates! And so it doesn't!** If we inspect the symbol table of the generated `foo.o` object file, we will see no `Foo` related symbols in it!

Now, if we do the same compilation process for our new `main.cpp` that also includes `foo.hpp` and try to link the resulting `main.o` object file with the `foo.o` object file from the previous step, **we get the linker error!**

<p align="center">
<img src="images/CompilationMainWithFooFail.png" alt="Video" style="width:100%;max-width:800;">
</p>

And by now we should see that the reason is that the `foo.o` does not have the symbols that we need in our `main` function, namely the specializations of our `Foo` template for `int` and for `float`.

## How to fix the linker error
Linker errors like these prompt many people to just use header-only libraries when using templates. And this _might_ be the only available solution if the library we are writing *really has to be extremely generic* and we have no idea which types our templates might be used with.

But this is not always the case. Actually, this is most often **not** the case! Most of us mortals don't write extremely generic libraries. We use templates to avoid code duplication and to introduce some nice-to-read abstractions into our system. In such situations, we usually know exactly what types we might be using with our templates!

In this situations we have another tool in our toolbox, called the **explicit template instantiation**, which can be used to, well, explicitly instantiate templates.

In our case, the explicit instantiation for our `Foo` function template looks like this:
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
template void Foo<int>();
template void Foo<float>();
```
Essentially, syntax-wise it looks like something stuck between a function declaration (just with a `template` keyword before it) and a template specialization (just without the angular brackets after the word `template`). To avoid any confusion, I would suggest to refresh how [function template specialization](templates_how_functions.md#full-function-template-specialization-and-why-function-overloading-is-better) looks like. What it essentially does is it forces the compiler to generate the code for our template with the provided type without waiting for seeing the code that uses it within some function.

And hopefully by now you can guess what we need to do to fix our linker error - we need to add **explicit template instantiations** to the end of our `foo.cpp` file:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` template_library_simple/foo_new.cpp
`CPP_RUN_CMD` CWD:template_library_simple c++ -std=c++17 -c foo_new.cpp -o foo_new.o && c++ -std=c++17 foo_new.o main.cpp
-->
```cpp
#include "foo.hpp"

// Function template definition.
template <typename T>
void Foo() {
  // Do something.
}

template void Foo<int>();
template void Foo<float>();
```
It is common to add these instantiations to the end of the file as by that time the compiler has seen all of the definitions so it knows how to generate the required template instantiations, which are then available in the symbol table of the `foo.o` object file. These symbols are then available for linkage against those required from the `main.o` object file to produce the final executable without error! :tada:


<p align="center">
<img src="images/CompilationSuccessWithHeaders.png" alt="Video" style="width:100%;max-width:800;">
</p>

## More complex explicit instantiations
This covers the basics of why we might want to use explicit template instantiation as well as hints on how this can be achieved.

But I guess you might be wondering if this only works with functions and the answer is: of course not! We can explicitly instantiate function, classes and even class methods.

Instead of talking about it too abstractly, let us look at a slightly more complex example which covers most of the interesting use-cases. The rest, I'm sure, you'll be able to figure out on your own.

Here, in the new `foo.hpp` header, we have a struct template that has a method template. In addition to the struct we also have a function that returns an object of our struct template and accepts a parameter of some type.

`foo.hpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` complex_template_library/foo.hpp
-->
```cpp
#pragma once
// Class template declaration.
template <typename T>
struct Foo {
  template <typename S>
  void Bar(const S& smth) const;

  T data{};
};

// Function template declaration.
template <typename T>
Foo<T> MakeFoo(const T& smth);
```
Just as before, the definitions for all of these declarations live in the `foo.cpp` file. And, as we know by now, we have to also explicitly instantiate all of these. Here, we make sure that we instantiate the struct template `Foo` for the type `int`, its `Bar` method for the types `int` and `float` (note that for functions we can either provide the type explicitly or let it be figured out from the function parameters) and, finally, the `MakeFoo` function for the type `int`.

`foo.cpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` complex_template_library/foo.cpp
`CPP_RUN_CMD` CWD:complex_template_library c++ -std=c++17 -c foo.cpp -o foo.o
-->
```cpp
#include "foo.hpp"

// Class method template definition.
template <typename T>
template <typename S>
void Foo<T>::Bar(const S& smth) const {}

// Function template definition.
template <typename T>
Foo<T> MakeFoo(const T& smth) {
  return Foo<T>{smth};
}

template class Foo<int>;
template void Foo<int>::Bar<int>(const int&) const;
template void Foo<int>::Bar(const float&) const;
template Foo<int> MakeFoo<int>(const int&);
```
And of course we also have a `main` function that makes use of all of the instantiations from before.

`main.cpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` complex_template_library/main.cpp
`CPP_RUN_CMD` CWD:complex_template_library c++ -std=c++17 main.cpp foo.o -o main
-->
```cpp
#include "foo.hpp"

int main() {
  const int data = 42;
  const auto foo = MakeFoo(data);
  foo.Bar(data);
  foo.Bar(42.42F);
  return 0;
}
```

Now if we build the object files for the `foo.cpp` and `main.cpp` we can link them together to produce the resulting binary without issues as all of our symbols have been generated after our templates have been explicitly instantiated by us in the `foo.cpp` file.
<!--
`CPP_SKIP_SNIPPET`
-->
```bash
# Create object file foo.o.
c++ -std=c++17 -c foo.cpp -o foo.o
# Create object file main.o.
c++ -std=c++17 -c main.cpp -o main.o
# Link object files.
c++ -std=c++17 main.o foo.o -o main
```

I'll leave it up to you to inspect the symbol tables of the generated binary files as well as to play around with this example by changing the template declarations and definitions as well as any arguments that we pass around. As always, it's all about getting a feeling for what works as well as how and why things break.

## Summary
This lecture should hopefully be enough to give us some intuition about explicit template instantiation and how it allows to split our template code declarations and definitions to header and source files.

For more details, I'll refer you to cppreference.com, as always. There are two distinct pages there with all the information we might be interested in, one for [explicit instantiations of function templates](https://en.cppreference.com/w/cpp/language/function_template#Explicit_instantiation) and one for [explicit instantiations of class templates](https://en.cppreference.com/w/cpp/language/class_template#Explicit_instantiation).

<!-- You'll also find the links to these below the video of course. And, as always, if you do run into any issues or come up with any questions, please write them in the comments, I value any feedback and will try my best to explain anything that was not clear enough.


And with this, I'd like to thank you for your attention, hope you liked what you saw today and if you feel that some details still didn't fully clock, then why not refresh your understanding of how to use templates by re-watching one of these videos?
-->
