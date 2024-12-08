
**`std::optional` and `std::expected` in Modern C++**
--

<p align="center">
  <a href="https://youtu.be/dummy_link"><img src="https://img.youtube.com/vi/dummy_link/maxresdefault.jpg" alt="Video Thumbnail" align="right" width=50% style="margin: 0.5rem"></a>
</p>

When working with modern C++, we often need tools to handle optional values. These are useful in many situations, like when returning from a function that might fail during execution. Since C++17 we have a class `std::optional` that can be used in such situations. And since C++23 we're also getting `std::expected`. So let's chat about what these types are, when to use them and what to think about while using them.

<!-- Intro -->


## Use `std::optional` to represent optional class fields
For example, imagine we implement a game and we have some items that it can hold in either hand.
```cpp
template<class Item>
struct Character {
  Item left_hand_item;
  Item right_hand_item;
};
```

The character, however, might hold nothing in their hands, so how do we model this?

We _could_ just replace them with pointers and if there is a `nullptr` stored there it would mean that the character holds no item there. But this has certain drawbacks as it changes the semantics of these variables. Before, our `Character` object had value semantics and now it follows pointer semantics under the hood, meaning that copying our `Character` object would become harder. The simple choice of allowing the character to have no objects in their hands should not force these unrelated design decisions.

One way to avoid this issue is to store a `std::optional<Item>` in each hand of the character instead:
```cpp
template<class Item>
struct Character {
  std::optional<Item> left_hand_item;
  std::optional<Item> right_hand_item;
};
```

Now it is clear just by looking at this tiny code snippet that neither item is required for the correct operation of the character and we did not change the value-semantics of our object.

Before we talk about how to use `std:::optional`, I'd like to first talk a bit about another important use-case - error handling.

## Use `std::optional` to return from functions that might fail
Let's say we have a function `GetAnswerFromLlm` that, getting a question, is supposed to answer all of our questions using some large language model.
```cpp
#include <string>

std::string GetAnswerFromLlm(const std::string& question);
```

This is a simple interface that serves its purpose in most situations: we ask it things and get some `std::string` answers. But what happens if something goes wrong within this function? What if it _cannot_ answer our question? What should it return so that we know that an error has occurred.

Largely speaking there are two schools of thought here:
- It can throw an **exception** to indicate that some error has occurred
- It can return a special value to indicate a failure

### Why not throw an exception
We'll have to briefly talk about the first option here if only to explain why we're not going to talk about in-depth.

Generally, at any point in our program we can `throw` an exception. It then is handled in a separate execution path, invisible to the user and can be caught at any point in the program upstream from the place where the exception was thrown.

In our case, the `GetAnswerFromLlm` would then throw an exception if, say, the network was down and our LLM of choice was unreachable:
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
If we are set on using exceptions, on the calling side, we would need to "catch" exceptions using the `try`-`catch` blocks. Generally, we wrap the code we want to execute into a `try` block that is followed by a `catch` block that handles all of our potential errors.
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
I will not talk too much about exceptions, mostly because in all of my decade of using C++ professionally I very rarely worked in code bases that use exceptions. Many code bases, especially those that contain safety-critical code, ban exceptions altogether due to the fact that there is, strictly speaking, no way to guarantee how long it takes to process an exception once one is thrown because of their dynamic implementation.

Furthermore, they have another issue of creating a hidden logic path that can be hard to trace. We have to become very rigorous about what function throws which exceptions when and, in some cases, the only way to know this is by relying on a documentation of a function which, in many cases, does not fully exist. I firmly believe that the statement `catch (...)` is singlehandedly responsible for many errors that you've undoubtedly encountered before yourself. Just imagine that the `LlmHandle::GetAnswer` function also throws some other exception that we don't expect - this would lead us to showing the "unexpected error happened" message, which is not super useful to the user of our code.
<!-- TODO: add an image of a funny error of "oops something happened" -->

### Avoid the hidden error path
All of these issues prompted people to think out of the box to avoid using exceptions but still to allow them to know that something went wrong during the execution of their function.

In the olden days (before C++17), there were only three options:
1. To return a special value from the function that indicates a failure:
    ```cpp
    #include <string>

    // 😱 Not a great idea nowadays.
    std::string GetAnswerFromLlm(const std::string& question, std::string& answer) {
      const auto llm_handle = GetLlmHandle();
      if (!llm_handle) { return {}; }
      return llm_handle->GetAnswer(question);
    }
    ```
    This option is not ideal because it is hard to define an appropriate "failure" value to return from most functions. For example, an empty string sounds like a good option for such a value, but then the LLM response to a query "Read this text, answer with empty string when done" would overlap with such a default value. Not great and the logic would be similar for any string we would designate as the failure value.
2. Another historic option is to return an error code from the function, which required passing any values that the function had to change as a non-const reference or pointer:
    ```cpp
    #include <string>

    // 😱 Not a great idea nowadays.
    int GetAnswerFromLlm(const std::string& question, std::string& answer) {
      const auto llm_handle = GetLlmHandle();
      if (!llm_handle) { return 1; }
      answer = llm_handle->GetAnswer(question);
      return 0;
    }
    ```
    This options is equally poor because now we lose a lot of benefits that we get with the compiler optimizing the return value that we get from a function and also reduce the readability of the code. This method is error prone and hard to read. Not great either.
3. An even worse but also still used method (OpenGL, anyone?) method is to set some global error variable and explore its value after every call to see if something bad has happened.
    ```cpp
    #include <string>

    // 😱 Not a great idea to have a global variable.
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
    I believe I don't have to go into many details as to why his is not an ideal way to deal with errors: it is even less readable and more error prone than the previous method. We even have to use a global variable! Good luck testing this code, especially when running a number of tests in parallel.

But I would not be telling you all of the above if there were no better way of course. This is where `std::optional` comes to the rescue. Instead of all of the horrible things we've just discussed, we can return a `std::optional<std::string>` instead of just returning a `std::string`:

`llm.hpp`
```cpp
#include <optional>
#include <string>

std::optional<std::string> GetAnswerFromLlm(const std::string& question);
```
Now it is super clear when reading this function that it might fail because it only optionally returns a string. It also forces us to deal with any potential error happening inside of this function when we call it because the _type_ or the value we get forces us to do it. No hidden error path!

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
    ", and then to " << *further_suggestion << std::endl;
  return 0;
}
```
In general, `std::optional` provides an interface in which we are able to:
- Check if it holds a value by calling its `has_value()` method or implicitly converting it to `bool`
- Get the stored value by calling `value()` or using a dereferencing operator `*`. Beware, though that getting a value of an optional that holds no value is undefined behavior, so _always check_ that there is actually a value stored in an optional.

There are many use-cases for `optional` in situations where we want to be able to handle a case where a value might exist but also might be missing under certain circumstances.

<!-- TODO: talk about how it is implemented through variant and maybe std expected, also get_value_or -->

## What about `std::expected`
There is just one more quality of life improvement that we are missing here. If we receive a `std::optional` object that stores a `std::nullopt` in it as a result of a function call, we know that the function failed. But we don't know **why** it failed.

This is why in C++23 we are getting a class `std::expected` that, while being very similar to `std::optional` has another template parameter: `std::expected<ResultT, ErrorT>` that stores the type of an error that might be stored in this object instead of the value we expect. This way, we can store arbitrary values to indicate that an error has occurred:
```cpp
#include <string>

// 😱 Not a great idea to have a global variable.
inline static int last_error{};

// 😱 Not a great idea nowadays.
std::expected<std::string, std::string> GetAnswerFromLlm(const std::string& question) {
  const auto llm_handle = GetLlmHandle();
  if (!llm_handle) {
    return std::unexpected{"No network"};
  }
  return llm_handle->GetAnswer(question);
}
```
Now if we have a network outage, we can return an error that tells us about this being the case and should the `LlmHandle::GetAnswer` return an expected too, it would automagically propagate to the caller of the `GetAnswerFromLlm` function.

## Performance implications
Largely speaking, both `std::optional` and `std::expected` are both implemented as a `union` in C++, meaning that the expected and unexpected values are stored _in the same underlying memory_ with helper functions allowing us to query which one is actually stored there.

This means that if the unexpected type is smaller than the expected type, there is no memory overhead. This leads us to the first performance consideration: do not use large types for the unexpected type in `std::expected`. There is not much we can do wrong with `std::optional` on this front as it holds a small `std::nullopt` type if it does not hold the expected type.

As these types are compile-time they also allow the compiler to optimize the code that uses them quite well and generally do not have any overhead over a single `if` statement. Which leads us to our second performance consideration: if you have a very tight loop that does not use optional or expected values, measure the runtime of your code if you need to introduce those and make sure that performance is still satisfied.

Finally, there are some quirks of the compilers and how they work around optimizing the return values from the functions. If we create objects that we aim to return in a wrong way, the compiler might generate unnecessary moves or copies of the objects. Here is how to return our objects:
<!-- TODO: example from Jason's video -->
For more please see a short and clear video by Jason Turner that covers this topic.
<!-- Link Jason Turner's video -->

## Summary
Overall, classes like `std::optional` and `std::expected` are extremely useful to represent values that optionally hold a value. Sometimes it is enough for us to know that the value simply might not exist, that's where `std::optional` shines but sometimes we would also like to know **why** the value does not exist and that's why `std::expected` has been added.

These classes are super useful - they make the code readable, maintain value semantics which is used quite often when coding in modern C++ and keep the code very performant.

<!-- I hope that this video was a useful overview on why and how to use std::optional and std::expected and next time we're about to have a look at `std::variant` to also have a look at how these can be implemented. -->
