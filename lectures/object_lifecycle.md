Object lifecycle
---

- [Creating a new object](#creating-a-new-object)
  - [**Constructor** - the first function called for any object](#constructor---the-first-function-called-for-any-object)
  - [User-defined custom constructors for expressive object creation](#user-defined-custom-constructors-for-expressive-object-creation)
  - [Member initializer lists](#member-initializer-lists)
    - [Member initializer lists **initialize** member variables](#member-initializer-lists-initialize-member-variables)
    - [🚨 Be aware of the order of initialization](#-be-aware-of-the-order-of-initialization)
    - [🚨 What if a member initializer list skips a value?](#-what-if-a-member-initializer-list-skips-a-value)
    - [🎓 Try to leave the body of the constructor empty](#-try-to-leave-the-body-of-the-constructor-empty)
  - [A default constructor is (sometimes) auto-generated](#a-default-constructor-is-sometimes-auto-generated)
  - [Use `= default` to re-enable a trivial default constructor](#use--default-to-re-enable-a-trivial-default-constructor)
  - [Use `explicit` with single-argument constructors](#use-explicit-with-single-argument-constructors)
  - [We've covered most of the things that happen when an object is created](#weve-covered-most-of-the-things-that-happen-when-an-object-is-created)
- [What happens when an object dies](#what-happens-when-an-object-dies)
  - [**Destructor** - the last function called for any object](#destructor---the-last-function-called-for-any-object)
  - [We rarely need to write our own destructor](#we-rarely-need-to-write-our-own-destructor)
- [Full class lifecycle explained](#full-class-lifecycle-explained)

<!-- Talking head -->
By now we kinda know how to create objects of custom types and that they get created and destroyed just like any other variable. But there is more to it!

So today we look under the hood and tap into the machinery that allows Modern C++ to be what it is - a flexible, efficient, and memory safe language all without the use of any sort of garbage collector! We're talking about the machinery of **constructors** and **destructors**!

Oh, and we'll also see how it enables us to create objects in a more expressive way, for example:
```cpp
Cat cat{number_of_lives, happiness};
```
<!-- Intro -->

# Creating a new object
## **Constructor** - the first function called for any object
<!-- Talking head -->
Under the hood, when a new object of any custom type is created a special member function called a **constructor** is called. New terminology might be scary, but there is nothing complicated about it - it looks and behaves just a function with just two differences:

<!-- B-roll show words on screen -->
- Its name **must** match the name of the `class` (or `struct`) exactly
- It does not return anything - it's job is to initialize a newly created object

<!-- Talking head -->
Other than that we are free to do whatever we want: there can be as many constructors as we want to have and each can take as many parameters as we like! Oh, and a constructor might also have no parameters at all, such a constructor is called a **default** constructor.

<!-- B-roll code and highlight -->
> :bulb: Note that when a default constructor is called it will leave the data uninitialized unless these data are initialized in-place:
> ```cpp
> class Foo {
> private:
>   int unintialized;
>   int initialized{};
> };
> ```
> Therefore we should _always_ initialize data in-place unless there is a good performance-related reason for not doing so.

## User-defined custom constructors for expressive object creation
<!-- B-roll code -->
Anyway, let's get our hands dirty and write a couple of constructors that take, say, `happiness` and `number_of_lives` values for some `Cat` class:
```cpp
constexpr int kDefaultNumberOfLives = 9;

class Cat {
public:
  explicit Cat(int happiness)
      : happiness_{happiness} {}

  Cat(int number_of_lives, int happiness)
      : number_of_lives_{number_of_lives}, happiness_{happiness} {}

private:
  int number_of_lives_{kDefaultNumberOfLives};
  int happiness_{};
};
```
<!-- Talking head -->
There is quite a bit of new syntax here! So let's have a more precise look at all of it.

## Member initializer lists
<!-- B-roll highlight code -->
The parts `: happiness_{happiness}` and `: number_of_lives_{number_of_lives}, happiness_{happiness}` are called the **member initializer lists**. Everything that happens in the member initialized list is **guaranteed to happen before** we enter the constructor function scope.

### Member initializer lists **initialize** member variables
<!-- Talking head -->
These are actually very aptly named - they really are just lists of values that initialize member variables. The emphasis here is on "initialize", meaning that the member initializer list brings the object member variables into existence and they don't exist before this operation. There is no copying involved.

### 🚨 Be aware of the order of initialization
<!-- Talking head + show variables on screen -->
It is important to understand here that the order of operations in the member initializer list will follow the order in which the data appears in the class declaration, **not** the order in which the variables show up in the member initializer list itself!

<!-- B-roll highlight code -->
So `number_of_lives_` will **always** be initialized before `happiness_`. Try to always have the variables appear in the right order in the member initializer list, otherwise it gets quite confusing. If we are afraid to make such a mistake, we can use the `-Wall` flag when compiling your code to enable compiler checking this and warning you if you mistype!

### 🚨 What if a member initializer list skips a value?
<!-- B-roll highlight code -->
In the Cat example, we see a couple of places where the variables are initialized, so it is important to understand which initialization takes precedence when. The rule is quite simple: the initializer list takes precedence over the in-place initialization. If an initializer list misses a value for a certain class member variable, only then this class member gets initialized from its in-place initialization.

### 🎓 Try to leave the body of the constructor empty
<!-- Talking head -->
🎓 We can of course do more things inside the scope of the constructor but it is a good practice to initialize as much as we can in the member initializer lists and try to leave the rest empty. The reason for this is that in the body of the constructor all the member variables will have already been constructed, meaning that if we now set values to them, we will perform a copy, not an initialization.

## A default constructor is (sometimes) auto-generated
<!-- B-roll code -->
After creating our custom constructors, if we try creating the `Cat` object without parameters we get an error! The compiler sees no "default constructor" which would be called in such a case.
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
```cpp
// Somewhere in the public part of our class
Cat() = default;  // Tell the compiler to use the default implementation
```

<!-- Talking head -->
It is important to note here, that we are just scratching the surface here and the compiler actually generates quite a number of special constructors and other useful functions for a class automatically under certain conditions. This is a bigger topic, so we will talk about later in the course, so stay tuned for that!

## Use `explicit` with single-argument constructors
<!-- B-roll highlight code -->
Coming back to our example, there is one last thing new thing that we still did not cover - the word `explicit`.

<!-- B-roll show google style website -->
Google style suggests that if we write a single-argument constructor, we should [mark it as `explicit`](https://google.github.io/styleguide/cppguide.html#Implicit_Conversions). But why?

<!-- Talking head -->
Well, without it, there are some implicit conversions that a compiler might perform that are a bit confusing and should be avoided. Let me illustrate:
<!-- B-roll code -->
```cpp
void Foo(const Cat &cat) {}

int main() { Foo(42); }
```
<!-- B-roll try to compile -->
This code doesn't look like it should compile, does it? And won't if we have `explicit` keyword in place!

<!-- B-roll try to compile after removing explicit -->
But it *will* compile if we don't. You probably see that if this code compiles it leads to confusion, so `explicit` here helps avoid such confusing situations.

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
A destructor is a good place to release any resources that were *manually* acquired during object construction. The emphasis is on the word "manually". Compilers know how to allocate and destroy any normal variable, so in most cases there is no need for us to write our own destructor. This is the reason why you don't see one in our `Cat` class from before.

<!-- Talking head -->
Nowadays in Modern C++ we need to write our own destructor only rarely, mostly when implementing really low-level stuff. But it is still important to know that destructors exist and what they are able to do. There will be more to them once we start talking about value semantics or polymorphism, so stay tuned for those topics but we'll leave it at that here.

# Full class lifecycle explained
<!-- Talking head -->
So, to summarize todays' video, it is important to remember that essentially every object is created and destroyed at some point. Classes in C++ are designed in such a way as to make sure that one and only one of the class constructors is _always_ called upon object creation and a destructor is _always_ called upon object destruction.

<!-- B-roll code -->
We can illustrate it with a small example where we print a message from a constructor and a destructor of an object:
```cpp
struct Foo {
  Foo() {std::cout << "Created" << std::endl; }
  ~Foo() {std::cout << "Destroyed" << std::endl; }
};

int main() {
  Foo foo{};
  return 0;
}
```
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
