# Const correctness
I like to think that the attention span of a typical software engineer is very close to that of a goldfish. At least that's true for myself. So we have to do everything in our power to reduce the amount of things we have to keep in our head when writing, and even more importantly, reading the code. Using `const` correctly (also knows as **"const correctness"**) helps us with this.

<!-- Intro -->

There are four places where we might want to put const within a custom class:
```cpp
class Foo {
 public:
  explicit Foo(const int& data): data_{data} {}
  const int& data() const { return data_; }
 private:
  const int& data_{};  // Can also be a const pointer
};
```
1. When passing `const` data into a function of a class (constructor _is_ a function, remember?)
2. When returning `const` reference to our data from our class
3. After a method of a class to indicate it doesn't change the internal data
4. To make the data of the class `const`

## Let's look at all of these and how they help us!

Before we start, in this video we will use a "lifetime tracker" object that prints whenever it is copied or moved.

```cpp
class LifetimeTracker {
  public:
    LifetimeTracker(const LifetimeTracker&) { std::cout << "copy" << std::endl; }
    LifetimeTracker(LifetimeTracker&&) { std::cout << "move" << std::endl; }
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

### 1. Passing `const` parameters to class methods
This is the simplest case as it is not different from any functions we wrote many times before. We just pass the data as a `const` reference into the method. One thing to be cautious about here is what we do with these data:

The data can be set as a reference:
```cpp
class DataRef {
 public:
  explicit DataRef(const LifetimeTracker& data): data_{data} {}  // Data is _not_ copied, a const reference is copied!
 private:
  const LifetimeTracker& data_{};
};
```
Or copied:
```cpp
class DataCopy {
 public:
  explicit DataCopy(const LifetimeTracker& data): data_{data} {}  // Data is _copied_!
 private:
  LifetimeTracker data_{};
};
```
We can easily see the difference:
```cpp
int main() {
  LifetimeTracker tracker{};
  DataRef{tracker};
  DataCopy{tracker};
}
```

It reduces our attention scope by ensuring that when we pass something into a class method - we know it won't change!

### 2. When returning `const` reference to our data from our class
This is a very common pattern and people also call such functions "getters" because they _get_ the data without giving a way to modify the data from the outside.

```cpp
int main() {
  const int number{42};
  Foo foo{number};
  std::cout << foo.number() << std::endl;
  return 0;
}
```

🎓 If you need to make any data visible from your class - use this pattern! It reduces our attention scope by knowing that the data we return in such a way will remain unchanged, so we know that if the data changes it happens from within our class.


### 3. After a method of a class to indicate it doesn't change the internal data


### 4. To make the data of the class `const`
