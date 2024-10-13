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
- [How is the sorting function implemented?](#how-is-the-sorting-function-implemented)
- [Enter lambdas](#enter-lambdas)
- [Lambda syntax](#lambda-syntax)
- [When to use lambdas](#when-to-use-lambdas)
- [Summary](#summary)


We've already covered so many topics in this course but there is one more thing that firmly belongs to modern C++ that we did not really touch upon - **lambdas**.

Here's one example for which they are useful. Imagine we have a list of people, represented as a struct `Person`, and we would like to sort them by age. We can try using the standard [`std::sort`](https://en.cppreference.com/w/cpp/algorithm/sort) function for that:
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

Indeed, by default `std::sort` will apply the operator `<` to the provided arguments and, unless we define such operator for our `Person` class, such an operator does not exist.

However, there is an overload of `std::sort` function that we can use! We can provide a lambda expression that compares two `Person` objects.
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

So let's talk about lambdas! What they are, how to write them in such a way that they operate safely and efficiently and, yes, how they make **this** valid C++ code:
```cpp
int main() {
  [](){}();
}
```

<!-- Intro -->

## Overview
My aim for today is to walk us through what lambdas are and the reasons they exist. As this topic comes relatively late in our modern C++ course, we have the advantage of being able to understand how lambdas operate using exclusively the things we already know about, mostly functions, classes, and a bit of templates.

## What is a "callable"
As a first step, though, I'd like to briefly talk about what it really means that something is "callable". Clearly, function is "callable" because we can, well, call it. By extension, we can claim that anything that we can call through an `operator()` with the expected number of arguments is also a "callable".


## A function pointer is sometimes enough
As we've just mentioned, the simplest "callable" is a function. In our example from before, if we write a function `less(const Person&, const Person&)` and pass its pointer to `std::sort` it will do the trick:
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
Note that we can also drop the `&` such that the call to `std::sort` becomes:
```cpp
std::sort(people.begin(), people.end(), less);
```
The reason for this is that [functions are implicitly converted to function pointers](https://en.cppreference.com/w/cpp/language/implicit_conversion#Function-to-pointer_conversion) if needed, they are special in this way.
<!-- you can always read more on this at cppreference.com following the link in the description to this video -->

## Before lambdas we had function objects (or functors)
But what if this is not enough for our use-case? What if we need to have a certain state stored in our "callable"? For example, we wouldn't want to sort our `Person` objects by their absolute age, but by the difference of their age with respect to some number, say `4242`.

Behold **function objects**, or **functors**. These are objects for which the function call operator is defined, or, in other words, that define an `operator()`.

So, if we want to sort our array by the age difference to some number, we can create a struct `ComparisonToQueryAge` that has a member `query_age_` and an `operator(const Person&, const Person&)` that compares the age differences of the two provided `Person` objects instead of directly their ages:
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

struct ComparisonToQueryAge {
  explicit ComparisonToQueryAge(int query_age) : query_age_{query_age} {}

  bool operator()(const Person& p1, const Person& p2) const {
    return std::abs(p1.age - query_age_) < std::abs(p2.age - query_age_);
  }

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
Once we pass this struct as the callable into the `std::sort`, we can see that our Tolkien characters are sorted by their age difference to the number `4242`.

## How is the sorting function implemented?
So far so good. We already know a lot about structs and classes as well as their methods, so I hope that how these operate seems quite intuitive here.

Now I think it makes sense to look a bit deeper into how `std::sort` is implemented. How does it magically take anything that looks like a "callable"?

Please pause here for a moment and think how would you implement this! I promise you that if you followed the previous lectures, you should have all the tools at your disposal by now.

The key is to think back to the lectures in which we covered templates! We can hopefully all imagine that using templates would allow us to implement a function similar to `std::sort`. Our interest here is _not_ to implement a better sorting algorithm, but to gain intuition about how we _could_ implement such a generic algorithm that would take any comparator object that is "callable" and accepts two `Person` objects as its parameters:
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

struct ComparisonToQueryAge {
  explicit ComparisonToQueryAge(int query_age) : query_age_{query_age} {}

  bool operator()(const Person& p1, const Person& p2) const {
    return std::abs(p1.age - query_age_) < std::abs(p2.age - query_age_);
  }

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
Note also that from C++20 on this code would become more readable as we could use concepts instead of templates.
<!-- Please tell me in the comments if you would be interested in that! -->

Oh, one more thing, the story of course doesn't end with `std::sort`! There is a number of functions that take similar function objects. For some example, see [`std::find_if`](https://en.cppreference.com/w/cpp/algorithm/find#Version_3), [`std::for_each`](https://en.cppreference.com/w/cpp/algorithm/for_each), [`std::transform`](https://en.cppreference.com/w/cpp/algorithm/transform), and many more.

## Enter lambdas
However, it might not be convenient to always define a new struct, class, or even function for every single use case. Sometimes we want to use such a function object only locally, once, and don't want to create any additional overhead.

The strive to enable such convenience is what brought us the [lambda expressions](https://en.cppreference.com/w/cpp/language/lambda), or, colloquially, **lambdas**. They are really just syntactic sugar for defining our own function objects as discussed before.

## Lambda syntax
The syntax of defining a lambda expression is a little different from what we've seen before. Let's modify our example to use lambdas instead of functions and function objects and look closer at how we can define and use lambdas in our programs.
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
```cpp
auto LambdaName = [CAPTURE_LIST](ARGUMENTS){BODY} -> ReturnType;
```
They all have some **arguments** (that can be omitted should they not be needed), a **body** that defines what the lambdas actually do, a return type, that we can also provide explicitly but if we don't, it will be deduced from the `return` statement within the lambda function.

If we assign our lambda to a variable, we can store our lambda object and reuse it multiple times. We do this in our example for the `Print` lambda. If you're wondering, the type of this lambda will be some unique unnamed type that the compiler will make up on its own.

Now it is time we talk about the **capture list**. It is a new thing to us and is the syntax that we can easily recognize using a lambda by.

The first two lambdas we use have an empty capture list, but one captures the `query_age` variable in it:
```cpp
[query_age](const auto& p1, const auto& p2) -> bool {
  return std::abs(p1.age - query_age) < std::abs(p2.age - query_age);
}
```
What this really means is that the `query_age` variable is copied such that it becomes available inside of the lambda body. If we look back at function objects we discussed before, this lambda behaves exactly the same as `ComparisonToQueryAge` struct from before.

In our case, `query_age` is a small variable - a single `int`. But if we wanted to capture a bigger variable, just like with function arguments, we would like to avoid unnecessary copies, so we'd like to capture it by reference. Any variable we would like to capture by reference we prefix by an ampersand `&` symbol. Just an an illustration, this would capture `query_age` by reference instead of copying it:
```cpp
[&query_age](const auto& p1, const auto& p2) -> bool {
  return std::abs(p1.age - query_age) < std::abs(p2.age - query_age);
}
```

We can provide as many captured variables as we want, specifying for each if we want to capture them by copy or by reference.
```cpp
[&one, two, &three] {
  // Do something with one, two, three.
}
```
Here, `one` and `three` will be captured by reference, while `two` is captured by copy.


Alternatively, we can capture all variables visible at the moment of lambda definition. There are three distinct cases that are worth talking about here.

If we want to capture all variables by copy, we can use `=` as the first capture. And if we want some variables to be captured by reference we can specify such variables further in the capture list.
```cpp
int one{};
float two{};
double three{};
[=] {
  // All variables are captured by copy.
}
[=, &two] {
  // two is captured by reference, all the others by copy.
}
```

Should we want to capture all variables by reference instead, we can pass a single ampersand `&` symbol instead. Should we want _some_ variables to still be captured by copy, we can simply append them to the capture list.
```cpp
int one{};
float two{};
double three{};
[&] {
  // All variables are captured by reference.
}
[&, two] {
  // two is captured by copy, all the others by reference.
}
```

Finally, if a lambda appears within a class method, we might want it to have access to all the data within the current object. For that we can pass `this` into the lambda capture list and use the object data without issues:
```cpp
struct Foo {
  void Bar() {
    [this] {
      // Current object is captured by reference.
    }
  }

  int one{};
  float two{};
  double three{};
};
```

And as a small bonus, now that we've discussed most of the syntax we use for lambdas, we can see that `[](){}()` from the thumbnail of the video is just a definition of a lambda that has an empty capture list, no arguments, empty body, which is called in-place right after creation (doing nothing of course). This lambda is totally useless, apart from the entertainment it provides :wink:


## When to use lambdas
Lambdas are neat and efficient. If you need an operation that you don't think you'll need to reuse to pass into some other function, like in our example with sorting, lambdas are your friend. Alternatively, if you are implementing some functionality in a header file and find yourself writing a bit of a longer function, lambdas are a useful way to split such function into meaningful chunks without introducing public-facing functions and not relying on comments that can easily go out of sync with the code functionality. So use them without fear in most situations.

One thing to be weary of is capturing all variables by default. While it might be tempting to always capture all the observed variables by reference by providing the ampersand in the capture list `[&]`, in my experience it makes it harder to keep track of what the lambda really does. So in most of my code, I prefer to capture only the variables I _really_ need as opposed to blanket-capturing them.
<!-- But I'm interested in what you guys think about it, so please comment below the video with your experience with this. -->

## Summary
Now we should know most of the things we need to know about what lambdas are as well as about how and when we should use them. They are a useful tool in our toolbox and we'll find that we want to use them quite often when writing modern C++ code. I hope that I could build parallels with what we have already learnt until now so that you can get all the use our lambdas while not being scared of what they do under the hood.

<!-- So thanks a lot for watching and I'll catch you in the next video, bye! -->
