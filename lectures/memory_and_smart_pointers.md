Memory and smart pointers
--

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

- [Memory and smart pointers](#memory-and-smart-pointers)
- [Memory management in C++](#memory-management-in-c)
- [Memory allocation under the hood](#memory-allocation-under-the-hood)
  - [The stack](#the-stack)
  - [Why not keep persistent data on the stack](#why-not-keep-persistent-data-on-the-stack)
  - [The heap](#the-heap)
  - [Typical pitfalls with data allocated on the heap](#typical-pitfalls-with-data-allocated-on-the-heap)
    - [Forgetting to call `delete`](#forgetting-to-call-delete)
    - [Performing shallow copy by mistake](#performing-shallow-copy-by-mistake)
    - [Calling a wrong `delete`](#calling-a-wrong-delete)
    - [Returning owning pointers from functions](#returning-owning-pointers-from-functions)
  - [Best practices for memory safety](#best-practices-for-memory-safety)
- [Smart pointers to ease our life](#smart-pointers-to-ease-our-life)
  - [`std::unique_ptr`](#stdunique_ptr)
  - [`std::shared_ptr`](#stdshared_ptr)
  - [Smart pointers are polymorphic](#smart-pointers-are-polymorphic)
- [Summary](#summary)


Alongside with understanding move semantics that we've [already looked at](move_semantics.md), it is also important to understand how memory is allocated and how to use smart pointers to keep that memory allocation safe.

So this is exactly what we'll focus on today: how memory is allocated and freed when we create and destroy variables in various ways, why manually dealing with memory can quickly become a mess, and how smart pointers help to avoid this mess.

<!-- Intro -->

## Memory management in C++
We'll start by talking about memory a bit more in-depth than we did until now. When we create variables in our code they have to be allocated somewhere. Which essentially means that they need to find a big-enough free slot in memory to fit into. Once we don't use these variables, we want them to free the memory that they occupied so that it could be reused, otherwise we might run out of free memory and be unable to create any new variables.

This act of allocating and freeing memory is usually called **"memory management"**.

If you have experience with Python, Go, Java, or other similar languages, you are used to leave memory management to professionals, i.e., to the built-in automatic **"garbage collection"** system. This system runs in the background and searches for the variables that are not used anymore and frees their memory. While this is convenient in terms of not needing to think about memory on our side, this is also slower as such a scan has to run repeatedly at runtime. Furthermore it is hard to predict when these scans will happen and how long they will take so garbage collected languages are not well-suited for safety-critical applications.

What makes C++ suited exactly for such safety-critical applications is that it stays away from any form of automatic memory management altogether. It just gives tools to manage memory on our own. And while it might not sounds like a benefit to you, the fact that we can decide how and when to manage our memory is really what makes C++ so loved. The beauty of C++ is that the way it is designed, alongside with its Standard Template Library (STL), allows us to write extremely efficient code while making sure that the memory is allocated and freed correctly.

## Memory allocation under the hood
Before we talk about the tools we have at our disposal to manage memory in modern C++, let's briefly focus on what happens under the hood when we want to create or destroy a variable. And while common, this task is anything but trivial.

The variables we allocate can be of vastly different sizes, lifetime durations, and frequency of allocation. Furthermore, we usually want to avoid "fragmentation" of our memory, i.e., we don't want to have many small "holes" between allocated variables. If we have those, it might be that we have a lot of free memory in the absolute sense, but are unable to find a continuous chunk of memory to allocate some larger variable. This means that ideally we want to find for each variable being allocated the smallest free memory slot it fits into.

Solving this problem in general is very hard! Think about it, we can't scan **all** the memory at our disposal exhaustively every time we want to allocate a variable, that would take too long! But we do have some more information about how we allocate our data and it helps us immensely!

For example, we might notice that we allocate data with **automatic storage duration**, i.e., variables that live within scopes, much more often than data that persist throughout the whole program lifetime. Furthermore, such data get deallocated very soon after they were allocated. And we can even observe that such variables are mostly on the smaller size in terms of how much memory they require.

This simplifies our task immensely! So let's focus on these variables first and deal with those that must persist for a longer time later.

Because the number of our variables within any scope is relatively small and the variables are small in size we argue that for any program all of these scoped variables would fit in a relatively small continuous chunk of memory.

### The stack
So we designate a small part of our memory, typically 8MB, at least on Linux and MacOS, to managing such local variables. Furthermore, because the variables get de-allocated at the end of the scope, we use a stack-like data structure for managing where to allocate such variables. Just like a stack of coins allows putting and removing coins on and from the top of this stack, such data structure supports **putting** and **popping** variables at the **end** of the currently occupied stack space.

🚨 This mechanism is used under the hood for all the local variables we create and destroy in our C++ programs.

And just to get some more intuition let's look at it a bit more precisely. We'll look at example that does not follow any of the best practices we followed throughout this course, furthermore it leads to an undefined behavior, so please don't copy this example to any real projects. But it does serve us well to build the intuition of how stack works.

In this example, we allocate an `int` with a value of `2` on a stack, followed by a variable of type `int*` that points to a `nullptr`. Then a new scope starts and we allocate two integers in a static array without initializing them. This is just for illustration purposes, so please don't use such arrays in real life. We set the values in that array in the next two lines. In C++, standard C-style arrays are equivalent to pointers and we can set `ptr` to point to the start of our `array` data. This is not a great idea in modern C++, but is a good indicator of where things are on a stack for us. If we now print these values we'll get the expected output of `42` followed by `23`. However, everything changes once we leave the inner scope as once we leave that scope all of the variables allocated while in it get popped off the stack. Which means that now `ptr` points to some data that we do not control. This leads to undefined behavior and if we run this program it might print anything that it finds under that address.
```cpp
#include <iostream>

int main() {
  int size = 2;
  int* ptr = nullptr;
  {
    int array[size];  // 😱 Don't use C-style arrays!
    array[0] = 42;
    array[1] = 23;
    ptr = array;
    std::cout << "Before stack cleanup.\\n";
    for (int i = 0; i < size; ++i) {
      std::cout << ptr[i] << std::endl;
    }
  }
  // 😱 Code below leads to undefined behavior!
  std::cout << "After stack cleanup.\\n";
  for (int i = 0; i < size; ++i) {
    std::cout << ptr[i] << std::endl;
  }
  return 0;
}
```

This way of dealing with allocating and freeing variables is amazing for local data. As long as the data does not need to persist beyond the end of the scope, this data structure is very efficient! We always know exactly where to allocate new memory and which memory to free at constant time, no additional operations needed!

<!-- Add the stack example -->

### Why not keep persistent data on the stack
Many things change the moment we want our data to persist beyond the end of the scope. Pause for a moment and think if we can keep such data on the stack too! ⏱️

And if we think long enough about it we will come up with a couple of issues! Let's for a moment assume that we could keep a variable in our stack for a longer time. And let's also assume that we allocated it in the middle of some scope, with some normal stack variables allocated before and after it. By the end of the scope we must free all memory of those variables. Which essentially means that we would need to pop all the variables above our persistent variable, then copy our variable somewhere, pop the rest of the normal variables and copy our persistent variable back. Not only this is not elegant but we also had to copy a potentially large chunk of memory around, which is slow. And we don't like slow!

As you can imagine, the situation would be even worse if there would be more of these persistent variables we wanted to keep track of, which is actually typically the case.

So clearly we want to keep our stack quite small and used exclusively for any local variables we are using and find another way to find a place to allocate potentially large persistent data.

### The heap
Such a place needs to be able to find free chunks of memory of any size, from small to very large. Also, allocations should depend as little as possible on the amount of data allocated before or after. Finally, such allocations should generally be made explicitly by the programmer as only they know if the particular data should persist and for how long.

When we speak about allocating these data, we usually call these data being allocated **"on the heap"**. For those of you who know data structures you might think that this is related to the "heap" data structure - a binary tree with the parent having a larger or smaller key value than its children but that seems to be not the case, although the evidence is murky on this one. If we trust Donald Knuth (one of the gods of algorithm design), this name is just coincidental. But I could not find any definitive proof for either side, so if you have it, please leave it in the comments.

Anyway, the easiest way to think about the heap is an intuitive one - imagine a heap of stuff, like coins. Every coin represents a place where we can store our variable that we want to allocate, and let's say that its denomination indicates the amount of free space available. So we look through our heap to find a coin that represents space big enough for our variable and store it there. This obviously takes some time but once such a place is found the memory can stay there until we don't need it anymore. This is a very inaccurate analogy as there is much more stuff happening under the hood but it gives a decent intuition nevertheless and that is all I'm aiming for here.

To allocate memory on the heap in C++ we use `new` and `new[]` operators. First one to allocate a single variable, second one to allocate an array of those. In order to free this memory we need to then call `delete` or `delete[]` respectively on these variables.

To have a bit more hands-on experience, let us see how our previous example changes if we use `new[]` instead of allocating a C-style array directly on the stack. We start by pushing the `size` and the `ptr` to the stack and then enter the inner scope just as before. What is not as before is that we now use the `new[]` operator to allocate our array on the heap. Just as before, by default, it stores garbage data. However, the pointer to these data, that we here still call `array`, is still stored on the stack! Now we update the values in our array and set the `ptr` to point to the same address as the `array` which allows us to print the values using the `ptr` variable. When we leave the scope, only the `array` variable is cleaned-up from the stack, but the `ptr` variable still points to our data, which still lives on the heap. So we still can print all the values we stored without any undefined behavior. Finally, we can explicitly free the memory using `delete[]` operator on our `ptr` variable and at the end of the program the stack empties itself.
```cpp
#include <iostream>

int main() {
  int size = 2;
  int* ptr = nullptr;
  {
    // 😱 Don't use unprotected new and new[]!
    int* array = new int[size];
    array[0] = 42;
    array[1] = 23;
    ptr = array;
    std::cout << "Before stack cleanup.\n";
    for (int i = 0; i < size; ++i) {
      std::cout << ptr[i] << std::endl;
    }
  }
  std::cout << "After stack cleanup.\n";
  for (int i = 0; i < size; ++i) {
    std::cout << ptr[i] << std::endl;
  }
  delete[] ptr;  // 😱 What points to our data?
  return 0;
}
```

### Typical pitfalls with data allocated on the heap
There is a number of common pitfalls when using heap-allocated data. If you followed my lectures for a while, you know that I am not a fan of taking care of things manually, I don't really trust myself on that :wink:. If we use `new` and `delete` operators like in the example before, we have to be very careful with them!

#### Forgetting to call `delete`
If we forget to call `delete` on the data that we allocated with `new`, we get a memory leak as the memory we allocated will never be freed!
<center>
<video src="images/destructor.mp4" width=50% style="margin: 0.5rem" autoplay muted/>
</center>

#### Performing shallow copy by mistake
If we allocate two chunks of data on the heap, each will have a pointer pointing to it. We need these pointers to free these data. One common mistake when wanting to copy the data is to assign one pointer to another.
```cpp
int main() {
  int* object = new int{42};
  int* other_object = new int{23};
  object = other_object;
  // 😱 How to free the memory?
  return 0;
}
```

But this **does not copy the data**, this only copies the pointer! We have two issues here!
- We now have two pointers that point the the same data! If we `delete` both of them we will get a runtime error `double free or corruption` that hints that we tried to free the memory twice.
- At the same time, we lost access to part of our data altogether and cannot remove it at all, which is another memory leak!
<center>
<video src="images/dangling_pointer.mp4" width=50% style="margin: 0.5rem" autoplay muted/>
</center>

#### Calling a wrong `delete`
Even if we _do_ call a `delete` we can still mess things up. If we allocate an array using the `new[]` operator and free it with a normal `delete` we will only free the memory under the first element of our array, so, memory leak again!

#### Returning owning pointers from functions
But it gets worse! If we don't follow best practices, we might have **no** way of knowing if and how we should free the data under a given pointer! :scream:

Imagine we have a bunch of functions that all return exactly the same type, `int*`. It is impossible to know if we need to free the memory that the returned value points to by just looking at that pointer alone! And yes, we might get lucky and these functions might all have descriptive names, of course. In this case, if we trust the names, we know which pointers we must free and which `delete` operator to use.
```cpp
namespace {

struct Pool {
  static int* GetPtr() { return &data_; }
  inline static int data_{};
};

int* AllocateVariable() {
  return new int;
}

int* AllocateArray(int size) {
  return new int[size];
}

int* BorrowDataFromPool() {
  return Pool::GetPtr();
}

}  // namespace

int main() {
  auto* ptr_1 = AllocateVariable();
  auto* ptr_2 = AllocateArray(20);
  auto* ptr_3 = BorrowDataFromPool();
  delete ptr_1;
  delete[] ptr_2;
  return 0;
}
```
This way we know that we should use `delete` to free the memory of a single allocated variable under `ptr_1`, `delete[]` to free memory allocated to store an array pointer to by `ptr_2` and that we should not touch the memory under `ptr_3` as that memory will be freed by the `Pool` struct.

However, life is rarely as accommodating in the real world. Functions might change their implementation with time without updating their names to adequately reflect these changes! Or they might not have readable names in the first place! This way we _must_ look into the implementation of these function to make out what to do!
```cpp
namespace {

struct Pool {
  static int* GetPtr() { return &data_; }
  inline static int data_{};
};

int* Foo() {
  return new int;
}

int* Bar(int size) {
  return new int[size];
}

int* Buzz() {
  return Pool::GetPtr();
}

}  // namespace

int main() {
  auto* ptr_1 = Foo();
  auto* ptr_2 = Bar(20);
  auto* ptr_3 = Buzz();
  delete ptr_1;
  delete[] ptr_2;
  return 0;
}
```
This is already quite annoying, but we still technically **can** find out if we should free the memory and with which operator in each of these cases.

Now, if you remember the lectures about [libraries](headers_and_libraries.md) you know that the actual implementation can be hidden from us in a compiled library in such a way that the only thing we see is the declaration of the function. Now there is no way for us to know what we should do with the pointers we get!
`lib.hpp`
```cpp
int* Foo();
int* Bar(int number);
int* Buzz();
```
`main.cpp`
```cpp
#include "lib.hpp"

int main() {
  auto* ptr_1 = Foo();
  auto* ptr_2 = Bar(20);
  auto* ptr_3 = Buzz();
  // 😱 What should we do with these pointers?
  return 0;
}
```

Let's quickly outline all the errors that are possible here:
1. **We don't free the memory.** This causes a memory leak in data under `ptr_1` and `ptr_2` - they never release their memory!
2. **We free memory with wrong `delete`.** Should we free memory under `ptr_2` with `delete` rather than with `delete[]` we will only release the memory directly under the pointer, not for the whole allocated array. So, a memory leak again.
3. **We free memory twice.** If we use `delete` on `ptr_3` we will get various errors, either `double free or corruption` or `free(): invalid pointer` depending if the `Pool` allocates data on the heap or not. Regardless, we are getting a runtime error because of this.

### Best practices for memory safety
But don't despair. There is a solution to all of these problems. In the lecture about [object lifecycle](object_lifecycle.md) we already touched upon the RAII principle that stands for Resource Allocation Is Initialization. This principle is crucial for writing safe C++ code. Essentially, we need to make sure that all memory allocation happens at the time of object creation and that memory is released on object destruction. Combining this with properly implemented value semantics, such that these objects can be copied and [moved](move_semantics.md) safely, and we can pretty much guarantee the overall memory safety.

## Smart pointers to ease our life
And now is eventually a good time to talk about smart pointers! They are RAII containers with proper value semantics out of the box so that we don't have to implement such value semantics from scratch. Furthermore there are different flavors of smart pointers to model different types of ownership.

Nowadays, we mostly use `std::unique_ptr` and `std::shared_ptr`, so let's talk about these a bit more in-depth.

These are classes implemented in the STL under the `#include <memory>` header. They are designed to be an almost drop-in replacement for raw owning pointers while providing guarantees for memory safety.

### `std::unique_ptr`
The `std::unique_ptr` is our main workhorse when we need to use owning pointers. The idea is extremely simple: the `std::unique_ptr` enforces unique ownership of a raw pointer given to it. That means that this unique pointer is the only responsible entity to free the memory under its pointer.

The way this is achieved technically is by making sure that the copy constructor and assignment operators of the `std::unique_ptr` class are **deleted**. This way, a unique pointer **can only be moved, not copied**! This way, there are never two raw pointers that point to the same memory owned by this unique pointer.

We work with an entity of such a unique pointer in a very similar way to how we usually work with a raw pointer.
The `std::unique_ptr` is a class template which we can instantiate for any wanted type, here `int`. We can either directly call its constructor passing a raw pointer to the memory allocated with `new` or we can use a helper function `std::make_unique` that helps us hide the naked `new` away and has benefits in terms of memory safety should something go wrong during the allocation.
```cpp
#include <iostream>
#include <memory>

int main() {
  auto ptr_1 = std::unique_ptr<int>(new int{23});
  auto ptr_2 = std::make_unique<int>(42);  // Prefer this to the above.
  std::cout << "*ptr_1: " << *ptr_1 << std::endl;
  std::cout << "*ptr_2: " << *ptr_2 << std::endl;
  ptr_1 = std::move(ptr_2);
  std::cout << "*ptr_1: " << *ptr_1 << std::endl;
  std::cout << "ptr_1: " << ptr_1.get() << std::endl;
  ptr_1.reset(new int{2323});
  std::cout << "*ptr_1: " << *ptr_1 << std::endl;
  std::cout << "ptr_1: " << ptr_1.get() << std::endl;
  return 0;
}
```
Once created, we can access the values under our pointers by dereferencing them with the `*` operator or, in case of classes, we can call their members with `->` operator just like we did with [raw pointers](raw_pointers.md) before.

We cannot assign `ptr_2` to `ptr_1` as the copy assignment operators is deleted for `std::unique_ptr` but we _can_ move-assign one into another. This way, the memory initially held by `ptr_1` is freed and `ptr_1` takes ownership of the memory previously owned by `ptr_2`. When `ptr_1` dies it frees the memory it owns, so no need to call any `delete` on our side.

In addition to this typical pointer-like interface, we also have access to functions like `.get()` which gets the underlying raw pointer and `.reset(T*)` that allows to reset the smart pointer to own a different raw pointer.

All in all, `std::unique_ptr` is an extremely useful tool! Use it all the time when you need to allocate some persistent data on the heap! It mimics raw pointer very closely without any of its downsides and costing us ([nearly](https://youtu.be/rHIkrotSwcc?si=G1yWs9zJ59od6aMj)) nothing at runtime.
<!-- If you are interested in why "nearly", watch this CppCon talk by Chandler Carruth, it is an amazing talk about what we call a "zero-cost abstraction" and why they probably don't really exist. -->

### `std::shared_ptr`
Another smart pointer that is extremely popular is the `std::shared_ptr`. As the name suggest, just as `std::unique_ptr` models unique ownership over some data, `std::shared_ptr` models, well, shared ownership.

Under the hood, it is also a RAII container but, unlike the unique pointer, it does not delete its copy constructor and assignment operators. Rather, `std::shared_ptr` implements the so-called "reference counting" under the hood. Essentially, it has a `static` entry (and we talked about using [`static` with classes](static_in_classes.md) before) that keeps track of how many instances of this `shared_ptr` point to any particular underlying data. If a new copy is created, this counter is incremented and if some instance is destroyed it gets decremented. Only once all of them are destroyed the data is freed.

```cpp
#include <iostream>
#include <memory>
// 😱 Missing other special functions to save space.
struct A {
  A(int a) { std::cout << "I'm alive!\n"; }
  ~A() { std::cout << "I'm dead... :(\n"; }
};

int main() {
  auto a_ptr = std::make_shared<A>(10);
  std::cout << a_ptr.use_count() << std::endl;
  {
    auto b_ptr = a_ptr;
    std::cout << a_ptr.use_count() << std::endl;
  }
  std::cout << "Back to main scope\n";
  std::cout << a_ptr.use_count() << std::endl;
  return 0;
}
```
### Smart pointers are polymorphic
And, as a bonus, these pointers, being pointers are also polymorphic, so we can create a `std::unique_ptr<Base>` from an instance of `std::unique_ptr<Derived>` just like what we discussed when talking about [inheritance](inheritance.md).
```cpp
#include <iostream>
#include <memory>

// 😱 Missing other special functions to save space.
struct Base {
  virtual void SayHello() const { std::cout << "Base hello\n"; }
  virtual ~Base() = default;
};
struct Derived : public Base {
  void SayHello() const override { std::cout << "Derived hello\n"; }
};

int main() {
  auto ptr_1 = std::unique_ptr<Base>(new Base{});
  auto ptr_2 = std::unique_ptr<Base>(new Derived{});
  ptr_1->SayHello();
  ptr_2->SayHello();
  return 0;
}
```

## Summary
This is about everything one needs to know about memory allocation and smart pointers. At least this is about 99% of the knowledge, with the rest available at cppreference.com :wink:

All in all, we should _almost never_ allocate memory manually. A good rule of thumb is to never write a manual `delete`, which leads us to also never writing a naked `new` (use `std::make_unique` and `std::make_shared` instead) and we should never have to deal with a memory leak or a dangling pointer.
