Introduction to templates
---

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

Templates are definitely one of the features that make C++ so popular and powerful. They provide an extremely versatile mechanism to write truly generic code allow building meaningful abstractions only paying for these benefits with some compilation time! Speaking of compilation time, using templates rigorously in our code makes sure that we catch most of the logic errors at compile time, before our code gets shipped to any users!

However, with great power come long error messages, so historically, templates were met with fear and anxiety by the beginners in C++. Which is a pity because I believe that templates are **the** way to write modern C++ code.

So, let's talk about templates, what they are useful for, what they are, and how to avoid typical pitfalls when using them.

<!-- Intro -->

## Why we want to use templates
Ok, so templates are generally being used for a couple of things.
- One of the classical use-cases is making some functions and classes perform the same operation on different types or store data of different types without writing additional code, think about a `std::max` function that must compute a maximum of two numbers regardless of these numbers being integer or floating point numbers.
  ```cpp
  // Works for any type as long as
  // NumberType is comparable with < operator! ✅
  template <typename NumberType>
  NumberType max(const NumberType& first, const NumberType& second) {
    if (first < second) { return second; }
    return first;
  }

  int main() {
    max(3.14, 42.42);
    max(42, 23);
  }
  ```
  Just imagine our life if we would not have templates. We would have to have an implementation of the same function over and over for any type we would use! And while `max` is a very simple function, imagine what would happen if it were a more complex function and we would someday need to change its implementation! :scream:
  ```cpp
  // Not a great idea to repeat code so many times! 😱
  // Imagine changing the implementation!
  int max(const int& first, const int& second) {
    if (first < second) { return second; }
    return first;
  }
  double max(const double& first, const double& second) {
    if (first < second) { return second; }
    return first;
  }
  // And so on for any other type we care about 😱
  ```

  The same story holds for classes too. As an example, think about the STL (which by the way stands for **S**tandard **T**emplate **L**ibrary :wink:) `std::array` class that we touched upon before. We want to be able to store **any** type of data in an array and we don't want to have a separate implementation for any of those situations:
  ```cpp
  template <typename UnderlyingType, std::size_t kSize>
  struct array {
    // Implementation
  };

  int main() {
    array<int, 20> int_array;
    array<double, 20> double_array;
  }
  ```
- And templates can be used for so much more, like implementing abstract design ideas in a composable and separable fashion. As an example, we could think about an `Image` class, just like the one that we implemented in this course before, and implement a method `Save` for this class that takes in the `SavingStrategy` object which will take care of the actual saving logic, separating the concerns of our classes better.
  ```cpp
  class Image {
    public:
      template <typename SavingStrategy>
      void Save(const std::filesystem::path& path, const SavingStrategy& strategy) {
        strategy.Save(pixels_);
      }
      // Skipping any other class details for the sake of example.

    private:
     std::vector<Color> pixels_{};
  };
  ```
  This way we could have two (or even more) different classes, say `SaveJpegImage` and `SavePngImage` that would implement their own logic to save an array of pixels to disk and the reason we want this is that as long as they have their own `Save` method, we would not need to touch our `Image` class should we want to change how the images are stored to disk at some point in the future. But more on this concept later in the lecture.
- Finally, we can also do really advanced things, like compile-time meta-programming, but I won't talk about it at the moment because this is a bit of an esoteric knowledge and I believe that as a community we are moving away from using templates in such a way.

Anyway, even without going into the details, I hope that it was easy to grasp why we would want to have a mechanism like this. I also hope, that looking at those functions and classes the syntax was more or less self explanatory.

## How to create templated stuff
Whenever we want to create a templated class or function, we prefix the declaration (and definition) of such a class or function with the keyword `template` followed by a list of **template parameters**.

These template parameters can be of various kinds:
- Parameters representing types, just like in our `max` function we had `typename NumberType`. These can be specified using either the keyword `typename` or the word `class` and generally there is no difference between the two ways but there are people with very strong opinion on the matter our there :wink:
  <!-- Please tell me which one you prefer :wink: -->
- Parameters representing values, like `std::size_t kSize` in our `array` class example. Oh, and such values can be computed as a compile-time expression, see [`std::is_integral`](https://en.cppreference.com/w/cpp/types/is_integral) for an example.
- Parameters representing a list of either of the above, the so-called **variadic templates**, more on these in a follow-up lecture
- Parameters representing types that have `template` parameters of their own, the so-called `template template` parameters, but these are not used that often in my experience so we will probably touch upon those some other time.

## How to use templated functions?
