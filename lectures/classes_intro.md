# Simple classes in C++

- [Simple classes in C++](#simple-classes-in-c)
- [The cat's life example](#the-cats-life-example)
  - [Let's model this using just the functions first](#lets-model-this-using-just-the-functions-first)
    - [Extension to smarter event generation](#extension-to-smarter-event-generation)
    - [Extension to more cats](#extension-to-more-cats)
  - [Model this nicer with custom types](#model-this-nicer-with-custom-types)
- [Time for formalities](#time-for-formalities)
  - [How to call things](#how-to-call-things)
  - [What does custom type hold?](#what-does-custom-type-hold)
    - [Let's define our own type `Cat`!](#lets-define-our-own-type-cat)
    - [Access modifiers `public` and `private`](#access-modifiers-public-and-private)
    - [Let's look at the class data](#lets-look-at-the-class-data)
    - [What's with the trailing `const`?](#whats-with-the-trailing-const)
    - [Const correctness](#const-correctness)
    - [What happens if we forget the const?](#what-happens-if-we-forget-the-const)
  - [Constructors](#constructors)
    - [Use `= default` if you still want the default constructor](#use--default-if-you-still-want-the-default-constructor)
    - [Use `explicit` with single-argument constructors](#use-explicit-with-single-argument-constructors)
  - [But what about `struct`?](#but-what-about-struct)
- [That's about it for now](#thats-about-it-for-now)

<!-- Talking head -->
By now we all should be quite comfortable using functions, but there are some things for which using just the functions alone doesn't really provide enough abstraction. The solution to this is to introduce the custom types, otherwise known as **classes**.

<!-- Intro -->

<!-- Talking head -->
Let me illustrate what I'm talking about with an example.

<!-- B-roll cat doing mischief -->
# The cat's life example
Imagine you want to write a game about a cat looking for some adventures. The cat starts off pretty grumpy and get's its happiness up by doing some fun mischief (like throwing a vase from a table). You win the game once the cat's happiness reaches 100%. It's not all fun though and some actions are dangerous and sometimes (rarely) the cat will lose 1 of its 9 lives. If your cat reaches 0 lives, you lose the game.

<!-- Talking head -->
Sounds good? So how can we model this in code?

## Let's model this using just the functions first

<!-- Talking head -->
> :bulb: Before we go any further, pause here and _do_ try to model this game. How would you write it using functions? Give it a try --- it's a good exercise!

<!-- B-roll code -->
One way or another, we will probably come up with something like this:
```cpp
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
Once we actually implement the functions, the code works and is fun to play with (you can print all the events that your cat encounters during the exploration for example) but we quickly start seeing limitations of this approach once we try extending it.

### Extension to smarter event generation
<!-- B-roll cat animation on a grid -->
For now, we assumed that the events are simply randomly generated on each iteration. But imagine that the events are physically scattered in a 2D world. The cat then has a coordinate `[x, y]` in this world and can decide to go in a certain direction where it can find new adventures. We now also need the `cat_x_coordinate` and the `cat_y_coordinate` values as well as to model the 2D world somehow.

<!-- Talking head -->
If you try to add this logic involving the 2D world to our code above you will see how it gets hard to keep the code elegant and readable.

### Extension to more cats
<!-- Talking head -->
The same happens if you want to have more than a single cat roaming your world and you want to find out which one wins. How would you do it?

<!-- Maybe B-roll code? Or animation? Or just number flying at the viewer -->
We would need to store all the properties in vectors. So we'll have a vector for the `cat_lives_counter` and the `cat_happiness` so that there is one for each cat. We'll have even more vectors if we model the world as we discussed before. This opens us up to the famous ["off by one" bugs](more_useful_types.md#access-elements-in-an-array) as we now have to process multiple vectors in unison.

## Model this nicer with custom types
<!-- Talking head -->
Wouldn't it be nice if we could capture our game setup in a more abstract way to keep the code readable and the logic clear?

<!-- Talking head -->
And of course there is such a way (otherwise there would be no lecture about it :wink:), and this way involves custom types.

Before we go into the mechanics of the custom types, let's first see how we could theoretically use them. The idea is that we bundle our data along with the methods to process them into a new `Cat` type:

<!-- B-roll change the code from before -->
```cpp
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
```cpp
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

```cpp
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

# Time for formalities
<!-- Talking head -->
<!-- Ok, time for a more formal definition -->
Now that we know at least a little about what we need the custom types for, we can talk about how to write them!

## How to call things
<!-- B-roll write code in the middle of the screen -->
First of all, let's get the language out of the way:
```cpp
Cat grumpy_cat;
Cat cute_cat{};  // ✅ Force the initialization of all Cat data
```
🚨 Here, `Cat` (with the capital `C`) is called a **class** or a **user-defined type**. The `grumpy_cat` and the `cute_cat` are variables of type `Cat`. They are also often called **instances** of type `Cat`.

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
Armed with this, let's implement our `Cat` class:

<!-- B-roll code -->
```cpp
class Cat {
  public:
    bool IsAlive() const { return number_of_lives_ > 0; }
    bool IsTotallyHappy() const { return happiness_ > 99; }

    void FindNextAdventure(const World& world) {
      Move();
      const auto event = world.GetEventAt(position_);
      UpdateNumberOfLives(event);
      UpdateHappiness(event);
    }

  private:
    void Move() { /* update position_ somehow */ }

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
<!-- Talking head -->
There is a whole lot of new stuff going on here! Let's unpack it all one by one.

<!-- B-roll highlight words. Start by "Let's first talk about" -->
### Access modifiers `public` and `private`
These define how the data and methods of the class are accessed through an instance of this class.

<!-- B-roll code and compilation succeeds -->
Everything under `public:` can be accessed directly from the outside, i.e., `cat.IsAlive()` will compile.

<!-- B-roll code and compilation failure -->
Everything under `private:` can **only** be accessed from within the methods of the class itself, i.e., `cat.Move()` won't compile.

<!-- Talking head -->
🚨 This is the fundamental principle behind **encapsulation**: the data of our class is only reachable from within the methods of our class, so every instance of such a class has full control over its data.

<!-- Talking head -->
:art: One more thing about these modifiers. We [always](https://google.github.io/styleguide/cppguide.html#Declaration_Order) start with `public` and `private` part follows later. Reason being that we read code from the top and only the `public` part contains the public interface of the class, and we should rarely read the `private` part which holds the implementation details.

<!-- B-roll highlight code -->
### Let's look at the class data
All the data in a class [**must** live under `private:` part](https://google.github.io/styleguide/cppguide.html#Access_Control).

:art: Name `private` variables of a class in `snake_case_` [with the trailing underscore](https://google.github.io/styleguide/cppguide.html#Variable_Names) `_`. It helps differentiate which variable we work with in the class methods.

<!-- Talking head -->
> :bulb: Note that we don't leave variables uninitialized as discussed in [the lecture on variable](cpp_basic_types_and_variables.md#always-initialize-all-variables). This helps us avoid the hard-to-debug undefined behavior.

<!-- B-roll highlight -->
<!-- Now it's time we looked at another curiosity! -->
### What's with the trailing `const`?
This is something we have not seen before.
<!-- Talking head -->
A trailing `const` for a method of a class means that when this function is called we guarantee that the data within this object will not change during this call. You can think of it like this: inside of the scope of a `const` function, all the data members are constants.

The cool thing is that the compiler is able to check this! This significantly reduces the amount of potential errors! Let's illustrate this on a small example:

<!-- B-roll: code -->
```cpp
// Somewhere in main
const Cat cat{};
const auto cat_is_alive = cat.IsAlive(); // ✅ Compiles as the method is const
cat.FindNextAdventure(world); // ❌ Won't compile, method not marked as const
```

<!-- Talking head -->
### Const correctness
When we use `const` consistently we are talking about **const correctness**.

There are two places specific to classes in which we should be using `const`:
- after the method
- and when returning references to the internal data

<!-- B-roll code -->
Let's illustrate this for a method returning the cat's position:
```cpp
class Cat {
  public:
    // Same as before
    const Position& position() const { return position_; }
  private:
    // Same data as before
    Position position_{};
};
```
<!-- Talking head -->
> :bulb: `Position` is not a fundamental type so we want to return it by reference as it is more expensive to copy than a single reference.

<!-- B-roll Highlight + talking head -->
> :art: You might have noticed that `position` is a function but is named in `snake_case`. This is a personal preference of mine that a function that just returns a data member is named the same way as the data member it returns, minus the trailing underscore.

<!-- B-roll code -->
We can now use this function even if we have a *constant* of type `Cat`:
```cpp
const Cat cat{};
const auto& position = cat.position();
```

<!-- Talking head. Start with "but" -->
### What happens if we forget the const?
<!-- B-roll code -->
Well, let's give it a try! Removing each of the `const` modifiers results in a separate error!

<!-- TODO: move constructors to the next lecture? -->
## Constructors
<!-- Talking head -->
The last thing I want to talk about today is how to create a new instance of a custom type. In our code before we've seen how to create new objects:
<!-- B-roll code -->
```cpp
Cat cat{};
```
<!-- Talking head -->
Under the hood, when a new object of a custom type is created a special function called a **constructor** is called. In the above example, a **default constructor** (one that takes 0 parameters) is called. We don't see it in the implementation of our `Cat` class because if we don't write our own constructors [a default one will be generated for us](https://en.cppreference.com/w/cpp/language/default_constructor).

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

<!-- Talking head -->
## But what about `struct`?
Nearly forgot to talk about `struct`. Structs are _exactly_ the same as classes with just one difference. If you leave a `class` without access modifiers, everything will be `private`. If you do the same with a `struct`, everything will be `public`. Other than that they are exactly the same.

> :bulb: A [rule of thumb](https://google.github.io/styleguide/cppguide.html#Structs_vs._Classes) is to use `struct` only for pure data storage, if you need any methods use a `class` instead.

<!-- Talking head -->
# That's about it for now
Now you know the basics of what custom types are, why we would  care about them and how to write your own ones! This is an important topic to understand as a lot of what modern C++ is builds on top of a solid understanding of what custom types are. In the following lectures we are going to extend what we learned here with further details and learn how to use classes and structs to achieve great things!

<!-- Thanks for watching as always! If you like what I do, tell your friends, subscribe here and maybe watch another video over there. Bye! -->
