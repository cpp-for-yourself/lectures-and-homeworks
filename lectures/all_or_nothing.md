
The rule of "All Or Nothing" - safely copying and moving objects
---

<p align="center">
  <a href="https://youtu.be/una89pkP9ms"><img src="https://img.youtube.com/vi/una89pkP9ms/maxresdefault.jpg" alt="Video" align="right" width=50%></a>
</p>

- ["Good style" as our guide](#good-style-as-our-guide)
- [What is "good style"](#what-is-good-style)
- [Setting up the example](#setting-up-the-example)
- [Rule 1: destructor](#rule-1-destructor)
- [Rule 2: copy constructor](#rule-2-copy-constructor)
- [Rule 3: copy assignment operator](#rule-3-copy-assignment-operator)
- [Rule 4: move constructor](#rule-4-move-constructor)
- [Rule 5: move assignment operator](#rule-5-move-assignment-operator)
- [Now we (mostly) follow best practices](#now-we-mostly-follow-best-practices)
- [Rule of 5](#rule-of-5)
- [The rule of "all or nothing"](#the-rule-of-all-or-nothing)


<!-- Talking head -->
If you ever wanted to embrace a teenager within you, to deal with the world in absolute categories then this topic is for you. Because when it comes to destructors, custom copy and move constructors and operators of a class it is *really* about having "all or nothing"!

<!-- Intro -->

# "Good style" as our guide
<!-- Talking head -->
Jokes aside, in the previous video about [move semantics](move_semantics.md) we had an example `struct` that made use of copy and move assignment operators. Turns out there are rules to follow when implementing these operators and their "friends". As a result the struct in that video did not follow a good style.
<!-- Maybe insert a throwback to previous video here -->

# What is "good style"
<!-- Talking head -->
A logical question then seems to be "what *is* the good style?". Long story short:
<!-- Overlay -->
> Good style is a style that helps us avoid mistakes and makes things easier to implement.

<!-- Talking head
Pop-up google style sheet and core guidelines
-->
There are many rules about good style when it comes to writing classes but I don't want to postulate any rules out of context. Rather, in the spirit of this course, let's build up to these good practices by formulating various "rules of good style" and summarize them as a single easy-to-remember rule afterwards.

# Setting up the example
<!-- Code voiceover
- Show the whole struct 🆗
- Change it to class 🆗
- Highlight constructor 🆗
- Highlight AllocateMemory function 🆗
- Highlight destructor 🆗
- Highlight FreeMemory function 🆗
- Zoom out 🆗
-->
So, in the [previous lecture](move_semantics.md) we had a struct `HugeObject` that owned some big chunk of memory. Today, we're going to make it a class to ensure encapsulation but other than that it does the same things as before. It allocates a chunk of memory in its constructor through some magic function `AllocateMemory` and frees this memory in its destructor through some other magic function `FreeMemory`.
<!-- Just as before, their exact implementation is not important right now but you *can* find their implementation in the script to this video, link is as always in the description. -->
<!--
`CPP_SETUP_START`
$PLACEHOLDER

int main() {
  HugeObject object_1;
  HugeObject object_2{100};
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` huge_object_initial/main.cpp
`CPP_RUN_CMD` CWD:huge_object_initial c++ -std=c++17 -c main.cpp
-->
```cpp
#include <cstddef>

std::byte *AllocateMemory(std::size_t length) { return new std::byte[length]; }
void FreeMemory(std::byte *ptr) { delete[] ptr; }

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
<!-- Talking head -->
To help us down the line we want to be able to get the address of the allocated memory, so let's add a function that will give it to us.
<!-- Code voiceover
- Add getter 🆗
- highlight name 🆗
- highlight return type 🆗
-->
As covered in the lecture about [object lifecycle](object_lifecycle.md), we can provide a simple getter function that returns a pointer to our const data.
<!--
`CPP_SETUP_START`
#include <cstddef>

std::byte *AllocateMemory(std::size_t length) { return new std::byte[length]; }
void FreeMemory(std::byte *ptr) { delete[] ptr; }

// 😱 Note that this class does not follow best style.
class HugeObject {
 public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length_{data_length}, ptr_{AllocateMemory(length_)} {}

  $PLACEHOLDER

  ~HugeObject() { FreeMemory(ptr_); }

 private:
  std::size_t length_{};
  std::byte *ptr_{};
};

int main() {
  const HugeObject object_1;
  object_1.ptr();
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` huge_object_getter/main.cpp
`CPP_RUN_CMD` CWD:huge_object_getter c++ -std=c++17 -c main.cpp
-->
```cpp
std::byte const *ptr() const { return ptr_; }
```
> 🎨 Note that such a simple getter function usually has a name of the variable it returns without the trailing underscore [[Google style]](https://google.github.io/styleguide/cppguide.html#Variable_Names).

> :bulb: Oh, and if you are confused about the return type of this function give a lecture about the [raw pointers](raw_pointers.md) a go.
<!-- The link is in the description and somewhere on the screen. -->

<!-- Talking head + code voiceover
- Add main function 🆗
- Highlight const in getter 🆗
-->
One final preparatory touch, let's also introduce a simple `main` function that creates a `HugeObject` instance and prints the address of the memory allocated for it:
<!--
`CPP_SETUP_START`
#include <cstddef>
#include <iostream>

std::byte *AllocateMemory(std::size_t length) { return new std::byte[length]; }
void FreeMemory(std::byte *ptr) { delete[] ptr; }

// 😱 Note that this class does not follow best style.
class HugeObject {
 public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length_{data_length}, ptr_{AllocateMemory(length_)} {}

  std::byte const *ptr() const { return ptr_; }

  ~HugeObject() { FreeMemory(ptr_); }

 private:
  std::size_t length_{};
  std::byte *ptr_{};
};

$PLACEHOLDER

`CPP_SETUP_END`
`CPP_COPY_SNIPPET` huge_object_getter_cout/main.cpp
`CPP_RUN_CMD` CWD:huge_object_getter_cout c++ -std=c++17 -c main.cpp
-->
```cpp
int main() {
  const HugeObject object{42};
  std::cout << "Data address: " << object.ptr() << std::endl;
  return 0;
}
```
> :bulb: Note that the `const` in the `ptr()` function allows us to call it on a constant `object` variable.

<!-- Talking head -->
If anything here confuses you, then do refresh your knowledge on [object lifecycle](object_lifecycle.md) in one of the previous lectures.

# Rule 1: destructor
<!-- Code voiceover
- Highlight destructor 🆗
-->
Now that we're done with the preparations, I would like to focus on the destructor here! What happens if it is missing?
<!-- Animation on the side of the talking head
- Create object, pointer, data 🆗
- Remove data, pointer, object 🆗
- Create object, pointer, data 🆗
- Remove object and pointer 🆗
- Wiggle data 🆗
-->
Right now when an object is created it allocates memory and when it gets destroyed it frees this memory. If we miss the destructor, `FreeMemory` will not be called and the memory will stay behind, causing a memory leak.

<!-- Talking head -->
This already gives us a glimpse into our first "rule":
<!-- Overlay -->
> **Rule 1:** If we acquire resources manually in the constructor we must have a destructor that releases these resources.

<!-- Highlight comment 🆗 -->
Note that even with this destructor in place we still must explicitly state here that **this class does not follow the best practices**. We'll find out why pretty soon.

<!-- Talking head -->
Hopefully you did not learn anything _really_ new by now. We touched upon this topic in the [object lifecycle](object_lifecycle.md) lecture before. So now it is about time we focus on why does the comment above our class still hold?

# Rule 2: copy constructor
<!-- Code voiceover
- Add new part of the main function 🆗
- Highlight adding new object 🆗
- Show the runtime error
-->
Let's illustrate an issue with our class by changing our `main` function a little bit. If we introduce another object of the `HugeObject` type and initialize it as a copy of our existing object the code will compile but will crash when we run it!

<!--
`CPP_SETUP_START`
#include <cstddef>
#include <iostream>

std::byte *AllocateMemory(std::size_t length) { return new std::byte[length]; }
void FreeMemory(std::byte *ptr) { delete[] ptr; }

// 😱 Note that this class does not follow best style.
class HugeObject {
 public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length_{data_length}, ptr_{AllocateMemory(length_)} {}

  std::byte const *ptr() const { return ptr_; }

  ~HugeObject() { FreeMemory(ptr_); }

 private:
  std::size_t length_{};
  std::byte *ptr_{};
};

$PLACEHOLDER

`CPP_SETUP_END`
`CPP_COPY_SNIPPET` huge_object_copy_fail/main.cpp
`CPP_RUN_CMD` CWD:huge_object_copy_fail c++ -std=c++17 -c main.cpp
-->
```cpp
int main() {
  const HugeObject object{42};
  std::cout << "object data address: " << object.ptr() << std::endl;
  const HugeObject other_object{object};
  std::cout << "other_object data address: " << other_object.ptr() << std::endl;
  return 0;
}
```
<!-- Talking head + code voiceover
- Show the whole code 🆗
- Highlight all constructors 🆗
- Add ??? signs
-->
Let's unpack this. First of all, why does it even compile in the first place? There is no constructor for `HugeObject` class that takes another instance of `HugeObject` class, and yet it still compiles! What is going on here?

<!-- Talking head -->
The reason is that the compiler is trying to be helpful. A constructor that takes a constant reference to the current type is called a **copy constructor** and the compiler generates a trivial copy constructor for our class **if none is provided by the user**. What do we mean by trivial? Means that it just copies all the variables from one object to another without giving it a second thought.

<!-- Code voiceover
- Add the constructor 🆗
- Highlight the inputs 🆗
- Highlight the copying 🆗
- Highlight the use of private methods 🆗
-->
We could even write one ourselves! Essentially, in our case a trivial copy constructor would take a constant `HugeObject` reference and will copy the length and the pointer to our new object:
<!--
`CPP_SETUP_START`
#include <cstddef>
#include <iostream>

std::byte *AllocateMemory(std::size_t length) { return new std::byte[length]; }
void FreeMemory(std::byte *ptr) { delete[] ptr; }

// 😱 Note that this class does not follow best style.
class HugeObject {
 public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length_{data_length}, ptr_{AllocateMemory(length_)} {}

  $PLACEHOLDER

  std::byte const *ptr() const { return ptr_; }

  ~HugeObject() { FreeMemory(ptr_); }

 private:
  std::size_t length_{};
  std::byte *ptr_{};
};

int main() {
  HugeObject object{42};
  HugeObject object_2{object};
}

`CPP_SETUP_END`
`CPP_COPY_SNIPPET` huge_object_copy_trivial/main.cpp
`CPP_RUN_CMD` CWD:huge_object_copy_trivial c++ -std=c++17 -c main.cpp
-->
```cpp
// 😱 Not a good idea in our case, just showing what a trivial constructor is.
HugeObject(const HugeObject &object)
      : length_{object.length_}, ptr_{object.ptr_} {}
```
> Note how we can use private members of another object here as we are still within the same `HugeObject` class even though we're dealing with a different instance of this class.

<!-- Talking head -->
Those of you who watched the video on [move semantics](move_semantics.md) carefully might already notice the issue with such a trivial constructor. :wink:

<!-- Talking head -->
Really, try to figure this one out before watching further! Do re-watch the [move semantics](move_semantics.md) video if needed. I'll wait!
<!-- Add video of reading a book, sleeping and doing other stuff -->

<!-- Talking head -->
Hope you got it by now! The issue is that the trivial constructor just copies over the pointer to a different object, **not the data**!
<!-- Animation
- One object that points to the data 🆗
- Another object that points to the same data 🆗
- Freeing memory twice 🆗
-->
So now we have two objects pointing to the same data. And both of these have destructors that will try to remove these data! So in our case the destructor of the `other_object` will succeed at freeing the memory but the destructor of the `object` will try to free the memory that has already been freed, causing a runtime error that mentions something along the lines of freeing the memory twice:
<!-- Code -->
```
a.out(78797,0x1e21a6500) malloc: Double free of object 0x155e06ac0
a.out(78797,0x1e21a6500) malloc: *** set a breakpoint in malloc_error_break to debug
```
<!-- Talking head -->
Let's dig a little into why this happened. The reason for this error is that there is a number of functions that we use to **actively** manage the resources that a certain object owns. In our case, we have a constructor that allocates memory and a destructor that frees this memory. What we missed here is that we also need to **actively manage memory** when copying our object. A trivial copy constructor does not do it - it just copies the pointer. So, here is our new rule:

<!-- Overlay words -->
> **Rule 2:** If we manage resources manually in our class, we need a custom copy constructor.

<!-- Talking head -->
For completeness, let's add the missing proper copy constructor to our class.
<!-- Code voiceover
- Add a copy constructor 🆗
- Highlight every action 🆗
- Highlight copying 🆗
 -->
It needs to copy the length of the allocated memory, allocate the needed amount of memory and copy the content of the incoming object's data into its newly allocated memory:
<!--
`CPP_SETUP_START`
#include <cstddef>
#include <iostream>

std::byte *AllocateMemory(std::size_t length) { return new std::byte[length]; }
void FreeMemory(std::byte *ptr) { delete[] ptr; }

// 😱 Note that this class does not follow best style.
class HugeObject {
 public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length_{data_length}, ptr_{AllocateMemory(length_)} {}

  $PLACEHOLDER

  std::byte const *ptr() const { return ptr_; }

  ~HugeObject() { FreeMemory(ptr_); }

 private:
  std::size_t length_{};
  std::byte *ptr_{};
};

int main() {
  const HugeObject object{42};
  std::cout << "object data address: " << object.ptr() << std::endl;
  const HugeObject other_object{object};
  std::cout << "other_object data address: " << other_object.ptr() << std::endl;
  return 0;
}

`CPP_SETUP_END`
`CPP_COPY_SNIPPET` copy_constructor/main.cpp
`CPP_RUN_CMD` CWD:copy_constructor c++ -std=c++17 -c main.cpp
-->
```cpp
HugeObject(const HugeObject &object)
      : length_{object.length_}, ptr_{AllocateMemory(length_)} {
    std::copy(object.ptr_, object.ptr_ + length_, ptr_);
  }
```

# Rule 3: copy assignment operator
<!-- Talking head -->
Can we remove the annoying comment now, I hear you ask? Unfortunately not yet :shrug:

<!-- Code voiceover
- Change copy constructor into copy assignment 🆗
-->
Let me illustrate by changing our `main` function again. Instead of creating `another_object` by copying `object` directly, we will first create a new object as empty and only then assign `object` to it:
<!--
`CPP_SETUP_START`
#include <cstddef>
#include <iostream>

std::byte *AllocateMemory(std::size_t length) { return new std::byte[length]; }
void FreeMemory(std::byte *ptr) { delete[] ptr; }

// 😱 Note that this class does not follow best style.
class HugeObject {
 public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length_{data_length}, ptr_{AllocateMemory(length_)} {}

  HugeObject(const HugeObject &object)
      : length_{object.length_}, ptr_{AllocateMemory(length_)} {
    std::copy(object.ptr_, object.ptr_ + length_, ptr_);
  }

  std::byte const *ptr() const { return ptr_; }

  ~HugeObject() { FreeMemory(ptr_); }

 private:
  std::size_t length_{};
  std::byte *ptr_{};
};

$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` copy_assignment/main.cpp
`CPP_RUN_CMD` CWD:copy_assignment c++ -std=c++17 -c main.cpp
-->
```cpp
int main() {
  const HugeObject object{42};
  std::cout << "object data address: " << object.ptr() << std::endl;
  HugeObject other_object{23};
  other_object = object;
  std::cout << "other_object data address: " << other_object.ptr() << std::endl;
  return 0;
}
```
<!-- Talking head + flipping table, rage quit -->
If we now compile and run this code we will get exactly the same runtime error as before. I know that at this moment it is very tempting to just flip the table and never return to C++ again but actually, nothing too magical happens here. It's just that the helpful compiler generates more than just a trivial copy constructor. It also generates a trivial copy assignment operator which we actually have already seen in the previous video!

<!-- Animation
- Create two objects pointing to different data 🆗
- Move the arrow of one of them to the first 🆗
-->
> And, the situation here is even worse than with the copy constructor - not only we have a runtime error when our objects get destroyed but we also have a memory leak from the moment we perform the assignment! The memory allocated for the `other_object` is never freed as nothing points to it!

<!-- Talking head -->
Fixing this is as easy as it was for the copy constructor. We just need to write our own custom copy assignment operator.
<!-- Code voiceover
- Add a copy assignment operator 🆗
- Highlight return type 🆗
- Highlight self-assign 🆗
- Highlight freeing memory 🆗
- Highlight copying 🆗
 -->
It is very similar to the copy constructor with just a couple of differences. It returns a reference to `HugeObject` and performs two additional steps: it needs to check if we are trying to perform a self-assignment, meaning that we're trying to assign the object to itself, and it needs to free the memory if we had any allocated from before, fixing the memory leak that we've just talked about. Other than that it copies the length, allocates new memory and copies the memory of the incoming object into this newly allocated memory.
<!--
`CPP_SETUP_START`
#include <cstddef>
#include <iostream>

std::byte *AllocateMemory(std::size_t length) { return new std::byte[length]; }
void FreeMemory(std::byte *ptr) { delete[] ptr; }

// 😱 Note that this class does not follow best style.
class HugeObject {
 public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length_{data_length}, ptr_{AllocateMemory(length_)} {}

  HugeObject(const HugeObject &object)
      : length_{object.length_}, ptr_{AllocateMemory(length_)} {
    std::copy(object.ptr_, object.ptr_ + length_, ptr_);
  }

  $PLACEHOLDER

  std::byte const *ptr() const { return ptr_; }

  ~HugeObject() { FreeMemory(ptr_); }

 private:
  std::size_t length_{};
  std::byte *ptr_{};
};

int main() {
  const HugeObject object{42};
  std::cout << "object data address: " << object.ptr() << std::endl;
  HugeObject other_object{23};
  other_object = object;
  std::cout << "other_object data address: " << other_object.ptr() << std::endl;
  return 0;
}

`CPP_SETUP_END`
`CPP_COPY_SNIPPET` copy_assignment_correct/main.cpp
`CPP_RUN_CMD` CWD:copy_assignment_correct c++ -std=c++17 -c main.cpp
-->
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
<!-- Talking head -->
This actually brings us to our third rule:

> **Rule 3:** If we manage resources manually in our class, we need a custom copy assignment operator.

# Rule 4: move constructor
<!-- Talking head -->
If you live in a world where you use only C++ versions before 11 then you could stop here but in a modern world we are missing a big chunk from this topic. You might have already guessed what it is - **the move semantics**!

<!-- Talking head -->
Just as compiler generates implicit copy constructor and assignment operator it also sometimes generates implicit move constructor and assignment operator although in slightly different circumstances - it only generates them if the user has defined no explicit destructor or copy constructor and assignment operator. But it still might cause problems to us so let's dig into this.

<!-- Code voiceover
- Add std::move to the old example 🆗
- Add printing address of object 🆗
 -->
Let's return back to our main function that used a copy constructor and modify it again by adding `std::move` to our `object` when passing it to the `other_object` to make sure that we are using a move constructor of our `HugeObject` class. And while we're at it let's also print the address of `object` after move:
<!--
`CPP_SETUP_START`
#include <cstddef>
#include <iostream>

std::byte *AllocateMemory(std::size_t length) { return new std::byte[length]; }
void FreeMemory(std::byte *ptr) { delete[] ptr; }

// 😱 Note that this class does not follow best style.
class HugeObject {
 public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length_{data_length}, ptr_{AllocateMemory(length_)} {}

  HugeObject(const HugeObject &object)
      : length_{object.length_}, ptr_{AllocateMemory(length_)} {
    std::copy(object.ptr_, object.ptr_ + length_, ptr_);
  }

  HugeObject(HugeObject &&object) : length_{object.length_}, ptr_{object.ptr_} {
    object.ptr_ = nullptr;
  }

  std::byte const *ptr() const { return ptr_; }

  ~HugeObject() { FreeMemory(ptr_); }

 private:
  std::size_t length_{};
  std::byte *ptr_{};
};

$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` missing_move_constructor/main.cpp
`CPP_RUN_CMD` CWD:missing_move_constructor c++ -std=c++17 -c main.cpp
-->
```cpp
int main() {
  HugeObject object{42};
  std::cout << "object data address: " << object.ptr() << std::endl;
  const HugeObject other_object{std::move(object)};
  std::cout << "object data address: " << object.ptr() << std::endl;
  std::cout << "other_object data address: " << other_object.ptr() << std::endl;
  return 0;
}
```
<!-- Talking head + output overlay + reuse animation from copying -->
When we run it, we see that the `other_object.ptr()` points to an address different from where the `object.ptr()` points to, even after the move! If you remember the lecture about the move semantics this is not what we want! We want the `other_object` to steal the data from `object`. Right now it sure looks like the data is just copied over. And this is indeed the case which you can verify by adding a printout to our copy constructor and see that it is indeed called.

<!-- Talking head -->
The reason for this is that the compiler will only generate a move constructor if there is no custom destructor and no custom copy constructor and assignment operator. By now our class has all of these! So the compiler will _not_ generate a move constructor for us and the rvalue reference will just bind to the normal lvalue reference in our existing copy constructor, so we _will_ perform an unnecessary copy! So, how do we make our class moveable?

<!-- Talking head -->
By now we already know what to do! We know that we just need to write a custom move constructor and that is it!
<!-- Code voiceover
- Add new constructor 🆗
- Highlight inputs 🆗
- Highlight copying pointer 🆗
- Highlight setting other to nullptr 🆗
-->
We write it in a very similar way to the copy constructor with the slight difference that we take an rvalue reference to `HugeObject` as input, don't copy the data and set the other object's `ptr_` field to `nullptr` (again we cover this in-depth in the move semantics video):
<!--
`CPP_SETUP_START`
#include <cstddef>
#include <iostream>

std::byte *AllocateMemory(std::size_t length) { return new std::byte[length]; }
void FreeMemory(std::byte *ptr) { delete[] ptr; }

// 😱 Note that this class does not follow best style.
class HugeObject {
 public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length_{data_length}, ptr_{AllocateMemory(length_)} {}

  HugeObject(const HugeObject &object)
      : length_{object.length_}, ptr_{AllocateMemory(length_)} {
    std::copy(object.ptr_, object.ptr_ + length_, ptr_);
  }

  $PLACEHOLDER

  HugeObject &operator=(const HugeObject &object) {
    if (this == &object) { return *this; }  // Do not self-assign.
    FreeMemory(ptr_);  // In case we already owned some memory from before.
    length_ = object.length_;
    ptr_ = AllocateMemory(length_);
    std::copy(object.ptr_, object.ptr_ + length_, ptr_);
    return *this;
  }

  std::byte const *ptr() const { return ptr_; }

  ~HugeObject() { FreeMemory(ptr_); }

 private:
  std::size_t length_{};
  std::byte *ptr_{};
};

int main() {
  HugeObject object{42};
  std::cout << "object data address: " << object.ptr() << std::endl;
  const HugeObject other_object{std::move(object)};
  std::cout << "object data address: " << object.ptr() << std::endl;
  std::cout << "other_object data address: " << other_object.ptr() << std::endl;
  return 0;
}

`CPP_SETUP_END`
`CPP_COPY_SNIPPET` move_constructor/main.cpp
`CPP_RUN_CMD` CWD:move_constructor c++ -std=c++17 -c main.cpp
-->
```cpp
HugeObject(HugeObject &&object) : length_{object.length_}, ptr_{object.ptr_} {
  object.ptr_ = nullptr;
}
```
<!-- Talking head -->
It is clear that we must also have another rule which probably also connects to having a custom destructor just like it does for the copy constructor:

<!-- Overlay -->
> **Rule 4:** If we manage resources manually in our class, we need a custom move constructor.

# Rule 5: move assignment operator
<!-- Talking head -->
Remember how once we had a copy constructor we also needed a copy assignment operator? Would you be surprized if I told you that the same story repeats here?

<!-- Talking head + overlay video thumbnails -->
I'd like to leave the implementation of a move assignment operator to you as a small homework. I'm sure you are going to be able to piece it together from this and the move semantics videos. If you get stuck the full code is in the script to this video, as always.

<!-- Talking head -->
Anyway, once you're done you will know that there is one last rule that we need:

<!-- Overlay -->
> **Rule 5:** If we manage resources manually in our class, we need a custom move assignment operator.

# Now we (mostly) follow best practices
<!-- Talking head + code voiceover
- Remove the comment 🆗
-->
Don't forget that after you're done implementing the move assignment operator, while there are still some things to improve about our class, we can remove the annoying comment at the top of it as the rest of the improvements are pretty minor!

# Rule of 5
<!-- Talking head -->
It's time we summarize our findings somewhat. We might notice here that all of these custom functions rely on the fact that we have to manage some resource of an object manually. In summary we can reformulate all of the previous rules as a single one:

<!-- Overlay -->
**If the class manages resources manually, it must explicitly implement the following:**
- **A custom destructor**
- **A custom copy constructor**
- **A custom copy assignment operator**
- **A custom move constructor**
- **A custom move assignment operator**

<!-- Talking head + overlay -->
The rule above is also known under the name of a **"rule of 5"** as there are 5 special functions here which was a **"rule of 3"** before move semantics was introduced.

<!-- Talking head -->
An alternative way to think about this rule is to think that if we find that we need to implement **just one** of the special functions that we just discussed then we most likely need to implement **all the rest** of them.

<!-- Talking head -->
That being said, I want to stress that we actually nearly never manage our resources manually! And if we don't manage them manually there is no reason to implement any of the special functions we've just discussed!

# The rule of "all or nothing"
<!-- Talking head -->
So instead of the "rule of 5" I prefer talking about the rule of **"all or nothing"**:
<!-- Overlay -->
**Don't define custom destructor, copy or move constructor or copy or move assignment operators. If just one of them needs to be defined, explicitly define the rest of those operations.** [[ref]](https://arne-mertz.de/2015/02/the-rule-of-zero-revisited-the-rule-of-all-or-nothing/) [[ref]](http://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#c20-if-you-can-avoid-defining-default-operations-do)

<!-- Talking head -->
This is a simple rule to follow and I hope that you now also understand *why* it is needed. We will touch more upon it when we start talking about polymorphism in the context of object oriented programming but for now thanks for following along!

You can find the full code in this file: [all_or_nothing.cpp](code/all_or_nothing.cpp)
<!-- See you in the next video, bye! -->
