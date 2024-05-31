**Forwarding references in modern C++**

----

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

By now we already know what move semantics is. We have even essentially [reinvented](move_semantics.md) it from scratch in one of the previous lectures. So we should be quite comfortable seeing functions (be it part of a class or not) that look like this:
<!--
`CPP_SETUP_START`
struct SomeType{};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forwarding_refs_do_smth/do_smth.cpp
`CPP_RUN_CMD` CWD:forwarding_refs_do_smth c++ -std=c++17 -c do_smth.cpp
-->
```cpp
void DoSmth(SomeType&& value);
```
These function usually have something to do with the ownership of the parameters they receive by an rvalue reference.

Well, now that we also talked about templates, there is one more thing we need to talk about. And it is a bit confusing at the first glance.

🚨 You see if we add a template into the mix, `value` is **not really an rvalue reference** anymore:
<!--
`CPP_SETUP_START`
struct SomeType{};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forwarding_refs_do_smth/rvalue_do_smth.cpp
`CPP_RUN_CMD` CWD:forwarding_refs_do_smth c++ -std=c++17 -c rvalue_do_smth.cpp
-->
```cpp
template <class SomeType>
void DoSmth(SomeType&& value);
```

<!-- Intro -->

## The forwarding reference
Ok, to spend you the suspense, the `value` in this example of ours is called a **"forwarding reference"** and it is usually used in combination with `std::forward` (don't worry, we'll unpack what we see here a bit later):
<!--
`CPP_SETUP_START`
struct SomeType{};
void DoSmthElse(SomeType&&);
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forwarding_refs_do_smth/forward_do_smth.cpp
`CPP_RUN_CMD` CWD:forwarding_refs_do_smth c++ -std=c++17 -c forward_do_smth.cpp
-->
```cpp
#include <utility>

template <class SomeType>
void DoSmth(SomeType&& value) {
  DoSmthElse(std::forward<SomeType>(value));
}
```

More formally, to quote [cppreference.com](https://en.cppreference.com/w/cpp/language/reference#Forwarding_references):
> Forwarding reference is a function parameter of a function template declared as rvalue reference to cv-unqualified type template parameter of that same function template.

Sometimes you will also hear people calling it a "universal reference", a term [coined by Scott Meyers](https://isocpp.org/blog/2012/11/universal-references-in-c11-scott-meyers), but I prefer the **"forwarding reference"** name as it is the one used in the standard today. If you want to learn more about it, please feel free to read [Arthur O'Dwyer's post](https://quuxplusone.github.io/blog/2022/02/02/look-what-they-need/) about this, he described it all much better than I ever could!

## Why use forwarding references
Anyway, in the spirit of this course, before we go into talking about **how** a forwarding reference works, I really want to talk a bit about **why** it exists and what we might want to use it for.

Long story short, just like normal rvalue references, I see forwarding references exclusively in the sense of ownership transfer. However, where a standard rvalue reference is designed to **always** transfer the ownership, a forwarding reference is designed for very generic contexts where it can **decide** if the ownership can be transferred based on the types of the input parameters.

I realize that this statement might feel too general, so let's illustrate what I mean using small concrete examples. As always, our examples are going to be very simple, but illustrative of the concept at hand.

### Example setup
For simplicity, let us say that we have a class `Container` that owns some `Data` and has a simple method `Put` that accepts a `const` reference to new `Data` to be put into it:

`container.hpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forwarding_refs/container.hpp
-->
```cpp
#include "data.hpp"

class Container {
   public:
    void Put(const Data& data) { data_ = data; }

   private:
    Data data_{};
};
```

Our `Data` class is going to be a very simple `struct` that is able to print from its copy and move assignment operators:

`data.hpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forwarding_refs/data.hpp
-->
```cpp
#include <iostream>

// 😱 Missing other special class methods!
struct Data {
    Data& operator=(const Data& other) {
        std::cout << "Copy assignment" << std::endl;
        return *this;
    }

    Data& operator=(Data&& other) {
        std::cout << "Move assignment" << std::endl;
        return *this;
    }
};
```
Note that to keep the code to the minimum, I omit the rest of the special functions in this struct, specifically a copy and move constructors as well as the destructor, please see the [rule of "all or nothing"](all_or_nothing.md) lecture to make sure we're on the same page why it is important to have all of those special functions. This is not too important is this particular example as we don't work with any memory or resources, but it is good to keep this knowledge up to date for the cases when we do.

Finally, in the `main` function, we create an instance of `Data` and pass it into our container:

`main.cpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forwarding_refs/main.cpp
`CPP_RUN_CMD` CWD:forwarding_refs c++ -std=c++17 main.cpp
-->
```cpp
#include "container.hpp"

int main() {
    Container container{};
    Data data{};
    container.Put(data);
}
```
If we compile and run this code we will get the output `Copy assignment` which indicates that the data is copied into our container, just as we expect.

Now let's say we don't want to create a `Data` instance in our `main` function and want to pass a temporary object to be owned by our `Container`. We can modify our `main` function every so slightly to achieve this:

`main.cpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forwarding_refs/main_temp.cpp
`CPP_RUN_CMD` CWD:forwarding_refs c++ -std=c++17 main_temp.cpp
-->
```cpp
#include "container.hpp"

int main() {
    Container container{};
    container.Put(Data{});
}
```
However, if we compile and run _this_ code we get the same output that indicates that copy assignment operator was called again. Not exactly what we want!

The reason for this is, of course, the fact that the `Put` method of our `Container` class only accepts a `const` reference to `Data`. By design a `const` reference binds to anything, so a temporary `Data` object is created, it gets bound to a `const` reference when passed into the `Put` function and its lifetime is extended for the duration of the execution of this function. Then because `data` is a `const` reference, its copy assignment operator is called to copy itself into the private `data_` field of our `Container` object.

Now, as copying might be expensive for large objects, we might want to avoid it, so we can force the temporary `Data` object to be moved into our container instead by overloading the `Put` method for an rvalue reference:

`container.hpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forwarding_refs/container.hpp
-->
```cpp
#include "data.hpp"

#include <utility>

class Container {
   public:
    void Put(const Data& data) { data_ = data; }

    void Put(Data&& data) { data_ = std::move(data); }

   private:
    Data data_{};
};
```
If this, or the fact that we have to use `std::move` on `data` here is confusing, do give the lecture about [reinventing move semantics](move_semantics.md) another go, I go in pretty detailed explanations about everything relevant to this there.

Anyway, this does the trick and now we can have both behaviors if we need them in our `main` function:

`main.cpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forwarding_refs/main_both.cpp
`CPP_RUN_CMD` CWD:forwarding_refs c++ -std=c++17 main_both.cpp
-->
```cpp
#include "container.hpp"

int main() {
    Container container{};
    Data data{};
    container.Put(data);
    container.Put(Data{});
}
```
Passing the `data` variable will actually copy the data into our container, while passing a temporary will move this temporary into the container without performing a copy.

### How forwarding references simplify things
So far we haven't really learnt anything new, have we? This is all just using the knowledge about move semantics and [function overloading](functions.md#function-overloading---writing-functions-with-the-same-names) from before. But it _is_ a necessary setup to understand **why** we might want to use forwarding references in the first place.

In this simple case, we needed two function overloads to achieve the behavior that we wanted. Using forwarding references we only need one function instead. Let us modify our `Container` class to use forwarding references instead!

For this, we remove the `Put` function that takes a `const` reference and make the remaining `Put` function, one that takes an rvalue reference, a function template. We then also use the template parameter `T` instead of the `Data` type in this function. Finally, we replace `std::move` with `std::forward<T>` and we have a fully functioning forwarding reference setup:

`container.hpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forwarding_refs/container.hpp
`CPP_RUN_CMD` CWD:forwarding_refs c++ -std=c++17 main_both.cpp
-->
```cpp
#include "data.hpp"

#include <utility>

class Container {
   public:
    template <typename T>
    void Put(T&& data) { data_ = std::forward<T>(data); }

   private:
    Data data_{};
};
```
If we compile and run this code we will still get exactly the behavior that we want: the `data` object gets copied into our container, while the temporary `Data` gets moved. So the forwarding references, and `std::forward` by extension allow us to auto-magically select if we want to copy or move an object based on the provided argument type. How neat is this?


### When to prefer forwarding references
So I hope it makes sense what forwarding references allow us to achieve. But it comes at a cost! We now have a `template` in the game, which means that we can now try to provide a wrong type, say `int` into our `Put` function:
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
#include "container.hpp"

int main() {
    Container container{};
    container.Put(42);
}
```
Which would lead to a nice compilation error of course that would tell us something about not being able to convert between `int` and an rvalue reference to `Data`:
```css
<source>: In instantiation of 'void Container::Put(DataT&&) [with DataT = int]':
<source>:31:18:   required from here
   31 |     container.Put(42);
      |     ~~~~~~~~~~~~~^~~~
<source>:19:15: error: no match for 'operator=' (operand types are 'Data' and 'int')
   19 |         data_ = std::forward<DataT>(data);
      |         ~~~~~~^~~~~~~~~~~~~~~~~~~~~~~~~~~
<source>:4:11: note: candidate: 'Data& Data::operator=(const Data&)'
    4 |     Data& operator=(const Data& other) {
      |           ^~~~~~~~
<source>:4:33: note:   no known conversion for argument 1 from 'int' to 'const Data&'
    4 |     Data& operator=(const Data& other) {
      |                     ~~~~~~~~~~~~^~~~~
<source>:9:11: note: candidate: 'Data& Data::operator=(Data&&)'
    9 |     Data& operator=(Data&& other) {
      |           ^~~~~~~~
<source>:9:28: note:   no known conversion for argument 1 from 'int' to 'Data&&'
    9 |     Data& operator=(Data&& other) {
      |                     ~~~~~~~^~~~~
```
And while we _can_ mitigate this and improve the error message by using traits or concepts, which we already talked about before when we talked about [how to use templates with classes](templates_how_classes.md), it still complicates the code quite a bit. So is it really worth it?

I would argue that in the situations like the one in our example, I would _not_ use forwarding references and would just add the two overloads for the `const` reference and the rvalue reference instead. The reason being arguably better readability and the fact that in some cases the compiler will actually generate more code if we use a forwarding reference as opposed to explicit overloads in this case. This is, though, very close to being just a personal preference.

The situation changes, however, should we have more function parameters to think about. To illustrate what I'm talking about, let us modify our `Container` class a bit by adding another `Data` entry to it:

`container.hpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forwarding_refs/container.hpp
-->
```cpp
#include "data.hpp"

#include <utility>

class Container {
   public:
    template <typename T, typename S>
    void Put(T&& data_1, S&& data_2) {
      data_1_ = std::forward<T>(data_1);
      data_2_ = std::forward<S>(data_2);
    }

   private:
    Data data_1_{};
    Data data_2_{};
};
```
Note what changed here. We now have two objects to store. Here, both `data_1_` and `data_2_` have the same type, but they could of course be of different types. The `Put` function now accepts two template arguments `T` and `S` as well as two forwarding references as its function arguments: `data_1` and `data_2`.

Now, what happens if we pass various combination of lvalue and rvalue references to `Data` into our `Put` function?

`main.cpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forwarding_refs/main_two_params.cpp
`CPP_RUN_CMD` CWD:forwarding_refs c++ -std=c++17 main_two_params.cpp
-->
```cpp
#include "container.hpp"

int main() {
    Container container{};
    Data data{};
    container.Put(data, Data{});
    std::cout << "-----" << std::endl;
    container.Put(Data{}, data);
    std::cout << "-----" << std::endl;
    container.Put(Data{}, std::move(data));
}
```
I'll let you figure out the actual output from this code on your own.
<!-- And please post in the comments what you think this code will print and why! -->

But the main thing is that in all of these cases the `Put` function will do what we want. It will move the data it can move and copy the data it cannot. And by now, if we look at our new `Put` function long enough and think about how to write the same functionality without the forwarding references, we might start understanding where exactly the forwarding references are useful. Let's see how we would write our `Put` functions without using forwarding references, shall we?

`container.hpp`
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forwarding_refs/container.hpp
`CPP_RUN_CMD` CWD:forwarding_refs c++ -std=c++17 main_two_params.cpp
-->
```cpp
#include "data.hpp"

#include <utility>

class Container {
   public:
    void Put(Data&& data_1, Data&& data_2) {
      data_1_ = std::move(data_1);
      data_2_ = std::move(data_2);
    }
    void Put(const Data& data_1, Data&& data_2) {
      data_1_ = data_1;
      data_2_ = std::move(data_2);
    }
    void Put(Data&& data_1, const Data& data_2) {
      data_1_ = std::move(data_1);
      data_2_ = data_2;
    }
    void Put(const Data& data_1, const Data& data_2) {
      data_1_ = data_1;
      data_2_ = data_2;
    }

   private:
    Data data_1_{};
    Data data_2_{};
};
```
To achieve the same performance, we need to have an explicit overload for every combination of lvalue and rvalue references that is possible for our function parameters. Which means that we now need 4 different functions! And you can imagine now what would happen if we would have even more parameters. We didn't really talk about it just yet, but we can pass _any_ number of template parameters into a function, using variadic templates, where using forwarding references is really our only way to write the code that will behave efficiently for any input parameters.

So, if you ask me, this is the reason why forwarding references really exist in the language. And this also warrants a rule of thumb of when they should be used.

🚨 Slightly controversially, I would recommend to only use forwarding references when we **really know what we're doing** in very generic contexts. When we have many function parameters of different types to think of and when these said parameters might be copied or moved if their type allows for it.

## How forwarding references work
Now that we know why we might want to use forwarding references and what they allow us to achieve, I think it is important to also talk about **how** this is done. What is the magic behind a forwarding reference being able to figure out what to do given the argument type?

And of course, this is not magic, but just clever engineering!
Here, I'm planning to go quite deep into details, but we should be able to follow each step of the way with the knowledge we gained until this point in this course. 🤞

### Reference collapsing
In order to understand what happens there, we need to take a short detour through [reference collapsing](https://en.cppreference.com/w/cpp/language/reference#Reference_collapsing). This happens when we use type aliases to reference types and then use references with these type aliases. This basically leads us to effectively have many `&`s stacked together! So we need to map an arbitrary amount of `&`s onto the references that we know how to work with, the lvalue reference denoted by `&` and an rvalue reference denoted by `&&`. And the rule for reference collapsing is quite simple:

🚨 **Rvalue reference to rvalue reference collapses to rvalue reference, all other combinations form lvalue references:**
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` ref_collapsing/main.cpp
`CPP_RUN_CMD` CWD:ref_collapsing c++ -std=c++17 -c main.cpp
-->
```cpp
#include <type_traits>

using lref = int&;
using rref = int&&;

static_assert(std::is_same_v<lref, int&>);
static_assert(std::is_same_v<rref, int&&>);

static_assert(std::is_same_v<lref&, int&>);
static_assert(std::is_same_v<lref&&, int&>);

static_assert(std::is_same_v<rref&, int&>);
static_assert(std::is_same_v<rref&&, int&&>);
```
These `static_assert`s here check if the conditions in them are `true` at compile time. In our case, we use the trait alias [`std::is_same_v`](https://en.cppreference.com/w/cpp/types/is_same) to check if the provided types are the same. It doesn't really matter how `std::is_same_v` is implemented here as long as you trust me that it returns `true` if the types are the same :wink:

That being said, after following the lecture on [how to write class templates](templates_how_classes.md) as well as the one on [how to use `static` with classes](static_in_classes.md) you should be able to implement such a trait on your own!
<!-- Please comment below on how you would do it! And please like this video and subscribe to my channel if you got any value out of it for yourself -->

### Remove reference using `std::remove_reference_t`
Continuing with the topic of playing with references and type traits, we can design a type trait to remove reference from a provided type completely. Such a trait is implemented as [`std::remove_reference_t`](https://en.cppreference.com/w/cpp/types/remove_reference) in the C++ standard library.

We can now see how it works using the `static_assert`s again:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` remove_reference/main.cpp
`CPP_RUN_CMD` CWD:remove_reference c++ -std=c++17 -c main.cpp
-->
```cpp
#include <type_traits>

static_assert(std::is_same_v<std::remove_reference_t<int>, int>);
static_assert(std::is_same_v<std::remove_reference_t<int&>, int>);
static_assert(std::is_same_v<std::remove_reference_t<int&&>, int>);
```
Basically, passing any reference type through the `std::remove_reference_t` trait alias will produce the actual type behind the reference.


### How `std::forward` works
Armed with this knowledge let us have a precise look at `std::forward` and implement our own version of it to understand what happens under the hood better. For this, we need two overloads of our function template `forward`, one that takes an lvalue reference and one that takes an rvalue reference:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forward/forward.hpp
-->
```cpp
#include <type_traits>

template <class T>
T&& forward(std::remove_reference_t<T>& t) { return static_cast<T&&>(t); }

template <class T>
T&& forward(std::remove_reference_t<T>&& t) { return static_cast<T&&>(t); }
```
Both overloads don't use their template type parameter directly to specify the type of their input parameter, but pass it through the `std::remove_reference_t` trait that removes any kind of reference from its input template parameter. The function then always returns the input parameter cast to an rvalue of the template type parameter `T`, or `T&&` type. This difference of the input parameter type and the return type in combination with reference collapsing that we have just discussed is what makes the magic work!

To see it in detail, let us illustrate what happens when we pass arguments of various types into our `forward` function using the forwarding reference:
<!--
`CPP_SETUP_START`
#include "forward.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forward/do_smth.hpp
-->
```cpp
#include <iostream>
#include <utility>

void Print(int&) { std::cout << "lvalue" << std::endl; }
void Print(int&&) { std::cout << "rvalue" << std::endl; }

template <class SomeType>
void DoSmth(SomeType&& value) {
  // 💡 Using our custom forward here, but std::forward works the same.
  Print(forward<SomeType>(value));
}
```
Here, we will use a simple `Print` function overloaded for lvalue and rvalue references to `int` to show what happens. We then pass a number arguments into our `DoSmth` function from `main`.

#### Passing an lvalue
We can observe, that passing a variable `number` as an argument prints `lvalue`, which is what we expect. So let's dig in and understand exactly why it works.
<!--
`CPP_SETUP_START`
#include "do_smth.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forward/main_lvalue.cpp
`CPP_RUN_CMD` CWD:forward c++ -std=c++17 main_lvalue.cpp
-->
```cpp
int main() {
  int number{};
  DoSmth(number);
}
```

1. When we pass `number` to `DoSmth`, the compiler needs to make sure that our forwarding reference type `SomeType&&` matches our de-facto input type, an lvalue reference to int: `int&`
2. A way to make this happen is to deduce `SomeType` to be `int&` using the reference collapsing rules as then `SomeType&&` is `int& &&` which collapses to `int&`, which matches the de-factor input parameter.
3. This leads `value` to have the type `int& &&`, or, as we've just discussed `int&`
4. Given all of this, our call to `forward<SomeType>(value)` ends up being a call to `forward<int&>(int&)`, making the `T` type in the `forward` function be `int&` and choosing the first overload because `std::remove_reference_t<int&>` is just `int`, so the first overload takes `int&`.
5. We then return `T&&` from the `forward` function, which means that we return `int& &&`, which again collapses to `int&`.
6. Which means that we get an lvalue reference out of our `forward` function, and the compiler picks the first overload of our `Print` function and prints `lvalue`.


#### Passing by rvalue
Now let's do the same exercise for the situation when we pass an rvalue into the `DoSmth` function. We can see that the code prints `rvalue` for both situations when we pass a temporary and when we `std::move` from an lvalue. So let's dive into what happens here too.
<!--
`CPP_SETUP_START`
#include "do_smth.hpp"
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` forward/main_rvalue.cpp
`CPP_RUN_CMD` CWD:forward c++ -std=c++17 main_rvalue.cpp
-->
```cpp
int main() {
  int number{};
  DoSmth(42);
  DoSmth(std::move(number));
}
```
1. The compiler needs to make sure that `SomeType&&` matches the input type `int&&`
2. So it trivially deduces `SomeType` to be `int`
3. Which leaves `value` to have type `int&&`.
4. This leads to calling `forward<int>(int&&)` overload, making the compiler deduce `T` as `int` in the `forward` function, picking the second `forward` function overload as it matches the `int&&` input type.
5. We then return a value of type `T&&` from the `forward`, which in our case turns out to be and rvalue reference `int&&`.
6. Finally, this leads us to picking the `Print(int&&)` overload and printing `rvalue` to the terminal.

And this is really all there is to how forwarding references work in conjunction with `std::forward`!

## Summary
With this we should be well equipped to detect when we see a forwarding reference used in the code.

Not only that but we should also leave with an intuition that it makes sense to use forwarding references if we have many function parameters of many template type parameters that can be either copied or moved depending on the reference type used.

Finally, we even dove deep into how it all works, how the compiler picks which types to deduce and which overloads to pick.

Hope this makes your journey towards understanding how to work with templates in C++ easier and that you enjoyed this explanation of mine.

<!-- Finally, if you feel that one or another concept don't fully make sense just yet, please give the appropriate videos on my channel a re-watch. So why not catch up on what move semantics is and maybe even reinvent it with me? For that please click on the video here. Otherwise, if you'd like to watch the series on why and how to use templates, then do give this video a click instead. Thanks a lot for watching and see you next time! Bye! -->
