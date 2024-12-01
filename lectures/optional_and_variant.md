
**`std::optional` and `std::variant` in Modern C++**
--

<p align="center">
  <a href="https://youtu.be/dummy_link"><img src="https://img.youtube.com/vi/dummy_link/maxresdefault.jpg" alt="Video Thumbnail" align="right" width=50% style="margin: 0.5rem"></a>
</p>

## **Introduction**

When working with modern C++ (C++17 and beyond), we often need tools to handle optional values or represent data that can take one of several types. That’s where `std::optional` and `std::variant` come into play. Today, we’ll explore what these features are, why they’re useful, and how you can leverage them in your projects.


## **What is `std::optional`?**

### Why use `std::optional`?

Imagine a function that searches for an item in a container. If the item is found, the function should return it. But what if it isn’t? Before C++17, you might have returned a special value (like `-1` for integers) or used a pointer, potentially introducing ambiguity or risking undefined behavior.

`std::optional` solves this by explicitly representing the absence of a value. It's a type-safe mechanism that avoids the pitfalls of ad-hoc solutions.

### Examples of `std::optional` in action

#### A simple search function

````cpp
#include <optional>
#include <iostream>
#include <vector>

std::optional<int> Find(const std::vector<int>& data, int value) {
    for (int element : data) {
        if (element == value) {
            return element;  // Return the value if found
        }
    }
    return std::nullopt;  // Explicitly indicate "no value"
}

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    auto result = Find(numbers, 3);

    if (result) {  // Check if a value exists
        std::cout << "Found: " << *result << '\n';
    } else {
        std::cout << "Not found.\n";
    }
}
````
In this example, `std::optional<int>` clearly communicates that the function may or may not return a value.

#### A factory function

````cpp
std::optional<std::string> CreateString(bool should_create) {
    if (should_create) {
        return "Hello, World!";
    }
    return std::nullopt;
}

int main() {
    auto maybe_string = CreateString(true);

    if (maybe_string) {
        std::cout << *maybe_string << '\n';
    } else {
        std::cout << "No string created.\n";
    }
}
````
---

## **What is `std::variant`?**

### Why use `std::variant`?

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
