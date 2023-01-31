## Constructors
<!-- Talking head -->
Until now we've been creating our custom types with default initialization.
<!-- B-roll code -->
```cpp
Cat cat{};
```

This is boring and not very useful. This changes now. After today's lecture we'll be able to create a new object of our class like this:
```cpp
Cat cat{number_of_lives, happiness};
```
i.e., passing the parameters to initialize the class internal data!

<!-- Intro -->

<!-- Talking head -->
Under the hood, when a new object of a custom type is created a special function called a **constructor** is called. We don't see it in the implementation of our `Cat` class because if we don't write our own constructors [a default one will be generated for us](https://en.cppreference.com/w/cpp/language/default_constructor).

<!-- B-roll show both cases -->
> :bulb: Such a default constructor will leave the data uninitialized unless it is initialized in-place.

<!-- Talking head -->
That being said, we can, of course, write any number of custom constructors for our classes. A constructor is just a class method with special signature - it does not return anything and it is named exactly as the class itself.

<!-- B-roll code -->
Let's illustrate this by writing a constructor that takes a happiness value and the number of lives for our cat (omitting all the other details of the class):
```cpp
class Cat {
  public:
    Cat(int number_of_lives, int happiness) : number_of_lives_{number_of_lives}, happiness_{happiness} {}
  private:
    int number_of_lives_{};
    int happiness_{};
};
```

<!-- Talking head -->
There is again a bit of new syntax here!

<!-- B-roll highlight -->
The part `: happiness_{happiness}` is called the **member initializer list** and you should *always* use it when writing constructors. It is guaranteed to happen **before** we enter the constructor function scope.

<!-- Talking head + show variables on screen -->
> 🚨 Remember that the order of operations in the member initializer list will follow the order in which the data appears in the class declaration, **not** the order in which the variables show up in the member initializer list itself! So `number_of_lives_` will **always** be initialized before `happiness_`.

### Use `= default` if you still want the default constructor
<!-- B-roll code -->
After creating our custom constructor try creating the `Cat` object without parameters again! There is an error now! The compiler sees no constructor!

<!-- Talking head -->
The reason behind this is that the compiler only generates the default constructor [if none are provided by the user](https://en.cppreference.com/w/cpp/language/default_constructor).
<!-- B-roll highlight -->
Well, now we *did* provide one, so the compiler thinks that we know what we're doing and does not generate a default constructor.

<!-- B-roll code -->
However, we can easily add this constructor back by adding one line to our class:
```cpp
class Cat {
  public:
    Cat() = default;  // ⬅️ Add back the default constructor
    Cat(int number_of_lives, int happiness) : number_of_lives_{number_of_lives}, happiness_{happiness} {}
  private:
    int number_of_lives_{};
    int happiness_{};
};
```

### Use `explicit` with single-argument constructors
<!-- Talking head -->
Last but not least, if we write a single-argument constructor, we should [mark it as `explicit`](https://google.github.io/styleguide/cppguide.html#Implicit_Conversions).
<!-- B-roll code -->
This is needed to avoid an implicit conversion in situations like this:
```cpp
void Foo(const Cat& cat);

class Cat {
  public:
    explicit Cat(int number_of_lives);
    // Other stuff lives here
};

int main() {
  Foo(42);
}
```
<!-- B-roll try to compile -->
This code should **not** compile, and won't if we have `explicit` keyword in place.
<!-- B-roll try to compile after removing explicit -->
But it *will* compile if we don't. You probably see that if this code compiles it leads to confusion, so `explicit` here helps avoid such confusing situations.
