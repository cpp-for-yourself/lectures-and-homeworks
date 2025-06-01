
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

This isn’t a one-size-fits-all topic. C++ is huge, powerful, and used across every domain imaginable for a long time.

*My* perspective comes from domains like robotics and automotive—where predictability, traceability, and safety are of highest importance. What works for us may not work for everyone.

That being said, I believe that what I present here will fit to many domains with minimal adaptation. Where possible, I’ll try to mention multiple possible options and if I *do* miss an important one—please let me know!

<!-- in the comments -->

# What Do We Mean by “Error”?

Before we go into how to handle errors, let’s clarify what we mean when we say "error" in the first place.

At the highest level: an error is when the code doesn’t produce the expected result. But there is nuance here!

We generally split these into two broad groups:

- **Unrecoverable errors** — where the program reaches an invalid or inconsistent state, and continuing could be unsafe or meaningless.
- **Recoverable errors** — where the program can detect something went wrong, and has ways to proceed by an alternative path.

Some languages—like Rust—bake this distinction into the type system. C++ doesn’t. But the classification is still useful, especially when designing interfaces.

# Unrecoverable errors: **fail early**

## How to deal with unrecoverable errors

Let’s start with the errors we don’t want to recover from.

These usually come from bugs: a violated precondition, accessing something that shouldn’t be accessed, or hitting undefined behavior. In all of these cases the program is already in some unknown state, so we have no guarantees on anything that happens next. So recovery is most likely impossible.

We often want to catch these types of errors as early as possible—and crash as early as possible—before any more damage is done.

A typical approach is to enforce contracts at function boundaries. My favorite method is to use the `CHECK` macro that can be found in Abseil library. Here’s a tiny example of checking if the element actually exists in a vector before returning it:

```cpp
#include <absl/log/check.h>

int GetElementAt(const std::vector<int>& v, std::size_t index) {
  CHECK(index < v.size());  // Contract check.
  return v[index];
}
```

This is simple: we check upfront that an index is actually valid. If it isn’t, we crash instead of going into the undefined behavior land.

Same pattern can be used in any other places where certain pre-conditions must be met in order to proceed, like in this example where some `data` object needs to be valid in order to be processed:

```cpp
void ProcessSensorData(const SensorData& data) {
  CHECK(data.IsValid());
  // Safe to process data here.
}
```

We don't try to continue with invalid data. We stop.

Under this philosophy, we essentially treat bugs as bugs—not as conditions we can try to live with.

## How to minimize number of unrecoverable errors

Of course, we'd rather not hit them at all. In practice, we rely on:

- High test coverage—ideally line coverage close to 100%.
- Contract checks on inputs and outputs.
- Assertions during development to catch bad assumptions early.

In safety-critical systems, we often isolate components into separate processes or even hardware units, with watchdogs that can trigger recovery actions if something crashes. This way we minimize the time to failure while keeping the system safe as a whole even when certain components fail.

But again, that’s recovery at the system level—not inside the code where the error occurred. This is a large architecture topic in itself and is far beyond what I want to talk about today.

# Recoverable errors: **handle and proceed**

Now, what I actually want to talk about today is **recoverable errors**.

To talk about them, let's start with an example function:

```cpp
std::string GetAnswerFromLlm(const std::string& question);
```

This function is supposed to call some LLM over the network. It’s supposed to return a response. But what if the network is down? Or we ran out of LLM tokens?

We have to decide: what does the function do in that case?

We have two broad strategies of communicating a failure that have emerged in C++ over the years:

1. **Return a special value from a function.**
2. Throw an exception.

We’ll spend most of our time on the first one—but let’s first spend some time and talk about what might be wrong with just throwing an exception.

## Exceptions

### What exceptions are

Since C++98 we have a powerful machinery of exceptions at our disposal. An exception is essentially just an object of some class, typically derived from [`std::exception`](https://en.cppreference.com/w/cpp/error/exception.html) class. Such an exception holds the information about the underlying failure and can be "throws" and "caught" within a C++ program.

In our example, we could throw a `std::runtime_error` when the network is not available:

```cpp
std::string GetAnswerFromLlm(const std::string& question) {
  auto llm = GetLlmHandle();
  if (!llm) throw std::runtime_error("No network connection");
  return llm->GetAnswer(question);
}
```

And handle this exception by catching it by reference, which is possible because `std::runtime_error` derives from `std::exception`:

```cpp
#include <iostream>

std::string GetAnswerFromLlm(const std::string& question) {
  auto llm = GetLlmHandle();
  if (!llm) throw std::runtime_error("No network connection");
  return llm->GetAnswer(question);
}

int main() {
  try {
    auto response = GetAnswerFromLlm("What should I do?");
    std::cout << response << "\n";
  } catch (const std::exception& e) {
    std::cerr << "Error: " << e.what() << "\n";
  }
}
```

On paper, this looks clean. But there are problems.

### Exceptions are (sometimes) expensive

Exceptions typically [allocate memory on the heap](memory_and_smart_pointers.md#the-heap) when thrown, and rely on **R**un-**T**ime **T**ype **I**nformation (RTTI) to propagate through the call stack.

Both of these operations happen at runtime of the program and cost some time. Unfortunately, there are no guarantees on timing or performance of these operations. While in most common scenarios these operations run fast-enough, in real-time or safety-critical code, such unpredictability is unacceptable.

Every serious project I’ve worked on either banned exceptions completely, or avoided them in performance-critical paths.

<!-- TODO: link Stack Overflow questionnaire about using exceptions -->
<!-- TODO: link to herb sutter's proposal: https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2019/p0709r4.pdf -->
<!-- https://www.youtube.com/watch?v=ARYP83yNAWk - reimageining exceptions -->

### Exceptions hide the error path

Exceptions also make control flow harder to reason about.

The error can propagate across many layers of calls before being caught. It’s easy to miss what a function might throw—especially if documentation is incomplete or out of date (which it almost always is).

Furthermore, we can use generic catch blocks like `catch (...)` and these make things even worse. We end up catching *something*, but we no longer know what or why.

Here's a real-world style example:

```cpp
#include <iostream>

std::string GetAnswerFromLlm(const std::string& question) {
  auto llm = GetLlmHandle();
  if (!llm) throw std::runtime_error("No network connection");
  return llm->GetAnswer(question);
}

int main() {
  try {
    auto answer = GetAnswerFromLlm("What’s the meaning of life?");
    std::cout << answer << "\n";
  } catch (...) {
    // Not very helpful, is it?
    std::cerr << "Oops, something happened.\n";
  }
}
```

<img src="images/error.png.webp" alt="Video Thumbnail" align="right" width=30% style="margin: 0.5rem">

If `GetAnswerFromLlm` throws `std::logic_error` but we only expect `std::runtime_error`, we might miss important context or even crash anyway.

I believe that `catch(...)` and equivalent constructs are singlehandedly responsible for the absolute majority of the funny error messages that you've undoubtedly seen all over the internet.

## Returning errors explicitly can work better if done well

Instead of throwing exceptions, we can encode failure directly in the return value from our function.

I would way that there are three distinct ways of thinking about it.
Let's illustrate all of them on a function we've already looked at:

```cpp
std::string GetAnswerFromLlm(const std::string& question);
```

We can:

1. Return a special **value** of the same return type, `std::string` in our case
2. Return an error code, which would change the signature of the function to return `int` instead:

    ```cpp
    int GetAnswerFromLlm(const std::string& question, std::string& result);
    ```

3. Return a different type `std::optional<std::string>` which only holds a valid `std::string` in case of success.

I believe that the third option is the best out of these three, but let me explain why first, before going deeper into details.

### Returning a value indicating error does not always work 😱

There is a number of issues with returning a special error value from a function. In our case, a naïve choice would be to return an empty string if there was no answer from the LLM, but what if we asked the LLM something along the lines of "read this file, return empty string when done"? An empty string *is* the valid response here!

Similar cases can be constructed for most values we can come up with. In addition to that, there is no easy way to encode the *reason* for the failure, like that the network was down. And a final nail in the coffin of this method is that it does not work at all for functions that return `void` for obvious reasons.

### Returning an error code breaks "pure functions" 😱

Returning an error code solves at least a couple of issues for us. It is fast and reliable and we can design our software with different error codes in mind so that the reason for the failure is also communicated to us. This is also still the prevalent way of handling errors in C, so there _is_ some merit to this method.

However, if our function actually must return a value, the only way to use error codes is to change its return type to the type that our error codes have, like `int`, which forces us to provide an additional output parameter to our function, like `std::string& result` in our case:

```cpp
int GetAnswerFromLlm(const std::string& question, std::string& result);
```

The main issue with this from my point of view is that it is clunky, mixes input/output in the signature, and limits functional composition. Furthermore, nowadays, the compilers are able to perform Return Value Optimization for values returned from a function and this functionality is limited for such input/output parameters.

So clearly, there are some issues with this method too. I believe it has its merits sometimes, but there has to be a reason for it and the performance must be measured well.

### Using `std::optional`: **a better way**

With C++17, we gained `std::optional`.

Now, we can express “might return a value” cleanly:

```cpp
std::optional<std::string> GetAnswerFromLlm(const std::string& question);
```

And use it like this:

```cpp
int main() {
  auto answer = GetAnswerFromLlm("What now?");
  if (!answer) return 1;
  std::cout << *answer << "\n";
}
```

The presence or absence of a value is part of the type. No more guessing. No more relying on magic return values or input/output arguments.

### Using `std::expected`: **add context**

However, we might notice that `std::optional` only tells us that something went wrong, but not *what* went wrong.

Enter `std::expected`, coming in C++23.

```cpp
std::expected<std::string, std::string> GetAnswerFromLlm(const std::string& question);
```

Now we can return either a valid result, or an error message:

```cpp
if (!IsNetworkAvailable()) {
  return std::unexpected("Network unreachable");
}
```

And the caller handles both cases explicitly.

If we're on C++20 or earlier, we can use `tl::expected` as a drop-in replacement.

## Performance Considerations for `std::optional` and `std::expected`

Both `std::optional` and `std::expected` are implemented using `union`-like storage internally—meaning the value and error share memory.

There are still a few things to be aware of:

### Error type size matters

With `expected`, the error type affects the size of the object—even when we’re returning a success.

So this is something to avoid:

```cpp
std::expected<int, HugeErrorObject> SomeFunction();  // bad idea
```

Every return now has the size of the larger type.

### Return value optimization

To avoid unnecessary copies, we should return values directly:

```cpp
std::expected<std::string, std::string> GetAnswer() {
  return std::expected<std::string, std::string>{"Answer"};
}
```

Avoid creating a local variable and returning it unless needed. Let the compiler optimize the value construction.

Jason Turner has a good [video on this](https://www.youtube.com/watch?v=0yJk5yfdih0) if you want to dig into the details.

## Summary

We went through quite some material today. To summarize what we've talked about, I'd recommend the following:

- Use `std::optional` when a value might be missing.
- Use `std::expected` when we want to return either a result or an error.
- Avoid exceptions in time-critical or safety-critical systems.
- Avoid other ways of handling errors if possible.

These tools let us make failure explicit and force the caller to handle it. That leads to clearer, safer, and more maintainable code.

One final thing I wanted to add is that obviously, the `std::optional` class can be used also in other places, not just as a return type from a function. If some object of ours must have an optional value, using `std::optional` can be a good idea there too! But I'm sure you're going to be able to figure this out from the related cppreference page.

<!-- Thanks for watching everyone! If you find these videos useful, just let them play fully through so that YouTube shows them to more people! And maybe watch one of these videos once you're at it? -->
