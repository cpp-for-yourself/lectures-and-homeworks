Memory management and smart pointers
--
<p align="center">
  <a href="xxx_https://youtu.be/eHcdTytDZrI"><img src="xxx_https://img.youtube.com/vi/eHcdTytDZrI/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

- [Memory management and smart pointers](#memory-management-and-smart-pointers)
- [Memory management in C++](#memory-management-in-c)
  - [Automatic memory management in other programming languages](#automatic-memory-management-in-other-programming-languages)
  - [The C++ way](#the-c-way)
- [Memory allocation under the hood](#memory-allocation-under-the-hood)
  - [The stack](#the-stack)
  - [Why not keep persistent data on the stack](#why-not-keep-persistent-data-on-the-stack)
  - [The heap](#the-heap)
    - [Operators `new` and `delete`](#operators-new-and-delete)
- [Typical pitfalls with data allocated on the heap](#typical-pitfalls-with-data-allocated-on-the-heap)
    - [Forgetting to call `delete`](#forgetting-to-call-delete)
    - [Performing shallow copy by mistake](#performing-shallow-copy-by-mistake)
  - [Performing shallow assignment by mistake](#performing-shallow-assignment-by-mistake)
  - [Calling a wrong `delete`](#calling-a-wrong-delete)
  - [Returning owning pointers from functions](#returning-owning-pointers-from-functions)
- [RAII for memory safety](#raii-for-memory-safety)
  - [STL classes use RAII](#stl-classes-use-raii)
  - [Smart pointers to the rescue!](#smart-pointers-to-the-rescue)
    - [`std::unique_ptr`](#stdunique_ptr)
    - [`std::shared_ptr`](#stdshared_ptr)
      - [Prefer `std::unique_ptr`](#prefer-stdunique_ptr)
  - [Smart pointers are polymorphic](#smart-pointers-are-polymorphic)
- [Summary](#summary)


Alongside with understanding move semantics that we've [already looked at](move_semantics.md), it is also important to understand how memory is allocated and freed when we create and destroy variables in various ways, why manually dealing with memory can quickly become a mess, and how smart pointers help us avoid this mess. So let's dive in!

<!-- Intro -->

## Memory management in C++
When we declare variables they have to be allocated somewhere. Which essentially means that they need to find a big-enough free slot in memory to fit into. Once we stop using these variables, we want them to free the memory that they occupied so that it could be reused, otherwise we might run out of free memory and be unable to create any new variables, which we'd really like to avoid!

This act of allocating and freeing memory is usually called **"memory management"**.

### Automatic memory management in other programming languages
Some languages like Python, Go, Java, or C#, just to name a few, deal with memory management in an automatic fashion, by using the so-called **"garbage collection"** system. This system runs at intervals in the background and searches for the variables that are not in use anymore and frees their memory. We can observe this by looking at the amount of memory used by programs written in such languages while they are running: the amount of allocated memory will grow for a while, followed by sharp drops once the garbage collection is triggered.

<img src="images/gc.png" alt="Garbage collection" align="right" width=70% style="margin: 0.5rem">

We won't focus too much on garbage collection here though, but if you'd like a more in-depth look into this, please feel free to follow a link to a post about various [options for garbage collection in Java](https://dzone.com/articles/choosing-the-right-gc).
<!-- that is linked below this video. -->

While such a garbage collection system is convenient in terms of not needing to think about memory on our side, using it takes away from the performance of our program. These systems must perform a scan for unused memory repeatedly at runtime which costs time. Furthermore it is hard to predict when these scans will happen and how long they will take, so garbage collected languages are not well-suited for safety-critical applications where we need to know exactly when each operation takes place and that they all fall within a certain time budget.

### The C++ way
What makes C++ suited for such safety-critical applications is that it stays away from garbage collection based memory management altogether. Instead it takes a two-tier approach.

On one hand it makes a good use of scopes and makes sure that any simple small variable allocated withing a scope gets freed by the end of it in an extremely efficient manner.

On the other hand, for some variables that need to allocate a large chunk of memory or that have to be still available after the end of the scope in which they were allocated, it allows us to allocate and release memory manually at our discretion. Which in turn allows us implement any behavior of arbitrary complexity.

Here I have to mention that with great power comes great responsibility and, historically, most of the fear of C++ among the beginners came from this ability to manage memory manually. It was complicated to think about how this manually allocated memory should be managed, and especially when it should be freed. There was also a lack of good tools and guidance that would be universal for each and every situation, which made learning how to work with memory safely hard.

But thankfully those days are in the past and that's where **modern C++** really comes into play. You see, today we *have* these tools within the Standard Template Library (STL) as well as the accompanying guidance on how to use them that work for nearly any situation that we might encounter! Using these tools and following the best practices allows us thinking more abstractly about what we do: not when to allocate and free memory but what **entities** we want to create, who owns them and how their ownership should be transferred while the program runs. This makes reasoning about our programs much easier while keeping our code efficient and memory-safe by default.

## Memory allocation under the hood
But before we talk about these tools we have at our disposal to manage memory in modern C++, let's briefly focus on the basics: on what happens under the hood when we want to create or destroy a variable. And, while common, this task is anything but trivial.

Remember, we want to find a perfect place in memory for every variable we want to use. These variables can have vastly different sizes and lifetime durations which influences their optimal placement in memory. Furthermore, we usually want to avoid "fragmentation" of our memory, i.e., we don't want to have many small "holes" between allocated variables. If we have those, it might be that we have a lot of free memory in the absolute sense, but we are still unable to find a continuous chunk of memory to allocate some larger variable. This means that ideally we want to find for each variable being allocated the smallest free memory slot it fits into.

Solving this problem in general is very hard! Think about it, we can't scan **all** the memory at our disposal exhaustively every time we want to allocate a variable, that would take too long! But we _can_ find effective algorithms for finding *not perfect*, but _good-enough_ spots, granted that we have some more information about our data.

### The stack
For example, we might notice that a lot of scope-local variables we use are really small variables like `int`s or `float`s. They are allocated and freed within their scopes very often which means that, ideally, they should be allocated and freed very quickly. Considering that these variables are mostly small in size and that our scopes are mostly quite short (at least they should be), it is a feasible assumption that we should be able to fit all of such small local variables into a relatively small continuous chunk of memory.

So we designate a small part of our memory, typically around 8MB on Linux and MacOS, to managing such local variables. Furthermore, because these variables are always allocated sequentially and get de-allocated in the reverse order of their allocation at the end of the scope, we use a stack-like data structure for managing where to place them in memory.

<img src="images/stack-coins.png" alt="Garbage collection" align="right" width=20% style="margin: 0.5rem">

Just like a stack of coins allows putting and removing coins from the top of this stack, such data structure supports **putting** and **popping** variables at the **end** of the currently occupied stack space.

🚨 This mechanism is used under the hood for all the local variables we create and destroy in our C++ programs. 🚨

And just to get some more intuition let's look at it a bit more precisely. We'll use an example, as we always do. This example **does not follow any of the best practices** we followed throughout this course, furthermore it leads to an undefined behavior, so please don't copy this example to any real projects. But it does serve us well to build the intuition of how stack works.

In this example, we allocate an `int` with a value of `2` on a stack, followed by a variable of type `int*` that points to nothing, or a `nullptr`. Then a new scope starts and we allocate two integers in a static C-style array without initializing them. Please don't use such C-style arrays in real life, but I do need them for illustration purposes here to make this example simpler. We set the values in that array in the next two lines. In C++, standard C-style arrays are equivalent to pointers and we can set `ptr` to point to the start of our `array` data. This is not a great idea in modern C++, but is a good indicator of where things are on a stack for us. If we now print these values we'll get the expected output of `42` followed by `23`. However, everything changes once we leave the inner scope. Once we leave that scope all of the variables allocated while in it get popped off the stack. Which means that now `ptr` points to some data that we do not control. This leads to **undefined behavior** and if we run this program it might print anything that it finds under that address.
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
    std::cout << "Before stack cleanup.\n";
    for (int i = 0; i < size; ++i) {
      std::cout << ptr[i] << std::endl;
    }
  }
  // 😱 Code below leads to undefined behavior!
  std::cout << "After stack cleanup.\n";
  for (int i = 0; i < size; ++i) {
    std::cout << ptr[i] << std::endl;
  }
  return 0;
}
```
This way of dealing with allocating and freeing variables is amazing for local data. As long as the data does not need to persist beyond the end of the scope, this data structure is very efficient! We always know exactly where to allocate new memory and which memory to free **at constant time**, no additional runtime operations needed!

### Why not keep persistent data on the stack
Many things change the moment we want to allocate bigger chunk of data at once or for our data to persist beyond the end of the scope. Pause for a moment and think if we can keep such data on the stack too! ⏱️

In the case of bigger chunk of data the answer is obvious: once the data stops fitting into the stack, we can't allocate it. If we try to allocate progressively more data in a loop, the program will terminate with `SIGSEGV`, which means that we tried accessing memory that is not allowed for us to access when trying to allocate beyond 8MB of data:
```cpp
#include <iostream>

int main() {
  const int megabyte{1'000'000};
  int i{};
  while(true) {
    // 😱 Don't use C-style arrays in real code!
    std::byte numbers[i++ * megabyte];
    std::cerr << "Allocating " << i << " * MB\n";
  }
  return 0;
}
```

Now, what about persistent data?

Let's for a moment assume that we could keep a variable in our stack for a longer time. And let's also assume that we allocated it in the middle of some scope, with some normal stack variables allocated before and after it. By the end of the scope we must free all memory of those variables. Which essentially means that we would need to pop all the variables above our persistent variable, then copy our variable somewhere, pop the rest of the normal variables and copy our persistent variable back. Not only this is not elegant but we also had to copy a potentially large chunk of memory around, which is slow.

The situation is similarly bad if we would want to free the memory of our persistent variable at some manually chosen point. This would mean that we would need to copy everything that we put on top of it in the stack, remove the persistent data we want, then copy everything back on top of the stack. Also slow!

And we don't like slow!

As you can imagine, the situation would be even worse if there would be more of these persistent variables we wanted to keep track of, which is actually typically the case.

So clearly we want to keep our stack quite small and used exclusively for local variables. Therefore, we must find another way to find a place to allocate potentially large persistent data.

### The heap
Such a place needs to be able to accommodate variables of any size, from small to very large. Also, allocations should depend as little as possible on the amount of data allocated before or after. Finally, such allocations should generally be made explicitly by the programmer as only they know if the particular data should persist and for how long.

When we speak about allocating these data, we usually call these data being allocated **"on the heap"**. Those of you who know data structures might think that this is related to the "heap" data structure - a binary tree with the parent having a larger or smaller key value than its children. And indeed I could imagine how the free chunks of memory could be organized as such a heap data structure by size to optimize the search for a free chunk of a given size. But that seems to be **not the case**, although the evidence is murky on this one. If we trust Donald Knuth (one of the gods of algorithm design), this name is just coincidental. But I could not find any definitive proof for either side of the argument, so if you have it, please send it my way.

<!-- And while you're at it, please subscribe to this channel, it really shows me if I'm moving in the right direction with these videos! -->

Anyway, the easiest way to think about the heap is an intuitive one - imagine a heap of stuff, like coins. Every coin represents a place where we can store our variable that we want to allocate, and let's say that its denomination indicates the amount of free space available.

<img src="images/heap-coins.png" alt="Garbage collection" align="right" width=30% style="margin: 0.5rem">

So when we need to create a new variable on the heap, we look through our heap to find a coin that represents space big enough for our variable and store our variable in that found slot. In our analogy this effectively removes the found coin from the heap maybe adding a smaller coin in its place.

This obviously takes some time at runtime but once such a place is found the variable can stay in that memory until we don't need it anymore. So, allocating on the heap is definitely less efficient than allocating on the stack but it has a benefit of being able to allocate or de-allocate these data at any time with less consideration on how packed the rest of the memory is.

Please note that this is a **very inaccurate analogy** as there is much more stuff happening under the hood and the actual implementations of the heap allocators are well-optimized and, as a result, quite complex, but thinking about a heap of coins gives a decent enough intuition. And that is all I'm aiming for here.

#### Operators `new` and `delete`
We allocate memory on the heap manually in C++. For that we use `new` and `new[]` operators that take a type and derive the amount of space that we want to allocate from that type. The `new` operator allocates a single variable, while `new[]` allocates an array of those. In order to free the memory we need to call `delete` or `delete[]` respectively on the pointer that points to the memory allocated on the heap.
```cpp
int main() {
  int* ptr_1 = new int{42};  // Allocate single variable.
  int* ptr_2 = new int[3]{1, 2, 3};  // Allocate array.
  delete ptr_1;
  delete[] ptr_2;
  return 0;
}
```

<!-- Animate a change from the stack example -->
To have a bit more hands-on experience, let us see how our previous example changes if we use `new[]` instead of allocating a C-style array directly on the stack.
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
We start by pushing the `size` and the `ptr` to the stack and enter the inner scope just as before. What is not as before is that we now use the `new[]` operator to allocate our array on the heap. We only allocate memory for it, without initializing the stored values, so initially it stores garbage data. Note that the **pointer to these data**, that we here still call `array`, is **still stored on the stack**! Now we update the values stored in our array and set the `ptr` to point to the same address as the `array` which allows us to print the values using the `ptr` variable. Different from the example before, when we leave the scope, only the `array` variable is cleaned-up from the stack, but the `ptr` variable still points to our data, which still happily lives on the heap. So we can still print all the values we stored in our array using the `ptr` pointer without any undefined behavior. Finally, we can explicitly free the memory using the `delete[]` operator on our `ptr` variable and at the end of the program the stack empties itself.

## Typical pitfalls with data allocated on the heap
There is a number of common pitfalls when using heap-allocated data. And you could probably have already guessed this from the amount of screaming smileys in my code snippets. If you followed my lectures for a while, you know that I am not a fan of taking care of things manually, I don't really trust myself on that :wink:. If we use `new` and `delete` operators manually like in the example before, we have to be very careful with them!

#### Forgetting to call `delete`
If we forget to call `delete` on the data that we allocated with `new`, we get a memory leak as the memory we allocated is never be freed!
<center>
<video src="images/destructor.mp4" width=50% style="margin: 0.5rem" autoplay muted/>
</center>

#### Performing shallow copy by mistake
Another common mistake when working with raw pointers is to try to copy the data by assigning one pointer to another.
```cpp
int main() {
  int* ptr_1 = new int{42};
  int* ptr_2 = ptr_1;
  delete ptr_2;
  ptr_2 = nullptr;
  // 😱 ptr_1 points to garbage!
  return 0;
}
```
But this **does not copy the data**, this only copies the pointer! So instead we now have two pointers that point to the same data! If we `delete` the memory under both of these pointers we will free the memory twice, which is not allowed. Let's say we remove `ptr_2` first. Now `ptr_1` points to memory that was already released. If we try to `delete` it now we will get a runtime error that will tell us that we are trying to free the memory twice (thus, double free):
```
*** Error: double free or corruption (fasttop): 0x00000000010a3010 ***
```
<center>
<video src="images/dangling_pointer.mp4" width=50% style="margin: 0.5rem" autoplay muted/>
</center>


### Performing shallow assignment by mistake
If we initially allocate two objects the situation becomes even worse!
```cpp
int main() {
  int* ptr_1 = new int{42};
  int* ptr_2 = new int{23};
  ptr_2 = ptr_1;
  delete ptr_2;
  ptr_2 = nullptr;
  // 😱 Lost access to some data!
  return 0;
}
```
Not only we have the same error as before by freeing the memory twice but we also introduce a memory leak as we now do not have any pointer that points to the data originally stored under the second pointer!
<center>
<video src="images/shallow_assignment.mp4" width=50% style="margin: 0.5rem" autoplay muted/>
</center>

### Calling a wrong `delete`
Even if we _do_ call a `delete` we can still mess things up. If we allocate an array using the `new[]` operator and free it with a normal `delete` we will only free the memory under the first element of our array, so, memory leak again!
```cpp
int main() {
  int* array = new int[23];
  delete array;
  // 😱 Only freed a single int!
  return 0;
}
```
Although in this case, at least on a modern `clang` compiler, there is a compilation warning about this situation, so please make sure you have warnings enabled and there are no warnings left unhandled when you compile you code!

### Returning owning pointers from functions
But we're not always as lucky! It gets worse! Much worse! If we don't follow best practices, we might **have no way** of knowing if and how we should free the data under a given pointer! :scream:

<!-- Animate this as code -->
Imagine we have a bunch of functions that all return exactly the same type, `int*`. It is impossible to know if we need to free the memory that the returned value points to by just looking at that pointer alone! And yes, we might get lucky and these functions might all have descriptive names, of course. In this case, if we trust the names, we know which pointers we must free and which `delete` operator to use.
```cpp
// 😱 Manual allocation is bad, especially in functions!
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
Our functions clearly state that they allocate memory and also what they allocate, so we know that we should use `delete` to free the memory of a single allocated variable under `ptr_1`, `delete[]` to free memory allocated to store an array pointer to by `ptr_2` and that we should not touch the memory under `ptr_3` as that memory will be freed by the `Pool` struct.

However, let's be honest, life is rarely as accommodating in the real world. Functions might change their implementation with time without updating their names to adequately reflect these changes! Or they might not have readable names in the first place! This way we _must look into the implementation of these functions_ to make out what they do!
```cpp
// 😱 Manual allocation is bad, especially in functions!
namespace {

struct Pool {
  static int* GetPtr() { return &data_; }
  inline static int data_{};
};

int* Foo() {
  return Pool::GetPtr();
}

int* Bar(int size) {
  return new int[size];
}

int* Buzz() {
  return new int;
}

}  // namespace

int main() {
  auto* ptr_1 = Foo();
  auto* ptr_2 = Bar(20);
  auto* ptr_3 = Buzz();
  delete ptr_3;
  delete[] ptr_2;
  return 0;
}
```
This is already quite annoying, but we still technically **can** find out if we should free the memory and with which operator in each of these cases. But note hard hard it is to track the correct `delete` operators even on such a small example. Imagine having a huge codebase riddles with code like this! :scream:

But we're not done yet, oh no! There is more! If you remember the lectures about [libraries](headers_and_libraries.md) you know that the actual implementation can be hidden from us in a compiled library in such a way that the only thing we see is the declaration of the function. **Now there is no way for us to know what we should do with the pointers we get! :scream:**

`lib.hpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` memory_and_pointers/lib.hpp
-->
```cpp
int* Foo();
int* Bar(int number);
int* Buzz();
```

`main.cpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` memory_and_pointers/main.cpp
`CPP_RUN_CMD` CWD:memory_and_pointers c++ -std=c++17 -c main.cpp
-->
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
1. **We don't free the memory.** This causes a memory leak in data under `ptr_3` and `ptr_2` - they never release their memory!
2. **We free memory with wrong `delete`.** Should we free memory under `ptr_2` with `delete` rather than with `delete[]` we will only release the memory directly under the pointer, not for the whole allocated array. So, a memory leak again.
3. **We free memory twice.** If we use `delete` on `ptr_1` we will get various errors, either `double free or corruption` or `free(): invalid pointer` depending if the `Pool` allocates data on the heap or not. Regardless, we are getting a runtime error because of this.

## RAII for memory safety
I hope I scared you enough and you never want to allocate and free memory manually ever in your life! And this is a great attitude, trust me!

There **is** a solution to all of these problems. In the lecture about [object lifecycle](object_lifecycle.md) we already touched upon the RAII principle that stands for **R**esource **A**llocation **I**s **I**nitialization. This principle is crucial for writing safe C++ code. Essentially, we need to make sure that all memory allocation happens at the time of object creation, ideally in a constructor, and that memory is released on object destruction, in the destructor. Combining this with properly implemented value semantics, such that these objects can be copied and [moved](move_semantics.md) safely, and we can pretty much guarantee the overall memory safety.

<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` memory_smart_ptrs_object/main.cpp
`CPP_RUN_CMD` CWD:memory_smart_ptrs_object c++ -std=c++17 -c main.cpp
-->
```cpp
class Object {
 public:
  explicit Object(int number) : data_{new int{number}} {}

  ~Object() { delete data_; }

  Object(const Object& other)
      : data_{other.data_ ? new int{*other.data_} : nullptr} {}

  Object(Object&& other) : data_{other.data_} { other.data_ = nullptr; }

  Object& operator=(const Object& other) {
    if (other.data_) {
      data_ = new int{*other.data_};
    }
    return *this;
  }

  Object& operator=(Object&& other) {
    data_ = other.data_;
    other.data_ = nullptr;
    return *this;
  }

 private:
  int* data_{};
};
```
### STL classes use RAII
This is essentially what happens in the STL containers like `std::vector` or `std::string`. They wrap a raw pointer to some heap-allocated memory and dynamically manage it, including resizing it when required, moving the pointer to it during the ownership transfer and eventually cleaning things up when they get destroyed. So we can work with variables of these types as if we had simple local variables and let these classes handle all the memory-related stuff under the hood.

### Smart pointers to the rescue!
But what if we have our custom data that we want to allocate on the heap? Well, we could write a wrapper class that would allocate our data, handle all the move-semantics and eventually free its memory but there is a better way.

And now is eventually a good time to talk about smart pointers! They are RAII containers with proper value semantics out of the box so that we don't have to implement such value semantics from scratch. Furthermore there are different flavors of smart pointers to model different types of ownership.

Nowadays, we mostly use `std::unique_ptr` and `std::shared_ptr`, so let's talk about these a bit more in-depth.

These are classes implemented in the **S**tandard **T**emplate **L**ibrary, or STL under the `#include <memory>` header. They are designed to be an almost drop-in replacement for raw owning pointers while providing guarantees for memory safety.

#### `std::unique_ptr`
The [`std::unique_ptr`](https://en.cppreference.com/w/cpp/memory/unique_ptr) is our main workhorse when we need to create data on the heap. The idea is extremely simple: the `std::unique_ptr` enforces unique ownership of a raw pointer given to it. That means that this unique pointer is the only entity responsible to free the memory under its pointer.

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

We cannot assign `ptr_2` to `ptr_1` as the copy assignment operators is deleted for `std::unique_ptr`, which protects us from performing a shallow copy by mistake, but we _can_ move-assign one into another. This way, the memory initially held by `ptr_1` is freed and `ptr_1` takes ownership of the memory previously owned by `ptr_2`. When `ptr_1` dies it frees the memory it owns, so no need to call any `delete` on our side.

In addition to this typical pointer-like interface, we also have access to functions like `.get()` which gets the underlying raw pointer and `.reset(T*)` that allows to reset the smart pointer to own a different raw pointer.

All in all, `std::unique_ptr` is an extremely useful tool! Use it all the time when you need to allocate some persistent data on the heap! It mimics raw pointers very closely without any of their downsides and costing us ([nearly](https://youtu.be/rHIkrotSwcc?si=G1yWs9zJ59od6aMj)) nothing at runtime.
<!-- If you are interested in why I said "nearly", watch this CppCon talk by Chandler Carruth, it is an amazing talk about what we call a "zero-cost abstraction" and why they probably don't really exist. Thanks me later! -->

#### `std::shared_ptr`
Another smart pointer that is extremely popular is the [`std::shared_ptr`](https://en.cppreference.com/w/cpp/memory/shared_ptr). As the name suggest, just as `std::unique_ptr` models unique ownership over some data, `std::shared_ptr` models, well, **shared ownership**.

Under the hood, it is also a RAII container but, unlike the unique pointer, it does not delete its copy constructor and assignment operators. Rather, `std::shared_ptr` implements the so-called "reference counting" under the hood. Essentially, it keeps track of how many instances of this `shared_ptr` point to any particular underlying data. If a new copy is created, this counter is incremented and if some instance is destroyed it gets decremented. Only once all of them are destroyed, i.e., no one points to the data, the data is freed.

I hope that you now see why the ownership is shared. Any of the `shared_ptr` instances can be the last surviving one and so can be the one that removes the data, and whoever removes the data owns it!

We create a `std::shared_ptr` in a very similar way to `std::unique_ptr`, by either using its constructor that also takes a raw pointer or using the `std::make_shared` helper function that allocates the needed object under the hood.
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
Note how, as opposed to the unique pointer, we can copy a shared pointer to another shared pointer.

In addition to the interface that a unique pointer provides, we can also see the number of pointers that point to our particular place in memory by calling the `use_count()` function, which in this example will show us that it is incremented in the inner scope and goes back to the old value when we leave that scope.

##### Prefer `std::unique_ptr`
One final word of caution related to `std::shared_ptr`. Because they are so easy to use, I regularly see beginners overuse shared pointers where unique pointers would suffice. Mostly this happens due to issues that beginners have with move semantics, so if your understanding of that concept is not rock solid, please give a watch to a lecture where we reinvent move semantics in 13 minutes.

In my experience, in most single-threaded application unique pointers are everything that we need for any situation and the overuse of shared pointers is usually a code smell. So please if you're unsure which one you need, always start with a unique pointer and only use a shared pointer if you really need to!

### Smart pointers are polymorphic
Finally, as a bonus, smart pointers, being, well, pointers are **polymorphic**, so we can create a `std::unique_ptr<Base>` from an instance of `std::unique_ptr<Derived>` just like what we discussed when talking about [inheritance](inheritance.md).
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
In this example, `ptr_1->SayHello()` will call the base implementation while the `ptr_2->SayHello()` will call the overriden `Derived` implementation just as we expect. I'll leave it up to you to check if this also works if we use a shared pointer instead.

## Summary
Now this is about everything one needs to know about memory allocation and smart pointers. At least this is about 99% of the knowledge, with the rest available at cppreference.com :wink: Was it too much? Tell me what you think!

All in all, we should _almost never_ allocate memory manually. A good rule of thumb is to never write a manual `delete`, which leads us to also (almost) never writing a naked `new` (use `std::make_unique` and `std::make_shared` instead) and we should never have to deal with a memory leak or a dangling pointer in our life! :heart:

<!-- On that, I'd like to, as always, thank you for your time! Please consider telling your C++ inclined friends if you found this useful and you think they might like it too, it would really mean a lot to me!

And if you would like to look deeper in how you might use pointers in a polymorphic way in C++, then please give this video a watch, while if you'd rather dig deeper into how move semantics works, then give this video a go instead.

Thanks again and bye!
-->
