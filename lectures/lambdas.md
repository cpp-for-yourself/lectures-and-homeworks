Lambdas
--

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

- [Lambdas](#lambdas)
- [Before lambdas we had functors](#before-lambdas-we-had-functors)
- [How is the sorting function implemented?](#how-is-the-sorting-function-implemented)
- [Enter lambdas](#enter-lambdas)
- [When to use lambdas](#when-to-use-lambdas)
- [Summary](#summary)


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
Note that we can also drop the `&` such that the call to `std::sort` becomes:
```cpp
std::sort(people.begin(), people.end(), less);
```
The reason for this is that [functions are implicitly converted to function pointers](https://en.cppreference.com/w/cpp/language/implicit_conversion#Function-to-pointer_conversion) if needed, they are special in this way.

But what if this is not enough? What if we need to have a certain state? For example, we wouldn't want to sort the people by their absolute age, but by the difference of their age with respect to some number, say `4242`.

Behold **function objects**, or **functors**. These are objects for which the function call operator is defined, or, in other words, that define an operator `()`.

So, if we want to sort our array by the age difference to `4242` we can create a struct `ComparisonToQueryAge` that has a member `query_age_` and an operator `()` that compares the age differences instead of directly the ages:
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

struct ComparisonToQueryAge {
  ComparisonToQueryAge(int query_age) : query_age_{query_age} {}

  bool operator()(const Person& p1, const Person& p2) const noexcept {
    return std::abs(p1.age - query_age_) < std::abs(p2.age - query_age_);
  }

  int query_age_{};
};

int main() {
  std::vector<Person> people{
      {"Gendalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people);
  std::sort(people.begin(), people.end(), ComparisonToQueryAge{4242});
  std::cout << "------ sorted --------" << std::endl;
  Print(people);
}
```

## How is the sorting function implemented?
So far so good. We already know a lot about structs and classes as well as their methods, so I hope that how these operate seems quite intuitive here. Furthermore, thinking back to the lectures in which we covered templates we can also imagine how to implement a function similar to `std::sort` that would take any object that is "callable" by using templates:
```cpp
template <class Iterator, class Comparator>
void MySort(Iterator begin, Iterator end, Comparator comparator) {
  // Sort using comparator(*iter_1, *iter_2) as a building block.
}

int main() {
  std::vector<Person> people{
      {"Gendalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  MySort(people.begin(), people.end(), ComparisonToQueryAge{4242});
  MySort(people.begin(), people.end(), less);
  MySort(people.begin(), people.end(), &less);
}
```

And the story doesn't end with `std::sort`. There is a number of functions that take these function objects. For some example, see `std::find_if`, `std::for_each`, `std::transform`, etc.

## Enter lambdas
However, it might not be convenient to always define a new struct, class, or even function for any use case. Sometimes we want to use such a function object only locally, within a function and don't want any overhead.

That convenience is what brought us the lambdas. This is really just a syntactic sugar for defining out own function objects using special syntax.

The syntax of defining a lambda is the following:
```cpp
[const] auto LambdaName = [CAPTURE_LIST](ARGUMENTS){BODY} -> ReturnType;
// We can call it with
LambdaName(ARGUMENTS);
```
So now you see that `[](){}()` is just a definition of a lambda that has an empty capture list, no arguments, empty body, which is called in-place right after creation (doing nothing of course). Totally useless, but a completely valid syntax!

We can replace all of our use-cases with such lambdas:
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
  std::sort(people.begin(), people.end(),
            [](const auto& p1, const auto& p2) { return p1.age < p2.age; });
  std::cout << "------ sorted --------" << std::endl;
  Print(people);

  int query_age = 4242;
  std::sort(people.begin(), people.end(),
            [query_age](const auto& p1, const auto& p2) {
              return std::abs(p1.age - query_age) <
                     std::abs(p2.age - query_age);
            });
  std::cout << "------ sorted --------" << std::endl;
  Print(people);
}
```

Furthermore we can store a lambda in a variable and reuse it multiple times. In our example, we can observe that we use `Print` function only in our main function here. While there is no issue with this function being a standalone function in an unnamed namespace, we might as well make it a lambda:
```cpp
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

int main() {
  const auto Print = [](const auto& persons) {
    for (const auto& person : persons) {
      std::cout << person.name << " " << person.age << "\n";
    }
  };

  std::vector<Person> people{
      {"Gendalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people);
  std::sort(people.begin(), people.end(),
            [](const auto& p1, const auto& p2) { return p1.age < p2.age; });
  std::cout << "------ sorted --------" << std::endl;
  Print(people);

  int query_age = 4242;
  std::sort(people.begin(), people.end(),
            [query_age](const auto& p1, const auto& p2) {
              return std::abs(p1.age - query_age) <
                     std::abs(p2.age - query_age);
            });
  std::cout << "------ sorted --------" << std::endl;
  Print(people);
}
```

## When to use lambdas
Lambdas are neat and efficient. If you need an operation that you don't think you'll need to reuse to pass into some other function, like in our example with sorting, lambdas are your friend. Alternatively, if you are implementing some functionality in a header file and find yourself writing a bit of a longer function, lambdas are usually a better way to split such function into meaningful chunks without introducing public-facing functions and not relying on comments that can easily go out of sync with the code functionality.

## Summary
TODO
