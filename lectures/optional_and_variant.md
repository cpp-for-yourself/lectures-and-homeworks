
**`std::optional` and `std::variant` in Modern C++**
--

<p align="center">
  <a href="https://youtu.be/dummy_link"><img src="https://img.youtube.com/vi/dummy_link/maxresdefault.jpg" alt="Video Thumbnail" align="right" width=50% style="margin: 0.5rem"></a>
</p>

When working with modern C++ (C++17 and beyond), we often need tools to handle optional values or represent data that can take one of several types. That’s where `std::optional` and `std::variant` come into play. Today, we’ll explore what these features are, why they’re useful, and how to use properly them.

<!-- Intro -->

## Why use `std::optional`?
To understand why we need `std::optional` I believe its best to start with an example.

Let's say we have a function `GetAnswerFromLlm` that, getting a question, is supposed to answer all of our questions using some large language model.
```cpp
#include <string>

std::string GetAnswerFromLlm(const std::string& question);
```

In a normal case, this is a good-enough interface, we ask it things and get some answers. But what happens if something goes wrong within this function? What if it _cannot_ answer our question? What should it return so that we know that an error has occurred.

Largely speaking there are two school of thought here:
- It can throw an **exceptions** to indicate that some error has happened
- Or it can return a special value to indicate a failure

I will not talk too much about exceptions today, I will just mention that in many codebases, especially those that contain safety-critical code, exceptions are banned altogether due to the fact that there is, strictly speaking, no way to guarantee their runtime performance because of their dynamic implementation.

This prompted people to think our of the box to avoid using exceptions but still to know that something went wrong during the execution of their function.

In the olden days (before C++17), people would return a special value from the function. For example, we could just return some pre-defined string, for example an empty one, should something have gone wrong. But what if we ask our LLM to actually return an empty string and it would fail to do so? What should it return then?

This is where `std::optional` comes to the rescue. We can now return a `std::optional<std::string>` instead of just returning a `std::string`:
```cpp
#include <optional>
#include <string>

std::optional<std::string> GetAnswerFromLlm(const std::string& question);
```
Now it is super clear when reading this function that it might fail because it only optionally returns a string.

`llm.hpp`
```cpp
#include <optional>
#include <string>

std::optional<std::string> GetAnswerFromLlm(const std::string& question);
```

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

## Why use `std::variant`?

`std::variant` is a type-safe union introduced in C++17. It allows a variable to hold one value out of a defined set of types. Think of it as a more flexible alternative to `enum` or `std::any`, but with static type checking.

For instance, if a variable can hold either an integer or a string, you can use `std::variant` instead of rolling your own solution with `void*` or `boost::variant`.

### Examples of `std::variant` in action

#### Basic usage

````cpp
#include <variant>
#include <iostream>
#include <string>

int main() {
    std::variant<int, std::string> value;

    value = 42;  // Assign an integer
    std::cout << "Integer: " << std::get<int>(value) << '\n';

    value = "Hello, std::variant!";  // Assign a string
    std::cout << "String: " << std::get<std::string>(value) << '\n';
}
````
#### Pattern matching with `std::visit`

````cpp
#include <variant>
#include <iostream>
#include <string>

int main() {
    std::variant<int, std::string> value = "Hello, Variant!";

    std::visit([](auto&& arg) {
        using T = std::decay_t<decltype(arg)>;
        if constexpr (std::is_same_v<T, int>) {
            std::cout << "Integer: " << arg << '\n';
        } else if constexpr (std::is_same_v<T, std::string>) {
            std::cout << "String: " << arg << '\n';
        }
    }, value);
}
````
Here, `std::visit` applies a visitor (a callable object) to the value contained in the variant.

---

## **Key differences and common use cases**

| Feature           | `std::optional`                                      | `std::variant`                                  |
|--------------------|------------------------------------------------------|------------------------------------------------|
| Purpose           | Represents optional values (may or may not exist).   | Represents one of several types.              |
| Typical Use Case  | Returning a value or "nothing" from a function.       | Handling inputs or data with multiple types.  |
| Type Safety       | Yes.                                                  | Yes.                                           |
| Pattern Matching  | Not applicable.                                       | Supported via `std::visit`.                   |

---

## **Summary**

`std::optional` and `std::variant` are two powerful tools in the C++ toolbox that greatly enhance type safety and code readability.

- Use `std::optional` when a value might be absent.
- Use `std::variant` when a value can be one of several types.

These features enable us to write cleaner, more expressive code while avoiding common pitfalls. Experiment with them in your projects and see how they can simplify your development workflow!
