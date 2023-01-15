# Simple classes in C++
<!-- Talking head -->
By now we all should be quite comfortable using functions, but there are some things for which using just the functions alone doesn't really provide enough abstraction. The solution to this is to introduce the custom types, or classes.

<!-- Intro -->

<!-- Talking head -->
Let me illustrate what I'm talking about with an example.

<!-- B-roll cat doing mischief -->
## The cat's life example
Imagine you want to write a game about a cat looking for some adventures. The cat starts off pretty grumpy and get's its happiness up by doing some fun mischief (like throwing a vase from a table). You win the game once the cat's happiness reaches 100%. It's not all fun though and some actions are dangerous and sometimes (rarely) the cat will lose 1 of its 9 lives. If your cat reaches 0 lives, you lose the game.

<!-- Talking head -->
Sounds good? So how can we model this in code?

### Let's model this using just the functions first

<!-- Talking head -->
> :bulb: Before we go any further, pause here and _do_ try to model this game. How would you write it using functions? Give it a try --- it's a good exercise!

<!-- B-roll code -->
One way or another, we will probably come up with something like this:
```c++
#include <iostream>

namespace {
  constexpr auto kMaxHappiness = 100;
  constexpr auto kMaxLives = 9;
}  // namespace

// Feel free to have more events here of course
enum class Event {
  kFun,
  kDanger,
};

// Return a random event in the simplest case
Event FindNextAdventure();

// Update number of lives depending on what happened
int UpdateLives(Event event, int current_lives);

// Update happiness depending on what happened
int UpdateHappiness(Event event, int current_happiness);

int main() {
  int cat_lives_counter{kMaxLives};
  int cat_happiness{0};
  while((cat_happiness < kMaxHappiness) && (cat_lives_counter > 0)) {
      const auto event = FindNextAdventure();
      cat_lives_counter = UpdateLives(event, cat_lives_counter);
      cat_happiness = UpdateHappiness(event, cat_happiness);
  }
  if (cat_lives_counter < 1) { std::cout << "Oops, we lost!\n"; }
  else { std::cout << "Yay, we won!\n"; }
  return 0;
}
```
<!-- Highlight the code -->
> :bulb: Note how I did not implement the functions and just declared them --- it is usually enough when designing something to get a feeling for the resulting system. We can fill the implementation once we're happy with the overall design.

<!-- Talking head -->
Once we implement the functions, the code works and is fun to play with (you can print all the events that your cat encounters during the exploration for example) but we quickly start seeing limitations of this approach once we try extending it.

#### Extension to smarter event generation
<!-- B-roll cat animation on a grid -->
For now, we assumed that the events are simply randomly generated on each iteration. But imagine that the events are physically scattered in a 2D world. The cat then has a coordinate `[x, y]` in this world and can decide to go in a certain direction where it can find new adventures. We now also need the `cat_x_coordinate` and the `cat_y_coordinate` values as well as to model the 2D world somehow.

<!-- Talking head -->
> :bulb: By the way, thinking of how to do implement such a 2D grid using a vector (or an array) and an indexing function is a good exercise and will come in handy very soon anyway :wink:

<!-- Talking head -->
If you try to add this logic involving the 2D world to our code above you will see how it gets hard to keep the code elegant and readable.

#### Extension to more cats
<!-- Talking head -->
The same happens if you want to have more than a single cat roaming your world and you want to find out which one wins. How would you do it?

<!-- Maybe B-roll code? Or animation? Or just number flying at the viewer -->
We would need to store all the properties in vectors. So we'll have a vector for the `cat_lives_counter` and the `cat_happiness` so that there is one for each cat. We'll have even more vectors if we model the world as we discussed before. This opens us up to the famous ["off by one" bugs](more_useful_types.md#access-elements-in-an-array) as we now have to process multiple vectors in unison.

### Model this nicer with custom types
<!-- Talking head -->
Wouldn't it be nice if we could capture our game setup in a more abstract way to keep the code readable and the logic clear?

<!-- Talking head -->
And of course there is such a way (otherwise there would be no lecture about it :wink:), and this way involves custom types.

Before we go into the mechanics of the custom types, let's first see how we could theoretically use them. The idea is that we bundle our data along with the methods to process them into a new `Cat` type:

<!-- B-roll change the code from before -->
```c++
#include <iostream>

// Magically define the Cat type here

int main() {
  Cat cat{};
  while(!cat.IsTotallyHappy() && cat.IsAlive()) {
    const auto event = cat.FindNextAdventure();
    cat.UpdateLives(event);
    cat.UpdateHappiness(event);
  }
  if (!cat.IsAlive()) { std::cout << "Oops, we lost!\n"; }
  else { std::cout << "Yay, we won!\n"; }
  return 0;
}
```
<!-- Talking head -->
Or, we could simplify the interface even further by hiding the details into a function `FindNextAdventure`!

<!-- B-roll change the code from before -->
```c++
#include <iostream>

// Magically define the Cat type here

int main() {
  Cat cat{};
  while(!cat.IsTotallyHappy() && cat.IsAlive()) {
    cat.FindNextAdventure();
  }
  if (!cat.IsAlive()) { std::cout << "Oops, we lost!\n"; }
  else { std::cout << "Yay, we won!\n"; }
  return 0;
}
```

<!-- Talking head with code overlay -->
Now *this* looks much better than before! The code is shorter, more readable and, if you think about the challenges presented before, they are much more manageable!

<!-- Talk while changing the code -->
To introduce the "world" as we discussed before, we could create another type `World` that would allow us to `GetEventAt(int x, int y)` and pass its instance into the `FindNextAdventure(const World& world)` function. The cat could then get two more properties for its position in the world. Or even one packed into a new type `Coordinate`. See? It's neat!

```c++
#include <iostream>

// Magically define the Cat and World types here

int main() {
  World world{};
  Cat cat{};
  while(!cat.IsTotallyHappy() && cat.IsAlive()) {
    cat.FindNextAdventure(world);
  }
  if (!cat.IsAlive()) { std::cout << "Oops, we lost!\n"; }
  else { std::cout << "Yay, we won!\n"; }
  return 0;
}
```
<!-- Talking head with cats popping up -->
> :bulb: This is just one of the ways to design this game. If you have the time, I encourage you to think about the alternatives. Can you think of any? Also, once you're at it, think how this can be extended to multiple cats :wink:

## Time for formalities
<!-- Talking head -->
Now that we know at least a little about what we need the custom types for, we can talk about how to write them!

### How to call things
<!-- B-roll write code in the middle of the screen -->
First of all, let's get the language out of the way:
```c++
Cat grumpy_cat;
Cat cute_cat{};  // ✅ Force the initialization of all Cat data
```
🚨 Here, `Cat` (with the capital `C`) is called a **class** or a **user-defined type**. The `grumpy_cat` and the `cute_cat` are variables of type `Cat`. They are also often called **instances** of type `Cat`.

> :bulb: Note that in the example above `grumpy_cat` _might_ remain uninitialized. Unless you have a good reason for it, always initialize variables, also of your custom types.

<!-- Talking head -->
🎨 In this course we will name the [custom types in `CamelCase`](https://google.github.io/styleguide/cppguide.html#Type_Names) and the [variables in `snake_case`](https://google.github.io/styleguide/cppguide.html#Variable_Names) just as any other variable.

<!-- TODO: simplify this -->
### What does custom type hold?
A custom type consists of 2 things:
- The data it holds
- The methods to process these data

> :bulb: This is usually referred to as **encapsulation**, which is a fancy word that just means that we put data that belongs together in one place along with the methods to process them

### Keywords to use to create custom types
There are two C++ keywords that indicate to the compiler that we are defining our own custom type:
- `class`
- `struct`

We can define a custom type like this:
<table>
<tr>
  <th><code>class</code></th>
  <th><code>struct</code></th>
</tr>
<tr>
  <td>

  ```c++
  class Cat {
    // Data and methods
  };  // Note the ;
  ```
  </td>
  <td>

  ```c++
  struct Cat {
    // Data (if methods needed use a class instead)
  };  // Note the ;
  ```
  </td>
</tr>
</table>

### The difference between `class` and `struct`
Both keywords create a new type with the only difference in how its data and methods are accessed. There are 3 access modifiers:
1. `private` (default for `class`) - can only be accessed from the methods of this very class or struct
2. `protected` - only can be accessed by the children of the class or struct (stay tuned)
3. `public` (default for `struct`) - can be accessed directly from the outside

🚨 The `struct` works in **exactly** the same way as the `class` with the only difference that, without explicit modifiers, all the data and methods of a `struct` have `public` access, while they are `private` for a `class`.

Here is this difference on a small example:
<table>
<tr>
  <th><code>class</code></th>
  <th><code>struct</code></th>
</tr>
<tr>
  <td>

  ```c++
  class Foo {
    int private_var_1_{};
   protected:
    int protected_var_{};
   public:
    // For illustration purposes only
    // Never have public data in a class
    int public_var_1{}; // 😱
    int public_var_2{}; // 😱
   private:
    int private_var_2_{};
  };

  // Somewhere in main
  Foo foo;
  foo.private_var_1_; // ❌
  foo.protected_var_; // ❌
  foo.public_var_1;   // ✅
  foo.public_var_2;   // ✅
  foo.private_var_2_; // ❌
  ```
  </td>
  <td>

  ```c++
  struct Foo {
    int bar{};
  };

  // Somewhere in main
  Foo foo;
  foo.bar;  // ✅
  ```
  </td>

</tr>
</table>

> :bulb: I'm using `int` here but any other type will of course also work.

> :bulb: Note that we don't leave variables uninitialized as discussed in [the lecture on variable](cpp_basic_types_and_variables.md#always-initialize-all-variables). This allows us to avoid the hard-to-debug undefined behavior.

> :art: Name `private` and `protected` variables in `snake_case_` with the trailing underscore `_`. It helps differentiate which variable we work with in the class methods.

> :art: It's a [good style](https://google.github.io/styleguide/cppguide.html#Declaration_Order) to start a class with the `public:` access modifier and keep the more restrictive access modifiers below. Why? Because private data is private for a reason. It should rarely be looked at, while public methods are read often and create the **public interface** of our class.

### Class methods
In addition to data, custom types usually have methods to work with these data. These methods are _very_ similar to free standing functions. Let's define some methods for our `Cat` class:

```c++
class Cat {
  public:
    void FindNextAdventure(const World& world) {
      // Update cat's position (omitted here)
      const auto event = world.GetEventAt(position_);
      UpdateNumberOfLives(event);
      UpdateHappiness(event);
    }

    bool IsAlive() const { return number_of_lives_ > 0; }
    bool IsTotallyHappy() const { return happiness_ > 99; }

  private:
    void UpdateNumberOfLives(Event event) {
      if (event == Event::kDanger) { number_of_lives_--; }
    }

    void UpdateHappiness(Event event) {
      if (event == Event::kFun) { happiness_ += 10; }
    }

    int number_of_lives_{9};
    int happiness_{};
    Position position_{};
};
```
🚨 Note how we can use the private data and methods within the methods of our `Cat` class. This is the fundamental principle behind **encapsulation**: the data of our class is only reachable from within the methods of our class, so we have full control over it.

> :bulb: Technically, a `struct` also can have methods, but it is [considered bad style](https://google.github.io/styleguide/cppguide.html#Structs_vs._Classes). If you need to have methods that process your data, use a `class` instead. If you just store some data together without methods processing them, use a `struct`.

#### What's with the trailing `const`?
This is something we have not seen before. Here is what it means. A trailing `const` for a method of a class means that when this function is called we guarantee that the data of this instance of a class will not change during this call. You can think of it like this: inside of the scope of a `const` function, all the data members are constants.

This is used to allow the compiler to check what we are doing. Let's illustrate this on a small example:

```c++
// Somewhere in main
const Cat cat{};
const auto cat_is_alive = cat.IsAlive(); // ✅ Compiles as the method is const
cat.FindNextAdventure(world); // ❌ Won't compile, method not marked as const
```

#### Const correctness
When we use `const` consistently we are talking about **const correctness**.

There are two places in which we should be using `const` consistently:
- after the method
- and when returning references to the internal data

Let's illustrate this for a method returning the cat's position:

```c++
class Cat {
  public:
    // Same as before
    const Position& position() const { return position_; }
  private:
    // Same data as before
    Position position_{};
};
```

> :bulb: `Position` is not a fundamental type so we want to return it by reference as it is more expensive to copy than a single reference.

> :art: You might have noticed that `position` is a function but is named in `snake_case`. This is a personal preference of mine that a function that just returns a data member is named the same way as the data member it returns, minus the trailing underscore.

We can now use this function even if we have a *constant* of type `Cat`:
```c++
const Cat cat{};
const auto& position = cat.position();
```

#### What happens if we forget the const?
But what will happen if we don't have the two `const` modifiers?

Well, let's give it a try!
- Removing the left-most `const` results in this error: TODO
- Removing the right-most `const` results in this error: TODO


### Constructors
The last thing I want to talk about today is how to create a new instance of a custom type. In our code before we've seen how to create new objects:
```c++
Cat cat{};
```
Under the hood, when a new object of a custom type is created a special function called a **constructor** is called. In the above example, a **default constructor** (one that takes 0 parameters) is called. We don't see it in the implementation of out `Cat` class because if we don't write our own constructors [a default one will be generated for us](https://en.cppreference.com/w/cpp/language/default_constructor).

> :bulb: Such a default constructor will leave the data uninitialized unless it is initialized in-place.

That being said, we can, of course, write any number of custom constructors for our classes. A constructor is just a class method with special signature - it does not return anything and it is named exactly as the class itself.

Let's illustrate this by writing a constructor that takes a happiness value and the number of lives for our cat (omitting all the other details of the class):
```c++
class Cat {
  public:
    Cat(int number_of_lives, int happiness) : number_of_lives_{number_of_lives}, happiness_{happiness} {}
  private:
    int number_of_lives_{};
    int happiness_{};
};
```

There is a bit of new syntax here! The part `: happiness_{happiness}` is called the **member initializer list** and you should *always* use it when writing constructors. It is guaranteed to happen **before** we enter the constructor function scope.

> 🚨 Remember that the order of operations in the member initializer list will follow the order in which the data appears in the class declaration, **not** the order in which the variables show up in the member initializer list itself! So `number_of_lives_` will **always** be initialized before `happiness_`.

#### Use `= default` if you still want the default constructor
After creating our custom constructor try creating the `Cat` object without parameters again! There is an error now! The compiler sees no constructor!

The reason behind this is that the compiler only generates the default constructor [if none are provided by the user](https://en.cppreference.com/w/cpp/language/default_constructor). Well, now we *did* provide one, so the compiler thinks that we know what we're doing and does not generate a default constructor.

However, we can easily add this constructor back by adding one line to our class:
```c++
class Cat {
  public:
    Cat() = default;  // ⬅️ Add back the default constructor
    Cat(int number_of_lives, int happiness) : number_of_lives_{number_of_lives}, happiness_{happiness} {}
  private:
    int number_of_lives_{};
    int happiness_{};
};
```

#### Use `explicit` with single-argument constructors
Last but not least, if we write a single-argument constructor, we should [mark it as `explicit`](https://google.github.io/styleguide/cppguide.html#Implicit_Conversions). This is needed to avoid an implicit conversion in situations like this:
```c++
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
This code should **not** compile, and won't if we have `explicit` keyword in place. But it *will* compile if we don't. You probably see that if this code compiles it leads to confusion, so `explicit` here helps avoid such confusing situations.

## That's about it for now
Now you know the basics of what custom types are, why we would even care and how to write your own ones! This is an important topic to understand as a lot of what modern C++ is builds on top of a solid understanding of what custom types are. In the following lectures we are going to extend what we learned here with further details and learn how to use classes and structs to achieve great things!
