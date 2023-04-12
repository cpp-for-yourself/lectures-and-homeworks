Value semantics
---

- [Why we care about value semantics](#why-we-care-about-value-semantics)
  - [Setting up the example to illustrate why we need value semantics](#setting-up-the-example-to-illustrate-why-we-need-value-semantics)
  - [Value semantics enables ownership transfer](#value-semantics-enables-ownership-transfer)
- [Let's re-design value semantics from scratch](#lets-re-design-value-semantics-from-scratch)
  - [Can we avoid having this "stealing" behavior?](#can-we-avoid-having-this-stealing-behavior)
  - [What does it mean to "steal" the data from an object?](#what-does-it-mean-to-steal-the-data-from-an-object)
  - [Naïve implementation of "stealing"](#naïve-implementation-of-stealing)
  - [Problems with the naïve solution](#problems-with-the-naïve-solution)
  - [Better solution - add a new "stealing reference" type to the language!](#better-solution---add-a-new-stealing-reference-type-to-the-language)
  - [We also design how the "stealing references" are created from other objects](#we-also-design-how-the-stealing-references-are-created-from-other-objects)
    - ["Stealing references" from temporary objects](#stealing-references-from-temporary-objects)
    - ["Stealing references" from existing objects already stored as variables](#stealing-references-from-existing-objects-already-stored-as-variables)
    - [Showcase of what we can do with our new "stealing references"](#showcase-of-what-we-can-do-with-our-new-stealing-references)
  - [Yay! We've reinvented value semantics!](#yay-weve-reinvented-value-semantics)
- [How is it actually designed and called in Modern C++?](#how-is-it-actually-designed-and-called-in-modern-c)
  - [Classes of values](#classes-of-values)
  - ["Stealing references" are rrefs and they are lvalues 🤯](#stealing-references-are-rrefs-and-they-are-lvalues-)
- [That's all folks!](#thats-all-folks)

<!-- Talking head + overlay words ✅ -->
If you heard anything about modern C++, you've probably heard these words: value semantics, move semantics, rvalues, lvalues, rvalue references, rrefs etc.

<!-- Talking head ✅  -->
The concepts behind these words form the foundational principles behind Modern C++ as we know it.

<!-- Talking head + b-rolls being scared, magic, confusion ✅ -->
However, for various reasons these concepts are **very confusing to a lot of people**! I've seen people being scared of these things, treating them like magic, and having a lot of misunderstandings along the way. Navigating these waters effortlessly is a must for being able to design great software.

<!-- Talking head ✅ -->
So, today I'm here to tell you - **there is no black magic!**

<!-- Talking head + scooby doo meme of unveiling rrefs ✅ -->
Actually, to build a better understanding, we're about to design the value semantics mechanism from scratch using nothing more than the concepts that we already know from the previous videos, mostly references and function overloading!

<!-- Intro -->

# Why we care about value semantics
<!-- Talking head ✅ -->
So, in the spirit of "starting with why", I want us to start with an example that will illustrate why we need value semantics.

## Setting up the example to illustrate why we need value semantics
<!-- Talking head ✅ -->
But first we need to set the stage. Please bear with me.

<!-- Code -->
Imagine that we have [a custom type](classes_intro.md) `HugeObject` that **owns** some **big** chunk of memory.
<!--
`CPP_SETUP_START`
#include <cstddef>

std::byte *AllocateMemory(std::size_t length) {
  return new std::byte[length];
}
void FreeMemory(std::byte *ptr) { delete[] ptr; }

$PLACEHOLDER

int main() {
  HugeObject object_1;
  HugeObject object_2{100};
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` huge_object_1/main.cpp
`CPP_RUN_CMD` CWD:huge_object_1 c++ -std=c++17 -c main.cpp
-->
```cpp
#include <cstddef>

// 😱 Note that this struct does not follow best style.
// We only use it to illustrate the concept here.
struct HugeObject {
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length{data_length}, ptr{AllocateMemory(length)} {}

  ~HugeObject() { FreeMemory(ptr); }

  std::size_t length{};
  std::byte *ptr{};
};
```
<!-- ✅ -->
It allocates this memory using some magic function `std::byte* AllocateMemory(std::size_t length)` on creation and frees this memory using another magic function `FreeMemory(std::byte* ptr)` when it dies. Please see the lecture on [object lifecycle](object_lifecycle.md) if this part sounds confusing.

<!-- Talking head ✅ -->
> At this point it is not important how exactly the memory allocation happens. We will talk about it in the future. We just have to remember that allocating, copying and freeing memory are all time-wise costly operations.
> <!-- For the impatient, you can see example of such functions in the script, which is as always linked in the description below  -->
> But for the impatient, here is one way to allocate the memory that we need in real code.
> ```cpp
> // 😱 Please don't do this in real code, for illustration purposes only!
> // 💡 We will talk about how to properly allocate and free memory later!
> std::byte *AllocateMemory(std::size_t length) { return new std::byte[length]; }
> void FreeMemory(std::byte *ptr) { delete[] ptr; }
> ```

<!-- Code
Anyway, back to our code... ✅
 -->
We also want to be able to assign another `HugeObject` to our current object after creation for the sake of this example, so we also add an "assignment operator" to it. This "operator" is just a **function** with a certain signature that takes a reference to a `HugeObject` as an input and copies this incoming object's data into the current instance. You can think of such an operator as being just a function with a funky name.
<!--
`CPP_SETUP_START`
#include <cstddef>

std::byte *AllocateMemory(std::size_t length) {
  return new std::byte[length];
}
void FreeMemory(std::byte *ptr) { delete[] ptr; }

$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` huge_object_copy/object.hpp
-->
```cpp
#include <cstddef>
#include <algorithm>

// 😱 Note that this struct does not follow best style.
// We only use it to illustrate the concept here.
struct HugeObject {
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length{data_length}, ptr{AllocateMemory(length)} {}

  // Think of it as just a function with a funky name.
  HugeObject &operator=(const HugeObject &object) {
    if (this == &object) { return *this; }  // Do not self-assign.
    FreeMemory(ptr);  // In case we already owned some memory from before.
    length = object.length;
    ptr = AllocateMemory(length);
    std::copy(object.ptr, object.ptr + length, ptr);
    return *this;
  }

  ~HugeObject() { FreeMemory(ptr); }

  std::size_t length{};
  std::byte *ptr{};
};
```

<!-- Talking head in different location ✅ -->
> :bulb: :scream: It's important to note here that this struct does not follow good style, but it is useful to us to illustrate the concept of value semantics. There are important parts missing here, like some constructors, operators or the fact that it should be a class in the first place, so don't copy this code blindly.

<!-- Talking head ✅ -->
Finally, as the last step of our setup, let's say we also want to store these `HugeObject`s somewhere, in some storage class. It could be an `std::vector` or any other container, but for now we will just have a struct `HugeObjectStorage` that holds a `HugeObject` instance as a `member_object`.

<!-- Code changes ✅ -->
This allows us to put an existing `HugeObject` into a `HugeObjectStorage` object in the `main` function:
<!--
`CPP_SETUP_START`
#include "object.hpp"

$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` huge_object_copy/main.cpp
`CPP_RUN_CMD` CWD:huge_object_copy c++ -std=c++17 -c main.cpp
-->
```cpp
struct HugeObjectStorage {
  HugeObject member_object;
};

int main() {
  HugeObject object{100};
  HugeObjectStorage storage{};
  storage.member_object = object;
  return 0;
}
```
<!-- ✅ -->
Let's quickly talk about what happens here:
- We create an `object` in the `main` function scope (⚠️ costly)
- We create an empty `storage.member_object` for the `storage` object (✅ cheap)
- We copy the data from `object` to `storage.member_object` (⚠️ costly)
- The `storage.member_object` is destroyed, freeing its data memory
- The `object` is destroyed, freeing its data memory

<!-- Talking head or code highlight ✅ -->
At this point, we might observe that we actually **do not use `object` after it is copied into `storage.member_object`**! But both objects `object` and `storage.member_object` are **still maintained** and ready to use. Because of this the data is **copied**, costing us time.

## Value semantics enables ownership transfer
<!-- Talking head ✅  -->
This situation is *exactly* why value semantics exists! It exists to enable **ownership transfer** in addition to copying and borrowing the data which we have seen before.

# Let's re-design value semantics from scratch
<!-- Illustrate data stealing ✅ -->
Essentially we want a way to "steal" the data from `object` and give it to `storage.member_object` if we know that `object` will not use these data anymore. Let's design such a way!

## Can we avoid having this "stealing" behavior?
<!-- Talking head ✅ -->
Before designing such a way to steal the data, let's think if there is really no other way. Do we _really_ need to steal the data?

<!-- Illustrate ✅ -->
We see why we can't copy them - it's slow - but why can't we just set the `member_object.ptr` to point to the same memory as `object.ptr` instead?

<!-- Show code and illustrate ✅ -->
To answer this, let's just look at the destructor of our `HugeObject` class. Essentially it frees the memory that the pointer points to.

<!-- Talking head ✅ -->
If we have pointers of two objects pointing to the same memory, this memory will be freed twice. This is not allowed and will cause a runtime error!

## What does it mean to "steal" the data from an object?
<!-- Illustrate with animation, maybe some heist reference ✅ -->
So, we want to be able to steal the data. But what does it even mean to "steal" them? Well, essentially, it only really makes sense in the context of pointers. If we have a pointer `a` that points to some address `0x42424242` in memory and a pointer `b` "steals" its data it means that at the end of this operation the following is true:
- Data stays where it was **with no modification**
- Pointer `b` is set to point to `0x42424242` address
- Pointer `a` is set to `nullptr`

<!-- Talking head ✅ -->
The emphasis here is on the **need to modify the pointer that we steal from**!

<!-- Code ✅ -->
If we want to implement this behavior in our existing assignment operator we can't! :shrug: Our assignment operator takes a **`const` reference** which makes it impossible to modify the underlying object!

## Naïve implementation of "stealing"
<!-- Talking head ✅ -->
That is, however, easy enough to fix. Let's just forget everything that we talked about passing objects into functions for a second and just remove the `const` :wink:.

<!-- Code ✅-->
So let's now change the logic from "copying" to "stealing" by setting the data pointer of the incoming object to `nullptr`:
<!--
`CPP_SETUP_START`
#include <cstddef>

std::byte *AllocateMemory(std::size_t length) {
  return new std::byte[length];
}
void FreeMemory(std::byte *ptr) { delete[] ptr; }

// 😱 Note that this struct does not follow best style.
// We only use it to illustrate the concept here.
struct HugeObject {
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length{data_length}, ptr{AllocateMemory(length)} {}

  $PLACEHOLDER

  ~HugeObject() { FreeMemory(ptr); }

  std::size_t length{};
  std::byte *ptr{};
};

`CPP_SETUP_END`
`CPP_COPY_SNIPPET` huge_object_move/object.hpp
-->
```cpp
// 😱 This is not a good practice and is only here for illustrating purposes
HugeObject &operator=(HugeObject &object) {
  if (this == &object) { return *this; }  // Do not self-assign.
  FreeMemory(ptr);  // In case we already owned some memory from before.
  length = object.length;
  ptr = object.ptr;
  object.ptr = nullptr;  // Essential for "stealing"!
  return *this;
}
```

<!-- Talking head ✅ -->
Great! Now, here is what happens if we have a look at our old main function:
<!--
`CPP_SETUP_START`
#include "object.hpp"

struct HugeObjectStorage {
  HugeObject member_object;
};

$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` huge_object_move/main.cpp
`CPP_RUN_CMD` CWD:huge_object_move c++ -std=c++17 -c main.cpp
-->
```cpp
int main() {
  HugeObject object{100};
  HugeObjectStorage storage{};
  storage.member_object = object;
  return 0;
}
```
- We create an `object` in the `main` function scope (⚠️ costly)
- We create an empty `member_object` for the `storage` object (✅ cheap)
- We **steal** the data from `object` and set it to `member_object` (✅ cheap)
- The `storage.member_object` is destroyed, freeing its data memory
- The `object` is destroyed without cleaning any data as its `ptr` points to `nullptr`

<!-- Talking head ✅  -->
Stop for a second to admire what we've done! This is essentially how we can steal resources without copying! If we have huge data stored under some pointer, stealing will be much quicker than copying while still not introducing any issues when destroying our objects! And if you ever heard phrases like "we move these data" this is what it is about! We've just "moved" one object into another.

## Problems with the naïve solution
<!-- Talking head from a different view ✅ -->
However, the whole story is not as simple... While we *did* achieve what we wanted in this small example, we've made a pretty terrible decision. There is now no more way to do the following:

<!-- Overlay text ✅ -->
- We cannot copy the data anymore 😐. Sometimes we still might want to! We can only steal now.
- We cannot pass a temporary object anymore! This won't work!
  <!-- Code -->
  <!--
  `CPP_SKIP_SNIPPET`
  -->
  ```cpp
  storage.member_object = HugeObject{200};  // ❌ Does not compile.
  ```
  <!-- More code ✅ -->
  The reason for this is that we can't bind a non-const reference to a temporary object (try it yourselves to see the actual error)
  <!--
  `CPP_SKIP_SNIPPET`
  -->
  ```cpp
  int& answer = 42;  // ❌ Does not compile.
  ```

<!-- Talking head + photos of cake mom made + image of growing C++ ✅ -->
So the question is - how can we have our cake and eat it at the same time? We will have to extend our language for this (which is exactly what happened with C++11).

## Better solution - add a new "stealing reference" type to the language!
<!-- Talking head ✅ -->
If we agree to add new things to the language, the answer to our problem is actually genius in its simplicity - we just invent a new type that means "reference that can be stolen from"!

<!-- Overlay text or code ✅ -->
Given any type, `HugeObject` in our case, we have a reference type for it: `HugeObject&`. By analogy, let's name our new type `HugeObject&&` and define it as such that it can bind to objects that we are allowed to steal from.

<!-- Talking head moving to code ✅ -->
This enables us to just write a different assignment operator overload for this new `&&` reference type. So writing something like this should be possible:

<!--
`CPP_SETUP_START`
#include <cstddef>

std::byte *AllocateMemory(std::size_t length) {
  return new std::byte[length];
}
void FreeMemory(std::byte *ptr) { delete[] ptr; }

$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` huge_object_copy_move/object.hpp
-->
```cpp
#include <algorithm>

struct HugeObject {
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length{data_length}, ptr{AllocateMemory(length)} {}

  HugeObject &operator=(const HugeObject &object) {
    if (this == &object) { return *this; }  // Do not self-assign.
    FreeMemory(ptr);  // In case we already owned some memory from before.
    length = object.length;
    ptr = AllocateMemory(length);
    std::copy(object.ptr, object.ptr + length, ptr);
    return *this;
  }

  HugeObject &operator=(HugeObject &&object) {
    if (this == &object) { return *this; }  // Do not steal from ourselves.
    FreeMemory(ptr);  // In case we already owned some memory from before.
    length = object.length;
    ptr = object.ptr;
    object.ptr = nullptr;
    return *this;
  }

  ~HugeObject() { FreeMemory(ptr); }

  std::size_t length{};
  std::byte *ptr{};
};
```
<!-- Voiceover code ✅
- Highlight new operator
- Highlight both operators
- Highlight const and copying
- Highlight && and stealing
 -->
Here, the two operators are nearly the same with the sole significant difference of one taking a constant reference and copying the data, while the other is taking "reference that can be stolen from" and then, well, stealing the data.

## We also design how the "stealing references" are created from other objects
<!-- Talking head ✅ -->
We now have different implementations and the compiler should be able to pick the appropriate one by using the same rules as it uses for any other [function overload resolution](functions.md#function-overloading---writing-functions-with-the-same-names)! There is just one thing missing... How are the `&&` references created?

<!-- Talking head from a different view ✅  -->
Ok, so we do need to design how our new `&&` reference type is created from various objects but then we are done! We mostly care about these two use cases:
<!-- Overlay text ✅ -->
- Passing temporary objects like `HugeObject{}`
- Passing objects that we as programmers know will not be in use anymore and so can be stolen from

### "Stealing references" from temporary objects
<!-- Let's start with the temporaries ✅ -->
<!-- Code -->
For temporary objects we can postulate that they can be bound to our `&&` references, and that the compiler always picks the `&&` reference overload of a function if a temporary is provided as a parameter:
```cpp
void Blah(int&) {}

void Blah(int&&) {}

int main() {
  int&& answer = 42;  // Can be bound to a temporary
  Blah(42);  // The compiler picks Blah(int&&)
}
```
> :bulb: Feel free to print something from these functions to make sure they work as intended.

### "Stealing references" from existing objects already stored as variables
<!-- Talking head ✅ -->
For the objects stored as normal variables but ones that we know will not be used anymore, we can add a function that converts any object into its `&&` reference.

<!-- Overlay text or code ✅ -->
We could call this function `CanBeStolenFrom(object)` but in C++11 this function has a name `std::move(object)`.

<!-- Talking head
Maybe overlay providing different types and getting && ones out ✅
-->
This naming might be slightly confusing as it does not actually *do* anything - it just makes a `&&` reference of any type we provide into it. This then serves as an indication that the resources of this object can be stolen.

<!-- Talking head ✅ -->
We will skip the actual implementation here for now as it is not important to understand the concept but feel free to look it up on [cppreference.com](https://en.cppreference.com/w/cpp/utility/move).

### Showcase of what we can do with our new "stealing references"
<!-- Code ✅ -->
These new `&&` reference types enable us to write the code like this:
<!--
`CPP_SETUP_START`
#include "object.hpp"

struct HugeObjectStorage {
  HugeObject member_object;
};

$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` huge_object_copy_move/main.cpp
`CPP_RUN_CMD` CWD:huge_object_copy_move c++ -std=c++17 -c main.cpp
-->
```cpp
int main() {
  HugeObject object{100};
  HugeObjectStorage storage{};
  storage.member_object = object;
  storage.member_object = HugeObject{200};
  storage.member_object = std::move(object);
  return 0;
}
```
<!-- Highlight ✅ -->
All of the behaviors from before are present here!
- We **copy** `object` into `storage.member_object`
- We **move** a temporary `HugeObject{200}` into `storage.member_object`
- We **move** the existing `object` into `storage.member_object`

## Yay! We've reinvented value semantics!
<!-- Talking head + celebrations ✅  -->
That is it! Conceptually, we've just reinvented, at least conceptually, the whole thing that is called value semantics in modern C++! At this point, it should be pretty clear what happens in the previous examples and why we need all of this.

<!-- Text overlay ✅  -->
There is a couple of things that logically follow from what we've just done:
- Moving objects only makes sense if they own some resource through a pointer. All the other data is simply copied over, yielding no benefit.
- We should never use the object that has been "moved from" as its resources are left in some undefined but valid state.

# How is it actually designed and called in Modern C++?
<!-- Talking head ✅ -->
Not to spoil all the fun, but there is one final thing before we can close this chapter. Let's return from our fairyland back to reality and make sure we are aligned with how things actually *are* in Modern C++. Our definition of this new type of reference was a bit hand-wavy, C++ standard of course defines things much more strictly.

## Classes of values
<!-- Text overlay ??? -->
Largely speaking there are a couple of different **kinds** of values:
- `lvalues` - with the name derived from "left value", historically anything that could be found on the left of the `=` operator. Nowadays, anything that has a name and an address in memory
- `prvalue` - with its name derived from "pure right value", maps most precisely to what we called a "temporary" before. These values don't have a name and a permanent address in memory and usually cannot appear on the left of the `=` operation
- `xvalues` - so-called e**X**piring values: mostly `lvalues` after `std::move`, i.e., those whose resources can be stolen
- `rvalues` - historically everything that is not an `lvalue`, nowadays, either an `xvalue` or an `prvalue`.

<!-- Talking head + overlay of cppreference ✅ -->
The value categories are quite nuanced in C++, but you should now be prepared to be able to read all about them on the [related page of the cppreference.com](https://en.cppreference.com/w/cpp/language/value_category) :wink:

## "Stealing references" are rrefs and they are lvalues 🤯
<!-- Talking head ✅ -->
The "stealing" `&&` references that we (and the authors of C++11 standard) have invented are usually referred to as `rrefs` because they are `refs` that binds to things that are `rvalues` and so the name is a shortcut for "rvalue references".

<!-- Talking head ✅ -->
There is also one important quirk of `rrefs` to be aware of. If we store an `rref` into a variable, **it is an `lvalue` and not an `rvalue`**! So, by default, such a value, when passed to a function, will choose the "lvalue reference" overload! This means that we have to use `std::move` on a named `rref` in order to choose a correct `rref` overload. It might sound a bit confusing, so let me illustrate:

<!-- Code overlay -->
```cpp
#include <iostream>

void Blah(int&) {
  std::cout << "&" << std::endl;
}

void Blah(int&&) {
  std::cout << "&&" << std::endl;
}

int main() {
  int&& answer = 42;  // answer is an lvalue that stores an rvalue reference!
  Blah(42);                 // Prints "&&"
  Blah(answer);             // Prints "&"
  Blah(std::move(answer));  // Prints "&&"
  return 0;
}
```
The function `Blah` is overloaded for taking lvalue references and rvalue references. In our main function we create an rvalue reference from an integer literal `42` and then pass it in various ways to the `Blah` function. If we compile and run this code we will observe that:
- Passing `42` will bind to the rvalue reference overload
- Passing `answer` will bind to the lvalue reference overload because `answer` is an lvalue that holds an rvalue reference
- Passing `std::move(answer)` will allow binding to the rvalue reference overload again

# That's all folks!
<!-- Talking head ✅ -->
Now we're done with this topic for good! We really do know close to everything there is to know about value semantics!

<!-- Maybe again overlay illustrations ✅ -->
We've learned that sometimes we want to transfer ownership of objects by moving the data as opposed to copying or borrowing them and, even more, we've designed the whole solution to achieve this, which, coincidentally is exactly the way it is implemented in the C++11 and later.

<!-- Talking head -->
So hopefully by this time we are all on the same page that the whole thing is definitely **not black magic** and is nothing else than a piece of clever and elegant engineering.

<!--
Thanks for watching! If you think this way of explaining this concept is worth your time, then do share this video with your friends, subscribe and leave any comment under this video so that I know how these land with you!

There is always more to watch on my channel but apart from that, thanks again and see you in the next one! Bye!
 -->
