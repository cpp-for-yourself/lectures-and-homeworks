<!-- Now it's time we looked at another curiosity! -->
### What's with the trailing `const`?
This is something we have not seen before.
<!-- Talking head TAG_4 -->
A trailing `const` for a method of a class means that when this function is called we guarantee that the data within this object will not change during this call. You can think of it like this: inside of the scope of a `const` function, all the data members are constants.

The cool thing is that the compiler is able to check this! This significantly reduces the amount of potential errors! Let's illustrate this on a small example:

<!-- B-roll: code -->
```cpp
// Somewhere in main
const Cat cat{};
const auto cat_is_alive = cat.IsAlive(); // ✅ Compiles as the method is const
cat.FindNextAdventure(world); // ❌ Won't compile, method not marked as const
```

<!-- Talking head TAG_6 -->
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
