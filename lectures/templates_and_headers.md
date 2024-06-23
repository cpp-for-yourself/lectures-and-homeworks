**Templates in header and source files**

----

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>


We've talked quite extensively about templates by now and we should now be comfortable with knowing what they are, how they work under the hood and how to use both function and class templates.

There is one small thing missing though.

Whenever we needed to share the code of some class or function template, we've always used header-only libraries. So... what happens if we try some compiled libraries instead?

Long story short, we will get our linker complaining. So, why is that?

<!-- Intro -->

## Why linker fails
We talk about this extensively in the lecture about [what templates do under the hood](templates_what.md) and I urge you to look at that lecture before we continue here. It will make this lecture much easier to digest.

In order to understand why the linker fails to link our binaries in the example that we started with, we need to remember these three things:
1. That the compiler generates code from templates
2. That it compiles this code into binary form, potentially packed into libraries
3. And that it only generates the code that it sees as needed by the rest of the code

<p align="center">
<img src="images/Compiler.png" alt="Video" style="width:100%;max-width:600;">
</p>

So let's have a more precise look at our header-source pair that forms a library. The header file on its own just has the declarations of our templates and has no indication about which types our templates will be instantiated with.

Does the source file maybe have that information? Well, not really, all of our definitions are still generic, they all use whatever types we provide into them. So the compiler, looking at only this code, has no clue which instantiations to generate, so it generates none, which we can see by inspecting the resulting object files (or libraries, for that matter). The issue is that when it tries to compiler our library it has no additional information about what types might be supplied into our templates.

Next, we compile the file that holds our `main` function in which we try to instantiate all of our templates. The only thing the compiler sees is the header file we provide. And this header file only has the declarations of our templates, so the compiler simply assumes the implementation exists somewhere else and will be linked to our current binary at the linker stage.

But, remember, our library does not have any concrete implementations compiled into it because at that point the compiler had no idea which types we might use! So the linker fails to find the needed definitions and shows an error.

## How to fix the linker error
These types of linker errors prompts many people to just use header-only libraries when using templates. And this _might_ be the only available solution if the library we are writing must really be absolutely generic and we have no ideas which types it might be used with.

But this is not always the case. Most of us mortals don't write extremely generic libraries. We use templates to avoid duplicating code and to introduce some nice-to-read abstractions into our code. In such situations, we actually usually have quite a good idea what types we might be using in our templates.

In this situations we have another tool in our toolbox, called the **explicit templates instantiation**, which can be used to explicitly instantiate either [function](https://en.cppreference.com/w/cpp/language/function_template#Explicit_instantiation) or [class](https://en.cppreference.com/w/cpp/language/class_template#Explicit_instantiation) templates. The syntax for it looks like this:
```cpp
template void f<double>(double); // instantiates f<double>(double)
template void f<>(char);         // instantiates f<char>(char), template argument deduced
template void f(int);            // instantiates f<int>(int), template argument deduced

template class N::Y<char*>;       // OK: explicit instantiation
template void N::Y<double>::mf(); // OK: explicit instantiation
```

If we know the types that our templates are to be used with we can explicitly instantiate them _after_ all the definitions in the source file. This will tell the compiler which instantiations to generate and store into the binary files it produces. Which in turn will mean that the linker is going to be able to find these instantiations when linking our library against the binary file containing our `main` function.

This is pretty much everything we need to know about how we can use templates in compiler libraries.
