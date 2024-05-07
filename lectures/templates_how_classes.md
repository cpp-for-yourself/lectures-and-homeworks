How to use templates with classes in C++
--

<p align="center">
  <a href="https://youtu.be/IQ62tA51Vag"><img src="https://img.youtube.com/vi/IQ62tA51Vag/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

- [How to use templates with classes in C++](#how-to-use-templates-with-classes-in-c)
- [Class method templates](#class-method-templates)
  - [Prefer overloading to specialization of class method templates](#prefer-overloading-to-specialization-of-class-method-templates)
  - [Sometimes overloading is not possible --- specialize in this case](#sometimes-overloading-is-not-possible-----specialize-in-this-case)
- [Class templates](#class-templates)
- [Class template argument deduction (min. C++17)](#class-template-argument-deduction-min-c17)
  - [Class template specialization: implicit and explicit](#class-template-specialization-implicit-and-explicit)
  - [Full explicit template specialization](#full-explicit-template-specialization)
    - [How to fully specialize class templates](#how-to-fully-specialize-class-templates)
    - [Make sure a specialization follows the expected interface](#make-sure-a-specialization-follows-the-expected-interface)
    - [Historical reference for `std::vector<bool>`](#historical-reference-for-stdvectorbool)
    - [Specialize just one method of a class](#specialize-just-one-method-of-a-class)
    - [Specialize method templates of class templates](#specialize-method-templates-of-class-templates)
    - [Type traits and how to implement them using template specialization](#type-traits-and-how-to-implement-them-using-template-specialization)
    - [More generic traits using partial specialization](#more-generic-traits-using-partial-specialization)
  - [Difference between partial and full specializations](#difference-between-partial-and-full-specializations)
    - [How to tell partial template specialization apart from a new template class definition?](#how-to-tell-partial-template-specialization-apart-from-a-new-template-class-definition)
    - [How to tell a partial template specialization apart from a full class template specialization?](#how-to-tell-a-partial-template-specialization-apart-from-a-full-class-template-specialization)
  - [Partial template specialization with more types](#partial-template-specialization-with-more-types)
- [Summary](#summary)


In the previous videos we talked about **why** we might want to use templates, **what** happens under the hood when we use them, and how to use function templates. Today, finally, we can talk about how to use **class templates**.

On the surface they are kinda similar to function templates but, well, for classes, with one crucial difference that enables most of C++ meta-programming. That difference is that we can **partially specialize class templates** and I can't stress enough how important that is!

<!-- Intro -->

## Class method templates
Before we start talking about actual class templates I want to briefly talk about **class method templates**.

We can write them just like any freestanding function template. And we can treat `static` class method templates in the same way. All of these class method templates can appear in any class or struct and it doesn't matter if that class or struct is a class template itself or not.

Such template methods behave in _exactly_ the same way as the normal function templates so we should already know how to use them after the [previous lectures](templates_how_functions.md):
```cpp
// Can also be a class, using struct for simplicity
struct SomeClass {
  template <typename ClassT>
  void DoSmthWithObject(const ClassT& value) {}

  template <typename ClassT>
  static void DoSmthWithType(const ClassT& value) {}
};

int main() {
  SomeClass object{};
  // Compiler infers int
  object.DoSmthWithObject(42);
  // Same as above, but explicit
  object.DoSmthWithObject<int>(42);

  // Compiler infers double
  SomeClass::DoSmthWithType(42.42);
  // Same as above, but explicit
  SomeClass::DoSmthWithType<double>(42.42);
}
```

### Prefer overloading to specialization of class method templates
Just like with function templates, we can overload or specialize these methods. And just like with function templates, we still should prefer overloading these methods while we are designing our class interface for the same reasons we discussed in the lecture about [free-standing function templates](templates_how_functions.md).
```cpp
// Can also be a class, using struct for simplicity
struct Foo {
  template <typename ClassT>
  void Bar(ClassT value) {}  // 1️⃣
  void Bar(int value) {}     // 2️⃣

  template <typename ClassT>
  static void StaticBar(ClassT value) {}   // 3️⃣
  static void StaticBar(double value) {}   // 4️⃣
};

int main() {
  Foo foo{};
  // What gets called in every case?
  foo.Bar(42);
  foo.Bar(42.42);
  Foo::StaticBar(42);
  Foo::StaticBar(42.42);
}
```
<!-- As a tiny exercise, tell me in the comments which methods get called in which order in this example! -->

### Sometimes overloading is not possible --- specialize in this case
There is one difference to the free-standing functions though: while it is always possible to introduce a new overload for any free-standing function at any place in the codebase after that function was defined, **it is impossible to create a new class method overloads outside of the class declaration**. So if we cannot change the code of our class, we are left with **full class function template specialization** as our only option:
```cpp
// Assume that we cannot change the code in this class
struct Foo {
  template <typename ClassT>
  void Bar(ClassT value) {}  // 1️⃣
  void Bar(int value) {}     // 2️⃣

  template <typename ClassT>
  static void StaticBar(ClassT value) {}   // 3️⃣
  static void StaticBar(double value) {}   // 4️⃣
};

// Specialize our template out-of-class anywhere
// in the code after the class declaration.
template<>
void Foo::Bar(double value) {}  // 5️⃣

int main() {
  Foo foo{};
  // What gets called now?
  foo.Bar(42);
  foo.Bar(42.42);
  Foo::StaticBar(42);
  Foo::StaticBar(42.42);
}
```
<!-- And, just like before, please tell me in the comments what you think gets called now? -->

We can add these specializations anywhere in the codebase (after the class declaration that is) without ever touching the code in the class again.

Anyway, with all of this out of the way, we're ready to talk about class templates!

## Class templates
The good news is that if we know how to use [function templates](templates_how_functions.md) and [what classes are](classes_intro.md), the syntax for class templates will look very logical and familiar. Another good news is that we've seen class templates before! A lot of [STL containers](more_useful_types.md) like `std::vector`, `std::array`, or `std::map` are actually class templates and that's why we can put values of nearly any (but same) type into them.

So, for the sake of example, Let's say I want to write a simple class that will represent a coordinate of a pixel on the screen that has `int` row and column and does not much more than just pack them together as well as allow getting or printing their values:
```cpp
#include <iostream>

class Coordinate {
   public:
    Coordinate(int row, int col) : row_{row}, col_{col} {}

    int row() const { return row_; }
    int col() const { return col_; }

    void Print() const {
      std::cout << "coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
    }

   private:
    int row_{};
    int col_{};
};

int main() {
    const Coordinate coordinate{42, 23};
    coordinate.Print();
    return 0;
}
```
This is all good, but I come from robotics and image processing background where we regularly need the so-called sub-pixel resolution, meaning that our coordinates should be represented by floating point numbers. So we suddenly also need a `FloatCoordinate` class :thinking:
```cpp
#include <iostream>

class Coordinate {
   public:
    Coordinate(int row, int col) : row_{row}, col_{col} {}

    int row() const { return row_; }
    int col() const { return col_; }

    void Print() const {
      std::cout << "int coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
    }

   private:
    int row_{};
    int col_{};
};

class FloatCoordinate {
   public:
    FloatCoordinate(float row, float col) : row_{row}, col_{col} {}

    float row() const { return row_; }
    float col() const { return col_; }

    void Print() const {
      std::cout << "float coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
    }

   private:
    float row_{};
    float col_{};
};

int main() {
    const Coordinate coordinate{42, 23};
    coordinate.Print();
    const FloatCoordinate other_coordinate{42.42F, 23.23F};
    other_coordinate.Print();
    return 0;
}
```
This is not very nice, is it? And of course you've already guessed that we can use class templates to get around this in an elegant way.

We can replace our `Coordinate` and `FloatCoordinate` with a single **class template** `Coordinate`:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` coordinate/coordinate.hpp
-->
```cpp
#include <iostream>

template <typename ScalarT>
class Coordinate {
   public:
    Coordinate(ScalarT row, ScalarT col) : row_{row}, col_{col} {}

    ScalarT row() const { return row_; }
    ScalarT col() const { return col_; }

    void Print() const {
      std::cout << "Generic coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
    }

   private:
    ScalarT row_{};
    ScalarT col_{};
};
```
<!--
`CPP_SETUP_START`
#include "coordinate.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` coordinate/main.cpp
`CPP_RUN_CMD` CWD:coordinate c++ -std=c++17 main.cpp
-->
```cpp
int main() {
    const Coordinate<int> coordinate{42, 23};
    coordinate.Print();
    const Coordinate<float> other_coordinate{42.42F, 23.23F};
    other_coordinate.Print();
    return 0;
}
```

A lot of things here are just like what we saw before for function templates:
- We declare the class template by prefixing our class with the word `template`
- We provide any number of templates parameters, here just one `ScalarT`, prefixing it with the key word `typename` or `class`. The compiler still doesn't care which names we give them but I would still advice to give these template parameters readable names
- We can use our template parameter `ScalarT` anywhere in our class just like we would use any other normal type
- When we instantiate an object of our class we provide the type that we want to use, which triggers **"implicit template instantiation"** (stay tuned for **explicit template instantiation** too). This means that the compiler creates a specialization of our class template for the concrete type that we are using it with. We can see this in detail using the awesome website [cppinsights.io](https://cppinsights.io/s/6729874b) where we see that in our example the compiler generates two concrete classes - one for `int` and one for `float` coordinates. For more see the lecture on [what templates do under the hood](templates_what.md).

## Class template argument deduction (min. C++17)
If our class has a constructor that uses all of our template types and we are using at least C++17 we can make use of the [**C**lass **T**emplate **A**rgument **D**eduction (CTAD)](https://en.cppreference.com/w/cpp/language/class_template_argument_deduction) and omit the template argument when creating our objects. This process uses implicit and explicit type deduction guides, which is a bit of a niche topic that I don't plan to actively cover in this course, but if we have a constructor for our class, we don't have to worry about it and the compiler will mostly be able to figure out the underlying types that we meant:
<!--
`CPP_SETUP_START`
#include "coordinate.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` coordinate/main_ctad.cpp
`CPP_RUN_CMD` CWD:coordinate c++ -std=c++17 main_ctad.cpp
-->
```cpp
int main() {
    // In C++17 the compiler is able to figure out the types
    const Coordinate coordinate{42, 23};
    coordinate.Print();
    const Coordinate other_coordinate{42.42F, 23.23F};
    other_coordinate.Print();
    return 0;
}
```

I use it all the time, but this is a bit of a controversial topic. If you look into the Google Code Style for C++ at least as of the date of preparing this lecture, they [suggest to steer away from using CTAD](https://google.github.io/styleguide/cppguide.html#CTAD) because the compiler might fail to deduce the type we expect it to deduce. We _can_ provide explicit type deduction guides but we won't cover it here. I believe that once you really need to use it, you'll know enough about C++ to read about it on your own. You can always read more on it [cppreference.com](https://en.cppreference.com/w/cpp/language/class_template_argument_deduction) under "User-defined deduction guides".

### Class template specialization: implicit and explicit
Ok, so from the lecture on [what templates do under the hood](templates_what.md) we already know that the code that actually gets compiled is just a copy of the code in our template with the chosen types substituted instead of the template parameters. These copies are called "specializations" and we touched upon this before too. So when we use a class template to instantiate an object in the code the compiler creates such a specialization and then uses that to create an object.
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
// Creates an implicit specialization Coordinate<int>
// if it wasn't created before
Coordinate<int> coordinate{42, 23};
```

But we don't *have* to wait for the compiler to create such a specialization at the first call site, we *can* (and sometimes *want*) to create one explicitly on our own! This is called **explicit template specialization** and it can be **full** and **partial**.

### Full explicit template specialization
We already talked about [full template specialization](templates_how_functions.md#full-function-template-specialization-and-why-function-overloading-is-better) when we talked about function templates because that's the only option we have with function templates (even though we should overload function instead of specializing them). Well, turns out we can use the same full template specialization with classes too. And in this case it _does_ have its valid use-cases that are quite popular.

#### How to fully specialize class templates
In order to fully specialize a class template we have to basically fully re-implement a class for a concrete type, prefixing it with `template<>`:
```cpp
#include <iostream>

template <typename ScalarT>
class Coordinate {
   public:
    Coordinate(ScalarT row, ScalarT col) : row_{row}, col_{col} {}

    ScalarT row() const { return row_; }
    ScalarT col() const { return col_; }

    void Print() const {
      std::cout << "Generic coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
    }

   private:
    ScalarT row_{};
    ScalarT col_{};
};

// Full class template specialization for ScalarT = float.
template<>
class Coordinate<float> {
   public:
    Coordinate(float row, float col) : row_{row}, col_{col} {}

    float row() const { return row_; }
    float col() const { return col_; }

    void Print() const {
      std::cout << "float coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
    }

   private:
    float row_{};
    float col_{};
};

int main() {
    // Creates a new implicit instantiation of Coordinate<int>
    const Coordinate coordinate{42, 23};
    coordinate.Print();
    // Uses the explicit instantiation of Coordinate<float>
    const Coordinate other_coordinate{42.42F, 23.23F};
    other_coordinate.Print();
    return 0;
}
```
Now, when we create a variable of this matching template instantiation, no implicit template instantiation is created by the compiler and it reuses the explicit template instantiation that we provide manually. I encourage you to play around with this simple example, printing things from these class template specializations to get a better intuition about what is happening.

Notice how this is very similar to what we saw in the [cppinsights.io](https://cppinsights.io/s/6729874b) before! The only difference is that now _we_ force one of the specializations to be created **explicitly**.

Note, that as _we_ implement the explicit specialization, it is **our responsibility** to implement the full class, along with all the data and methods that it provides. If we implement it differently from the original class template, it will behave differently when we try to use our specialization. Which might be confusing or error prone! Imagine if we for whatever reason dropped the `Print` function in our specialization:
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
#include <iostream>

template <typename ScalarT>
class Coordinate {
   public:
    Coordinate(ScalarT row, ScalarT col) : row_{row}, col_{col} {}

    ScalarT row() const { return row_; }
    ScalarT col() const { return col_; }

    void Print() const {
      std::cout << "Generic coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
    }

   private:
    ScalarT row_{};
    ScalarT col_{};
};

template<>
class Coordinate<float> {
   public:
    Coordinate(float row, float col) : row_{row}, col_{col} {}

    float row() const { return row_; }
    float col() const { return col_; }

   private:
    float row_{};
    float col_{};
};

int main() {
    // Creates a new implicit instantiation of Coordinate<int>
    const Coordinate coordinate{42, 23};
    coordinate.Print();
    // Uses the explicit instantiation of Coordinate<float>
    const Coordinate other_coordinate{42.42F, 23.23F};
    // ❌ Won't compile! No Print() function in explicit specialization
    other_coordinate.Print();
    return 0;
}
```
This example won't compile as there is no `Print` function found in the class template specialization for `float` :scream:.

```css
<source>: In function 'int main()':
<source>:38:22: error: 'class Coordinate<float>' has no member named 'Print'
   38 |     other_coordinate.Print();
      |                      ^~~~~
Compiler returned: 1
```

#### Make sure a specialization follows the expected interface
🚨 So if we do decide to specialize a class, we have to make sure it conforms to the same logical interface as the original template, otherwise we're probably going to go through a whole lot of pain.
<!-- Add the this is fine gif -->

#### Historical reference for `std::vector<bool>`
> **Story time:** one famous example of such a template specialization that **does not** fully conform to the interface that the original base template has is the specialization of `std::vector` for `bool` type. If you remember when we talked about `std::vector` in one of the [previous lectures](more_useful_types.md) I cautioned not to use `std::vector<bool>`. So here is the story behind that suggestion.
>
> By default, if we store a `bool` it will still take a full byte of memory, even though we logically need just one bit to represent the stored value - `true` or `false`. So naïvely, if we store a number of `bool` variables in some array we will lose quite some memory, to be precise, we will use about 8 times the memory we could have.
>
> At some point, the standardization committee decided that it would be a nice idea to have a specialization for the `std::vector` class template for type `bool` that addresses this issue. This specialization would allow to "pack" the boolean values together, 8 per byte and, as such, save space. It made sense too, a vector was designed to store a bunch of values in sequence, so it was conceivable that anybody who will want to store `bool` variables will want to pack them tightly.
>
> The issue is that because we tightly pack these boolean values we can't really access them by a normal reference as we do with any other type. Type `bool` on its own still takes usually 1 byte. And so, `std::vector<bool>` returns a `std::__bit_reference` temporary wrapper instead that handles all the bit-fiddling. Which means that innocent-looking code like this won't compile:
> <!--
> `CPP_SKIP_SNIPPET`
> -->
> ```cpp
> // ❌ Does not compile!
> #include <vector>
> int main() {
>   std::vector<bool> vector{/* some data */};
>   for (auto& value : vector) { /* do something */ };
> }
> ```
> In addition to that, returning a temporary wrapper might actually be quite a bit slower, so there is a trade-off between storage and speed and forcing people to pack booleans together forces their hand.
> As you might imagine, not everybody was a fan of this idea!
>
> Anyway, long story short, while it is cool that `std::vector` is so flexible and interesting that we can reduce the usage of space occupied by a vector of booleans by a factor of 8, it has been widely considered a **"wrong move"** on the standard side and generally people are suggested to avoid using `std::vector<bool>` and use a different class specifically designed for this purpose if they need an array of bits.
>
> I encourage you to read more about this from people who know much more about any of this: [Howard Hinnant](https://isocpp.org/blog/2012/11/on-vectorbool) and [Herb Sutter](http://www.gotw.ca/publications/mill09.htm). <!-- The links are below this video, of course. -->


#### Specialize just one method of a class
You might start noticing that sometimes it might be useful to specialize just one method of a class. And there _is_ a way to do it as we can specialize a single method of a class template too! For the sake of example, let us specialize the `Print` function for the specialization of our class template for type `float`:
```cpp
#include <iostream>

template <typename ScalarT>
class Coordinate {
   public:
    Coordinate(ScalarT row, ScalarT col) : row_{row}, col_{col} {}

    ScalarT row() const { return row_; }
    ScalarT col() const { return col_; }

    void Print() const {
      std::cout << "Generic coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
    }

   private:
    ScalarT row_{};
    ScalarT col_{};
};

template<>
void Coordinate<float>::Print() const {
  std::cout << "float coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
}

int main() {
    // In C++17 the compiler is able to figure out the types
    const Coordinate coordinate{42, 23};
    coordinate.Print();
    const Coordinate other_coordinate{42.42F, 23.23F};
    other_coordinate.Print();
    return 0;
}
```
We just need to add a definition of a single function for our class specialization following the pattern that we should be used to by now, adding the `template <>` prefix. The main difference is that as we are implementing a class method, we have to indicate this by prefixing the name of the function with `Coordinate<float>::`. Note that we did not need to re-implement other methods of the generic coordinate class. This makes such a pattern quite useful: if a class still needs to conform to some generic interface, we usually don't need to specialize _all_ of its methods, just some. And we can also do this long after we're done designing our original class template.

#### Specialize method templates of class templates
Now if we would want to specialize a class method template that itself is found within a class template, we could still specialize it by just stacking multiple `template <>` prefixes together. So, if we would want a method `CastTo` that casts our `Coordinate` row and column to a different type we would be able to fully specialize such a method by specializing the class `Coordinate<int>::` with the first `template <>` and then the method `CastTo<int>` itself with the second `template <>`.
```cpp
#include <iostream>

template <typename ScalarT>
class Coordinate {
   public:
    Coordinate(ScalarT row, ScalarT col) : row_{row}, col_{col} {}

    ScalarT row() const { return row_; }
    ScalarT col() const { return col_; }

    void Print() const {
        std::cout << "Generic coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
    }

    template <typename OtherScalarT>
    Coordinate<OtherScalarT> CastTo() const {
        std::cout << "Non-trivial cast" << std::endl;
        return Coordinate<OtherScalarT>{
          static_cast<OtherScalarT>(row_), static_cast<OtherScalarT>(col_)};
    }

   private:
    ScalarT row_{};
    ScalarT col_{};
};

template<>
void Coordinate<float>::Print() const {
  std::cout << "float coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
}

template <>
template <>
Coordinate<int> Coordinate<int>::CastTo<int>() const {
    std::cout << "Trivial cast" << std::endl;
    return *this;
}

int main() {
    // In C++17 the compiler is able to figure out the types
    const Coordinate coordinate{42.42F, 23.23F};
    coordinate.Print();
    const auto int_coordinate = coordinate.CastTo<int>();
    int_coordinate.Print();
    const auto another_int_coordinate = int_coordinate.CastTo<int>();
    another_int_coordinate.Print();
    return 0;
}
```
Running this shows that we are able to convert from a `float` coordinate to `int` coordinate and can perform a trivial cast after that.
```output
float coordinate: [42.42, 23.23]
Non-trivial cast
Generic coordinate: [42, 23]
Trivial cast
Generic coordinate: [42, 23]
```

#### Type traits and how to implement them using template specialization
Going back to a class template specialization there is one canonical example where full class template specialization is widely used. I am talking about the implementation of the so-called "type traits". If you're not familiar with these, they are (usually) tiny structs that are designed to tell us certain things about various types. There is a bunch of these defined [in the standard](https://en.cppreference.com/w/cpp/header/type_traits), like for example [`std::is_integral`](https://en.cppreference.com/w/cpp/types/is_integral) that checks if the provided type is integer in an abstract sense. We can see how it works by using a `static_assert` that checks that any given boolean condition is `true` at compile time. So, if we combine all of the `std::is_integral` values for various input types we should get `true` in the end, which we can check by compiling this code:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` is_integral/main.cpp
`CPP_RUN_CMD` CWD:is_integral c++ -std=c++17 -c main.cpp
-->
```cpp
#include <type_traits>

static_assert
(
    !std::is_integral<float>::value &&
    !std::is_integral<int*>::value &&
    std::is_integral<int>::value &&
    std::is_integral<const int>::value &&
    std::is_integral<bool>::value &&
    std::is_integral<char>::value
);
```

The way such a type trait can be implemented uses nothing but class template specialization and is genius in its simplicity.
We start by defining the base trait that has its `static` `value` constant set to `false` for any given type:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` custom_is_integral/is_integral.hpp
-->
```cpp
template <typename T>
struct is_integral {
  static constexpr inline bool value{};
};
```
Now we can access the `value` for any of our class template instantiations as follows:
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
// ❌ Does not compile!
static_assert(is_integral<int>::value);
static_assert(!is_integral<double>::value);
```
And if we compile this assertion, it will _not_ compile with an error that a static assertion has failed. That's because we expect `is_integral<int>::value` to be `true` and in our case the `value` is `false` regardless of the type we pass into our trait.

So let's fix this. And you might have already guessed that we can use class template specialization for this! Let us specialize our `is_integral` class template by prefixing it with `template <>` statement and specifying `int` as the type for which we specialize it:
<!--
`CPP_SETUP_START`
#include "is_integral.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` custom_is_integral/is_integral_specialization.hpp
-->
```cpp
template <>
struct is_integral<int> {
  static constexpr inline bool value{true};
};
```
Now if we compile our asserts they will compile without issues!
<!--
`CPP_SETUP_START`
#include "is_integral_specialization.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` custom_is_integral/main.cpp
`CPP_RUN_CMD` CWD:custom_is_integral c++ -std=c++17 -c main.cpp
-->
```cpp
// ✅ Compiles now!
static_assert(is_integral<int>::value);
static_assert(!is_integral<double>::value);
```
And, of course, we can repeat the same process for any other type that we consider to be integer-like (mostly variations on `bool` and `char`) and we've implemented `is_integral` type very similar to the one found in the STL.

#### More generic traits using partial specialization
And if you now think that it is a bit cumbersome to copy so much code to create an explicit specialization for any type we want, you're totally right! It feels a bit limiting. In the case of `is_integral` there is not too much we could do, but in most other cases, we can definitely do better!

To illustrate this let's implement our own type trait `IsCoordinate` that we can use, for the sake of example, to show better errors to the users, should they try using our library in a wrong way.

Imagine that we have a function to validate coordinates in some way:
<!--
`CPP_SETUP_START`
template<class T>
struct Coordinate {};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` validate_simple/main.cpp
`CPP_RUN_CMD` CWD:validate_simple c++ -std=c++17 -c main.cpp
-->
```cpp
#include <vector>

template<typename ScalarT>
[[nodiscard]] bool IsValid(const Coordinate<ScalarT>& coordinate) {
  return true; // Actually do something useful here!
}

template<typename CoordinateT>
[[nodiscard]] bool ValidateCoordinates(const std::vector<CoordinateT>& coordinates) {
  for (const auto& coordinate : coordinates) {
    if (!IsValid(coordinate)) return false;
  }
  return true;
}
```
We have a function `IsValid` template that is able to validate a single coordinate and we pass a vector of these coordinates to some other function template `ValidateCoordinates`.

If we pass a wrong type into this function, like `std::vector<int>` instead of a vector of actual coordinates, we will get an error which is not very nice to read:
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
#include <iostream>

int main() {
  const std::vector<int> wrong_input{1, 2, 3};
  std::cout << ValidateCoordinates(wrong_input) << std::endl;
}
```

```css
<source>: In instantiation of 'bool ValidateCoordinates(const std::vector<CoordinateT>&) [with CoordinateT = int]':
<source>:69:37:   required from here
<source>:62:21: error: no matching function for call to 'IsValid(const int&)'
   62 |         if (!IsValid(coordinate)) return false;
      |              ~~~~~~~^~~~~~~~~~~~
<source>:54:20: note: candidate: 'template<class ScalarT> bool IsValid(const Coordinate<U>&)'
   54 | [[nodiscard]] bool IsValid(const Coordinate<ScalarT>& coordinate) {
      |                    ^~~~~~~
<source>:54:20: note:   template argument deduction/substitution failed:
<source>:62:21: note:   mismatched types 'const Coordinate<U>' and 'const int'
   62 |         if (!IsValid(coordinate)) return false;
      |              ~~~~~~~^~~~~~~~~~~~
```

Now, what we _could_ do instead is check at compile time if we use the function correctly by, for the sake of example, putting a `static_assert` into it:
<!--
`CPP_SETUP_START`
template<class T>
struct IsCoordinate{
  static constexpr inline bool value{};
};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` validate_static_assert/main.cpp
`CPP_RUN_CMD` CWD:validate_static_assert c++ -std=c++17 -c main.cpp
-->
```cpp
#include <vector>

template<typename CoordinateT>
[[nodiscard]] bool ValidateCoordinates(const std::vector<CoordinateT>& coordinates) {
  static_assert(IsCoordinate<CoordinateT>::value, "Contents of the container are not coordinates");
  for (const auto& coordinate : coordinates) {
    if (!IsValid(coordinate)) return false;
  }
  return true;
}
```

Now if we try to write the same code it won't compile with a much more readable error generated by our `static_assert`.

```css
<source>: In instantiation of 'bool ValidateCoordinates(const std::vector<CoordinateT>&) [with CoordinateT = int]':
<source>:71:37:   required from here
<source>:61:52: error: static assertion failed: Contents of the container are not coordinates
   61 |     static_assert(IsCoordinate<CoordinateT>::value == true,
      |                                              ~~~~~~^~~~~~~
<source>:61:52: note: the comparison reduces to '(0 == 1)'
<source>:64:21: error: no matching function for call to 'IsValid(const int&)'
   64 |         if (!IsValid(coordinate)) return false;
      |              ~~~~~~~^~~~~~~~~~~~
<source>:54:20: note: candidate: 'template<class ScalarT> bool IsValid(const Coordinate<U>&)'
   54 | [[nodiscard]] bool IsValid(const Coordinate<ScalarT>& coordinate) {
      |                    ^~~~~~~
<source>:54:20: note:   template argument deduction/substitution failed:
<source>:64:21: note:   mismatched types 'const Coordinate<U>' and 'const int'
   64 |         if (!IsValid(coordinate)) return false;
      |              ~~~~~~~^~~~~~~~~~~~
```

This is a powerful technique but it is now slowly getting outdated as in C++20 we have an even better tool to do the same things: **concepts**, which we'll briefly talk about soon. As a short introduction they will allow us to write code that looks something like this instead:
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
// Requires C++20!
template <CoordinateLike CoordinateT>
[[nodiscard]] bool ValidateCoordinates(const std::vector<CoordinateT>& coordinates) {
  for (const auto& coordinate : coordinates) {
    if (!IsValid(coordinate)) return false;
  }
  return true;
}
```
Note the change from the `typename` keyword to a **concept** `CoordinateLike`, which defines a set of rules that a type must conform to in order to be accepted for this template. This function, if we pass a wrong type into it, will generate a similarly nice error message.

But we're getting ahead of ourselves. For now we're interested in implementing such an `IsCoordinate` trait and see any limitations we encounter along the way. Just as in the case with `is_integral` trait, we start with the primary template that has a `false` `static` `value` constant:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` is_coordinate_trait/is_coordinate_base.cpp
`CPP_RUN_CMD` CWD:is_coordinate_trait c++ -std=c++17 -c is_coordinate_base.cpp
-->
```cpp
template <typename T>
struct IsCoordinate {
  static constexpr inline bool value{};
};
```
And some of its explicit specializations for some of our `Coordinate` types:
<!--
`CPP_SETUP_START`
template<class T>
struct Coordinate {};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` is_coordinate_trait/is_coordinate.cpp
`CPP_RUN_CMD` CWD:is_coordinate_trait c++ -std=c++17 -c is_coordinate.cpp
-->
```cpp
template <typename T>
struct IsCoordinate {
  static constexpr inline bool value{};
};

template <>
struct IsCoordinate<Coordinate<int>> {
  static constexpr inline bool value{true};
};

template <>
struct IsCoordinate<Coordinate<float>> {
  static constexpr inline bool value{true};
};

// Not an exhaustive test, just an illustration.
static_assert
(
    !IsCoordinate<void>::value &&
    !IsCoordinate<int>::value &&
    !IsCoordinate<float>::value &&
    IsCoordinate<Coordinate<int>>::value &&
    IsCoordinate<Coordinate<float>>::value
);
```
We might notice that some things are not too optimal just yet. We are copying our `IsCoordinate` trait for each of the `Coordinate` template specializations just like we did in our `is_integral` trait implementation. And sure enough, if we want to cover _any_ type that the `Coordinate` template will accept, we are in for a lot of copying...

Well, this is exactly what [**partial template specialization**](https://en.cppreference.com/w/cpp/language/partial_specialization) helps us to avoid!

Partial template specialization is a very powerful technique. Let's see how it makes our `IsCoordinate` trait much nicer:
<!--
`CPP_SETUP_START`
template<class T>
struct Coordinate {};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` is_coordinate_trait/is_coordinate_partial.cpp
`CPP_RUN_CMD` CWD:is_coordinate_trait c++ -std=c++17 -c is_coordinate_partial.cpp
-->
```cpp
template <typename T>
struct IsCoordinate {
  static constexpr inline bool value{};
};

template <typename T>
struct IsCoordinate<Coordinate<T>> {
  static constexpr inline bool value{true};
};

static_assert
(
    !IsCoordinate<void>::value &&
    !IsCoordinate<int>::value &&
    !IsCoordinate<float>::value &&
    IsCoordinate<Coordinate<int>>::value &&
    IsCoordinate<Coordinate<float>>::value
);
```
We definitely need to pause here and unpack this syntax a bit. We still have the same primary template trait that sets `value` to be `false` using value initialization. And we still have the same `static_assert` below. What changed is the way we define our template specialization.

### Difference between partial and full specializations
We replaced the `template <>` that we would have used for full template specialization with another `template <typename T>`.

This syntax, in my experience, can be slightly confusing for beginners for two reasons.

#### How to tell partial template specialization apart from a new template class definition?
It is easy to confuse a new class template definition and a partial template specialization. The main indicator for the specialization is the `<Coordinate<T>>` part that follows the class template name `IsCoordinate`.
<!--
`CPP_SETUP_START`
template<class T>
struct Coordinate{};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` is_coordinate_trait/is_coordinate_illustrate.cpp
`CPP_RUN_CMD` CWD:is_coordinate_trait c++ -std=c++17 -c is_coordinate_illustrate.cpp
-->
```cpp
template <typename T>
struct IsCoordinate {
    static constexpr inline bool value{};
};

template <typename T>
struct IsCoordinate  //
    <Coordinate<T>>  // <-- This is an indicator of a specialization
{
    static constexpr inline bool value{true};
};
```

#### How to tell a partial template specialization apart from a full class template specialization?
Another confusing part is that it might take some time to learn the differences between partial and full class template specializations. So here is a simple rule of thumb:
- **Full specialization** specializes a template **with a concrete type** and uses `template <>` prefix
- **Partial specialization** specializes a template **with another template type** so needs template parameters in its definition

In our case, we have a template type parameter `T`. It appears in the `Coordinate<T>` which is a specialization of the `Coordinate` template. We then specialize the `IsCoordinate` with `Coordinate<T>` type, making `IsCoordinate<Coordinate<T>>` a partial template specialization. We use the word "partial" because we don't *fully* constrain our specialization and the new input type `T` adds a degree of freedom to it.

Now what the compiler does is it sees the call to `IsCoordinate<Coordinate<int>>` and looks for an appropriate implementation. It finds the primary template `IsCoordinate` and then looks for any explicit specializations available. Out of those it picks the ["most specialized"](https://en.cppreference.com/w/cpp/language/partial_specialization) one, which in our case is our only specialization. Here, a specialization is **"more specialized"** than the other if it only takes a subset of types that the other specialization takes.

To fully understand the interplay of the full and partial class template specialization, let's have a look at this small artificial example where we have a custom dummy container for some data and some trait that has a couple of specializations:
```cpp
#include <iostream>

template<typename T>
struct Container {
  T data{};
};

template<typename T>
struct Trait {
  static constexpr inline int kNumber{};
};

template<typename T>
struct Trait<Container<T>> {
  static constexpr inline int kNumber{1};
};

template<>
struct Trait<int> {
  static constexpr inline int kNumber{2};
};

int main() {
  std::cout << Trait<float>::kNumber << " ";
  std::cout << Trait<int>::kNumber << " ";
  std::cout << Trait<Container<int>>::kNumber << " ";
  std::cout << Trait<Container<float>>::kNumber << std::endl;
}
```
Please spend some time playing with this example! By now you should be able to understand what each definition does and what gets printed to the terminal.
<!-- Please pause the video, think about this example and type what will be printer to the terminal and why in the comments!

Also, while you're at it, hit that like button and subscribe if you haven't already!
-->

### Partial template specialization with more types
Partial template specialization works in exactly the same way if there are more types! Like if we have a class `Foo` that accepts 3 template parameters, we can write its partial specialization that takes, for example, just two types and reuses them to specialize the primary template:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` multiple_types/foo.hpp
-->
```cpp
// Primary template
template<class T1, class T2, int I>
class Foo {};

// Partial specialization of Foo where T2 is a pointer to T1
template<class T, int I>
class Foo<T, T*, I> {};
```

The compiler then still picks the most specialized out of all the template specializations it finds for a given class or struct when they are used.
<!--
`CPP_SETUP_START`
#include "foo.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` multiple_types/main.cpp
`CPP_RUN_CMD` CWD:multiple_types c++ -std=c++17 main.cpp
-->
```cpp
int main() {
  Foo<int, double, 23> foo_generic;
  Foo<int, int*, 42> foo_partial_specialization;
}
```

Play around with this a bit on tiny examples and see if everything that happens makes sense. If it doesn't (even after you slept on it) please do not hesitate to ask questions! This is an important topic to understand!

That being said, because of the sheer power that templates and their specialization provide, there _will_ be situations when what the compiler does will seem confusing. But if we firmly understand the concepts behind what is happening, we should be able to eventually figure out what is going on.

## Summary
All in all, using templates with classes is one of the super powers of C++. In combination with full and partial template specialization and function overloading, this enables most of the things that C++ is so well known for --- extreme flexibility that we only pay for with compile time (well, at least almost).

Class templates also enable most of what we know as template meta-programming, i.e., writing code with complex logic that makes its results available at compile time. Furthermore, it was a stepping stone and the basis for arguably the most modern way to write C++ code by using concepts. So understanding how to use templates as well as various template specialization techniques is key to a happy and healthy C++ life.

But don't worry if some concepts don't "click" from the first time, play around with examples, try to use templates in real code and see what causes you trouble. Then ask questions and I hope that in no time you will feel very comfortable using templates.

<!-- And if you'd like to start watching all of the template-related videos in the order that I intended them to be watched please feel free to watch this video where I "start with why" we might be interested in using templates in the first place. If you'd rather dive deeper and refresh what templates do under the hood, then do click on this video instead! Other than that, thanks again for watching, tell your friends if you want to further support my efforts at recording these videos, and see you next time! -->
