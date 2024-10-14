Lambdas
--

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

- [Lambdas](#lambdas)
- [Overview](#overview)
- [What is a "callable"](#what-is-a-callable)
- [A function pointer is sometimes enough](#a-function-pointer-is-sometimes-enough)
- [Before lambdas we had function objects (or functors)](#before-lambdas-we-had-function-objects-or-functors)
- [How to implement generic algorithms like `std::sort`](#how-to-implement-generic-algorithms-like-stdsort)
- [Enter lambdas](#enter-lambdas)
- [Lambda syntax](#lambda-syntax)
- [When to use lambdas](#when-to-use-lambdas)
- [Summary](#summary)


We've already covered so many topics in this course but there is one more thing that firmly belongs to modern C++ that we did not really touch upon - [**lambdas**](https://en.cppreference.com/w/cpp/language/lambda).

Here's one example for which they are useful. Imagine we have a list of people, represented as a struct `Person`, and we would like to sort them by age. We can try using the standard [`std::sort`](https://en.cppreference.com/w/cpp/algorithm/sort) function for that:
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
#include <algorithm>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

int main() {
  std::vector<Person> people{
      {"Gendalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  // ❌ Won't compile, cannot compare Person objects.
  std::sort(people.begin(), people.end());
}
```
But the naïve call to `std::sort` will fail and the compiler will throw a loooong error at us:
<details>
<summary>Long compiler error</summary>

```css
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:71,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h: In instantiation of 'constexpr bool __gnu_cxx::__ops::_Iter_less_iter::operator()(_Iterator1, _Iterator2) const [with _Iterator1 = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Iterator2 = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >]':
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:82:17:   required from 'void std::__move_median_to_first(_Iterator, _Iterator, _Iterator, _Iterator, _Compare) [with _Iterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1924:34:   required from '_RandomAccessIterator std::__unguarded_partition_pivot(_RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1958:38:   required from 'void std::__introsort_loop(_RandomAccessIterator, _RandomAccessIterator, _Size, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Size = long int; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1974:25:   required from 'void std::__sort(_RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:4859:18:   required from 'void std::sort(_RAIter, _RAIter) [with _RAIter = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >]'
<source>:14:41:   required from here
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:43:23: error: no match for 'operator<' (operand types are 'Person' and 'Person')
   43 |       { return *__it1 < *__it2; }
      |                ~~~~~~~^~~~~~~~
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:67,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1096:5: note: candidate: 'template<class _IteratorL, class _IteratorR, class _Container> bool __gnu_cxx::operator<(const __gnu_cxx::__normal_iterator<_IteratorL, _Container>&, const __gnu_cxx::__normal_iterator<_IteratorR, _Container>&)'
 1096 |     operator<(const __normal_iterator<_IteratorL, _Container>& __lhs,
      |     ^~~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1096:5: note:   template argument deduction/substitution failed:
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:71,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:43:23: note:   'Person' is not derived from 'const __gnu_cxx::__normal_iterator<_IteratorL, _Container>'
   43 |       { return *__it1 < *__it2; }
      |                ~~~~~~~^~~~~~~~
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:67,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1104:5: note: candidate: 'template<class _Iterator, class _Container> bool __gnu_cxx::operator<(const __gnu_cxx::__normal_iterator<_Iterator, _Container>&, const __gnu_cxx::__normal_iterator<_Iterator, _Container>&)'
 1104 |     operator<(const __normal_iterator<_Iterator, _Container>& __lhs,
      |     ^~~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1104:5: note:   template argument deduction/substitution failed:
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:71,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:43:23: note:   'Person' is not derived from 'const __gnu_cxx::__normal_iterator<_Iterator, _Container>'
   43 |       { return *__it1 < *__it2; }
      |                ~~~~~~~^~~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h: In instantiation of 'bool __gnu_cxx::__ops::_Val_less_iter::operator()(_Value&, _Iterator) const [with _Value = Person; _Iterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >]':
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1826:20:   required from 'void std::__unguarded_linear_insert(_RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Val_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1854:36:   required from 'void std::__insertion_sort(_RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1886:25:   required from 'void std::__final_insertion_sort(_RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1977:31:   required from 'void std::__sort(_RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:4859:18:   required from 'void std::sort(_RAIter, _RAIter) [with _RAIter = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >]'
<source>:14:41:   required from here
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:96:22: error: no match for 'operator<' (operand types are 'Person' and 'Person')
   96 |       { return __val < *__it; }
      |                ~~~~~~^~~~~~~
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:67,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1096:5: note: candidate: 'template<class _IteratorL, class _IteratorR, class _Container> bool __gnu_cxx::operator<(const __gnu_cxx::__normal_iterator<_IteratorL, _Container>&, const __gnu_cxx::__normal_iterator<_IteratorR, _Container>&)'
 1096 |     operator<(const __normal_iterator<_IteratorL, _Container>& __lhs,
      |     ^~~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1096:5: note:   template argument deduction/substitution failed:
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:71,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:96:22: note:   'Person' is not derived from 'const __gnu_cxx::__normal_iterator<_IteratorL, _Container>'
   96 |       { return __val < *__it; }
      |                ~~~~~~^~~~~~~
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:67,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1104:5: note: candidate: 'template<class _Iterator, class _Container> bool __gnu_cxx::operator<(const __gnu_cxx::__normal_iterator<_Iterator, _Container>&, const __gnu_cxx::__normal_iterator<_Iterator, _Container>&)'
 1104 |     operator<(const __normal_iterator<_Iterator, _Container>& __lhs,
      |     ^~~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1104:5: note:   template argument deduction/substitution failed:
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:71,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:96:22: note:   'Person' is not derived from 'const __gnu_cxx::__normal_iterator<_Iterator, _Container>'
   96 |       { return __val < *__it; }
      |                ~~~~~~^~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h: In instantiation of 'bool __gnu_cxx::__ops::_Iter_less_val::operator()(_Iterator, _Value&) const [with _Iterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Value = Person]':
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_heap.h:139:48:   required from 'void std::__push_heap(_RandomAccessIterator, _Distance, _Distance, _Tp, _Compare&) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Distance = long int; _Tp = Person; _Compare = __gnu_cxx::__ops::_Iter_less_val]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_heap.h:246:23:   required from 'void std::__adjust_heap(_RandomAccessIterator, _Distance, _Distance, _Tp, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Distance = long int; _Tp = Person; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_heap.h:355:22:   required from 'void std::__make_heap(_RandomAccessIterator, _RandomAccessIterator, _Compare&) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1666:23:   required from 'void std::__heap_select(_RandomAccessIterator, _RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1937:25:   required from 'void std::__partial_sort(_RandomAccessIterator, _RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1953:27:   required from 'void std::__introsort_loop(_RandomAccessIterator, _RandomAccessIterator, _Size, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Size = long int; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1974:25:   required from 'void std::__sort(_RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:4859:18:   required from 'void std::sort(_RAIter, _RAIter) [with _RAIter = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >]'
<source>:14:41:   required from here
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:67:22: error: no match for 'operator<' (operand types are 'Person' and 'Person')
   67 |       { return *__it < __val; }
      |                ~~~~~~^~~~~~~
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:67,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1096:5: note: candidate: 'template<class _IteratorL, class _IteratorR, class _Container> bool __gnu_cxx::operator<(const __gnu_cxx::__normal_iterator<_IteratorL, _Container>&, const __gnu_cxx::__normal_iterator<_IteratorR, _Container>&)'
 1096 |     operator<(const __normal_iterator<_IteratorL, _Container>& __lhs,
      |     ^~~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1096:5: note:   template argument deduction/substitution failed:
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:71,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:67:22: note:   'Person' is not derived from 'const __gnu_cxx::__normal_iterator<_IteratorL, _Container>'
   67 |       { return *__it < __val; }
      |                ~~~~~~^~~~~~~
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:67,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1104:5: note: candidate: 'template<class _Iterator, class _Container> bool __gnu_cxx::operator<(const __gnu_cxx::__normal_iterator<_Iterator, _Container>&, const __gnu_cxx::__normal_iterator<_Iterator, _Container>&)'
 1104 |     operator<(const __normal_iterator<_Iterator, _Container>& __lhs,
      |     ^~~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1104:5: note:   template argument deduction/substitution failed:
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:71,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:67:22: note:   'Person' is not derived from 'const __gnu_cxx::__normal_iterator<_Iterator, _Container>'
   67 |       { return *__it < __val; }
      |                ~~~~~~^~~~~~~
Compiler returned: 1
```

</details>
</br>

This error message might be quite scary, but if we scroll all the way up, we will see that this error comes down to this line:
```css
error: no match for 'operator<' (operand types are 'Person' and 'Person')
```

Indeed, by default `std::sort` will apply the operator `<` to the provided arguments and, unless we define such operator for our `Person` class, this operator does not exist.

However, there is an overload of `std::sort` function that we can use! We can provide a **lambda expression** that compares two `Person` objects.
```cpp
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

void Print(const std::vector<Person>& persons, const std::string& tag) {
  std::cout << tag << std::endl;
  for (const auto& person : persons) {
    std::cout << person.name << " " << person.age << "\n";
  }
}

int main() {
  std::vector<Person> people{
      {"Gendalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people, "> Before sorting:");
  std::sort(
      people.begin(), people.end(),
      [](const auto& left, const auto& right) { return left.age < right.age; });
  Print(people, "> Sorted by age ascending:");
}
```
And now `std::sort` sorts our entries by age in ascending order.
```
> Before sorting:
Gendalf 55000
Frodo 33
Legolas 2931
Gimli 139
> Sorted by age ascending:
Frodo 33
Gimli 139
Legolas 2931
Gendalf 55000
```

So let's talk about what lambdas are, how to write them in such a way that they operate safely and efficiently and, yes, how they make **this** a valid piece of C++ code :wink:
```cpp
// ✅ Yep, this compiles 🙃
int main() {
  [](){}();
}
```

<!-- Intro -->

## Overview
My aim for today is to walk us through what lambdas are and the reasons they exist as well as roughly how they work under the hood. As this topic comes relatively late in our modern C++ course, we have the advantage of being able to understand how lambdas operate using a bunch of things we already know about, like functions, classes, and a bit of templates.

## What is a "callable"
As a first step, though, I'd like to briefly talk about what `std::sort` does to whatever third argument we pass into it. It, well, calls it with two `Person` objects as the input arguments. But what do we really mean, when we say that something gets "called"?

Clearly, we can "call" a function, more or less by definition. By extension, we can claim that anything that we can call through an `operator()` with the expected number of arguments is also "callable". Which opens a whole new perspective on how to create these "callable" things.

## A function pointer is sometimes enough
In most cases, simple is good enough. As we've just mentioned, the simplest "callable" is a function. In our example from before, we don't _really_ need to use a lambda. If we write a function `less` that takes two `Person` objects and pass its pointer to `std::sort` it will do the trick and the objects will get sorted:
```cpp
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

void Print(const std::vector<Person>& persons, const std::string& tag) {
  std::cout << tag << std::endl;
  for (const auto& person : persons) {
    std::cout << person.name << " " << person.age << "\n";
  }
}

bool less(const Person& p1, const Person& p2) { return p1.age < p2.age; }

int main() {
  std::vector<Person> people{
      {"Gendalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people, "> Before sorting:");
  // 💡 We can also pass "less" without "&" here. Try it!
  std::sort(people.begin(), people.end(), &less);
  Print(people, "> Sorted by age ascending:");
}
```
Note that we can also drop the `&` in the `std::sort` call and the code will do exactly the same thing:
<!--
`CPP_SETUP_START`
#include <vector>
#include <algorithm>
bool less(int a, int b) { return a < b;}
int main() {
  std::vector<int> people{1, 2, 3};
  $PLACEHOLDER
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` lambda_use_simple_function/main.cpp
`CPP_RUN_CMD` CWD:lambda_use_simple_function c++ -std=c++17 main.cpp
-->
```cpp
std::sort(people.begin(), people.end(), less);
```
The reason for this is that [functions can be implicitly converted to function pointers](https://en.cppreference.com/w/cpp/language/implicit_conversion#Function-to-pointer_conversion), they are special in this way.
<!-- You can always read more on this at cppreference.com following the link in the description to this video -->

## Before lambdas we had function objects (or functors)
But what if we need to have a certain state stored in our "callable"? For example, we wouldn't want to sort our `Person` objects by their absolute age, but by the difference of their age with respect to some number, say `4242`.

Behold [**function objects**](https://en.cppreference.com/w/cpp/utility/functional), or **functors**. These are objects for which the function call operator is defined, or, in other words, that define an `operator()`. So they are also "callable".

Which means that if we want to sort our array by the age difference to some number, we can create a class `ComparisonToQueryAge` that has a member `query_age_` and an `operator(const Person&, const Person&)` that compares the age differences of the two provided `Person` objects instead of directly their ages:
```cpp
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

void Print(const std::vector<Person>& persons, const std::string& tag) {
  std::cout << tag << std::endl;
  for (const auto& person : persons) {
    std::cout << person.name << " " << person.age << "\n";
  }
}

class ComparisonToQueryAge {
 public:
  explicit ComparisonToQueryAge(int query_age) : query_age_{query_age} {}

  bool operator()(const Person& p1, const Person& p2) const {
    return std::abs(p1.age - query_age_) < std::abs(p2.age - query_age_);
  }

 private:
  int query_age_{};
};

int main() {
  std::vector<Person> people{
      {"Gendalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people, "> Before sorting:");
  std::sort(people.begin(), people.end(), ComparisonToQueryAge{4242});
  Print(people, "> Sorted by age difference to 4242, ascending:");
}
```
Once we pass an object of this class as the callable into the `std::sort`, we can see that our Tolkien characters are sorted by their age difference to the number `4242`.

## How to implement generic algorithms like `std::sort`
So far so good. We already know a lot about classes so I hope that what we've just covered seems quite self-explanatory.

Now I think it makes sense to look a bit deeper into how `std::sort` is implemented. How does it magically take anything that looks like a "callable" and just rolls with it?

Please pause here for a moment and think how would **you** implement this! I promise you that if you followed the previous lectures, you should have all the tools at your disposal by now.

The key is to think back to the lectures in which we covered [templates](templates_why.md)! We can hopefully all imagine that using templates would allow us to implement a function similar to `std::sort`:
```cpp
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

void Print(const std::vector<Person>& persons, const std::string& tag) {
  std::cout << tag << std::endl;
  for (const auto& person : persons) {
    std::cout << person.name << " " << person.age << "\n";
  }
}

class ComparisonToQueryAge {
 public:
  explicit ComparisonToQueryAge(int query_age) : query_age_{query_age} {}

  bool operator()(const Person& p1, const Person& p2) const {
    return std::abs(p1.age - query_age_) < std::abs(p2.age - query_age_);
  }

 private:
  int query_age_{};
};

bool less(const Person& p1, const Person& p2) { return p1.age < p2.age; }

template <class Iterator, class Comparator>
void MySort(Iterator begin, Iterator end, Comparator comparator) {
  // The actual algorithm is not important here.
  for (Iterator i = begin + 1; i != end; ++i) {
    Iterator j = i;
    // We call comparator(*iter_1, *iter_2) somewhere in our algorithm.
    while (j != begin && comparator(*j, *(j - 1))) {
      std::iter_swap(j, j - 1);
      --j;
    }
  }
}

int main() {
  std::vector<Person> people{
      {"Gendalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people, "> Before sorting:");
  MySort(people.begin(), people.end(), less);
  Print(people, "> Sorted by age ascending:");
  MySort(people.begin(), people.end(), ComparisonToQueryAge{4242});
  Print(people, "> Sorted by age difference to 4242, ascending:");
  MySort(people.begin(), people.end(), &less);
  Print(people, "> Sorted by age ascending:");
}
```
Note though that our interest here is _not_ to implement a better sorting algorithm (so feel free to ignore the actual implementation) but to gain intuition about how we _could_ implement a generic algorithm that takes any comparator object that is "callable" with two `Person` objects. We don't have to write much code to achieve this too! And if we run this, we get the expected output.

Note also that from C++20 on this code would become more readable and safe as we could use concepts instead of raw templates.
<!-- Please tell me in the comments if you would be interested in hearing more about that! -->

Oh, one more thing, the story of course doesn't end with `std::sort`! There is a number of functions that take similar function objects. For some example, see [`std::find_if`](https://en.cppreference.com/w/cpp/algorithm/find#Version_3), [`std::for_each`](https://en.cppreference.com/w/cpp/algorithm/for_each), [`std::transform`](https://en.cppreference.com/w/cpp/algorithm/transform), and many more.

## Enter lambdas
However, it might not be convenient to always define a new struct, class, or even function for every single use case. Sometimes we want to use such a function object only locally, once, and don't want to deal with any additional boilerplate code.

The strive to enable such convenience is what brought us the [**lambda expressions**](https://en.cppreference.com/w/cpp/language/lambda), or, colloquially, **lambdas**. They are really just syntactic sugar for defining our own function objects, just like the `ComparisonToQueryAge` class we talked about before.

## Lambda syntax
The syntax of defining a lambda expression is a little different from what we've seen until now. Let's modify our example to use lambdas instead of functions and function objects and look closer at how we can define and use lambdas in our programs.
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
  const auto Print = [](const auto& persons, const auto& tag) {
    std::cout << tag << std::endl;
    for (const auto& person : persons) {
      std::cout << person.name << " " << person.age << "\n";
    }
  };

  std::vector<Person> people{
      {"Gendalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people, "> Before sorting:");

  std::sort(people.begin(), people.end(),
            [](const auto& p1, const auto& p2) { return p1.age < p2.age; });
  Print(people, "> Sorted by age ascending:");

  const int query_age = 4242;
  std::sort(people.begin(), people.end(),
            [query_age](const auto& p1, const auto& p2) -> bool {
              return std::abs(p1.age - query_age) <
                     std::abs(p2.age - query_age);
            });
  Print(people, "> Sorted by age difference to 4242, ascending:");
}
```

Here, we use 3 different lambdas. All of them follow the same general syntax that largely looks like this:
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
auto LambdaName = [CAPTURE_LIST](ARGUMENTS){BODY} -> ReturnType;
```
They all have some **arguments** (that can be omitted should they not be needed), a **body** that defines what the lambdas actually do, and a return type, that we can also provide explicitly but if we don't, it will be deduced from the `return` statement within the lambda function.

If we assign our lambda to a variable, we can store our lambda object and reuse it multiple times as we do for the `Print` lambda. And if you were wondering, the type of this lambda will be some unique unnamed type that the compiler will make up on its own.

Now it is time we talk about the **capture list**. It is a new thing to us and is the syntax that we can easily recognize lambdas by.

The first two lambdas we use have an empty capture list, but the third one captures the `query_age` variable in it:
<!--
`CPP_SETUP_START`
#include <algorithm>
struct P {
  int age;
};
int main() {
  int query_age{};
  $PLACEHOLDER
  Compare(P{0}, P{1});
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` lambda_compare_1/main.cpp
`CPP_RUN_CMD` CWD:lambda_compare_1 c++ -std=c++17 main.cpp
-->
```cpp
const auto Compare = [query_age](const auto& p1, const auto& p2) -> bool {
  return std::abs(p1.age - query_age) < std::abs(p2.age - query_age);
};
```
What this really means is that the `query_age` variable is copied such that it becomes available inside of the lambda body. If we look back at function objects we discussed before, this lambda behaves exactly the same as `ComparisonToQueryAge` class.

In our case, `query_age` is a small variable - a single `int`. But if we want to capture a bigger variable, we would like to avoid unnecessary copies, so we'd like to capture it by reference. Any variable we would like to capture by reference we prefix by an ampersand `&` symbol. Just as an illustration, this code would capture `query_age` by reference instead of copying it:
<!--
`CPP_SETUP_START`
#include <algorithm>
struct P {
  int age;
};
int main() {
  int query_age{};
  $PLACEHOLDER
  Compare(P{0}, P{1});
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` lambda_compare_2/main.cpp
`CPP_RUN_CMD` CWD:lambda_compare_2 c++ -std=c++17 main.cpp
-->
```cpp
const auto Compare = [&query_age](const auto& p1, const auto& p2) -> bool {
  return std::abs(p1.age - query_age) < std::abs(p2.age - query_age);
};
```

We can also provide as many captured variables as we want, specifying for each if we want to capture them by copy or by reference.
<!--
`CPP_SETUP_START`
#include <iostream>
int main() {
  $PLACEHOLDER
  Lambda();
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` lambda_capture_custom/main.cpp
`CPP_RUN_CMD` CWD:lambda_capture_custom c++ -std=c++17 main.cpp
-->
```cpp
int one{};
float two{};
double three{};
const auto Lambda = [&one, two, &three] {
  // Do something with one, two, three.
  std::cout << one << " " << two << " " << three << std::endl;
};
```
Here, `one` and `three` will be captured by reference, while `two` is captured by copy.


Alternatively, we can capture all variables visible at the moment of lambda definition. There are three distinct cases that are worth talking about here.

If we want to capture all variables by copy, we can use `=` as the first capture. And if we want some variables to be captured by reference we can specify such variables further in the capture list.
<!--
`CPP_SETUP_START`
#include <iostream>
int main() {
  $PLACEHOLDER
  Lambda1();
  Lambda2();
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` lambda_capture_copy/main.cpp
`CPP_RUN_CMD` CWD:lambda_capture_copy c++ -std=c++17 main.cpp
-->
```cpp
int one{};
float two{};
double three{};
const auto Lambda1 = [=] {
  // All variables are captured by copy.
  std::cout << one << " " << two << " " << three << std::endl;
};
const auto Lambda2 = [=, &two] {
  // two is captured by reference, all the others by copy.
  std::cout << one << " " << two << " " << three << std::endl;
};
```

Should we want to capture all variables by reference instead, we can pass a single ampersand `&` symbol instead. Alike to the previous setup, if we want _some_ variables to still be captured by copy, we can simply append them to the capture list.
<!--
`CPP_SETUP_START`
#include <iostream>
int main() {
  $PLACEHOLDER
  Lambda1();
  Lambda2();
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` lambda_capture_by_ref/main.cpp
`CPP_RUN_CMD` CWD:lambda_capture_by_ref c++ -std=c++17 main.cpp
-->
```cpp
int one{};
float two{};
double three{};
const auto Lambda1 = [&] {
  // All variables are captured by reference.
  std::cout << one << " " << two << " " << three << std::endl;
};
const auto Lambda2 = [&, two] {
  // two is captured by copy, all the others by reference.
  std::cout << one << " " << two << " " << three << std::endl;
};
```

Finally, if a lambda appears within a class method, we might want it to have access to all the data within the current object. For that we can pass `this` into the lambda capture list and use the object data without issues:
```cpp
#include <iostream>

struct Foo {
  void Bar() {
    [this] {
      // The whole current object is captured by reference.
      std::cout << one << " " << two << " " << three << std::endl;
    }();  // We call this lambda in-line for illustration purposes.
  }

  int one{};
  float two{};
  double three{};
};

int main() {
  Foo foo{};
  foo.Bar();
}
```
Note, that just to show that this is possible, we call the lambda in-place right after declaring it.

And, on that note, now that we've discussed most of the syntax we use for lambdas, we can see that `[](){}()` from the thumbnail of the video is just a definition of a lambda that has an empty capture list, no arguments, empty body, which is called in-place right after creation (doing nothing of course). This lambda is totally useless, apart from the entertainment it provides :wink:


## When to use lambdas
All in all, lambdas are neat and efficient. If we need a callable object to pass to some function and we don't think we'll ever want to reuse it, like in our example with sorting, lambdas should be out go-to tool.

Alternatively, if we are implementing some functionality in a header file and find ourselves writing a bit of a longer function, lambdas are a useful way to split such function into meaningful chunks without introducing public-facing functions and not relying on comments that can easily go out of sync with the code functionality. So use them without fear in most situations.
<!-- Add a meme with a guy not approving and then approving -->

One thing to be weary of though, is capturing all variables by default. While it might be tempting to always capture all the observed variables by reference by providing the ampersand in the capture list `[&]`, in my experience it sometimes makes it harder to understand what the lambda really does when reading the code. So in most of my code, I prefer to capture only the variables I _really_ need as opposed to blanket-capturing them.
<!-- But I'm interested in what you guys think about it, so please comment below the video with your experience with this. -->

## Summary
And this is pretty much most of the things we need to know about lambdas. But if you ever need more details on anything here, please refer to their [cppreference.com](https://en.cppreference.com/w/cpp/language/lambda) page, as always.

All in all, lambdas are a useful tool in our toolbox and we'll find that we want to use them quite often when writing modern C++ code. I hope that I could build parallels with what we have already learnt until now so that you can get all the use out of lambdas while not being scared of what they do under the hood.

<!-- So thanks a lot for watching and I'll catch you in the next video, bye! -->
