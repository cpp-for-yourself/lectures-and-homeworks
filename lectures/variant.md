
`std::variant` in Modern C++
--

<p align="center">
  <a href="https://youtu.be/dummy_link"><img src="https://img.youtube.com/vi/dummy_link/maxresdefault.jpg" alt="Video Thumbnail" align="right" width=50% style="margin: 0.5rem"></a>
</p>

When people think about runtime polymorphism in C++ they usually think about virtual functions and pointers. But in modern C++ we seem to embrace value semantics more and more for its efficiency and clarity.

So the question is: what if we want that runtime power without giving up value semantics?

And, as you might have already guessed, there’s a modern, elegant solution for exactly that, and its name is `std::variant` class!

<!-- Intro -->

Let's dive deeper into what exactly `std::variant` allows us to do, shall we?

When we talked about static polymorphism we learnt how to use templates (and concepts) to be able to work with objects of different classes that all conform to some common interface.

Think of various image classes that all have a `Save` method and a function `SaveImage` taking a template that we assume to have a `Save` method:

```cpp
#include <iostream>
#include <string>

struct PngImage {
    void Save(const std::string& file_name) const {
        std::cout << "Saving " << file_name << " as PNG\n";
    }
    // Some private image data would go here.
};

struct JpegImage {
    void Save(const std::string& file_name) const {
        std::cout << "Saving " << file_name << " as JPEG\n";
    }
    // Some private image data would go here.
};

template <typename Image>
void SaveImage(const Image& image, const std::string& file_name) {
    image.Save(file_name);
}

int main() {
    SaveImage(PngImage{}, "diagram");
    SaveImage(JpegImage{}, "photo");
}
```

But this pattern is not very useful if we want, for example, to load our files from a folder at runtime - all the code with all the types needs to be visible to the compiler at compile time!

We would really like to store a bunch of different images into a vector, potentially populating it at runtime, and save them all using their common `Save` method. But our images have different types so we can't easily put them into a vector!

```cpp
// ❌ Can't store objects of different types in a vector!
const std::vector<???> images{PngImage{}, JpegImage{}, ...};
```

Aha, I hear you say, we can create an interface class and store its pointer in vector, using *dynamic polymorphism* that we covered when we talked about inheritance! Indeed, we can create a class, say `Saveable`, that has a single pure virtual function `Save`. We can then inherit from this class in our `PngImage` and `JpegImage` that override `Save` with their respective implementations:

```cpp
#include <iostream>
#include <memory>
#include <string>
#include <vector>

// Interface
struct Saveable : public Noncopyable {
    virtual void Save(const std::string& file_name) const = 0;
    virtual ~Saveable() = default;
};

struct PngImage : public Saveable {
    void Save(const std::string& file_name) const override {
        std::cout << "Saving " << file_name << " as PNG\n";
    }
    // Some private image data would go here.
};

struct JpegImage : public Saveable {
    void Save(const std::string& file_name) const override {
        std::cout << "Saving " << file_name << " as JPEG\n";
    }
    // Some private image data would go here.
};

void SaveImage(const Saveable& image, const std::string& file_name) {
    image.Save(file_name);
}

int main() {
    // A bunch of images that could be put here at runtime.
    const std::vector<std::unique_ptr<Saveable>> images {
      std::make_unique<PngImage>(),
      std::make_unique<JpegImage>()
    };
    for (const auto& image : images) SaveImage(*image, "output");
}
```

This *does* allow us to store a bunch of image pointers in a vector and process all of them in a for loop without regard to their actual type:

While cool, we did have to give up certain things. Now, our image classes have a common explicit interface which will be hard to change down the line if this was a bad design decision. They also now follow reference / pointer semantics rather than value semantics, meaning that our classes are now designed to be accessed by a pointer to them and we cannot copy or move the actual objects around. Finally, because of this, while we did gain the ability to put objects into a vector, we now have to allocate pointers to them and that means that we have to allocate them on the heap. Usually this is not a big issue but can become one if we need to allocate many objects in a performance-critical context.
<!-- Watch a video on the heap for a more in-depth look into this topic. -->

This is where `std::variant` comes to the rescue. It allows us to keep using templates just like we originally wanted, but adds a twist. We can store a variant of our two types in a vector and use `std::visit` to call our `SaveImage` on any type from the ones we allow in the variant:

```cpp
#include <iostream>
#include <string>
#include <variant>
#include <vector>

struct PngImage {
    void Save(const std::string& file_name) const {
        std::cout << "Saving " << file_name << " as PNG\n";
    }
    // Some private image data would go here.
};

struct JpegImage {
    void Save(const std::string& file_name) const {
        std::cout << "Saving " << file_name << " as JPEG\n";
    }
    // Some private image data would go here.
};

using Image = std::variant<PngImage, JpegImage>;

void SaveImage(const Image& image, const std::string& file_name) {
    std::visit([&](const auto& img) { img.Save(file_name); }, image);
}

int main() {
    const std::vector<Image> images = {PngImage{}, JpegImage{}};
    for (const auto& image : images) SaveImage(image, "output");
}
```

Note, how we create the vector in exactly the way that we dreamed about before! We also call the same `SaveImage` function just like we did when using `virtual` functions and pointers!

However, it is hard not to notice that there is a bit more syntax present here. There is the `std::variant` as well as `std::visit` being used and we have not really looked into those before. So let's do so now.

## Basics of what `std::variant` is

The class `std::variant` is a so-called type-safe `union` type introduced in C++17. It allows a variable to hold one value out of a defined set of types.

For instance, if a variable can hold either an `int` or a `double`, we can use `std::variant<int, double>` and put any values of these types in it:

```cpp
#include <variant>
#include <iostream>

int main() {
  // There can be many more types in std::variant.
  std::variant<int, double> value;
  value = 42;   // Value holds an int.
  std::cout << "Integer: " << std::get<int>(value) << '\n';
  value = 42.42  // Value now holds a double.
  std::cout << "Double: " << std::get<double>(value) << '\n';
  return 0;
}
```

Do note though, that once we put one type into variant, `get`ting another type is undefined behavior, so don't do that.

The values of different types occupy the same memory, which means that the amount of memory allocated for the whole variant needs to be enough to store the biggest type stored in it. In our previous example, even when we write an `int` into our variant object, the object still allocates 8 bytes as needed for a `double`.

By the way, this is also how `std::optional` and `std::expected` that we talked about in the previous lecture work too.

## How to use `std::variant` with `std::visit` in practice

While cool already, the current tiny example might feel quite limited. Think about it, we somehow have to *know* which type our `std::variant` holds to use it. Which almost feels like it defeats the purpose. And, well, it does. If we need to know the type we want to use at compile time, we could as well just use that type and not bother with `std::variant` at all.

But we should not despair, this is C++ after all, there are options for us to use to make sure that we can work with *any* type that the variant holds. This option is to use a visitor pattern through the use of the `std::visit` function that we've already seen in our original example:

```cpp
#include <variant>
#include <iostream>
#include <string>

struct Printer {
  void operator(int value) const {
    std::cout << "Integer: " << value << '\n';
  }
  void operator(const std::string& value) const {
    std::cout << "String: " << value << '\n';
  }
};

int main() {
  const Printer printer{};
  std::variant<int, std::string> value = "Hello, Variant!";
  std::visit(printer, value);
  value = 42;
  std::visit(printer, value);
}
```

Here, `std::visit` applies a [function object](lambdas.md#before-lambdas-we-had-function-objects-or-functors) to the value contained in the variant. Should our variant hold a string - the operator that accepts a string is called, and should it hold an integer - the operator that accepts an integer is called instead.

And while we used an explicit function object here, we could as well use a lambda function of course.

It is important to remember that the selection of the function to be called happens at runtime! To quote cppreference.com:

> Implementations usually generate a table equivalent to an (possibly multidimensional) array of n function pointers for every specialization of `std::visit`, which is similar to the implementation of virtual functions.
> On typical implementations, the time complexity of the invocation of the callable can be considered equal to that of access to an element in an (possibly multidimensional) array or execution of a switch statement.

That is to say: it is usually pretty fast but still takes *some* tiny amount of time.

However, and this is an important pitfall that I see many beginners struggle with, we need to ensure that *all* the types in a variant are covered in the function object we provide into the `std::visit`. The code won't compile otherwise.

This *is* confusing. It might seem strange that we have to cover a case that we never aim to use. However, the reason why it was designed the way it was designed becomes easier to see if we look at a slightly more complex example.

Imagine that our `variant` is part of some class `Foo` that we design. The header file `foo.hpp` contains a declaration of our `Foo` class with a function `Print`:

`foo.hpp`

```cpp
#pragma once

#include <string>
#include <variant>

// Using struct for simplicity here.
struct Foo {
    void Print() const;

    std::variant<int, std::string> value{};
};

```

We implement this `Print` function in a corresponding `foo.cpp` file and, because we want to print the value stored in a `std::variant` we need to use `std::visit` with, say, `BadPrinter` function object passed to it. We call it "bad" because it does not handle all of the types in our variant.

`foo.cpp`

```cpp
#include "foo.hpp"

#include <iostream>
#include <string>
#include <variant>

namespace {

// 😱 Does not handle std::string.
struct BadPrinter {
    void operator()(int value) const {
        std::cout << "Integer: " << value << '\n';
    }
};

}  // namespace


void Foo::Print() const { std::visit(BadPrinter{}, value); }

```

If we try to compile this code it won't - the compiler wants us to cover all the types of our variant in the `BadPrinter` class. However, let us for a moment assume that it *would* be allowed by the standard and we would be able to compile this code into a library.

In that case, the code that we compile would be generated and stored in our library binary file. Without the code for handling `std::string` in `BadPrinter` that is.

Now imagine what would happen if at some point down the line someone would write an executable, link it to our code, try to store a `std::string` in the variant, and call `Print` on our `foo` object!

```cpp
#include "foo.hpp"

int main() {
    Foo foo{};
    foo.value = "Some string";
    foo.Print();
}
```

The behavior of this code would be undefined as our library's binary file would have no idea about how to print a string stored in the variant inside the `Foo` class.

To the degree of my understanding this is *the* reason why the standard requires a function object passed into `std::visit` to be able to handle all the types that can be stored inside of a given `std::variant` object.

## `std::monostate`

One last thing to cover about `std::variant` is a caveat that this type has. When we create a variable of this type, by default, a default value of the first type in its type list is stored. This might not always be desirable or, indeed, even possible. Imagine that we store only types that do not have a default constructor in the first place.

For this purpose there is a type `std::monostate` in the standard library. This is an empty type that is default constructible and we can define our variant type using `std::monostate` as its first type in the list should we want our variant to hold no value by default:

```cpp
std::variant<std::monostate, SomeType, SomeOtherType> value{};
// value holds an instance of std::monostate now.
```

Note that it probably means that we'll need to differentiate between our variant holding the `std::monostate` value or some other value in the `std::visit` that we will inevitably use at a later point in time.

## Use it with an `std::vector`

And this brings us back to our original example. We now know that declaring `Image` to be a variant allows us to store any kind of image in a vector of `Image`s:

```cpp
using Image = std::variant<PngImage, JpegImage>;
const std::vector<Image> images = {PngImage{}, JpegImage{}};
```

At the same time, the use of `std::visit` with a tiny lambda allows us to call `Save` on any concrete image class, thus achieving dynamic polymorphism keeping our value semantics completely intact:

```cpp
void SaveImage(const Image& image, const std::string& file_name) {
    std::visit([&](const auto& img) { img.Save(file_name); }, image);
}
```

## **Summary**

Overall, `std::variant` is extremely important for modern C++. If we implement our code largely using templates or concepts and need to enable dynamic polymorphism based on some values provided at runtime, there is probably no way around using `std::variant`. Which also means that we probably also need to use `std::visit`. These things might well be confusing from the get go but I hope that the explanations that we've covered just now will suffice to break the ice and using `std::variant` and `std::visit` in actual code will clear up any remaining issues.
