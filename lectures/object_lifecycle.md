Object lifecycle
---

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50%></a>
</p>

- [Creating a new object](#creating-a-new-object)
  - [**Constructor** - the first function called for any object](#constructor---the-first-function-called-for-any-object)
    - [A default constructor](#a-default-constructor)
    - [User-defined custom constructors for expressive object creation](#user-defined-custom-constructors-for-expressive-object-creation)
  - [Member initializer lists](#member-initializer-lists)
    - [Member initializer lists **initialize** member variables](#member-initializer-lists-initialize-member-variables)
    - [Be aware of the order of initialization](#be-aware-of-the-order-of-initialization)
    - [What if a member initializer list skips a value?](#what-if-a-member-initializer-list-skips-a-value)
    - [Try to leave the body of the constructor empty](#try-to-leave-the-body-of-the-constructor-empty)
  - [Again on default constructor auto-generation](#again-on-default-constructor-auto-generation)
  - [Use `= default` to re-enable a trivial default constructor](#use--default-to-re-enable-a-trivial-default-constructor)
  - [Use `explicit` with single-argument constructors](#use-explicit-with-single-argument-constructors)
  - [We've covered most of the things that happen when an object is created](#weve-covered-most-of-the-things-that-happen-when-an-object-is-created)
- [What happens when an object dies](#what-happens-when-an-object-dies)
  - [**Destructor** - the last function called for any object](#destructor---the-last-function-called-for-any-object)
  - [We rarely need to write our own destructor](#we-rarely-need-to-write-our-own-destructor)
- [Full class lifecycle explained](#full-class-lifecycle-explained)

<!-- Talking head -->
By now we kinda know how to create objects of [custom types](classes_intro.md) and that they get created and destroyed just like any other variable. But there is more to it!

So today we look under the hood and tap into the machinery that allows Modern C++ to be what it is - a flexible, efficient, and memory safe language all without the use of any sort of garbage collector! We're talking about the machinery of **constructors** and **destructors**!

Oh, and we'll also see how it enables us to create objects in a more expressive way, for example we can create a `Cat` class directly with its number of lives and happiness:
<!--
`CPP_SETUP_START`
struct Cat {
  Cat(int, int) {};
};

int main() {
  int number_of_lives{};
  int happiness{};
  $PLACEHOLDER
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` cat_simple/main.cpp
`CPP_RUN_CMD` CWD:cat_simple c++ -std=c++17 -c main.cpp
-->
```cpp
Cat cat{number_of_lives, happiness};
```
<!-- Intro -->

# Creating a new object
## **Constructor** - the first function called for any object
<!-- Talking head -->
Under the hood, when a new object of any custom type is created a special member function called a **constructor** is called. New terminology might be scary, but there is nothing complicated about it - it looks and behaves just as a function with just two differences:

<!-- B-roll show words on screen -->
- Its name **must** match the name of the `class` (or `struct`) exactly
- It does not return anything - it's job is to initialize a newly created object

<!-- Talking head -->
Other than that we are free to do whatever we want: there can be as many constructors as we want to have and each can take as many parameters as we like! Oh, and a constructor might also have no parameters at all!

### A default constructor
<!-- B-roll code -->
Such a constructor without parameters is called a **default** constructor.
<!--
`CPP_SETUP_START`
$PLACEHOLDER
int main() { Foo{}; }
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` foo_default_constructor/main.cpp
`CPP_RUN_CMD` CWD:foo_default_constructor c++ -std=c++17 -c main.cpp
-->
```cpp
class Foo {
public:
  Foo() {}  // Default constructor
};
```
And, we can use the `= default` after the constructor to tell the compiler that it can generate it as it wants which is even better because the compiler is usually smarter than us:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
int main() { Foo{}; }
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` better_default_constructor/main.cpp
`CPP_RUN_CMD` CWD:better_default_constructor c++ -std=c++17 -c main.cpp
-->
```cpp
class Foo {
public:
  Foo() = default;  // Even better default constructor
};
```

<!-- Talking head -->
> :bulb: Note that when such default constructor is called it will leave the data uninitialized unless these data are initialized in-place:
> <!-- B-roll add private part code  -->
> ```cpp
> class Foo {
> public:
>   Foo() = default;
>
> private:
>   int uninitialized;
>   int initialized{};
> };
> ```
> Here, the `uninitialized` variable will remain uninitialized while the `initialized` one will be initialized to a default value.
>
> <!-- Talking head  -->
> To avoid mistakes, we should _always_ initialize data in-place unless there is a good performance-related reason for not doing so.

<!-- B-roll code, remove the constructor from the above  -->
> :bulb: Also note that if we provide no constructors at all the compiler will **generate** a default one automagically! 🦄

### User-defined custom constructors for expressive object creation
<!-- B-roll code -->
Anyway, let's get our hands dirty and write a couple of constructors that take, say, `happiness` and `number_of_lives` values for some `Cat` class:
<!-- 🚨
We can see that now we are able to create a cat object providing either just its happiness or the number of lives and happiness. -->
```cpp
constexpr int kDefaultNumberOfLives = 9;

class Cat {
public:
  // Please ignore explicit for now, we talk about it below
  explicit Cat(int happiness)
      : happiness_{happiness} {}

  Cat(int number_of_lives, int happiness)
      : number_of_lives_{number_of_lives}, happiness_{happiness} {}

private:
  int number_of_lives_{kDefaultNumberOfLives};
  int happiness_{};
};

int main() {
  const Cat cat_1{42};
  const Cat cat_2{9, 100};
  return 0;
}
```
<!-- Talking head -->
There is quite a bit of new syntax here! So let's have a more precise look at all of it.

## Member initializer lists
<!-- B-roll highlight code -->
The parts `: happiness_{happiness}` and `: number_of_lives_{number_of_lives}, happiness_{happiness}` are called the **member initializer lists**. Everything that happens in the member initialized list is **guaranteed to happen before** we enter the constructor function scope.

### Member initializer lists **initialize** member variables
<!-- Talking head -->
These are actually very aptly named - they really are just lists of values that initialize member variables. The emphasis here is on "initialize", meaning that the member initializer list brings the object member variables into existence and they don't exist before this operation. There is no copying involved.

### Be aware of the order of initialization
<!-- Talking head + show variables on screen -->
It is important to understand here that the order of operations in the member initializer list will follow the order in which the data appears in the class declaration, **not** the order in which the variables show up in the member initializer list itself!

<!-- B-roll highlight code -->
So `number_of_lives_` will **always** be initialized before `happiness_`. Try to always have the variables appear in the right order in the member initializer list, otherwise it gets quite confusing.

<!-- Talking head 🚨 -->
If we are afraid to make such a mistake, we can use the `-Wall` flag when compiling your code to enable compiler checking this and warning us if we mistype!

### What if a member initializer list skips a value?
<!-- B-roll highlight code -->
In the Cat example, we see a couple of places where the variables are initialized, so it is important to understand which initialization takes precedence when. The rule is quite simple: the initializer list takes precedence over the in-place initialization. If an initializer list misses a value for a certain class member variable, only then this class member gets initialized from its in-place initialization. And if that in-place initialization is missing it will remain uninitialized.

### Try to leave the body of the constructor empty
<!-- Talking head -->
🎓 We can of course do more things inside the scope of the constructor but it is a good practice to initialize as much as we can in the member initializer lists and try to leave the rest empty. The reason for this is that in the body of the constructor all the member variables will have already been constructed, meaning that if we now set values to them, we will perform a copy, not an initialization.

## Again on default constructor auto-generation
<!-- B-roll code -->
After creating our custom constructors, if we try creating the `Cat` object without parameters we get an error! The compiler sees no constructor which would be called in such a case.
<!--
`CPP_SETUP_START`
using Cat = int;
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` no_default_constructor/main.cpp
`CPP_RUN_CMD` CWD:no_default_constructor c++ -std=c++17 -c main.cpp
-->
```cpp
int main() {
  Cat cat{};  // ❌ Won't compile when custom constructors present
  return 0;
}
```
```css
error: no matching constructor for initialization of 'Cat'
  Cat cat{};
      ^  ~~
```
<!-- B-roll comment out, recompile -->
Seems pretty logical, we did not provide a default constructor! However, the strange thing here is if we just comment out our custom constructors for the `Cat` class it suddenly starts working again! What's going on? :thinking:

<!-- Talking head -->
The reason behind this is that the compiler can generate some constructors automatically under certain conditions. In this particular case, it only generates the default constructor [if no constructors are provided by the user](https://en.cppreference.com/w/cpp/language/default_constructor).

<!-- B-roll highlight -->
So, as it follows, now we *did* provide custom constructors, so the compiler thinks that we know what we're doing and does not generate a default constructor anymore.

## Use `= default` to re-enable a trivial default constructor
<!-- B-roll code -->
However, we can easily add this constructor back by adding just one line to our class:
<!--
`CPP_SETUP_START`
struct Cat {
  $PLACEHOLDER
};
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` default_constructor/main.cpp
`CPP_RUN_CMD` CWD:default_constructor c++ -std=c++17 -c main.cpp
-->
```cpp
// Somewhere in the public part of our Cat class
Cat() = default;  // Tell the compiler to use the default implementation
```

<!-- Talking head -->
It is important to note here, that we are just scratching the surface here and the compiler actually generates quite a number of special constructors and other useful functions for a class automatically under certain conditions. This is a bigger topic, so we will talk about later in the course, so stay tuned for that!

## Use `explicit` with single-argument constructors
<!-- B-roll highlight code -->
Coming back to our example, there is one last new thing that we still did not cover - the word `explicit`.

<!-- B-roll show google style website -->
Google style suggests that if we write a single-argument constructor, we should [mark it as `explicit`](https://google.github.io/styleguide/cppguide.html#Implicit_Conversions). But why?

<!-- Talking head 🚨 -->
Well, without it, there are some implicit conversions that a compiler might perform that are a bit confusing and should be avoided. Let me illustrate this by *removing the `explicit`* from our previous `Cat` class implementation and trying to compile the following code replacing our previous `main` function:
<!-- B-roll code -->
<!--
`CPP_SETUP_START`
using Cat = int;
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` explicit_cat/main.cpp
`CPP_RUN_CMD` CWD:explicit_cat c++ -std=c++17 -c main.cpp
-->
```cpp
void Foo(const Cat &cat) {}

int main() { Foo(42); }
```
<!-- B-roll try to compile 🚨 -->
This code doesn't look like it should compile, does it? We are passing an integer into a function where a `Cat` object is expected! And yet it does! What happens here?

<!-- Talking head 🚨 -->
Well, our `Cat` class has a constructor that takes a single integer as a parameter. The compiler is allowed to perform implicit creation and decides that the best way to compile this code is to generate a temporary `Cat` object from the provided integer `42` and pass it into the function `Foo`!

<!-- B-roll try to compile after adding explicit 🚨 -->
Now, if we add `explicit` back, the code *won't* compile anymore.
So, `explicit` basically forbids creating the object implicitly.

## We've covered most of the things that happen when an object is created
<!-- Talking head -->
At this point it should be pretty clear how the life of every object starts, it always starts with one or another constructor, which takes care of initializing the object's variables, acquiring any resources needed etc. Honestly, there is not that much more to it.

# What happens when an object dies
## **Destructor** - the last function called for any object
<!-- Talking head -->
So I guess it is about time we talked about what happens when an object is destroyed. Just as how the life of an object starts with a constructor, it ends with another special function - a **destructor**. The last thing that happens before the object is completely destroyed - its destructor is called.

<!-- B-roll text on screen -->
There are again some rules for how destructors are named and how they behave:
- There can only be a single destructor for a class
- The name of destructor for class `Foo` must be `~Foo()`
- The destructor takes no input parameters and returns no value

## We rarely need to write our own destructor
<!-- Talking head -->
A destructor is a good place to release any resources that were acquired during object construction and, just as with the default constructor a default destructor is generated by the compiler automagically.

<!-- Code 🚨 Add destructor -->
That is usually how we want it. Compilers know how to allocate and destroy any normal variable that we did not allocate manually (more on that later), so in most cases there is no need for us to write our own destructor. This is the reason why you don't see one in our `Cat` class from before.
```cpp
class Cat {
public:
  explicit Cat(int happiness)
      : happiness_{happiness} {}

  ~Cat() {
    // Nothing to do here, so not really needed...
  }
private:
  int happiness_{};
};

int main() { const Cat cat{9}; }
```

<!-- Talking head -->
Nowadays in Modern C++ we need to write our own destructor only rarely, mostly when implementing really low-level stuff. But it is still important to know that destructors exist and what they are able to do. There will be more to them once we start talking about value semantics or polymorphism, so stay tuned for those topics but we'll leave it at that here.

# Full class lifecycle explained
<!-- B-roll code 🚨 -->
So, to summarize todays' video, it is important to remember that essentially every object is created by calling one and only one of its constructors, used for a while and eventually its destructor will be called as the last thing before the object is destroyed.
<!--
`CPP_SETUP_START`
struct Cat{
  void RunAround();
  void BeAwesome();
  void ThrowThingsFromAbove();
  int a;
};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` object_life/main.cpp
`CPP_RUN_CMD` CWD:object_life c++ -std=c++17 -c main.cpp
-->
```cpp
int main() {
  Cat cat{100}; // Cat(int happiness) is called.
  cat.RunAround();
  cat.BeAwesome();
  cat.ThrowThingsFromAbove();
  return 0;
} // Destructor cat.~Cat(); is called.
```

<!-- B-roll show words on screen 🚨 -->
> Exercise: to make sure this is clear, try adding some `std::cout` statements to the constructors and the destructor of our `Cat` class and see that they get printed!

<!-- Talking head -->
The reason for such a design is simple - to ensure control over the resources that each object owns.

<!-- B-roll show words on screen -->
The paradigm that this design enables is usually referred to as **RAII** - **R**esource **A**cquisition **I**s **I**nitialization and it is a very important paradigm in Modern C++.

<!-- Talking head -->
This means that all resources that a class owns should be acquired upon object creation and released upon object destruction. Well, technically they also can be transferred to some other object through the mechanism of move semantics but we're going to talk about this in the next video.

<!-- Talking head -->
For now, with the understanding of an object lifecycle, we've made our first steps on the path to understanding proper value semantics which is **the** cornerstone of the Modern C++ design.

<!-- Talking head
Thanks for watching as always and see you in the next video, bye!
-->
