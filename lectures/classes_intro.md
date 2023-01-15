# Simple classes in C++
By now we all should be quite comfortable using functions, but there are some things for which using just the functions doesn't really provide enough abstraction. Let me illustrate.

## The cat's life example
Imagine you want to write a game about a cat looking for some adventures. The cat starts off pretty grumpy and get's his happiness up by doing some fun mischief (like throwing a vase from a table). You win the game once cat happiness reaches 100%. It's not all fun though and some actions are dangerous and sometimes (rarely) the cat will lose 1 of its 9 lives. If you reach 0 lives, you lose the game. Sounds good?

So how can we model this in code?

### Let's model this using just the functions first

> :bulb: Before we go any further, pause here and do try to model this game. How would _you_ write it using functions? Do give it a try --- it's a good exercise!

One way or another, we will probably come up with something like this:
```c++
#include <iostream>

namespace {
    constexpr auto kMaxHappiness = 100;
    constexpr auto kMaxLives = 9;
}  // namespace

enum class Event {
    kFindFood,
    kDropVase,
    kFindMouse,
    kFall
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

It works and is fun to play with (you can print all the events that your cat encounters during the exploration) but we quickly start seeing limitations of this approach once we try extending it.

#### Extension to better event generation
In the above we assume that the events are randomly generated. But imagine that the events are scattered in the world. The cat then has a coordinate `[x, y]` in this world and can decide to go in a certain direction. We now also need the `cat_x_coordinate` and the `cat_y_coordinate` values as well as to model the 2D world somehow.

> :bulb: Thinking of how to do this using a vector and an indexing function is a good exercise and will come in handy very soon anyway :wink:

If you try to add this logic to our code above you will see how it gets hard to keep the code elegant and readable.

#### Extension to more cats
Now imagine that you now want to have more than a single cat roaming your world and you want to find out which one wins? How would you do it?

We would need to store all the properties in vectors. So we'll have a vector for the `cat_lives_counter` and the `cat_happiness` so that there is one for each cat. We'll have even more vectors if we model the world as we discussed before. This opens us up to the famous "off by one" bugs as we now have to process multiple vectors in unison.

### Model this nicer with classes

Wouldn't it be nice if we could capture our game setup in a more abstract way to keep the code readable and the logic clear?

And of course there is such a way (otherwise there would be no lecture about it :wink:), and this way involves classes.

Before we go into the mechanics of classes, let's first see how we can use them.

```c++
#include <iostream>

namespace {
  constexpr auto kMaxHappiness = 100;
  constexpr auto kMaxLives = 9;
}  // namespace

enum class Event {
  kFindFood,
  kDropVase,
  kFindMouse,
  kFall
};

class Cat {
 public:
  Event FindNextAdventure();
  void UpdateLives(Event event);
  void UpdateHappiness(Event event);
  bool IsAlive() const;
  bool IsTotallyHappy() const;

 private:
  int happiness{0};
  int lives_counter{kMaxLives};
};

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
Or, we could go a step further and simplify the interface even further!
```c++
// Same code as before here

class Cat {
 public:
  // Does everything in one go
  void ProcessNextAdventure();
  bool IsAlive() const;
  bool IsTotallyHappy() const;

 private:
  int happiness{0};
  int lives_counter{kMaxLives};
};

int main() {
  Cat cat{};
  while(!cat.IsTotallyHappy() && cat.IsAlive()) {
    cat.ProcessNextAdventure();
  }
  if (!cat.IsAlive()) { std::cout << "Oops, we lost!\n"; }
  else { std::cout << "Yay, we won!\n"; }
  return 0;
}
```
Now this looks much better than before! The code is shorter, more readable and, if you think about the challenges presented before, they are much more manageable!

To introduce the "world" we would create another class `World` and pass it's instance into the `ProcessNextAdventure` function. The cat could then get two more properties for its position in the world. Or even one packed into a new class `Coordinate`. See? It's neat!

> :bulb: This is just one of the ways to design this game. If you have the time, I encourage you to think about the alternatives. Can you think of any?

## Time for formalities

Now that we know at least a little about what we need the classes for, we can talk about how to write our own classes.

### How to call things
First of all, let's get the language out of the way:
```c++
MyAwesomeClass my_variable;
```
🚨 Here, `MyAwesomeClass` is called a **class** or a **user-defined type** of a variable `my_variable`. The `my_variable` variable here is called an **instance** or the `MyAwesomeClass` type.

🎨 In this course we will name the custom types in `CamelCase` and the variables in `snake_case` just as any other variable.

### What is a custom type?
A custom type consists of 2 things:
- The data it holds
- The methods to process these data

> :bulb: This is usually referred to as **encapsulation**, which is a fancy word that just means that we put data that belongs together in one place along with the methods to process them

### Keywords to use to create custom types
There are two C++ keywords that indicate to the compiler that we are defining our own custom type:
- `class`
- `struct`

The types can be declared and defined just like [functions](functions.md#declaration-vs-definition).

To **declare** a custom type do the following:
<table>
<tr>
  <td>

  ```c++
  class CustomType;
  ```
  </td>
  <td>

  ```c++
  struct CustomType;
  ```
  </td>
</tr>
</table>


To **define** a custom type do the following:
<table>
<tr>
  <td>

  ```c++
  class CustomType {
    // Contents
  };
  ```
  </td>
  <td>

  ```c++
  struct CustomType {
    // Contents
  };
  ```
  </td>
</tr>
</table>


### The difference between `class` and `struct`
Both keywords create a new type with the only difference in accessing its data. The `class` has 3 access modifiers for its data:
1. `private` (default) - can only be accessed from the methods of this very class
2. `protected` - only can be accessed by the children of the class (stay tuned)
3. `public` - can be accessed directly from the outside

The `struct` works in **exactly** the same way as the `class` with the only difference that all the data and methods of a `struct` have `public` access.

Here is the difference on a small example:
<table>
<tr>
  <th><code>class</code></th>
  <th><code>struct</code></th>
</tr>
<tr>
  <td>

  ```c++
  class Foo {
    int bar;
   public:
    int buzz;
   private:
    int blah;
  };

  // Somewhere in main
  Foo foo;
  foo.bar;   // ❌
  foo.buzz;  // ✅
  foo.blah;  // ❌
  ```
  </td>
  <td>

  ```c++
  struct Foo {
    int bar;
  };

  // Somewhere in main
  Foo foo;
  foo.bar;  // ✅
  ```
  </td>

</tr>
</table>

> :bulb: I'm using `int` here but any other type will of course also work.

<!-- TODO: to be continued -->
TODO:
- Initializers
- Constructor
- Functions
- Const with classes (cover the case of const data)
