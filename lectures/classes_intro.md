# Simple classes in C++

- [Simple classes in C++](#simple-classes-in-c)
- [The cat's life example](#the-cats-life-example)
  - [Let's model this using just the functions first](#lets-model-this-using-just-the-functions-first)
    - [Extension to more cats](#extension-to-more-cats)
  - [Model this nicer with custom types](#model-this-nicer-with-custom-types)
- [Time for formalities](#time-for-formalities)
  - [How to call things](#how-to-call-things)
  - [What does custom type hold?](#what-does-custom-type-hold)
    - [Let's define our own type `Cat`!](#lets-define-our-own-type-cat)
    - [Access modifiers `public` and `private`](#access-modifiers-public-and-private)
    - [Let's look at the class data](#lets-look-at-the-class-data)
  - [But what about `struct`?](#but-what-about-struct)
- [That's about it for now](#thats-about-it-for-now)

<!-- Talking head -->
By now we all should be quite comfortable using functions, but there are some things for which using just the functions alone doesn't really provide enough abstraction. The solution to this is to introduce the custom types, otherwise known as **classes**.

<!-- Intro -->

<!-- Talking head -->
Let me illustrate what I'm talking about with an example.

<!-- B-roll cat doing mischief -->
# The cat's life example
Imagine that we want to write a game about a cat roaming the world looking for fun adventures. The cat starts off as pretty grumpy and get's its happiness up by doing some fun mischief (like throwing a vase from a table). We win the game once the cat's happiness reaches 100% or it has explored every corner of our world. It's not all fun though and some actions are dangerous and sometimes (rarely) the cat will lose 1 of its 9 lives. If our cat reaches 0 lives, we lose the game.

<!-- Talking head -->
Sounds good? So how can we model this in code taking into account everything we know until now?

## Let's model this using just the functions first

<!-- Talking head -->
> :bulb: Before we go any further, pause here and _do_ try to model this game. How would *you* write it using functions? Give it a try - it's a good exercise!

<!-- Talking head -->
Before we jump into coding this, we first would want to *model* our world and the cat using some variables.

<!-- B-roll visualize -->
For simplicity, we will assume a line-like world, which we then can represent as a vector of fun and dangerous events randomly generated for each game. The cat then can be represented by its number of lives, happiness and a position in the world.

<!-- B-roll code -->
One way or another, we will probably come up with something like this:
<!--
`CPP_COPY_SNIPPET` cat_functions/main.cpp
`CPP_RUN_CMD` CWD:cat_functions c++ -std=c++17 -c main.cpp
-->
```cpp
#include <iostream>
#include <vector>

namespace {
  constexpr auto kMaxHappiness = 100;
  constexpr auto kMaxLives = 9;
}  // namespace

// Feel free to have more events here of course
enum class Event {
  kNone,
  kFun,
  kDanger,
  kWorldExplored,
};

// Generate a random world to explore
std::vector<Event> GenerateWorld();

// Return a random event in the simplest case
Event FindNextAdventure(std::vector<Event> world, std::size_t cat_position);

// Update number of lives depending on what happened
int UpdateLives(Event event, int current_lives);

// Update happiness depending on what happened
int UpdateHappiness(Event event, int current_happiness);

int main() {
  const auto world = GenerateWorld();
  std::size_t cat_position{};
  int cat_lives_counter{kMaxLives};
  int cat_happiness{0};
  while(true) {
      const auto event = FindNextAdventure(world, cat_position);
      if (event == Event::kWorldExplored) {
        std::cout << "The world is fully explored. We won!\n";
        break;
      }
      cat_lives_counter = UpdateLives(event, cat_lives_counter);
      if (cat_lives_counter < 1) {
        std::cout << "Cat ran out of lives. We lost...\n";
        break;
      }
      cat_happiness = UpdateHappiness(event, cat_happiness);
      if (cat_happiness >= kMaxHappiness) {
        std::cout << "Cat fully happy! We won!\n";
        break;
      }
  }
  return 0;
}
```
<!-- Highlight the code -->
> :bulb: Note how I did not implement the functions and just declared them - it is usually enough when designing something to get a feeling for the resulting system. We can fill the implementation once we're happy with the overall design.

<!-- Talking head -->
Once we *actually implement* the functions, the code works and is fun to play with (you can add more events and print the ones your cat encounters during the exploration for example) but we quickly start seeing limitations of this approach once we try extending it, for example to multiple cats.

### Extension to more cats
<!-- Maybe B-roll code? Or animation? Or just number flying at the viewer -->
We would need to store all the cat properties in vectors. So we'll have a vector for the `cat_lives_counter`, `cat_happiness`, and for `cat_position` so that there is one for each cat. Not only this is not neat, this opens us up to the famous ["off by one" bugs](more_useful_types.md#access-elements-in-an-array) as we now have to process multiple vectors in unison and given that the code will inevitably change later, this _will_ lead to errors.

## Model this nicer with custom types
<!-- Talking head -->
Wouldn't it be nice if we could capture our game setup in a more abstract way to keep the code readable and the logic clear?

<!-- Talking head -->
And of course there is such a way (otherwise there would be no lecture about it :wink:), and this way involves **custom types**.

Before we go into the mechanics of the custom types, let's first see how we could theoretically use them on an abstract level. The idea is that we bundle our data along with the methods to process them into the new `Cat` and `World` types:

<!-- B-roll change the code from before -->
<!--
`CPP_SETUP_START`
using World = int;
enum class Event {kWorldExplored};
struct Cat {
  Event FindNextAdventure(const World& world);
  void UpdateLives(Event event);
  void UpdateHappiness(Event event);
  bool IsTotallyHappy();
  bool IsAlive();
};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` cat_classes_first/main.cpp
`CPP_RUN_CMD` CWD:cat_classes_first c++ -std=c++17 -c main.cpp
-->
```cpp
#include <iostream>
#include <vector>

// Magically define the Cat and the World types here

int main() {
  World world{};
  Cat cat{};
  while(true) {
    const auto event = cat.FindNextAdventure(world);
    if (event == Event::kWorldExplored) {
      std::cout << "The world is fully explored. We won!\n";
      break;
    }
    cat.UpdateLives(event);
    if (!cat.IsAlive()) {
      std::cout << "Cat ran out of lives. We lost...\n";
      break;
    }
    cat.UpdateHappiness(event);
    if (cat.IsTotallyHappy()) {
      std::cout << "Cat fully happy! We won!\n";
      break;
    }
  }
  return 0;
}
```
<!-- Talking head -->
Or, if we think more about it, when we interact with our `cat`, the `UpdateLives` and the `UpdateHappiness` functions look more like an implementation detail so we could hide them into our existing `FindNextAdventure` function, further simplifying the `cat` interface!

<!-- B-roll change the code from before -->
<!--
`CPP_SETUP_START`
using World = int;
enum class Event {kWorldExplored};
struct Cat {
  Event FindNextAdventure(const World& world);
  bool IsTotallyHappy();
  bool IsAlive();
};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` cat_classes_simple/main.cpp
`CPP_RUN_CMD` CWD:cat_classes_simple c++ -std=c++17 -c main.cpp
-->
```cpp
#include <iostream>
#include <vector>

// Magically define the Cat and the World types here

int main() {
  World world{};
  Cat cat{};
  while(true) {
    const auto event = cat.FindNextAdventure(world);
    if (event == Event::kWorldExplored) {
      std::cout << "The world is fully explored. We won!\n";
      break;
    }
    if (!cat.IsAlive()) {
      std::cout << "Cat ran out of lives. We lost...\n";
      break;
    }
    if (cat.IsTotallyHappy()) {
      std::cout << "Cat fully happy! We won!\n";
      break;
    }
  }
  return 0;
}
```

<!-- B-roll compare two tabs -->
Now *this* looks much better than before! The code is shorter, more readable for humans and is going to be easier to maintain!

<!-- Talking head with cats popping up -->
> :bulb: This is just one of the ways to design this game. If you have the time, I encourage you to think about the alternatives. Can you think of any? Also, once you're at it, think how *this* can be extended to multiple cats :wink:

# Time for formalities
<!-- Talking head -->
<!-- Ok, time for a more formal definition -->
Now that we know at least a little about what we need the custom types for, we can talk about how to write them!

## How to call things
<!-- B-roll write code in the middle of the screen -->
First of all, let's get the language out of the way:

<!--
`CPP_SETUP_START`
using Cat = int;
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` object/main.cpp
`CPP_RUN_CMD` CWD:object c++ -std=c++17 -c main.cpp
-->
```cpp
Cat grumpy_cat;
Cat cute_cat{};  // ✅ Force the initialization of all Cat data
```
🚨 Here, `Cat` (with the capital `C`) is called a **class** or a **user-defined type**. The `grumpy_cat` and the `cute_cat` are variables of type `Cat`. They are also often called **instances** or an **object** of type `Cat`.

> :bulb: Note that in the example above `grumpy_cat` _might_ remain uninitialized. Unless you have a good reason for it, always initialize variables, also of your custom types.

<!-- Talking head -->
🎨 In this course we will name the [custom types in `CamelCase`](https://google.github.io/styleguide/cppguide.html#Type_Names) and the [variables in `snake_case`](https://google.github.io/styleguide/cppguide.html#Variable_Names) just as any other variable.

<!-- Talking head with data and method on each hand -->
## What does custom type hold?
A custom type consists of 2 things:
- The data it holds
- The methods to process these data

<!-- Talking head smack them together for encapsulation -->
> :bulb: This is usually referred to as **encapsulation**, which is a fancy word that just means that we put data that belongs together in one place along with the methods to process them.

<!-- B-roll: Overlay with class and struct words -->
### Let's define our own type `Cat`!
First of all, there are two C++ keywords that indicate to the compiler that we are defining our own custom type:
- `class`
- `struct`

<!-- B-roll: Overlay, word class moves to the middle -->
We're going to use `class` for now and talk about struct at the end of this lecture.

<!-- Talking head -->
In the beginning of this lecture, we kinda *already* designed our `Cat` class methods without even thinking about the data it has to store.

<!-- B-roll: Overlay with words Methods > Data -->
In other words, methods of the class form its **public interface** answering the question "what does the class do" which is much more important than the data the class holds, which answers the question "how does it do it" and is just an **implementation detail**. If we change the class data without changing its public interface nobody will notice!

<!-- Talking head -->
Armed with this, let's fully implement our `Cat` class:

<!-- B-roll code -->
<!--
- We define a class by typing the word class, its name and brackets with semicolon (that it ends with ;)
- Classes have so-called access modifiers: public and private (+ Talking head TAG_5)
  - Everything under public is a "public interface" and can be accessed from the outside, for example:
  - The IsAlive() function. We want the user to be able to check if the cat is alive.
  - Everything under `private` is an "implementation detail" and is only accessible from _within_ the class. For example:
  - The function UpdateHappiness() should not be available to the user, as the cat decides if it wants to be happy on its own, without the user input
  - Actually, let's write a small main function and compile this code to illustrate access modifiers in action
  - int main() {Cat cat{}; cat.IsAlive(); cat.UpdateHappiness(Event::kFun); return 0; }
  - Insert Talking head TAG_1 and TAG_2 here
- Draw attention to the const at the end of IsAlive()
  - Explain it with talking head TAG_4
  - Let's make our cat object const and try to call const and non-const functions on it
- Now with this out of the way we can quickly finalize our public interface.
- Awesome, now let's fill it with actual code!
- The first two function are easy, they just return a boolean. But they touch upon the cat internal data, which we _always_ put into the private part of our class. Data is always an implementation detail of a class!
- We name these variables in snake_case with a trailing underscore_
- And just as with any other variables we don't want to leave them uninitialized (Talking head TAG_3)
- Now we get to the most interesting function of our cat class: FindNextAdventure as it has most of the logic.
- We first outline this logic with some abstract functions and then fill in the functions we require.
- These functions will all live in the private area as they should only be used from within the class
- Feel free to pause at any time to look into the implementation more precisely but with this we have implemented our cat class!
-->
<!--
`CPP_SETUP_START`
#include <iostream>
#include <vector>

enum class Event {
  kNone,
  kFun,
  kDanger,
  kWorldExplored,
};

namespace {
  constexpr auto kMaxHappiness = 100;
  constexpr auto kMaxLives = 9;
  constexpr auto kHappinessIncrement = 10;
}  // namespace

using World = std::vector<Event>;

$PLACEHOLDER

int main() {
  World world{};
  Cat cat{};
  const auto& cat_ref{cat};
  cat_ref.IsAlive();
  cat_ref.IsTotallyHappy();
  const auto adventure = cat.FindNextAdventure(world);

  return 0;
}
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` full_cat/main.cpp
`CPP_RUN_CMD` CWD:full_cat c++ -std=c++17 -c main.cpp
-->
```cpp
class Cat {
  public:
    bool IsAlive() const { return number_of_lives_ > 0; }
    bool IsTotallyHappy() const { return happiness_ >= kMaxHappiness; }

    Event FindNextAdventure(const World& world) {
      Move();
      if (position_ >= world.size()) { return Event::kWorldExplored; }
      const auto event = world[position_];
      UpdateNumberOfLives(event);
      UpdateHappiness(event);
      return event;
    }

  private:
    void Move() { position_++; }

    void UpdateNumberOfLives(Event event) {
      if (event == Event::kDanger) { number_of_lives_--; }
    }

    void UpdateHappiness(Event event) {
      if (event == Event::kFun) { happiness_ += kHappinessIncrement; }
    }

    int number_of_lives_{kMaxLives};
    int happiness_{};
    std::size_t position_{};
}; // <- Note a semicolon here!
```
<!-- Skip -->
There is a whole lot of new stuff going on here! Let's unpack it all one by one.

<!-- Skip -->
### Access modifiers `public` and `private`
These define how the data and methods of the class are accessed through an instance of this class.

- Everything under `public:` can be accessed directly from the outside, i.e., `cat.IsAlive()` will compile.
- Everything under `private:` can **only** be accessed from within the methods of the class itself, i.e., `cat.Move()` won't compile.

<!-- Talking head TAG_5 -->
> :bulb: There is also the `protected` access modifier but we will talk about it later.

<!-- Talking head TAG_1 -->
🚨 This is the fundamental principle behind **encapsulation**: the data of our class is only reachable from within the methods of our class, so every instance of such a class has full control over its data.

<!-- Talking head TAG_2 -->
:art: Also note that we [always](https://google.github.io/styleguide/cppguide.html#Declaration_Order) start with `public` and `private` part follows later. Reason being that we read code from the top and care about what we actually can call more than about some obscure implementation details.

<!-- Skip -->
### Let's look at the class data
All the data in a class [**must** live under `private:` part](https://google.github.io/styleguide/cppguide.html#Access_Control).

<!-- Skip -->
:art: Name `private` variables of a class in `snake_case_` [with the trailing underscore](https://google.github.io/styleguide/cppguide.html#Variable_Names) `_`. It helps differentiate which variable we work with in the class methods.

<!-- Talking head TAG_3 -->
> :bulb: Note that we don't leave variables uninitialized as discussed in [the lecture on variable](cpp_basic_types_and_variables.md#always-initialize-all-variables). This helps us avoid the hard-to-debug undefined behavior.

<!-- Talking head -->
## But what about `struct`?
Ok, I Nearly forgot to talk about `struct`. Structs are _exactly_ the same as classes with just one difference. If you leave a `class` without access modifiers, everything will be `private`. If you do the same with a `struct`, everything will be `public`. Other than that they are exactly the same.

> :bulb: A [rule of thumb](https://google.github.io/styleguide/cppguide.html#Structs_vs._Classes) is to use `struct` only for pure data storage, if you need any methods use a `class` instead.

<!-- Talking head -->
# That's about it for now
Now we know the basics of what custom types are, why we would care about them and how to write our own ones! This is an important topic to understand as a lot of what modern C++ is builds on top of a solid understanding of what custom types are. In the following lectures we are going to extend what we learned here with further details and learn how to use classes and structs to achieve great things!

<!-- Thanks for watching as always! If you like what I do, tell your friends, subscribe here and maybe watch another video over there. Bye! -->
