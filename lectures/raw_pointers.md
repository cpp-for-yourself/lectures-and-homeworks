# Raw pointers

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=40%></a>
</p>

- [Raw pointers](#raw-pointers)
- [The pointer type](#the-pointer-type)
- [Pointers = variables of pointer types](#pointers--variables-of-pointer-types)
- [How to get the data?](#how-to-get-the-data)
- [Initialization and assignment](#initialization-and-assignment)
- [Using const with pointers](#using-const-with-pointers)
  - [Non-const pointer to const data](#non-const-pointer-to-const-data)
  - [Constant pointer to non-const data](#constant-pointer-to-non-const-data)
  - [Constant pointer to constant data](#constant-pointer-to-constant-data)
- [That's about it](#thats-about-it)


<!-- Talking head -->
Today we talk about pointers. Largely speaking there are two kinds of pointers in modern C++:
- Smart pointers
- Raw pointers

The difference between them is ownership. Smart pointers own their data, and the raw ones don't. While we will talk about ownership more soon, for now it's enough to think about it as follows:
<!-- Spell out words on screen -->
> **whoever owns data - cleans up its memory**.

<!-- Talking head -->
Today we talk about the non-owning kind of pointers - the raw pointers. We already talked about something very similar: [references](cpp_basic_types_and_variables.md#references-to-variables). But with raw pointers you get more flexibility, i.e., ever tried putting references into an [`std::vector`](more_useful_types.md#use-stdvector-when-number-of-items-is-unknown-before-wise)?
<!-- Code -->
```cpp
std::vector<int&> vector_of_refs{};  // ❌ Doesn't compile
```
<!-- Talking head -->
You can do that (and more) with raw pointers but you do pay with some syntax overhead as well as with a potential infamous **"segfault"**. Let's dig into the details!

<!-- Intro -->

# The pointer type
<!-- Talking head -->
<!-- Show int and int* on top -->
First of all, when we talk about pointers, we talk about **variables** of a special **pointer type**. We form such "pointer types" from other types by appending the `*` symbol on the right. So, just as `int` is a type, `int*` is a "pointer to `int`" type. Of course it doesn't have to `int`, it can be any other type, including other pointer types, for example `Cat**` type is a "pointer to a pointer of a `Cat` class".

# Pointers = variables of pointer types
<!-- Talking head -->
Anyway, as I said before, **pointers** are just **variables** of **pointer types**. So what do these variables hold?

<!-- Draw memory and a pointer, also write the address as integer as in hex -->
They hold nothing else than an address in memory of another variable. Intuitively, we can think about this address as if it were simply a large integer number (usually represented in hexadecimal system). That's why all pointer variables occupy the same amount of memory that is also usually equal to a long integer.

<!-- Talking head -->
However, C++ pointers are *much* better than just a number that represents an address. A pointer always *points to a variable of a certain type*. Which means that for every pointer the compiler knows:
- The address of the start of a variable it points to
- Type of the variable it points to

This allows the compiler to check that we point to the correct type making our life easier.

<!-- Code -->
Which brings us to how such pointers can be created and initialized in code:
```cpp
int var{};         // Some variable that we will point to
int* ptr1{&var};   // The & operator returns a pointer to a variable
int* ptr2 = &var;  // Same as above
```
<!-- Talking head -->
The use of `&` might confuse you as we've seen it also when declaring references. In references, it is **part of the type**, e.g. `int&` stands for a type "reference to int". But at the same time we can also use the same symbol `&` as an **"address operator"** to get a pointer to a variable.

<!-- Code -->
Once we're at it, let's quickly illustrate my point from before that compiler is our friend. If we try to create a pointer to a variable of a wrong type we get an error:
```cpp
double var{};
int* var_ptr{&var};  // ❌ Won't compile!
```

# How to get the data?
<!-- Talking head -->
Being able to create pointers is all great, but we would like to get to the underlying data too! We use the `*` operator for that. It is called a **"dereferencing operator"**.

<!-- Overlay illustration -->
The compiler then is able to look at where the pointer points to in memory and, knowing the size of the underlying type, interpret the appropriate number of bytes as the underlying type giving us direct access to the underlying variable.

<!-- Code -->
```cpp
int var{}
int* var_ptr{&var};
var = 42;
std::cout << var << " " << *var_ptr << std::endl;
*var_ptr = 23;
std::cout << var << " " << *var_ptr << std::endl;
```
<!-- Skip -->
> :bulb: What does the above print?

<!-- Talking head -->
Oh, and one more thing. When pointing to more complex types, e.g. `std::string` or any type that has methods that we can call we technically have to:
- Dereference the pointer to get to the object
- Call the method on our object
Which ends up looking something like this:
<!-- Code -->
```cpp
std::string blah{"blah"};
std::string* str_ptr{&blah};
// 😱 Ugh, this is ugly!
std::cout << "String size: " << (*str_ptr).size() << std::endl;
```
<!-- Talking head -->
There is a shortcut for this! We can use the `->` operator which does exactly the two steps we actually perform here:
<!-- Code -->
```cpp
std::string blah{"blah"};
std::string* str_ptr{&blah};
// ✅ Now this is nice!
std::cout << "String size: " << str_ptr->size() << std::endl;
```

# Initialization and assignment
<!-- Talking head -->
It's time we talk about the main difference between references and pointers. Pointers **are re-assignable**, while a reference is initialized directly from a given variable and cannot be reassigned later.

<!-- Code -->
For example:
```cpp
int var_1{42};
int var_2{23};

int* var_ptr{&var_1};
// Re-assigns pointer: var_ptr now points to var_2 and not var_1
var_ptr = &var_2;

int& var_ref{var_1};
// Copies the data into var_1, does not re-assign var_ref.
var_ref = var_2;
```
<!-- Talking head -->
This is the feature that allows us to put pointers into containers!
<!-- Code -->
```cpp
int foo{42};
int bar{23};
// Not very useful for now, but this is the staple
// behind the Object Oriented Programming (stay tuned 😉)
std::vector<int*> my_numbers{&foo, &bar};
```

<!-- Talking head -->
This flexibility for pointers also means that we *can* have an uninitialized pointer or a pointer pointing to nothing (also known as the `nullptr`).
<!-- Code -->
For example:
```cpp
int& unassigned_ref;        // ❌ won't compile!
int* unassigned_ptr;        // 😱 compiles but don't do this!
int* empty_ptr_1{};         // ✅ do this instead!
int* empty_ptr_2{nullptr};  // ✅ or this, same as above
```

<!-- Talking head -->
The `nullptr` is a special value with which to initialize the pointers that don't point to any existing variable. By definition is means "points to nothing".

<!-- Code -->
Oh, by the way, wanna see smth cool? Pointers get implicitly converted to `bool`, so we can check if a pointer is set to `nullptr` very neatly:
```cpp
if (empty_ptr_1) { /* do smth with empty_ptr_1 */ }
if (!empty_ptr_2) { /* do smth when empty_ptr_2 is nullptr */ }
```

<!-- Code -->
Trying to dereference a `nullptr` will lead to a **"segmentation fault"** runtime error, or, shorter, a **"segfault"**.
```cpp
int* nothing{nullptr};
*nothing;  // ❌ Will compile but fail at runtime with a segfault.
```

<!-- Talking head -->
It's unpleasant, yes, but this is not the worst that can happen! Dereferencing a `nullptr` is a well-defined runtime error. To fix it is just a matter of finding which pointer points to `nullptr`.

<!-- Draw pointer pointing to a random memory -->
🚨 But if you don't initialize your pointer at all, it will point to a random address and if you dereference it, it will interpret whatever it finds under that random address as the required type. It might segfault but might also just return some garbage data. Welcome back to the undefined behavior land :scream:

# Using const with pointers
<!-- Talking head with overlay -->
Switching gears, just as with references, we want to be able to forbid modification of data when using pointers. This is a topic that routinely leaves the best of us with a twitching eye... The issue here is that `int*`, `int *const`, `const int*`, and `const int* const` all represent their own types and all mean different things! So... what's the difference? And how to make sense of it?

<!-- Talking head point right, point left -->
There is a trick to this: read the types that involve pointers from right to left. Let's see some examples:

## Non-const pointer to const data
<!-- Overlay with highlight -->
```cpp
  const int * blah{};
//  |    |  |  | blah is a...
//  |    |  | pointer to an...
//  |    | integer...
//  | constant!
```
<!-- Talking head -->
Which means that we cannot change the underlying data, but can reassign `blah` to point to other data!

<!-- Code -->
```cpp
const int * blah{&some_var};
blah = &some_other_var;  // ✅
*blah = 42;              // ❌
```
<!-- Talking head -->
:bulb: This is the most common use of `const` with pointers.

But there are other ways too! Let's quickly look at those.

## Constant pointer to non-const data
<!-- Overlay with highlight -->
```cpp
   int * const blah{};
//  |  |   |   | blah is a...
//  |  |   | constant...
//  |  | pointer to an...
//  | integer!
```
<!-- Talking head -->
Which means that we **can** change the underlying data, but cannot reassign `blah` to point to other data!
<!-- Code -->
```cpp
int * const blah{&some_var};
blah = &some_other_var;  // ❌
*blah = 42;              // ✅
```

## Constant pointer to constant data
<!-- Talking head -->
Finally, there is a way to forbid any changes as follows:

<!-- Overlay with highlight -->
```cpp
  const int * const blah{};
//  |    |  |   |   | blah is a...
//  |    |  |   | constant...
//  |    |  | pointer...
//  |    | to an integer...
//  | constant!
```
<!-- Talking head -->
which means that we cannot change the underlying data, **and** we cannot reassign `blah` to point to other data!
<!-- Skip -->
```cpp
const int * const blah{&some_var};
blah = &some_other_var;  // ❌
*blah = 42;              // ❌
```

<!-- Talking head -->
> :bulb: To make sure you understood how it works, try the same exercise yourself for the following:
> ```cpp
> int const * const blah{};
> ```
> What does it translate to?

# That's about it
<!-- Talking head -->
This is about everything we have to know now about the raw pointers. They give us some flexibility but we pay the cost of possible segfaults and sometimes even with a potential for an undefined behavior in our code. The rule of thumb is to use references whenever you possibly can and resort to raw pointers if you cannot use a reference instead.

That being said, understanding what raw pointers are is very important and they also will become more useful once we start talking more about the Object Oriented Programming and Polymorphism in that context.

<!-- Thanks for watching and see you in the next one! -->
