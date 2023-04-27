
The rule of "All Or Nothing" - safely copying and moving objects
---

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50%></a>
</p>

If you ever wanted to embrace a teenager within you to deal with the world in absolute categories then this topic is for you. Because when it comes to destructors, custom copy and move constructors and operators of a class it comes down to having "all or nothing"!

<!-- Intro -->

Jokes aside, we already used an assignment operator in the previous video Igor did about [move semantics](move_semantics.md) and we stressed that the struct we've been using did not follow the best style.
<!-- Maybe insert a throwback to previous video here -->

A logical question then seems to be "what is the good style then?"

There are many rules about good style when it comes to writing classes but I don't want to postulate this rule out of context. Rather, in the spirit of this course, let's build up to these good practices and summarize them afterwards as an easy-to-remember rule.

In the [previous lecture](move_semantics.md) we had a struct `HugeObject` that owned some big chunk of memory (and we already know that "if you own something you clean it up"). It allocated this memory through some magic function `AllocateMemory` and freed this memory through some other magic function `FreeMemory`. You can find their implementation in the script to this video in the description but it is not really important how they work here.

<!--
`CPP_SETUP_START`
#include <cstddef>

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

std::byte *AllocateMemory(std::size_t length) {
  return new std::byte[length];
}
void FreeMemory(std::byte *ptr) { delete[] ptr; }

// 😱 Note that this struct does not follow best style.
struct HugeObject {
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length{data_length}, ptr{AllocateMemory(length)} {}

  ~HugeObject() { FreeMemory(ptr); }

  std::size_t length{};
  std::byte *ptr{};
};
```

Note that we must explicitly state here that this struct does not follow the best practices. And if you're anything like me this must annoy you to no end, so let's fix it :wink:

First of all, we want to maintain encapsulation, meaning that we don't want to give away the access to our data to the outside without our control. The easiest way to do this is to make our `HugeObject` a class:

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

// 😱 Note that this class does not follow best style.
class HugeObject {
public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length_{data_length}, ptr_{AllocateMemory(length_)} {}

  ~HugeObject() { FreeMemory(ptr_); }

private:
  std::size_t length_{};
  std::byte *ptr_{};
};
```

This is slightly better, nobody can access the data we own anymore. Actually, just to make this class a bit more useful, let's give people access to the underlying data but in such a way that they cannot change this.

As covered in the video about [object lifecycle](object_lifecycle.md), we can provide a simple getter function that returns a constant pointer to our data.

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

// 😱 Note that this class does not follow best style.
class HugeObject {
public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length_{data_length}, ptr_{AllocateMemory(length_)} {}

  std::byte const * ptr() const { return ptr_; }

  ~HugeObject() { FreeMemory(ptr_); }

private:
  std::size_t length_{};
  std::byte *ptr_{};
};
```

> 🎨 A simple getter function like the one above usually has a name of the variable it returns without the trailing underscore.

> Oh, and if you are confused about the return type of this function give a video about the [raw pointers](raw_pointers.md) a watch. The link is in the description and somewhere on the screen.

Let's also use our class for something by introducing a simple `main` function:

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
#include <iostream>

// 😱 Note that this class does not follow best style.
class HugeObject {
public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length_{data_length}, ptr_{AllocateMemory(length_)} {}

  std::byte const * ptr() const { return ptr_; }

  ~HugeObject() { FreeMemory(ptr_); }

private:
  std::size_t length_{};
  std::byte *ptr_{};
};

int main() {
  const HugeObject object{42};
  std::cout << "Data address: " << object.ptr() << std::endl;
  return 0;
}
```

> :bulb: Note that the `const` in the `ptr()` function allows us to call it on a constant `object` variable.

So far so good. You might start to wonder, does the comment above the class still hold?

Let's illustrate why it does by changing our `main` function a little bit. We will introduce another object of the `HugeObject` type and initialize it as a copy of our existing object:

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
#include <iostream>

// 😱 Note that this class does not follow best style.
class HugeObject {
public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length_{data_length}, ptr_{AllocateMemory(length_)} {}

  std::byte const * ptr() const { return ptr_; }

  ~HugeObject() { FreeMemory(ptr_); }

private:
  std::size_t length_{};
  std::byte *ptr_{};
};

int main() {
  const HugeObject object{42};
  std::cout << "object data address: " << object.ptr() << std::endl;
  const HugeObject other_object{object};
  std::cout << "other_object data address: " << object.ptr() << std::endl;
  return 0;
}
```

First of all, does it compile? There is no constructor for `HugeObject` class that takes another instance of `HugeObject` class, and yet it compiles! Why?

The reason is that the compiler is trying to be helpful. A constructor that takes a constant reference to the current type is called a **copy constructor** and the compiler generates a trivial copy constructor for our class **if none is provided by the user**. What do we mean by trivial? Means that it just copies all the variables from one object to another without giving it a second thought. Essentially, in our case we could write such a trivial constructor as follows:

```cpp
// 😱 Not a good idea in our case, just showing what a trivial constructor is.
HugeObject(const HugeObject& other): length_{other.length}, ptr_{other.ptr_} {}
```
> Note how we can use private members of another object here as we are still within the same `HugeObject` class even though we're dealing with a different instance of this class.

Those of you who watched the video on move semantics carefully might already notice the issue with such a trivial constructor. :wink:

Really, try to figure this one out before watching further! Do re-watch the [move semantics](move_semantics.md) video if needed. I'll wait!

Hope you got it by now! The issue is that the trivial constructor just copies over the pointer to a different object, **not the data**! So now we have two objects pointing to the same data. And both of these have destructors that will try to remove these data! So in our case the destructor of the `other_object` will succeed at freeing the memory but the destructor of the `object` will try to free the memory that has already been freed, causing a runtime error that looks something like this:
```
a.out(78797,0x1e21a6500) malloc: Double free of object 0x155e06ac0
a.out(78797,0x1e21a6500) malloc: *** set a breakpoint in malloc_error_break to debug
```

Let's dig a little into why this happened. The reason for this error is that there is a number of functions that we use to **actively** manage the resources that a certain object owns. In our case, we have a constructor that allocates memory and a destructor that frees this memory. What we missed here is that we also need to **actively manage memory** when copying our object. A trivial copy constructor does not do it - it just copied the pointer. So, here is our first rule:

🚨 **If we have a custom destructor, we need a custom copy constructor.**

For completeness, let's add the missing copy constructor here. It needs to copy the length of the allocated memory, allocate the needed amount of memory and copy the content of the incoming object's data into its newly allocated memory:
```cpp
HugeObject(const HugeObject &object):
  length_{object.length_},
  ptr_{AllocateMemory(length_)} {
    std::copy(object.ptr_, object.ptr_ + length_, ptr_);
}
```

So far so good. But we still can't get rid of the annoying comment before the class. Why, I hear you ask? Let me illustrate by changing our `main` function again. Instead of creating `another_object` by copying `object` we will first create it and only then assign `object` to it:
```cpp
int main() {
  const HugeObject object{42};
  std::cout << "object data address: " << object.ptr() << std::endl;
  HugeObject other_object{23}
  other_object = object;
  std::cout << "other_object data address: " << object.ptr() << std::endl;
  return 0;
}
```
If we now compile and run this code we will get exactly the same runtime error as before. I know that at this moment it is very tempting to just flip the table and never return to C++ again but actually, nothing too magical happens here. It's just that the helpful compiler generates more than just a trivial copy constructor. It also generates a trivial copy assignment operator which we actually have already seen in the previous video!

> Actually, the situation here is even worse than with the copy constructor - not only we have a runtime error when our objects get destroyed but we also have a memory leak from the moment we perform the assignment! The memory allocated for the `other_object` is never freed!

Fixing this is as easy as it was for the copy constructor. We just need to write our own custom copy assignment operator. It is very similar to the copy constructor with just two additional steps: it needs to check if we are trying to perform a self-assignment, like `object = object` and it needs to free the memory if we had any allocated from before.
```cpp
HugeObject &operator=(const HugeObject &object) {
  if (this == &object) { return *this; }  // Do not self-assign.
  FreeMemory(ptr_);  // In case we already owned some memory from before.
  length_ = object.length_;
  ptr_ = AllocateMemory(length_);
  std::copy(object.ptr_, object.ptr_ + length_, ptr_);
  return *this;
}
```
<!-- Show diagram what happens -->
This actually brings us to our second rule:

🚨 **If we have a custom copy constructor, we need a custom copy assignment operator**

If you live in a world where you use only C++ versions before 11 then you could stop here but in a modern world we are missing a big chunk of this topic. You might have already guessed what it is - **the move semantics**!

Just as compiler generates default copy constructor and assignment operator it also generates default move constructor and assignment operator with the same consequences in our case.

Let's modify our main function again and make sure that we are using a move constructor.
```cpp
int main() {
  const HugeObject object{42};
  std::cout << "object data address: " << object.ptr() << std::endl;
  const HugeObject other_object{std::move(object)};
  std::cout << "other_object data address: " << object.ptr() << std::endl;
  return 0;
}
```

When we run it, we see that the `other_object.ptr()` points to the same address as the `object.ptr()` after the move! The compiler doesn't know that it should set the `object.ptr_` that it moved from to `nullptr` and just leaves it pointing to the same address causing the already dear to us runtime error when we inevitably free the memory twice.

By now we already know what to do! We know that we just need to write a custom move constructor and that is it! We write it in a very similar way to the copy constructor with the slight difference that we don't copy the data and set the other object's `ptr_` field to `nullptr` (again we cover this in-depth in the move semantics video):
```cpp
HugeObject(HugeObject &&object):
  length_{object.length_},
  ptr_{object.ptr_} {
    object.ptr_ = nullptr;
}
```

It is clear that we must also have another rule which probably also connects to having a custom destructor just like it does for the copy constructor:

🚨 **If we have a custom destructor, we need a custom move constructor**

Remember how once we had a copy constructor we also needed a copy assignment operator? Would you be surprized if I told you that the same story repeats here?

I'd like to leave the implementation of a move assignment operator to you as a small homework. I'm sure you are going to be able to piece it together from this and the move semantics videos. I do strongly encourage you to actually follow what we did before - find the case that causes the runtime error about freeing memory twice and implement the missing operator to fix this error. If you get stuck the full code is in the script to this video, as always.

Anyway, once you're done you will know that there is one last rule that we need:

🚨 **If we have a custom destructor, we need a custom move constructor**

We might notice here that all of these custom functions rely on the fact that we have to manage some resource of an object manually. In summary we can reformulate all of the previous rules as a single one:

**If we manage some resource manually, we must implement the following:**
- **A custom destructor**
- **A custom copy constructor**
- **A custom copy assignment operator**
- **A custom move constructor**
- **A custom move assignment operator**

The rule above is also known under the name of a **"rule of 5"** which was a **"rule of 3"** before move semantics was introduced.

An alternative way to think about it is to think that if we find that we need to implement **just one** of the special functions that we just discussed then we most likely need to implement **all the rest** of them.

And that's it! Once we have all of these implemented, we would be able to remove the annoying comment above our class.

That being said, I want to stress that we should nearly never manage our resources manually! If we don't manage them manually there is no reason to implement any of the special functions we've just discussed!

So instead of the "rule of 5" I prefer talking about the rule of **"all or nothing"**:
**Most classes don't need to redefine default destructor, copy or move constructor or copy or move assignment operators. Ones that redefine just one of them should explicitly redefine the rest of those operations.** [[ref]](https://arne-mertz.de/2015/02/the-rule-of-zero-revisited-the-rule-of-all-or-nothing/#:~:text=Rule%20of%20All%20or%20Nothing%3A%20A%20class%20that%20needs%20to,or%20copy%2Fmove%20assignment%20operator.) [[ref]](http://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#c20-if-you-can-avoid-defining-default-operations-do)

This is a simple rule to follow and I hope that you now also understand why it is needed. We will touch more upon it when we start talking about polymorphism in the context of objective oriented programming but for now thanks for following along!

<!-- See you in the next video, bye! -->
