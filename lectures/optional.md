
**Error Handling in C++**

<p align="center">
  <a href="https://youtu.be/dummy_link"><img src="https://img.youtube.com/vi/dummy_link/maxresdefault.jpg" alt="Video Thumbnail" align="right" width=50% style="margin: 0.5rem"></a>
</p>


- [Disclaimer](#disclaimer)
- [What Do We Mean by “Error”?](#what-do-we-mean-by-error)
- [Unrecoverable errors: **fail early**](#unrecoverable-errors-fail-early)
  - [How to deal with unrecoverable errors](#how-to-deal-with-unrecoverable-errors)
  - [How to minimize number of unrecoverable errors](#how-to-minimize-number-of-unrecoverable-errors)
- [Recoverable errors: **handle and proceed**](#recoverable-errors-handle-and-proceed)
  - [Exceptions](#exceptions)
    - [What exceptions are](#what-exceptions-are)
    - [Exceptions are (sometimes) expensive](#exceptions-are-sometimes-expensive)
    - [Exceptions hide the error path](#exceptions-hide-the-error-path)
    - [Exceptions are banned in many code bases](#exceptions-are-banned-in-many-code-bases)
  - [Returning errors explicitly can work better if done well](#returning-errors-explicitly-can-work-better-if-done-well)
    - [Returning a value indicating error does not always work 😱](#returning-a-value-indicating-error-does-not-always-work-)
    - [Returning an error code breaks "pure functions" 😱](#returning-an-error-code-breaks-pure-functions-)
    - [Using `std::optional`: **a better way**](#using-stdoptional-a-better-way)
    - [Using `std::expected`: **add context**](#using-stdexpected-add-context)
  - [Performance Considerations for `std::optional` and `std::expected`](#performance-considerations-for-stdoptional-and-stdexpected)
    - [Error type size matters](#error-type-size-matters)
    - [Return value optimization](#return-value-optimization)
  - [Summary](#summary)

When writing C++ code, much like in life, we don’t always get what we want. The good news is that we can prepare for this!

And just like everything else in C++, there are… a lot of ways to do that.

Today we’re talking about error handling. What options we have, which trade-offs they come with, and what modern C++ gives us to make our lives a bit easier.

And as this topic is quite nuanced, there will definitely be some statements that are quite opinionated and I can already see some people with pitchforks coming my way... so... I'm sure it's gonna be fun!

# Disclaimer

Following up on what I've just said, I'd like to start with a disclaimer.

This isn’t a one-size-fits-all topic. C++ is huge, powerful, and used across every domain imaginable for a long-long time.

*My* perspective comes from domains like robotics and automotive—where predictability, traceability, and safety are of highest importance. What works for us may not work for everyone.

That being said, I believe that what I present here will fit many other domains with minimal adaptation and is grounded in sane reasoning. Where possible, I’ll try to mention multiple possible options and if I *do* miss an important one—please let me know!

<!-- in the comments -->

# What Do We Mean by “Error”?

Before we go into how to handle errors, let’s clarify what we mean when we say "error" in the first place.

At the highest level: an error is something that happens when the code doesn’t produce the expected result. But there is nuance here!

I like to think of errors belonging to one of two broad groups:

- **Unrecoverable errors** — where the program reaches a state where recovery is impossible or meaningless.
- **Recoverable errors** — where the program can detect that something went wrong, and has ways to proceed following an alternative path.

Some languages—like Rust—bake this distinction [into the language design](https://doc.rust-lang.org/book/ch09-00-error-handling.html). C++ doesn’t.
But, for my money, this classification is still useful. So let's talk a bit more in-depth about these kinds of errors and I hope that you'll agree with my logic by the end of it.

# Unrecoverable errors: **fail early**

## How to deal with unrecoverable errors

Let’s start with the errors we don’t want to recover from.

These usually come from bugs: a violated precondition, accessing something that shouldn’t be accessed, or hitting undefined behavior. In all of these cases the program is already in some unknown or unexpected state, so we have no guarantees on anything that happens next. Which means that recovery is most likely impossible and we are probably better off not even trying to recover.

We often want to catch these types of errors as early as possible—and crash as early as possible—before any more damage is done.

A typical approach is to enforce contracts at function boundaries. My favorite method is to use the [`CHECK`](https://abseil.io/docs/cpp/guides/logging#CHECK) macro that can be found in the [Abseil library](https://abseil.io/docs/). Here’s a toy example of registering a robot by id:

```cpp
#include <absl/log/check.h>
#include <string>

void RegisterRobot(const std::string& robot_id) {
  CHECK(!robot_id.empty()) << "Robot ID cannot be empty";
  // Perform some registration logic.
}
```

The idea is simple: we check upfront that the id is actually valid. If it isn’t, we crash instead of going into the undefined behavior land. The Abseil library handles all the additional niceties for us, like showing a stack trace for the failure as well as showing an optional message that explains the failure.

<!-- Add an animation of showing UB land and CHECK kicking its ass -->

Under this philosophy, we essentially treat bugs as bugs—not as conditions we can try to live with.

## How to minimize number of unrecoverable errors

Of course, we'd rather not have the bugs we're talking about here at all. In practice, we aim to keep the test coverage high for our code, ideally close to 100% line and branch coverage.

However, this does not guarantee that our program will not hit a `CHECK` failure in production, so we have to think about these scenarios too.

In safety-critical systems, we often isolate components into separate processes or even hardware units, with watchdogs that can trigger recovery actions if something crashes. This way we can have our cake and eat it at the same time: using `CHECK` minimizes the time-to-failure when a bug is encountered, while our fallback options keep the system safe as a whole even when certain components fail.

That being said, such design of a system as a whole is a large architecture topic in itself and is far beyond what I want to talk about today.

# Recoverable errors: **handle and proceed**

Now, what I actually *want* to talk about today is **recoverable errors**.

To talk about them, let's start with an example function:

```cpp
std::string GetAnswerFromLlm(const std::string& question);
```

This function is supposed to call some LLM over the network. It’s supposed to return a response. But what if the network is down? Or we ran out of LLM tokens? Or the AI became self aware and is refusing to answer our stupid questions?

Until that happens it is up to us to decide what our function does in case of a failure!

Broadly speaking, we have two strategies of communicating failures like these that have emerged in C++ over the years:

1. **Return a special value from a function.**
2. Throw an exception.

We’ll spend most of our time on the first one—but let’s first spend some time and talk about throwing exceptions, and yes, why I think it might not be the best thing we could do. This is the time to get your pitchforks ready 😉.

## Exceptions

### What exceptions are

Since C++98 we have a powerful machinery of exceptions at our disposal. An exception is essentially just an object of some type, typically derived from [`std::exception`](https://en.cppreference.com/w/cpp/error/exception.html) class. Such an exception holds the information about the underlying failure and can be "thrown" and "caught" within a C++ program.

In our example function, we could throw an object of `std::runtime_error` when the network is not available:

```cpp
std::string GetAnswerFromLlm(const std::string& question) {
  const auto llm = GetLlmHandle();  // Assuming GetLlmHandle exists.
  if (!llm) throw std::runtime_error{"No network connection"};
  return llm->GetAnswer(question);
}
```

And handle this exception by catching it by reference, which is possible because `std::runtime_error` derives from `std::exception`:

```cpp
#include <iostream>

std::string GetAnswerFromLlm(const std::string& question) {
  const auto llm = GetLlmHandle();  // Assuming GetLlmHandle exists.
  if (!llm) throw std::runtime_error{}"No network connection"};
  return llm->GetAnswer(question);
}

int main() {
  try {
    const auto response = GetAnswerFromLlm("What should I do?");
    std::cout << response << "\n";
  } catch (const std::exception& e) {
    std::cerr << "Error: " << e.what() << "\n";
  }
}
```

On paper, this looks clean. But there are problems.

### Exceptions are (sometimes) expensive

Exceptions typically [allocate memory on the heap](memory_and_smart_pointers.md#the-heap) when thrown, and rely on **R**un-**T**ime **T**ype **I**nformation ([RTTI](https://en.wikipedia.org/wiki/Run-time_type_information)) to propagate through the call stack. There is a [great talk by Andreas Weiss](https://www.youtube.com/watch?v=kO0KVB-XIeE), my former colleague at BMW, that goes into a lot of detail how exactly exceptions behave. The talk is called "Exceptions demystified" and I urge you to give it a watch if you want to know *all* the details!

But long story short, both throwing and catching exceptions relies on mechanisms that work at runtime and therefore cost execution time.

Unfortunately, there are no guarantees on timing or performance of these operations. While in most common scenarios these operations run fast-enough, in real-time or safety-critical code, such unpredictability is unacceptable.

### Exceptions hide the error path

Exceptions also arguably make control flow harder to reason about. To quote Google C++ style sheet:

> Exceptions make the control flow of programs difficult to evaluate by looking at code: functions may return in places you don't expect. This causes maintainability and debugging difficulties.

Indeed, an error can propagate across many layers of calls before being caught. It’s easy to miss what a function might throw—especially if documentation is incomplete or out of date (which it almost always is).

Furthermore, the language permits the use of generic catch blocks like `catch (...)` and these make things even more confusing. We end up catching *something*, but we no longer know what or who threw it at us! 😱

In our own example, if `GetAnswerFromLlm` throws an undocumented `std::logic_error` but we only expect `std::runtime_error`, we might miss important context or even crash anyway:

```cpp
#include <iostream>

std::string GetAnswerFromLlm(const std::string& question) {
  const auto llm = GetLlmHandle();
  if (!llm) throw std::runtime_error("No network connection");
  return llm->GetAnswer(question);
}

int main() {
  try {
    const auto response = GetAnswerFromLlm("What’s the meaning of life?");
    std::cout << response << "\n";
  } catch (...) {
    // Not very helpful, is it?
    std::cerr << "Oops, something happened.\n";
  }
}
```

<img src="images/error.png.webp" alt="Video Thumbnail" align="right" width=30% style="margin: 0.5rem">

I believe that `catch(...)` and equivalent constructs are singlehandedly responsible for the absolute majority of the fun error messages that we can see all over the internet and have probably encountered ourselves multiple times.

### Exceptions are banned in many code bases

All of these issues led a lot of code bases to ban exceptions altogether. In 2019, isocpp.org did a [survey](https://isocpp.org/files/papers/CppDevSurvey-2018-02-summary.pdf) on this matter and found that about half the respondents could not use exceptions at least in part of their code bases.

My own experience aligns with these results - every serious project I’ve worked on either banned exceptions completely, or avoided them in performance-critical paths. But then again, I did work in robotics and automotive for the majority of my career.

The problem of using exceptions with an acceptable overhead has quite vibrant discussions around it with even calls for re-imagining exceptions altogether as can be seen in this [wonderful talk by Herb Sutter](https://www.youtube.com/watch?v=ARYP83yNAWk) from CppCon 2019 as well as his [corresponding paper](https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2019/p0709r4.pdf) on this topic.

<!-- That is linked in description to this video. -->

But until the C++ community figures out what to do we are stuck with many people being unable to use the default error handling mechanism in C++.

So what do we do?

## Returning errors explicitly can work better if done well

Now is a time to return to the other option we hinted at before: dealing with errors by returning a special value from a function.

I would way that there are three distinct ways of thinking about it.
Let's illustrate all of them on a function we've already looked at:

```cpp
std::string GetAnswerFromLlm(const std::string& question);
```

We can:

1. Keep the return type, `std::string` in our case, but return a special **value** of this type
2. Return an **error code**, which would change the signature of the function to return `int` or a similar type instead:

    ```cpp
    int GetAnswerFromLlm(const std::string& question, std::string& result);
    ```

3. Return a **different type** specifically designed to encode failure states alongside the actual return, like `std::optional<std::string>` which only holds a valid `std::string` in case of success.

I believe that the third option is the best out of these three, but let me explain why the first two are not cutting it, before going deeper into details.

### Returning a value indicating error does not always work 😱

There is a number of issues with returning a special value from a function without using a special return type. As an illustration, in our case, a naïve choice would be to return an empty string if there was no answer from the LLM, but what if we asked the LLM something along the lines of "read this file, return empty string when done"? An empty string *is* the valid response here! How do we distinguish this output from a failure?

```cpp
std::string GetAnswerFromLlm(const std::string& question) {
  const auto llm = GetLlmHandle();
  if (!llm) return "";  // 😱 Not a great idea!
  return llm->GetAnswer(question);
}
```

Similar cases can be constructed for most values we can come up with. In addition to that, there is no easy way to encode the *reason* for the failure - we do want to know if we failed due to a network timeout or due to an imminent AI world takeover. And a final nail in the coffin of this method is that it does not work at all for functions that return `void` for obvious reasons.

### Returning an error code breaks "pure functions" 😱

Returning an error code instead solves at least a couple of these issues. It is fast and reliable and we can design our software with different error codes in mind so that the reason for the failure is also communicated to us. This is also still the prevalent way of handling errors in C and in some library that we can find in the wild, so there *is* some merit to this method.

However, if our function actually must return a value, the only way to use error codes is to change its return type to the type that our error codes have, like `int`, which forces us to provide an additional output parameter to our function, like `std::string& result` in our case:

```cpp
int GetAnswerFromLlm(const std::string& question, std::string& result);
```

The main issue with this from my point of view is that it is clunky, mixes input/output in the signature, and limits functional composition. Consider how we would use this function:

```cpp
int main() {
    std::string response{};  // Can't be const!
    const auto success = GetAnswerFromLlm("What’s the meaning of life?", response);
    if (!success) {
      std::cerr << "Could not get the result from LLM\n";
      return 1;
    }
    std::cout << response << "\n";
}
```

In this code, we have to create an empty string before calling the `GetAnswerFromLlm` function. Furthermore this string cannot be `const`, which goes against everything we've been talking in this series until now.

On top of all this, nowadays, the compilers are able to perform Return Value Optimization (or [RVO](https://en.cppreference.com/w/cpp/language/copy_elision.html)) for values returned from a function and this functionality is limited for such input/output parameters.

So clearly, there are some issues with this method too. I believe it has its merits sometimes, but there has to be a reason for it and we must measure the performance well.

### Using `std::optional`: **a better way**

I believe that there *is* a better way. With C++17, we gained [`std::optional`](https://en.cppreference.com/w/cpp/utility/optional.html) with which we can express that a function “might return a value” if everything goes well:

```cpp
std::optional<std::string> GetAnswerFromLlm(const std::string& question);
```

Now our function returns an object of a different type, `std::optional<std::string>` that we can use in an `if` statement to find out if it actually holds a value, which we can get to by calling its `value()` method or using a dereferencing operator `*` just like with pointers:

```cpp
int main() {
  const auto answer = GetAnswerFromLlm("What now?");
  if (answer.has_value()) return 1;
  std::cout << answer.value() << "\n";
  std::cout << *answer << "\n";  // Same as above.
}
```

The presence or absence of a value is encoded into the type itself. No more guessing. No more relying on magic return values or input/output arguments. And as always, we can always find more information about how to use it at [cppreference.com](https://en.cppreference.com/w/cpp/utility/optional.html).

### Using `std::expected`: **add context**

However, we might notice that `std::optional` only tells us that *something* went wrong, but not *what* went wrong. We're still interested in a reason!

Enter [`std::expected`](https://en.cppreference.com/w/cpp/utility/expected.html), coming in C++23. And if you'd like to know what led to it being added to the language, give this [fantastic talk by Andrei Alexandrescu](https://www.youtube.com/watch?v=PH4WBuE1BHI) a watch! It is one of my favorite talks ever! It is both informative and entertaining in an equal measure!

<!-- However, please do that after watching this video to the end so that YouTube still shows it to other people. -->

With `std::expected` we could do the same things we could with `std::optional` and more by changing our function accordingly:

```cpp
std::expected<std::string, std::string> GetAnswerFromLlm(const std::string& question);
```

Essentially, `std::expected` holds one of two values of two potentially different types - an expected or an unexpected one. Now we can return either a valid result, or an error message:

```cpp
std::expected<std::string, std::string> GetAnswerFromLlm(const std::string& question) {
  const auto llm = GetLlmHandle();
  if (!llm) return std::unexpected("Cannot get LLM handle.");
  return llm->GetAnswer(question);
}
```

This has all the benefits we mentioned before:

- The signature of our function clearly states that it might fail
- The error if it happens needs to be dealt explicitly by the caller
- Everything happens in deterministic time with no RTTI overhead
- World for functions returning `void` too

Using it is also quite neat:

```cpp
int main() {
  const auto answer = GetAnswerFromLlm("What now?");
  if (!answer.has_value()) {
    std::cerr << answer.error() << "\n";
    return 1;
  }
  std::cout << answer.value() << "\n";
}
```

There is just one tiny issue that spoils our fun. As you've probably noticed, most of the things we covered until now targeted C++17, and `std::expected` is only available from C++23 on. But there is a solution to this: we can use [`tl::expected`](https://github.com/TartanLlama/expected) as a drop-in replacement for code bases that don't yet adopt C++23.

## Performance Considerations for `std::optional` and `std::expected`

One final thing I want to talk about is performance considerations when using `std::optional` and `std::expected`.

### Error type size matters

Both `std::optional` and `std::expected` are implemented using [`union`](https://en.cppreference.com/w/cpp/language/union.html)-like storage internally—meaning the value and error share memory with the bigger type defining the amount of memory allocated. Note that we should not use `union` directly in our code, but a number of standard classes use it under the hood.

In the case of `std::optional` this does not play much of a difference, as the "error" type is a tiny `std::nullopt_t` type but for `std::expected`, the error type affects the size of the object—even when we’re returning a success.

So this is something to avoid:

```cpp
// Bad idea, wasting memory 😱
std::expected<int, HugeErrorObject> SomeFunction();
```

Every return now has the size of the larger type. Don't do this!

<!-- TODO: Should I provide a good way of doing things? -->

### Return value optimization

There is also one quirk with how these types interact with the return value optimization and named return value optimization in C++. These topics are quite nuanced, but in general, the rule of thumb here is quite simple: we should prefer constructing the `std::expected` and `std::optional` objects in-place rather than creating a local variable first.

For more details, I'll refer you to a [short video by Jason Turner](https://www.youtube.com/watch?v=0yJk5yfdih0) on this.

## Summary

We went through quite some material today. We've looked at all the various kinds of ways to deal with errors happening in our (and somebody else's) code. As a short summary, I hope that I could convince you that these are some sane suggestions:

<!-- TODO: Maybe summarize all the options we covered with quick overview of what to use? -->

- Use `CHECK` and similar macros for dealing with unrecoverable errors like programming bugs or contract violation.
- Use `std::optional` as a return type when a value might be missing due to a recoverable error occurring.
- Use `std::expected` when a reason for failure is important to know.
- Keep the test coverage of the code high to reduce chances of missing errors.
- Avoid exceptions in time-critical or safety-critical systems due to their non-deterministic runtime overhead.

All in all, the overall direction that we seem to be following as a community is to make failure explicit and force the caller to handle it. That leads to clearer, safer, and more maintainable code.

One final thing I wanted to add is that obviously, the `std::optional` class can be used also in other places, not just as a return type from a function. If some object of ours must have an optional value, using `std::optional` can be a good idea there too! But I'm sure you're going to be able to figure this out from the related [cppreference page](https://en.cppreference.com/w/cpp/utility/optional.html).

<!-- Thanks for watching everyone! If you find these videos useful, just let them play fully through to the end so that YouTube shows them to more people! And maybe watch one of these other videos of mine once you're at it? Click here to watch a video on how to set up GoogleTest framework with CMake! Or here to refresh how dynamic polymorphism works and why it takes time at runtime!

See you in the next one! Bye! -->
