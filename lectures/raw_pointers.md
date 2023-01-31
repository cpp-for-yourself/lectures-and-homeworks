# Raw non-owning pointers

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50%></a>
</p>

Today we talk about raw non-owning pointers. You might have heard about pointers if you heard about C++ (or C). There are wild emotions raging with respect to these. Mostly there is hatred, depression sprinkled with a little bit of boredom. But there is a small number of those who understand that they are nothing but a nice abstraction and allow for much flexibility. If we use them right, they become our friend!

## What are pointers?
At this point, you should know what references are. After all, we used them in all the functions we wrote. Well, pointers are very similar to references! In fact they can be used in _all_ situations where references are used. Albeit with a bit of a different syntax.

Creating a pointer to a variable is very similar to creating a reference to one:
```cpp
int var{};
int& var_ref{var};
int* var_ptr{&var};
```
Ok, there is some syntax here that confused many students! The use of the `&`! Let us straighten that up.

The `&` with references and with pointers means two things. In references, it _is_ part of the type, e.g. `int&`. But at the same time we can also use the same symbol `&` to get **an address** of a variable. We then store this address into a variable of type `int*` - a pointer to `int`.


## So why use both?
There is one crucial difference between references and pointers - we can have pointer not assigned to anything while a reference must be assigned to a variables at all times.

For example:
```cpp
int& unassigned_ref; // ❌ won't compile!
int* variable_ptr;   // 😱 compiles but don't do this!
```

## Initialize!
Why is the above bad? If you listened carefully to the lecture about variables (or at all when I speak) you probably have already guessed it: its the initialization!

Oh, and there is a special value with which to initialize the pointers: `nullptr`. The below are equivalent:
```cpp
int* empty_ptr{};
int* another_empty_ptr{nullptr};
```

Oh, and wanna see smth cool? We can check if a pointer is set to `nullptr` very neatly:
```cpp
if (empty_ptr) { /* do smth with nullptr */ }
if (!another_empty_ptr) { /* do smth with actual data */ }
```

## How to get the data?
Speaking of getting the data stored within a pointer, we use the `*` for that:
```cpp
int var{}
int* var_ptr{&var};
var = 42;
std::cout << var << " " << *var_ptr << std::endl;
*var_ptr = 23;
std::cout << var << " " << *var_ptr << std::endl;
```

What does the above print?

## Using const with pointers
This is a topic that routinely leaves the best of us with a twitching eye... Just as with references, we want to be able to forbid modification of data when using pointers. The issue here is that `int*`, `int *const`, `const int*`, and `const int* const` all represent their own types and are all different! So... what's the difference? And how to make sense of it?

There is a trick to this: read the types that involve pointers from right to left (top to bottom). Let's first cover the simpler cases:

### Non-const pointer to const data
```cpp
  const int * blah{};
//  |    |  |  | blah is a...
//  |    |  | pointer to an...
//  |    | integer...
//  | constant!
```
which means that we cannot change the underlying data, but can reassign `blah` to point to other data!
```cpp
const int * blah{&some_var};
blah = &some_other_var;  // ✅
*blah = 42;              // ❌
```

### Const pointer to non-const data
```cpp
   int * const blah{};
//  |  |   |   | blah is a...
//  |  |   | constant...
//  |  | pointer to an...
//  | integer!
```
which means that we **can** change the underlying data, but cannot reassign `blah` to point to other data!
```cpp
int * const blah{&some_var};
blah = &some_other_var;  // ❌
*blah = 42;              // ✅
```

### Const pointer to const data
```cpp
  const int * const blah{};
//  |    |  |   |   | blah is a...
//  |    |  |   | constant...
//  |    |  | pointer...
//  |    | to an integer...
//  | constant!
```
which means that we cannot change the underlying data, and we cannot reassign `blah` to point to other data!
```cpp
const int * const blah{&some_var};
blah = &some_other_var;  // ❌
*blah = 42;              // ❌
```

> :bulb: Try the same exercise yourself for the following:
> ```cpp
> int const * const blah{};
> ```
> What does it translate to?

## That's about it
This is about everything you have to know now about the non-owning raw pointers. They are a very useful construct in modern C++ and you should not shy away from using them when needed. You will hear some people saying that raw pointers should not be used in modern C++, but they are talking about different pointers - ones that own the data. The ones we talked about here, just point to already existing data. We will talk about this at length later.
