# Const correctness
I like to think that the attention span of a typical software engineer is very close to that of a goldfish. At least that's true for myself. So we have to do everything in our power to reduce the amount of things we have to keep in our head when writing, and even more importantly, reading the code. Using `const` correctly (also knows as **"const correctness"**) helps us with this.

<!-- Intro -->

Let's say we have an `Example` class. This class takes references to some data in its constructor, owns some data, keeps a reference to other data, performs some operations on these data and returns these data when needed:
<!-- Animation:
- Add empty Example class
- Add constructor and private part without comments
- Add update and compare functions
- Add getters
 -->
```cpp
class Example {
 public:
  Example(const Data &copy_me, const Data &view_me)
      : owned_data_{copy_me}, data_ref_{view_me} {}

  void Update(const Data &copy_me) { owned_data_ = copy_me; }
  bool Compare(const Data &other) const { return true; }

  Data &owned_data() { return owned_data_; }
  const Data &owned_data() const { return owned_data_; }

  const Data &data() const { return data_ref_; }

 private:
  Data owned_data_{};       // Technically can be const, but shouldn't
  const Data &data_ref_{};  // Can also be a const pointer
};
```

Largely speaking, there are four distinct places where we might want to put const within this class:
1. When passing `const` data into a function of a class (constructor _is_ a function, [remember](object_lifecycle.md)?)
2. After a method of a class to indicate that this method doesn't change the internal data
3. When returning a `const` references to data from a class
4. To make the data stored in the class `const`

## Let's look at all of these and how they help us!

Before we start, in this video we will use a "lifetime tracker" object that, whenever it is copied or moved, prints the appropriate event to the console. Here is how an object like this can be used:
<!-- Animate:
  - Add code
  - Add results
  - Highlight code lines and result printout at the same time
-->
```cpp
int main() {
  LifetimeTracker tracker{};
  LifetimeTracker other_copied{tracker};
  LifetimeTracker other_moved{std::move(tracker)};
  other_copied = other_moved;
  other_moved = std::move(other_copied);
  return 0;
}
```

Which, when executed, prints the following sequence of actions:
```
construct
copy construct
move construct
copy assign
move assign
destroy
destroy
destroy
```

After following the [move semantics tutorial](move_semantics.md) you should be able to write a class that behaves like this yourself. I encourage you to try. If you struggle, then the code for it is right here.
<!-- Below the video -->

<details>
<summary><code>LifetimeTracker</code> code</summary>

```cpp
#include <iostream>

class LifetimeTracker {
  public:
    LifetimeTracker() { std::cout << "construct" << std::endl; }
    LifetimeTracker(const LifetimeTracker&) { std::cout << "copy construct" << std::endl; }
    LifetimeTracker(LifetimeTracker&&) { std::cout << "move construct" << std::endl; }
    LifetimeTracker& operator=(const LifetimeTracker&) {
      std::cout << "copy assign" << std::endl;
      return *this;
    }
    LifetimeTracker& operator=(LifetimeTracker&&) {
      std::cout << "move assign" << std::endl;
      return *this;
    }
    ~LifetimeTracker() { std::cout << "destroy" << std::endl; }
};
```

</details>

Going forward, we'll use this `LifetimeTracker` class in place of `Data` in our `Example` class from before.


### 1. Passing `const` parameters to class methods

This is the simplest case as it is not different from any [functions we wrote](functions.md) many times before. We just pass the data as a `const` reference into the method.

```cpp
bool Compare(const int &other) const { return true; }
```

Still, let's reiterate what the benefits are.
1. The `other` object is not copied, so we save time.
2. At the same time we know that the `other` object will not be changed during the execution of the `example.Compare(other)` function. If we try to change it - we get a compilation error.
    ```cpp
    bool Compare(const int &other) const {
      other = 42;  // ❌ Won't compile
      return true;
    }
    ```

This means that if we stick to passing parameters by `const` reference, we have one fewer things to think about. So that when we read the code:
```cpp
const auto comparison result = example.Compare(other);
```
we know for a fact that `other` won't be changed, no need to read the function code (assuming we even have access to it).

### 2. Using `const` after a class method

Now you might have noticed in our previous example the `const` at the end of the function. What's that about? Actually, we _have_ touched upon this before when we talked about [writing classes in headers](headers_with_classes.md).

Such a `const` means this: if a method of some object is marked by a `const` at the end, it means that in this method the object on which the method is called will not be changed.

Now, why is that important? Consider this example:
```cpp
const Example example{};  // Look, a const object!
example.Compare(42);  // And we can do stuff with it!
```
It allows us to set the object as `const` which adds the peace of mind for us - we know that nobody can change this object! See? Const correctness!

### 3. When returning `const` reference to our data from our class
This is a very common pattern and people also call such functions "getters" because they _get_ the data without giving a way to modify the data from the outside.

```cpp
int main() {
  const int number{42};
  Foo foo{number};
  std::cout << foo.number() << std::endl;
  return 0;
}
```

🎓 If you need to make any data visible from your class - use this pattern! When used consistently, it reduces our attention scope by knowing that the data we return in such a way will remain unchanged, so we know that if the data changes it happens from within our class.


### 4. To make the data of the class `const`
