Lifecycle of an object
---

- [Creating a new object](#creating-a-new-object)
  - [Constructor - the first function called for any object](#constructor---the-first-function-called-for-any-object)
  - [User-defined custom constructors for expressive object creation](#user-defined-custom-constructors-for-expressive-object-creation)
  - [Member initializer lists](#member-initializer-lists)
  - [An auto-generated default constructor](#an-auto-generated-default-constructor)
  - [Use `= default` if you still want the default constructor](#use--default-if-you-still-want-the-default-constructor)
  - [Use `explicit` with single-argument constructors](#use-explicit-with-single-argument-constructors)
- [What happens when an object dies](#what-happens-when-an-object-dies)
- [Full class lifecycle explained](#full-class-lifecycle-explained)


<!-- Talking head -->
Until now we've been creating our custom types with default initialization.

<!-- B-roll code -->
```cpp
Cat cat{};
cat.SetNumberOfLives(9);  // 😱 Breaks encapsulation.
```
This is quite boring and not particularly useful. We have to expose the class data through some sort of setters in order to update them to what we want which breaks encapsulation, which is not nice.

<!-- Talking head with code overlay -->
This changes today! After this lecture we'll be able to create a new object of our custom type by passing the parameters to initialize the object data upon object creation!
```cpp
Cat cat{number_of_lives, happiness};
```

Not only this is nicer to read but this also is one of the building blocks to clean software architecture!

Oh, and we'll also briefly touch upon what happens when objects get destroyed. Let get cracking!

<!-- Intro -->

# Creating a new object
## Constructor - the first function called for any object
<!-- Talking head -->
Under the hood, when a new object of any custom type is created a special function called a **constructor** is called. New terminology might be scary, but there is nothing complicated about it - it looks and behaves just a function with just two differences:
- Its name **must** match the name of the `class` (or `struct`) exactly
- It does not return anything but at the end of it there is a new object

Other than that we are more or less free to do whatever we want: there can be as many constructors as we want to have and each can take as many parameters as we like! Oh, and a constructor with no parameters is called a **default** constructor.

<!-- B-roll show both cases -->
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
Anyway, let's try it all out by writing a couple of constructors that take, say, happiness and number of lives values for a `Cat` class:
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
There is quite a bit of new syntax here!

## Member initializer lists
<!-- B-roll highlight -->
The parts `: happiness_{happiness}` and `: number_of_lives_{number_of_lives}, happiness_{happiness}` are called the **member initializer lists** and you should *always* use them when writing constructors. It is guaranteed to happen **before** we enter the constructor function scope.

<!-- Talking head + show variables on screen -->
> 🚨 Remember that the order of operations in the member initializer list will follow the order in which the data appears in the class declaration, **not** the order in which the variables show up in the member initializer list itself! So `number_of_lives_` will **always** be initialized before `happiness_`. Use the `-Wall` flag when compiling your code to enable compiler checking this and warning you if you mistype!

<!-- Talking head -->
🎓 We can of course do more things inside the scope of the constructor but it is a good practice to initialize as much as we can in the member initializer lists and try to leave the rest empty.

<!-- B-roll highlight code -->
> 🚨 In the Cat example, we see a couple of places where the variables are initialized, so it is important to understand which initialization takes precedence when. The rule is quite simple: the initializer list takes precedence over the in-place initialization. If an initializer list misses a value for a certain class member variable, only then this class member gets initialized from its in-place initialization.

## An auto-generated default constructor
<!-- B-roll code -->
After creating our custom constructors, if we try creating the `Cat` object without parameters we get an error! The compiler sees no "default constructor" which would be called in such a case!
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

## Use `= default` if you still want the default constructor
<!-- B-roll code -->
However, we can easily add this constructor back by adding just one line to our class:
```cpp
// Somewhere in the public part of our class
Cat() = default;  // Tell the compiler to use the default implementation
```

It is important to note here, that compiler actually generates quite a number of special constructors and other useful functions for a class automatically under certain conditions but we will talk about later in the course, so stay tuned for that!

## Use `explicit` with single-argument constructors
<!-- Talking head -->
There is one last thing new thing that we still did not cover from our code example - the word `explicit`. Google style suggests that if we write a single-argument constructor, we should [mark it as `explicit`](https://google.github.io/styleguide/cppguide.html#Implicit_Conversions). But why?

<!-- Talking head -->
Well, without it, there are some implicit conversions that a compiler might perform that are a bit confusing and should be avoided. Let me illustrate:
<!-- B-roll code -->
```cpp
void Foo(const Cat &cat) {}

int main() { Foo(42); }
```
<!-- B-roll try to compile -->
This code should **not** compile, and won't if we have `explicit` keyword in place.
<!-- B-roll try to compile after removing explicit -->
But it *will* compile if we don't. You probably see that if this code compiles it leads to confusion, so `explicit` here helps avoid such confusing situations.

# What happens when an object dies
At this point it should be pretty clear how the life of every object starts, but how does it end?

Just as it starts, it ends with a special function - a destructor. The last thing that happens before the object is completely destroyed, its destructor is called.

It is very similar to a constructor but there are some differences. Here are the rules for destructors:
- There can only be a single destructor for a class.
- The name of destructor for class `Foo` must be `~Foo()`
- The destructor takes no input parameters and returns no value

A destructor is a good place to release any resources that were manually acquired during object construction. Nowadays in Modern C++ we need this only rarely and when implementing really low-level stuff. But it is still important to know that destructors exist. There will be more to them once we start talking about value semantics or polymorphism, so stay tuned for that too!

# Full class lifecycle explained
So, to summarize todays video, it is important to remember that essentially every object is created and destroyed at some point. Classes in C++ are designed in such a way as to make sure that one and only one of the constructors is _always_ called upon object creation and a destructor is _always_ called upon object destruction. We can illustrate it with a small example where we print a message from a constructor and a destructor of an object:
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

The reason for such a design is simple - to ensure control over the resources that each object owns.

The paradigm that this design enables is usually referred to as **RAII** - **R**esource **A**cquisition **I**s **I**nitialization, meaning that all resources that the class owns should be acquired upon creation and released upon destruction. Well, technically they also can be transferred to some other object through the mechanism of move semantics but we're going to talk about in the next video.

For now, with the understanding of an object lifecycle, we've made our first steps on the path to understanding proper value semantics which is **the** cornerstone of the Modern C++ design.
