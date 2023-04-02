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
    - [From temporary objects](#from-temporary-objects)
    - [From existing objects already stored as variables](#from-existing-objects-already-stored-as-variables)
    - [Showcase of what we can do with our new "stealing references"](#showcase-of-what-we-can-do-with-our-new-stealing-references)
  - [Yay! We've reinvented value semantics!](#yay-weve-reinvented-value-semantics)
- [How is it actually designed and called in Modern C++?](#how-is-it-actually-designed-and-called-in-modern-c)
  - [Classes of values](#classes-of-values)
  - ["Stealing references" are rrefs and they are lvalues 🤯](#stealing-references-are-rrefs-and-they-are-lvalues-)
- [That's all folks!](#thats-all-folks)


If you heard anything about modern C++, you've probably heard these words: value semantics, move semantics, rvalues, lvalues, rvalue references, rrefs etc.

The concepts behind these words form the foundational principles behind Modern C++ as we know it.

However, for various reasons these concepts are *very* confusing to *a lot* of people! I've seen people being scared of these things, treating them like magic, and having a lot of misunderstandings along the way. Navigating these waters effortlessly is a must for being able to design great software.

So, today I'm here to tell you - **there is no black magic!**

Actually, to build a better understanding, we're about to design the value semantics mechanism from scratch using the concepts that we already know from the previous videos, mostly references and function overloading!

<!-- Intro -->

# Why we care about value semantics
So, in the spirit of "starting with why", I want us to start with an example that will illustrate why we need value semantics.

## Setting up the example to illustrate why we need value semantics
But first we need to set the stage. Please bear with me.

Imagine that we have [a custom type](classes_intro.md) `HugeObject` that **owns** some **big** chunk of memory.
```cpp
class HugeObject {
public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length{data_length}, data_ptr{AllocateMemory(length)} {}

  ~HugeObject() { FreeMemory(data_ptr); }

private:
  std::size_t length{};
  std::byte *ptr{};
};
```
It allocates this memory using some magic function `std::byte* AllocateMemory(std::size_t length)` on creation and frees this memory using another magic function `FreeMemory(std::byte* ptr)` when it dies. Please see the [object lifecycle](object_lifecycle.md) lecture if this part sounds confusing.

> At this point it is not important how exactly the memory allocation happens. We will talk about it in the future. We just have to remember that allocating, copying and freeing memory are all time-wise costly operations. But for the impatient, here is one way to allocate the memory that we need in real code.
> ```cpp
> // 😱 Please don't do this in real code, for illustration purposes only!
> // 💡 We will talk about how to properly allocate and free memory later!
> std::byte *AllocateMemory(std::size_t length) { return new std::byte[length]; }
> void FreeMemory(std::byte *ptr) { delete[] ptr; }
> ```

We also want to be able to assign another `HugeObject` to our current object after creation for the sake of this example, so we also add an "assignment operator" to it. This "operator" is just a **function** with a certain signature that takes a reference to a `HugeObject` as an input and copies this incoming object's data into the current instance. You can think of such an operator as being just a function with a funky name.
```cpp
// 😱 Note this class does not follow best style.
// We only use it to illustrate the concept here
class HugeObject {
public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length{data_length}, data_ptr{AllocateMemory(length)} {}

  // Think of it as just a function with a funky name.
  HugeObject &operator=(const HugeObject &object) {
    if (this == &object) { return *this; }  // Do not self-assign.
    FreeMemory(data_ptr);  // In case we already owned some memory from before.
    length = object.length;
    data_ptr = AllocateMemory(length);
    std::copy(object.data_ptr, object.data_ptr + length, data_ptr);
    return *this;
  }

  ~HugeObject() { FreeMemory(data_ptr); }

private:
  std::size_t length{};
  std::byte *ptr{};
};
```

> :bulb: :scream: Note that this struct does not follow good style, but it is useful to us to illustrate the concept of value semantics. There are important parts of this class missing, like some constructors, operators etc., so don't copy this code blindly.

Finally, as the last step of our setup, let's say we also want to store these `HugeObject`s somewhere, in some storage class. It could be an `std::vector` or any other container, but for now we will just have a struct `HugeObjectStorage` that holds a `HugeObject` instance as a `member_object`.

This allows us to put an existing `HugeObject` into a `HugeObjectStorage` object in the `main` function:
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
Let's quickly talk about what happens here:
- We create an `object` in the `main` function scope (⚠️ costly)
- We create an empty `storage.member_object` for the `storage` object (✅ cheap)
- We copy the data from `object` to `storage.member_object` (⚠️ costly)
- The data is freed from the `storage.member_object`
- The data is freed from the `object`

At this point, we might observe that we actually **do not use `object` after it is copied into `storage.member_object`**! But both objects `object` and `storage.member_object` are **still maintained**. Because of this the data is **copied**, costing us time.

## Value semantics enables ownership transfer
This situation is *exactly* why value semantics exists! It exists to enable **ownership transfer** in addition to copying and borrowing the data which we have seen before.

# Let's re-design value semantics from scratch
Essentially we want a way to "steal" the data from `object` and give it to `storage.member_object` if we know that `object` will not use these data anymore. Let's design such a way?

## Can we avoid having this "stealing" behavior?
Some of you might ask a question - why do we _really_ need to steal the data? We see why we can't copy them - it's slow - but why can't we just set the `member_object.ptr` to point to the same memory as `object.ptr` instead?

To answer this, let's just look at the destructor of our `HugeObject` class. If we have pointers of two objects pointing to the same memory, this memory will be freed twice. This is not allowed and will cause a runtime error!

## What does it mean to "steal" the data from an object?
<!-- Illustrate with animation -->
So, we want to be able to steal the data. But what does it even mean to "steal" them? Well, essentially, it only really makes sense in the context of pointers. If we have a pointer `a` that points to some address `0x42424242` in memory and a pointer `b` "steals" its data it means that at the end of this operation the following is true:
- Data stays where it was **with no modification**
- Pointer `b` is set to point to `0x42424242` address
- Pointer `a` is set to `nullptr`

<!-- Talking head -->
The emphasis here is on the **need to modify the pointer that we steal from**!

<!-- Code -->
If we want to implement this behavior in our existing assignment operator we can't! :shrug: Our assignment operator takes a **`const` reference** which makes it impossible to modify the underlying object!

## Naïve implementation of "stealing"
That is, however, easy enough to fix. Let's just forget everything that we talked about passing objects into functions for a second and just remove the `const` :wink:. This allows us to change the incoming object, so let's now change the logic from "copying" to "stealing":
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

Great! Now, this is what happens in our new `main` function:
- We create an `object` in the `main` function scope (⚠️ costly)
- We create an empty `member_object` for the `storage` object (✅ cheap)
- We **steal** the data from `object` and set it to `member_object` (✅ cheap)
- The data is freed from the `storage.member_object`
- The `object` is destroyed without cleaning any data as its `ptr` points to `nullptr`

<!-- Talking head -->
Stop for a second to admire what we've done! This is essentially how we can steal resources without copying! If we have huge data stored under some pointer, stealing will be much quicker than copying! And if you ever heard phrases like "we move these data" this is what it is about! We've just "moved" one object into another.

## Problems with the naïve solution
However, the whole story is not as simple... While we *did* achieve what we wanted in this small example, we've made a pretty terrible decision. There is now no more way to do the following:
- We cannot copy the data anymore 😐. Sometimes we still might want to! We can only steal now.
- We cannot pass a temporary object anymore! This won't work!
  <!-- Code -->
  ```cpp
  storage.member_object = HugeObject{200};  // ❌ Does not compile.
  ```
  <!-- More code -->
  The reason for this is that we can't bind a non-const reference to a temporary object (try it yourselves to see an error)

<!-- Talking head -->
So the question is - how can we have our cake and eat it at the same time? We will have to extend our language for this (which is exactly what happened with C++11).

## Better solution - add a new "stealing reference" type to the language!
<!-- Talking head -->
If we agree to add new things to the language, the answer to our problem is genius in its simplicity - we just invent a new type that means "reference that can be stolen from"!

Given any type, `HugeObject` in our case, we have a reference type for it: `HugeObject&`. By analogy, let's name our new type `HugeObject&&` and define it as such that it can bind to objects that we are allowed to steal from.

This enables us to just write a different assignment operator overload for this new `&&` reference type. So writing something like this should be possible:
```cpp
struct HugeObject {
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length{data_length}, ptr{AllocateMemory(length)} {}

  HugeObject &operator=(const HugeObject &object) {
    if (this == &object) { return *this; }  // Do not self-assign.
    FreeMemory(ptr);  // In case we already owned some memory from before.
    length = object.length;
    ptr = AllocateMemory(length);
    std::copy(object.ptr.begin(), object.ptr.begin() + length, ptr.begin());
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
Here, the two operators are nearly the same with the sole significant difference of

## We also design how the "stealing references" are created from other objects
Now we just need to design how our new `&&` reference type is created from various objects and we are done! We care about two use cases - passing temporary objects like `HugeObject{}` and passing objects that we as programmers know will not be in use anymore and so can be stolen from.

### From temporary objects
For temporary objects we can postulate that they can be bound to our `&&` references:
```cpp
int&& answer = 42;
```
and that the compiler always picks the `&&` reference overload if a temporary is provided as a parameter.

### From existing objects already stored as variables
For the objects stored as a normal variable but ones that we know will not be used anymore, we can add a function that converts any object into its `&&` reference. We could call this function `CanBeStolenFrom(object)` but in C++11 this function has a name `std::move(object)`.

This naming might be slightly confusing as it does not actually *do* anything - it just casts the type to our `&&` reference as an indication that the resources of this object can be stolen. We will skip the actual implementation here for now as it is not important to understand the concept but feel free to look it up on [cppreference.com](https://en.cppreference.com/w/cpp/utility/move).

### Showcase of what we can do with our new "stealing references"
These new `&&` reference types enable us to write the code like this:
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
All of the behaviors from before are present here!
- We **copy** `object` into `member_object`
- We **move** a temporary `HugeObject{200}` into `storage.member_object`
- We **move** the existing `object` into `storage.member_object`

## Yay! We've reinvented value semantics!
That is it! Conceptually, we've just invented the whole thing that is called value semantics in modern C++! At this point, it should be pretty clear what happens in the previous examples and why we need all of this. Of course the actual implementation of this to life is a monstrous effort but the ideas are not _really_ that complicated, are they?

There is a couple of things that logically follow from what we've just done:
- Moving objects only makes sense if they own some resource through a pointer. All the other data is simply copied over, yielding no benefit.
- We should never use the object that has been "moved from" as its resources are left in some undefined but valid state.

# How is it actually designed and called in Modern C++?
One final thing before we close here. Let's return from our fairyland back to reality and make sure we are aligned with how things actually *are* in Modern C++. Our definition of this new type of reference was a bit hand-wavy, C++ standard of course defines things much more strictly.

## Classes of values
Largely speaking there are a couple of different **kinds** of values:
- `lvalues` - with the name derived from "left value", historically anything that could be found on the left of the `=` operator. Nowadays, anything that has a name and an address in memory
- `prvalue` - with its name derived from "pure right value", maps most precisely to what we called a "temporary" before. These values don't have a name and a permanent address in memory and usually cannot appear on the left of the `=` operation
- `xvalues` - so-called e**X**piring values: `lvalues` after `std::move`, i.e., those whose resources can be stolen
- `rvalues` - historically everything that is not an `lvalue`, nowadays, either an `xvalue` or an `prvalue`.

The value categories are quite nuanced in C++, but you should now be prepared to be able to read all about them on the [related page of the cppreference.com](https://en.cppreference.com/w/cpp/language/value_category) :wink:

## "Stealing references" are rrefs and they are lvalues 🤯
The "stealing" `&&` reference that we (and the authors of C++11 standard) have invented is usually referred to as an `rref` because it is a `ref` that binds to things that are `rvalues` and so it is a shortcut for "rvalue reference".

There is also one important quirk of `rrefs` to be aware of. If we store an `rref` into a variable, **it is an `lvalue` and not an `rvalue`**! So, by default, such a value, when passed to a function, will choose the "lvalue reference" overload! This means that we have to use `std::move` on a named `rref` in order to choose a correct `rref` overload. It might sound a bit confusing, so let me illustrate:

```cpp
#include <iostream>

void Blah(int&&) {
  std::cout << "rvalue reference" << std::endl;
}

void Blah(int&) {
  std::cout << "lvalue reference" << std::endl;
}

int main() {
  int&& answer = 42;  // answer is an lvalue that stores an rvalue reference!
  Blah(42);                 // Prints "rvalue reference"
  Blah(answer);             // Prints "lvalue reference"
  Blah(std::move(answer));  // Prints "rvalue reference"
  return 0;
}
```
The function `Blah` is overloaded for taking lvalue references and rvalue references. In our main function we create an rvalue reference from an integer literal `42` and then pass it in various ways to the `Blah` function. If we compile and run this code we will observe that:
- Passing `42` will bind to the rvalue reference overload
- Passing `answer` will bind to the lvalue reference overload because `answer` is an lvalue that holds an rvalue reference
- Passing `std::move(answer)` will allow binding to the rvalue reference overload again

# That's all folks!
And that's kind of it! Now we really know close to everything there is to know about value semantics!

We've learned that sometimes we want to transfer ownership of objects by moving the data as opposed to copying or borrowing them and, even more, we've designed the whole solution to achieve this, which, coincidentally is exactly the way it is implemented in the C++11 and later.

So hopefully by this time we are all on the same page that the whole thing is **not black magic** and is nothing else than a piece of clever and elegant engineering.

<!--
Thanks for watching! If you think this way of explaining this concept is worth your time, then do share this video with your friends, subscribe and leave any comment under this video so that I know how these land with you!

There is always more to watch on my channel but apart from that, thanks again and see you in the next one! Bye!
 -->
