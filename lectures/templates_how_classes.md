<!-- Talk about static_assert -->

How to use templates with classes in C++
--

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

This video is the fourth video about templates. In the first video we talked about **why** we might want to use templates. Second video focused on **what** happens under the hood when we use them, then we talked about how to use function templates and finally we can talk about how to use class templates.
<!-- All of the links below -->

On the surface they are kinda similar to function templates but, well, for classes. But there is one crucial difference that enables most of C++ meta-programming, at least until C++20 and concepts - partial template specialization.

<!-- Intro -->

## Template class methods
Before we start to talk about actual class templates I want to briefly talk about class method templates.

We can write such class method templates just like any freestanding function template. Same for static class method templates. All of these class method templates can appear in any class or struct and it doesn't matter if that class or struct is a template itself or not.

Such template methods behave in _exactly_ the same way as the normal function templates so you already know how to use them. We still should overload these methods rather than specialize them too.

<!-- TODO: add a small example -->

## Class templates
If you followed my lecture on how to use function templates and on what classes are, the syntax for class templates will look very logical and familiar.

Let's assume that we want to represent a 2D coordinate, like a pixel coordinate on screen. We can do this by using two `int` numbers of course, representing the corresponding pixel row and column:
```cpp
int row{42};
int col{23};
```

It is cumbersome to use them separately, so we'd rather pack them together into a `class` or `struct`:
```cpp
struct Coordinate {
  int row{};
  int col{};
};

int main() {
  Coordinate coordinate{42, 23};
  return 0;
}
```

This is already much nicer, we can work with a "coordinate" rather then with the row and column separately. But I come from robotics and image processing background where we regularly need the so-called sub-pixel resolution, meaning that our coordinate should be represented by floating point numbers. So we suddenly also need a `FloatCoordinate` class :thinking:
```cpp
struct Coordinate {
  int row{};
  int col{};
};

struct FloatCoordinate {
  float row{};
  float col{};
};

int main() {
  Coordinate coordinate{42, 23};
  FloatCoordinate float_coordinate{42.42F, 23.23F};
  return 0;
}
```

This is not nice, is it? And of course you've already guessed that we can use class templates to get around this in an elegant way.

We can replace our `Coordinate` and `FloatCoordinate` with a single class template `Coordinate`:
```cpp
template<typename ScalarT>
struct Coordinate {
  ScalarT row{};
  ScalarT col{};
};

int main() {
  Coordinate<int> coordinate{42, 23};
  Coordinate<float> float_coordinate{42.42F, 23.23F};
  Coordinate float_coordinate{42.42F, 23.23F};
  return 0;
}
```

A lot of things here are just like in the lecture on function templates:
- We declare the class template by prefixing our class with the word `template`
- We provide any number of templates parameters, here `ScalarT` and the compiler doesn't care which names we give them but I will advice to give these template parameters readable names
- We can use our template parameter `ScalarT` anywhere in our class just like we would any other normal type
- When we instantiate an object of our class we provide the type that we want to use, which triggers "implicit template instantiation" (stay tuned for explicit template instantiation too). This means that the compiler creates a specialization of our class template for the concrete type that we are using it with. We can see it using the awesome website [cppinsights.io](https://cppinsights.io/s/14bed6df) where we see that the compiler generates two concrete classes - one for `int` and one for `float` coordinates. For more see the lecture on [what templates do under the hood](templates_what.md).

## Class template argument deduction
If our class has a constructor that uses all of our template types and we are using at least C++17 we can make use of the [**C**lass **T**emplate **A**rgument **D**eduction (CTAD)](https://en.cppreference.com/w/cpp/language/class_template_argument_deduction) and omit the template argument when creating our objects. This process uses implicit and explicit type deduction guides, which is a bit of a complicated topic that I don't plan to actively cover in this course, but if you have a constructor for your class you don't have to worry about it and it will mostly just work.

I use it all the time, but this is a bit of a controversial topic. If you look into the Google Code Style for C++ at least as of the date of recording this video, they [suggest to steer away from using CTAD](https://google.github.io/styleguide/cppguide.html#CTAD) because it might fail to deduce the type you expect it to. We _can_ provide explicit type deduction guides (more on it [here](https://en.cppreference.com/w/cpp/language/class_template_argument_deduction) under "User-defined deduction guides
") but we won't cover it here. I believe that once you really need to use it, you'll know enough about C++ to read about it on your own.

## Template specialization
Ok, so we already know that the code that actually gets compiled is just a copy of the code in our template with the chosen types substituted instead of the template parameters. I also already used the word "specialization". When we use a class template to instantiate an object the compiler creates such a specialization and then uses that to create an object.

But we don't have to wait for the compiler to create such a specialization, we can do so on our own!

Specialization can be full and partial.

### Full template specialization
We already talked about full template specialization when we talked about function templates because that's the only we theoretically can do with function template (even though we shouldn't). Well, turns out we can use the same full template specialization with classes too. And in this case it _does_ have its use-cases.

First let's talk about how its done and then talk about what it's being mostly used for.

In order to fully specialize a class template we have to basically fully re-implement a class for a concrete type, prefixing it with `template<>`:
```cpp
template<typename ScalarT>
struct Coordinate {
  ScalarT row{};
  ScalarT col{};
};

template<>
struct Coordinate<double> {
  double row{};
  double col{};
};

int main() {
  Coordinate<int> coordinate{42, 23};
  // Uses the explicit instantiation
  Coordinate<double> float_coordinate{42.42F, 23.23F};
  return 0;
}
```

Notice how this is exactly what we saw in the cppinsights.io before!

Note, that it is our responsibility to implement the full class, along with all the data and methods that it provides. If we implement it differently from the original class template, it will behave differently when we try to create a variable using our class template with the chosen types. Which might be confusing! Imagine if we for whatever reason drop the `col` entry in our `Coordinate` explicit instantiation for `double`:
```cpp
template<typename ScalarT>
struct Coordinate {
  ScalarT row{};
  ScalarT col{};
};

template<>
struct Coordinate<double> {
  double row{};
  // 😱 col missing! Does not follow the template!
};

int main() {
  Coordinate<int> coordinate{42, 23};
  // ❌ Ooops. Won't compile!
  Coordinate<double> float_coordinate{42.42, 23.23};
  return 0;
}
```
This example won't compile as there is only one data member in the explicit full specialization of the `Coordinate` template for `double` :scream:.

So if we _have_ to specialize a class, we have to make sure it conforms to the same logical interface as the original template, otherwise we're probably going to go through a whole lot of pain.

> **Story time:** one famous example of such a full template specialization is a specialization of `std::vector` for `bool` type. If you remember when we talked about `std::vector` in one of the previous lectures I cautioned not to use `std::vector<bool>`. So here is the story behind that suggestion.
>
> By default, if we store a `bool` it will still take a full byte of memory, even though we logically need just one bit to represent the stored value - `true` or `false`. So naïvely, if we store a number of `bool` variables in an array of sorts we will lose quite some memory, about 8x.
>
> At some point, the standardization committee decided that this has to be fixed somehow and that it would be a nice idea to have a specialization for the `std::vector` class template for type `bool` that addresses this issue. This specialization would allow to "pack" the boolean values together, 8 per byte and as such save space. It made sense too, a vector was designed to store a bunch of values in sequence, so it was conceivable that anybody who will want to store `bool` variables will want to pack them tightly.
>
> The issue is that because we tightly pack these boolean values we can't really access them by a normal reference as we do with any other type, and `std::vector<bool>` returns a `std::__bit_reference` temporary wrapper instead that handles all the bit-fiddling. Which means that innocent-looking code like this won't compile:
> ```cpp
> std::vector<bool> vector{/* some data */};
> for (auto& value : vector) { /* do something */ };
> ```
> Not only that but also returning a temporary wrapper might actually be quite a bit slower, so there is a trade-off between storage and speed.
> Anyway, long story short, while it is cool that `std::vector` is so flexible and interesting that we can reduce our space by 8x, it has been widely considered a "wrong move" on the standard side and generally people are suggested to avoid using `std::vector<bool>` and use a different class if they need an array of bits.
>
> Read more about this here: https://isocpp.org/blog/2012/11/on-vectorbool and here: http://www.gotw.ca/publications/mill09.html
>
> Oh, and yes, technically, this is a partial specialization here but it _can_ be considered a full specialization in our case and for the sake of example.

#### When to use full class template specialization
Because of the above issues, it is rare to see a full template specialization in the wild. Here are some examples that come to mind.

The most useful example of full template specialization is to implement so-called "type traits". If you're not familiar with these, they are (usually) tiny struts that are designed to tell us certain things about various types. There is a bunch of these defined [in the standard](https://en.cppreference.com/w/cpp/header/type_traits), like for example [`std::is_integral`](https://en.cppreference.com/w/cpp/types/is_integral) that checks if the provided type is integer in an abstract sense. We can see it by ensuring that the following `static_assert` compiler without errors:
```cpp
static_assert
(
    std::is_integral<float>::value == false &&
    std::is_integral<int*>::value == false &&
    std::is_integral<int>::value == true &&
    std::is_integral<const int>::value == true &&
    std::is_integral<bool>::value == true &&
    std::is_integral<char>::value == true
);
```

Let's implement our own trait `IsCoordinate`. A trait is nothing else than a tiny struct template with no data as we never intend to create objects of this `struct`. It does usually have a single `static constexpr inline bool` constant named `value`.

We start by defining the base trait that has this `value` set to `false` for any given type:
```cpp
template <typename T>
struct IsCoordinate {
  static constexpr inline bool value{};
};
```

If we use this trait now, it will store a `value` of `false` for any type we provide. So now we want to make it useful and actually set the `value` to `true` for some types:
```cpp
template <typename T>
struct IsCoordinate {
  static constexpr inline bool value{};
};

template <>
struct IsCoordinate<Coordinate<int>> {
  static constexpr inline bool value{true};
};

template <>
struct IsCoordinate<Coordinate<float>> {
  static constexpr inline bool value{true};
};

static_assert
(
    IsCoordinate<void>::value == false,
    IsCoordinate<int>::value == false,
    IsCoordinate<float>::value == false,
    IsCoordinate<Coordinate<int>>::value == true,
    IsCoordinate<Coordinate<float>>::value == true,
);
```

Which is already quite useful. Imagine if we have a function to validate coordinates one way or another:
```cpp
template<typename ScalarT>
[[nodiscard]] bool IsValid(const Coordinate<ScalarT>& coordinate) {
  return true; // Actually do something useful here!
}

template<typename CoordinateT>
[[nodiscard]] bool ValidateCoordinates(const std::vector<CoordinateT>& coordinates) {
  for (const auto& coordinate : coordinates) {
    if (!IsValid(coordinate)) return false;
  }
  return true;
}
```

If we pass a wrong type into our function, like `std::vector<int>` instead, we will get an error which is not very nice to read:
```cpp
#include <iostream>

int main() {
  const std::vector<int> blah{1, 2, 3};
  std::cout << ValidateCoordinates(blah) << std::endl;
}
```

Now, what we _could_ do instead is check at compile time if we use the function correctly by, for the sake of example, putting a `static_assert` into it:
```cpp
template<typename CoordinateT>
[[nodiscard]] bool ValidateCoordinates(const std::vector<CoordinateT>& coordinates) {
  static_assert(IsCoordinate<CoordinateT>::value == true, "Contents of the container are not coordinates");
  for (const auto& coordinate : coordinates) {
    if (!IsValid(coordinate)) return false;
  }
  return true;
}
```

Now if we try to write the same code it won't compile with a much more readable error generated by our `static_assert`.

All of the above is just for the sake of example, now, in C++20 we have a better way with concepts, which we'll briefly talk about soon, that will allow us to write code that looks something like this instead:
```cpp
template<CoordinateLike CoordinateT>
[[nodiscard]] bool ValidateCoordinates(const std::vector<CoordinateT>& coordinates) {
  for (const auto& coordinate : coordinates) {
    if (!IsValid(coordinate)) return false;
  }
  return true;
}
```
Which will generate a similarly nice error message. But we're getting ahead of ourselves. Regardless, the mechanism behind this stays largely the same and we've just learnt the gist of it.

Let's get back to our trait specialization. You might notice that some things are not too optimal just yet. We are copying our `IsCoordinate` trait for each of the `Coordinate` template specializations. Well, this is what **partial template specialization** helps us to avoid!

### Partial template specialization
Partial template specialization is a very powerful technique. But before we talk more about it, let's see how it makes our `IsCoordinate` trait much nicer:
```cpp
template <typename T>
struct IsCoordinate {
  static constexpr inline bool value{};
};

template <typename T>
struct IsCoordinate<Coordinate<T>> {
  static constexpr inline bool value{true};
};

static_assert
(
    IsCoordinate<void>::value == false,
    IsCoordinate<int>::value == false,
    IsCoordinate<float>::value == false,
    IsCoordinate<Coordinate<int>>::value == true,
    IsCoordinate<Coordinate<float>>::value == true,
);
```
We need to unpack this syntax a bit. We still have the same base trait that sets `value` to be `false` by default. And we still have the same `static_assert` below. What changed is the way we define our template specialization.

We replaced the `template<>` with another `template <typename T>`, which in my experience is the most confusing part for beginners. Let's trace where that `T` appears, it appears in the `Coordinate<T>` which itself is a specialization of the `IsCoordinate` template.

Now what the compiler does is it sees the call to `IsCoordinate<Coordinate<int>>` and looks for an appropriate implementation. It finds the base template `IsCoordinate` and then looks for any explicit specializations available. Out of those it picks the ["most specialized"](https://en.cppreference.com/w/cpp/language/partial_specialization) one, which in our case is our only specialization. Here, a specialization is "more specialized" than the other if it only takes a subset of types that the other specialization takes.

To fully understand this, please see this example and think what gets printed to the terminal:
```cpp
#include <iostream>

template<typename T>
struct Container {
  T data{};
};

template<typename T>
struct Trait {
  static constexpr inline int kNumber{};
};

template<typename T>
struct Trait<Container<T>> {
  static constexpr inline int kNumber{1};
};

template<>
struct Trait<int> {
  static constexpr inline int kNumber{2};
};

int main() {
  std::cout << Trait<float>::value << " ";
  std::cout << Trait<int>::value << " ";
  std::cout << Trait<Container<int>>::value << " ";
  std::cout << Trait<Container<float>>::value << std::endl;
}

```
<!-- TODO: add output as spoiler -->

#### Also with more types
Partial template specialization works in exactly the same way if there are more types! The compiler still picks the most specialized out of all the template specializations it finds for a given class or struct.

## Summary
