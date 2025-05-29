
**Error handling in C++**
--

<p align="center">
  <a href="https://youtu.be/dummy_link"><img src="https://img.youtube.com/vi/dummy_link/maxresdefault.jpg" alt="Video Thumbnail" align="right" width=50% style="margin: 0.5rem"></a>
</p>

- [**Error handling in C++**](#error-handling-in-c)
- [Disclaimer](#disclaimer)
- [What is error handling after all](#what-is-error-handling-after-all)
- [What to do about unrecoverable errors](#what-to-do-about-unrecoverable-errors)
- [How to recover from recoverable errors](#how-to-recover-from-recoverable-errors)
  - [Why not set a global value](#why-not-set-a-global-value)
  - [Why not throw an exception](#why-not-throw-an-exception)
    - [Exceptions are expensive](#exceptions-are-expensive)
    - [The hidden path is hidden](#the-hidden-path-is-hidden)
  - [Use return type for explicit error path](#use-return-type-for-explicit-error-path)
- [How to work with `std::optional`](#how-to-work-with-stdoptional)
- [Use `std::expected` to tell why a function failed](#use-stdexpected-to-tell-why-a-function-failed)
- [Use `std::optional` to represent optional class fields](#use-stdoptional-to-represent-optional-class-fields)
- [How are they implemented and their performance implications](#how-are-they-implemented-and-their-performance-implications)
- [Summary](#summary)

When writing code in C++, just like in life overall, we don't always get what we want. The good news is that we can prepare by being careful and anticipating some of the errors that we can encounter. Just like with everything else in C++, there are many mechanisms for this and today we're talking about what options we have with an added "benefit" of some highly opinionated suggestions. All of you experienced C++ devs, prepare your pitch forks! :wink:

<!-- Intro -->

## Disclaimer

The topics we cover today don't have a single simple answer. The main reason for this is the shear power of C++ and all of the things is lets us do. This is only strengthened by how long C++ exists, the diversity of the use-cases and the people who use it. Depending on your context, the particular way of thinking presented here might be more or less useful to you. My experience mostly comes from automotive and robotics bubbles and might not apply to your domain. I will do my best to mention all options, but will only cover in-depth areas that I have been using myself over the last 15 or so years.

I aim to add links to opinions alternative to those expressed in this lecture to the best of my ability, but if I miss something, please do not hesitate to let me know in the comments.

## What is error handling after all

With the disclaimer out of the way, it makes sense to start our conversation by defining what we call an "error" in the first place in the context of our C++ code.

Essentially, on the highest level of abstraction, we say that there was an error when the code does not produce the result we expect it to produce.

We can further classify the possible errors by their origin. The errors are typically thought of as:

- **recoverable:** errors that we can recover from within the normal operation of the program. An example of these would be a network timeout in a situation when a user can wait and retry.
- **unrecoverable:** errors that indicate a state of the program so broken that any recovery is useless. Typical examples are programmatic errors and errors resulting from undefined behavior encountered previously in the program.

<!-- Link the CppCon talk by Andreas, maybe also Aleksandrescu? -->

Note that, while some languages, like Rust, make this distinction directly in their official documentation, the classification of errors into recoverable and unrecoverable is still highly debated in C++. There is a large camp of people, who believe that every error is potentially recoverable and should be treated as such and that an error should be reported for potentially being handled later at a different place in the program. This is absolutely a valid way of thinking but it comes with a price that, at least in my industry, people are usually unwilling to pay.

## What to do about unrecoverable errors

In this lecture, we will assume that we cannot or don't want to try to recover from a class of errors that we deem "unrecoverable". That being said, we still generally want to have tools to reduce the likelihood of these errors popping up. In my experience, most of these errors come from an erroneous assumption or an undetected error earlier in the program.

One typical way of dealing with issues like these is a combination of two techniques:

- Having a high [test code coverage](googletest.md), ideally 100% code line coverage
- Enforcing contract checking at the start (and potentially also at the end) of every function

The combination of these technique allows us to increases the likelihood that an actual error would be caught early in the development and won't make it into the actual delivered application.

<!-- TODO: add an example here or even before -->

Such contract enforcement typically crash the application if their premise is not met, assuming that the only way this could have happened is if something before has already gone horribly wrong, no recovery is possible, and the best way to move on is to die as quickly as possible.

This obviously needs careful considerations. You don't want all of the software in your car to die at a random point in time without any recovery procedure.

We won't talk about this too much but in general, as at least one potential reason for such failures is memory being in an undefined and potentially inconsistent state, people usually run multiple processes or even multiple programs on different hardware and monitor the main execution path by some watchdog that activates a safe recovery procedure if needed.

<!-- Add a fun video to this? Maybe laser or car? Or both? -->

## How to recover from recoverable errors

The bulk of this talk is focused around ways to recover from a recoverable error in modern C++ with a function being our smallest unit of concern.

For the sake of example, let's say we have a function `GetAnswerFromLlm` that, getting a question, is supposed to answer all of our questions using some large language model living in the cloud.

```cpp
#include <string>

std::string GetAnswerFromLlm(const std::string& question);
```

We've seen [functions](functions.md) like this before. This is a simple interface that serves its purpose in most situations: we ask it things and get some `std::string` answers (sometimes of questionable quality). But what if this function _cannot_ return an answer to our question? What should this function do in this case, so that we know that an error has occurred?

Largely speaking there are three schools of thought here:

1. It can throw an **exception** to indicate that some error has occurred
2. **It can return a special value to indicate a failure**
3. It can set a special global value to indicate a failure

Today we mostly focus on option 2., where we would return a special value of a special type to indicate that something went wrong, but before we go there, I'd like to briefly talk about why I don't like the other options.

### Why not set a global value

We'll start with option 3 - setting some global value as an indicator for a failure. This way was quite popular long time ago but it rarely used today when we believe that variables should live in as local scope as possible. But you can still encounter it if you ever code using OpenGL, for example.
<!-- Check this and add an illustration -->

### Why not throw an exception

A more interesting question is why not use option 1 - to throw an exception.

And I can already see people with pitchforks coming for me so do note that this is a highly-debated topic with even thoughts of [re-imagining exceptions altogether](https://www.youtube.com/watch?v=ARYP83yNAWk) as shown in this wonderful presentation by Herb Sutter.

Anyway. Exceptions. Generally, at any point in our program we can `throw` an exception. In our case, if, say, the network would be down and our LLM of choice would be unreachable, the `GetAnswerFromLlm` could throw an exception, say a `std::runtime_error`:

```cpp
#include <string>

std::string GetAnswerFromLlm(const std::string& question) {
  const auto llm_handle = GetLlmHandle();
  if (!llm_handle) {
    throw std::runtime_error("Cannot get LLM handle");
  }
  return llm_handle->GetAnswer(question);
}
```

This exception is then "caught" in some other part of the program upstream of the place at which it was thrown using a so-called "try-catch" block. The exception travels to get there on a separate execution path, invisible to the user.

```cpp
int main() {
  try {
    const answer = GetAnswerFromLlm("What am I doing with ny life?");
    std::cout << answer << std::endl;
  } catch (std::runtime_error error) {
    std::cerr << error << std::endl;
  } catch (...) {
    std::cerr << "Unexpected error happened" << std::endl;
  }
}
```

<!-- Explain catch blocks -->

This sounds wonderful at first glance as it allows us to use the return type of our function for actually returning the result of the operation without trying to use it for anything else. This way also goes along the philosophy of having no unrecoverable errors: the function that throws an exception makes no decision about this error being recoverable or not - this will be decided by some other part of code that handles (or fails to handle) this exception.

However, there are some limitations to this approach that we'll try to outline here.

#### Exceptions are expensive

A `std::exception` is just a [class](classes_intro.md) like all those that we've seen before already. An exception object can be caught by value or by reference at any point in the program upstream from the place where the exception was originally thrown. Also, exceptions are polymorphic and use [runtime polymorphism](inheritance.md#using-virtual-for-interface-inheritance-and-proper-polymorphism), so there can be a hierarchy of exception classes and when exceptions are caught by reference, they can be caught by their base class.

Essentially the problem comes down to exceptions using dynamic allocation at the throwing side and RTTI (Runtime Type Information) at the catching side. This means that technically a program can take an arbitrary amount of time to throw and catch an exceptions. Many code bases, especially those that contain safety-critical code, ban exceptions altogether due to the fact that there is, strictly speaking, no way to guarantee how long it takes to process an exception once one is thrown because of their dynamic implementation. In all the places where I worked the exceptions were either banned altogether or avoided when possible.
<!-- TODO: link Stack Overflow questionnaire about using exceptions -->
<!-- TODO: link to herb sutter's proposal: https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2019/p0709r4.pdf -->

#### The hidden path is hidden

Furthermore, there is another thing I don't really like about them. They create a hidden logic path that can be hard to trace when reading the code.
You see, the `catch` block that catches an exception can be in _any_ calling function and it will catch a matching exception that is thrown at any depth of the call stack.

<img src="images/error.png.webp" alt="Video Thumbnail" align="right" width=50% style="margin: 0.5rem">

This typically means that we have to become very rigorous about what function throws which exceptions when and, in some cases, the only way to know this is by relying on a documentation of a function which, in many cases, does not fully exist or is not up to date. I firmly believe that the statement `catch (...)` is singlehandedly responsible for many errors of the style of "oops, something happened" that we've all encountered.

To be a bit more concrete, just imagine that the `LlmHandle::GetAnswer` function throws some other exception, say `std::logic_error` that we don't expect - this would lead us to showing such a `"Something happened"` message, which is not super useful to the user of our code and still likely leads to the program to crash, which is what we tried to avoid with exceptions in the first place.
<!-- TODO: add an example of this -->

### Use return type for explicit error path

<!-- TODO: old text below -->

All of these issues prompted people to think out of the box to avoid using exceptions. And that while still having a way to know that something went wrong during the execution of some code.

In the olden days (before C++17), there were only three options.

1. The first one was to return a special value from the function. When the user receives this value they know that an error has occurred:

    ```cpp
    #include <string>

    // 😱 Assumes empty string to indicate error. Not a great idea nowadays.
    std::string GetAnswerFromLlm(const std::string& question, std::string& answer) {
      const auto llm_handle = GetLlmHandle();
      if (!llm_handle) { return {}; }
      return llm_handle->GetAnswer(question);
    }
    ```

    This option is not ideal because it is hard to define an appropriate "failure" value to return from most functions. For example, an empty string sounds like a good option for such a value, but then the LLM response to a query "Read this text, return empty string when done" would overlap with such a default value. Not great, right? We can extend the same logic of course for any string we would designate as the "failure value".
2. Another option is to return an error code from the function, which required passing any values that the function had to change as a non-const reference or pointer:

    ```cpp
    #include <string>

    // Returns a status code rather than the value we want.
    // 😱 Not a great idea nowadays.
    int GetAnswerFromLlm(const std::string& question, std::string& answer) {
      const auto llm_handle = GetLlmHandle();
      if (!llm_handle) { return 1; }
      answer = llm_handle->GetAnswer(question);
      return 0;
    }
    ```

    This options is also not great. I would argue that not being able to have pure functions that get only const inputs and return a single output makes the code a lot less readable. Furthermore, modern compilers are very good at optimizing the returned value and sometimes the function that constructs this value altogether which might be a bit harder if we pass a reference to a value stored elsewhere. Although I don't know enough about the magic that the compilers do under the hood to be 100% about this second reason, so if you happen to know more - tell me!
    <!-- In the comments below this video -->
3. An arguably even worse but still sometimes used method (OpenGL, anyone?) is to set some global error variable if an error has occurred and explore its value after every call to see if something bad has actually happened.

    ```cpp
    #include <string>

    // 😱 Not a great idea to have a global mutable variable.
    inline static int last_error{};

    // 😱 Not a great idea nowadays.
    std::string GetAnswerFromLlm(const std::string& question) {
      const auto llm_handle = GetLlmHandle();
      if (!llm_handle) {
        last_error = 1;
        return {};
      }
      last_error = 0;
      return llm_handle->GetAnswer(question);
    }
    ```

    I believe I don't have to go into many details as to why his is not an ideal way to deal with errors: it is even less readable and more error prone than the previous method. We even have to use a mutable global variable! Also, good luck [testing](googletest.md) this code, especially when running a number of tests in parallel.

But I would not be telling you all of this if there were no better way, would I? This is where `std::optional` comes to the rescue. Instead of all of the horrible things we've just discussed, we can return a `std::optional<std::string>` instead of just returning a `std::string`:

`llm.hpp`

```cpp
#include <optional>
#include <string>

std::optional<std::string> GetAnswerFromLlm(const std::string& question) {
  const auto llm_handle = GetLlmHandle();
  if (!llm_handle) { return {}; }
  return llm_handle->GetAnswer(question);
}
```

Now it is super clear when reading this function that it might fail because it only _optionally_ returns a string. It also forces us to deal with any potential error happening inside of this function when we call it because the _type_ or the value we get forces us to do it. No hidden error path!

Note also, that the code of the function itself stayed _exactly_ the same as in the case where we would indicate an error by returning an empty string, just the return type is different!

## How to work with `std::optional`

So let's see how we could work with such a function! For this we'll call it a couple of times with various prompts and process the results that we're getting:

`main.cpp`

```cpp
#include "llm.hpp"

int main() {
  const auto suggestion = GetAnswerFromLlm(
    "In one word, what should I do with my life?");
  if (!suggestion) return 1;
  const auto further_suggestion = GetAnswerFromLlm(
    std::string{"In one word, what should I do after doing this: "} + suggestion.value());
  if (!further_suggestion.has_value()) return 1;
  std::cout <<
    "The LLM told me to " << *suggestion <<
    ", and then to " << further_suggestion.value() << std::endl;
  return 0;
}
```
In general, `std::optional` provides an interface in which we are able to:
- Check if it holds a value by calling its `has_value()` method or implicitly converting it to `bool`
- Get the stored value by calling `value()` or using a dereferencing operator `*` as well as `->` should we want to call methods or ged data of an object stored in the optional wrapper. Beware, though that getting a value of an optional that holds no value is undefined behavior, so _always check_ that there is actually a value stored in an optional.

## Use `std::expected` to tell why a function failed
There is just one more quality of life improvement that we are missing here. If we receive a `std::optional` object that stores a `std::nullopt` as a result of a function call, we know that the function failed. But we don't know **why** it failed.

This is why in C++23 we are getting a class `std::expected` that, while being very similar to `std::optional` has another template parameter: `std::expected<ResultT, ErrorT>` that stores the type of an error that might be stored in this object instead of the value we expect. This way, we can store arbitrary values to indicate that an error has occurred:
```cpp
#include <string>

std::expected<std::string, std::string> GetAnswerFromLlm(const std::string& question) {
  const auto llm_handle = GetLlmHandle();
  if (!llm_handle) {
    return std::unexpected{"No network"};
  }
  return llm_handle->GetAnswer(question);
}
```
Now if we have a network outage, we can return an error that tells us about this being the case and should the `LlmHandle::GetAnswer` return an expected object of the same type too, it would automagically propagate to the caller of the `GetAnswerFromLlm` function.

## Use `std::optional` to represent optional class fields

<!-- Maybe talk about this elsewhere. -->

As a a first tiny example, imagine that we want to implement a game character and we have some items that they can hold in either hand (we'll for now assume that the items are of the same pre-defined type for simplicity but could of course extend this example with a class template):

```cpp
struct Character {
  Item left_hand_item;
  Item right_hand_item;
};
```

The character, however, might hold nothing in their hands too, so how do we model this?

As a naïve solution, we could of course just add two additional boolean values `has_item_in_left_hand` and `has_item_in_right_hand` respectively:

```cpp
struct Character {
  Item left_hand_item;
  Item right_hand_item;
  // 😱 Not a great solution, we need to keep these in sync!
  bool has_item_in_left_hand;
  bool has_item_in_right_hand;
};
```

This is not a great solution as we would then need to keep these variables in sync and I, for one, do not trust myself with such an important task, especially if I can avoid it. So, speaking of avoiding this, can we somehow bake this information into the stored item types directly?

We _could_ just replace the items with pointers and if there is a `nullptr` stored in either of those it would mean that the character holds no item in the corresponding hand. But this has certain drawbacks as it changes the semantics of these variables.

```cpp
// 😱 Who owns the items?
struct Character {
  Item* left_hand_item;
  Item* right_hand_item;
};
```

Before, our `Character` object had value semantics and now it follows pointer semantics under the hood, meaning that copying our `Character` object would become [harder](memory_and_smart_pointers.md#performing-shallow-copy-by-mistake).

This is not great. The simple decision of allowing the character to have no objects in their hands forces us to actively think about memory, complicating the implementation and forcing unrelated design considerations upon us.

One way to avoid this issue is to store a `std::optional<Item>` in each hand of the character instead:

```cpp
struct Character {
  std::optional<Item> left_hand_item;
  std::optional<Item> right_hand_item;
};
```

Now it is clear just by looking at this tiny code snippet that neither item is required for the correct operation of the character. As a bonus, the object still has value semantics and can be copied and moved without any issues.

Before we talk about how to use `std:::optional`, I'd like to first talk a bit about another important use-case for it - **error handling**.



## How are they implemented and their performance implications
Largely speaking, both `std::optional` and `std::expected` are both implemented as a `union` in C++, meaning that the expected and unexpected values are stored _in the same underlying memory_ with helper functions allowing us to query which one is actually stored there.

This means that if the unexpected type has a smaller memory footprint than the expected type, then there is no memory overhead. This leads us to the first performance consideration: **we should not use large types for the _unexpected_ type in `std::expected`**. Otherwise, we might be wasting a lot of memory:
```cpp
// 😱 Not a great idea.
std::expected<int, HugeType> SomeFunction();
```
Here, instead of returning a tiny `int` object we will now always return an object that takes the same amount of memory as `HugeType`. As allocating memory is work, this will also most probably be slower than returning tiny integer numbers.
<!-- TODO: illustrate the above -->

The good news here is that there is not much we can do wrong with `std::optional` on this front as it holds a small `std::nullopt` type if it does not hold the expected return type.

As you might have already guessed, both `std::optional` and `std::variant` are class templates. Which means that they are created and checked at compile-time. Which incidentally allows the compiler to optimize the code that uses them quite well. This in turn means that generally neither `std::optional` nor `std::expected` have much of a runtime overhead.

That being said, they might not be completely for free which leads us to our second performance consideration: **if we have a very tight loop that does not use `optional` or `expected` values, we must measure the runtime of your code if we introduce those and make sure that performance is still satisfied**.

Finally, there are some quirks around how the compilers are able to optimize the code when a function returns `optional` or `expected` values. If we create objects that we aim to return in a wrong way, the compiler might generate unnecessary moves or copies of the objects. Here is how to return our objects to avoid this:
<!-- TODO: example from Jason's video -->
For more please see a [short and clear video by Jason Turner](https://www.youtube.com/watch?v=0yJk5yfdih0) that covers this topic.

## Summary
Overall, classes like `std::optional` and `std::expected` are extremely useful to represent values that optionally hold a value. Sometimes it is enough for us to know that the value simply might not be there, without caring for a reason behind this, that's where `std::optional` shines. But sometimes, especially when returning from functions, we would also like to know **why** the value does not exist and that's what `std::expected` has been added for in C++23. Oh, and if you'd like to use something like `std::expected` before C++23, take a peek at `tl::expected`, I've gotten some good mileage out of it over the years.

These classes are very useful - they make the intent behind our code crystal-clear. They also allow us to keep the code readable and performant.

<!-- I hope that this video was a useful overview on why and how to use std::optional and std::expected and next time we're about to have a look at `std::variant` - a class that is implemented in a very similar way but is even more powerful and unlocks runtime-like polymorphism in a typically static polymorphism context. -->
