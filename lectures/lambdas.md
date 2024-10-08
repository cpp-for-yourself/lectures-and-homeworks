Lambdas
--

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

We've talked about so many things, like classes and functions but there is one more thing that modern C++ has that we did not really touch upon - lambdas.

Here's what they are useful for. Imagine we have a vector of people, represented as a struct `Person`, and we would like to sort them by age. We can use the standard [`std::sort`](https://en.cppreference.com/w/cpp/algorithm/sort) function for that.

```cpp
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

void Print(const std::vector<Person>& persons) {
  for (const auto& person : persons) {
    std::cout << person.name << " " << person.age << "\n";
  }
}

int main() {
  std::vector<Person> people{
      {"Gendalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people);
  std::sort(
      people.begin(), people.end(),
      [](const auto& left, const auto& right) { return left.age < right.age; });
  std::cout << "------ sorted --------" << std::endl;
  Print(people);
}
```
The third argument to the `std::sort` function here is the lambda expression that essentially stands in for a comparison operator between the objects of the person class.

So let's talk about lambdas! What they are, how to write them to stay safe and efficient and, yes, how they make this valid C++ code:
```cpp
int main() {
  [](){}();
}
```

<!-- Intro -->

## Before lambdas we had functors
The concept of something "callable" that we can pass into a function or even store for a while is not new to C++. It existed long before lambdas were introduced into the language.

Let's pause for a moment and talk a bit about what it means that something is "callable". Essentially it means that we can call it through a `()` operator with the expected number of arguments. So if we write a function `less(const Person&, const Person&)` and pass its pointer to `std::sort` it will do the trick:
```cpp
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

void Print(const std::vector<Person>& persons) {
  for (const auto& person : persons) {
    std::cout << person.name << " " << person.age << "\n";
  }
}

bool less(const Person& p1, const Person& p2) { return p1.age < p2.age; }

int main() {
  std::vector<Person> people{
      {"Gendalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people);
  std::sort(people.begin(), people.end(), &less);
  std::cout << "------ sorted --------" << std::endl;
  Print(people);
}
```

But what if this is not enough? What if we need to have a certain state? For example, we wouldn't want to sort the people by their absolute age, but by the difference of their age with respect to some number, say `4242`.

Behold **function objects**, or **functors**. These are objects for which the function call operator is defined, or, in other words, that define an operator `()`.
