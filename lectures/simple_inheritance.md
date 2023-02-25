# Simple inheritance and why composition is better

Inheritance is an important concept that enables a lot of techniques that we use in C++.

Largely speaking, there are two types of inheritance:
- Interface inheritance
- **Implementation inheritance**

Today we focus on the latter and will cover the former in the coming lectures very soon.


<!-- intro -->

A little caveat, I will not cover all the details here. I will focus on the best practices that served me well over the years only.

## What is the implementation inheritance used for?

While it can be used for many more things, we technically mostly use implementation inheritance to save us some coding.

<table>
<tr>
<td>
Without inheritance
</td>
<td>
With inheritance
</td>
</tr>
<tr>
<td>

```cpp
class Human {
public:
  void Sleep() { tiredness_ = 0.0F; }
  float tiredness() const { return tiredness_; }
private:
  float tiredness_{};
};

class Programmer {
public:
  void Sleep() { tiredness_ = 0.0F; }
  void Code() {tiredness_ += 0.1F; }
  float tiredness() const { return tiredness_; }
private:
  float tiredness_{};
};

class Biker {
public:
  void Sleep() { tiredness_ = 0.0F; }
  void Shred() {tiredness_ += 0.5F; }
  float tiredness() const { return tiredness_; }
private:
  float tiredness_{};
};

int main() {
    Biker biker{};
    biker.Shred();
    std::cout << biker.tiredness() << std::endl;
    biker.Sleep();
    std::cout << biker.tiredness() << std::endl;

    Programmer programmer{};
    programmer.Code();
    std::cout << programmer.tiredness() << std::endl;
    programmer.Sleep();
    std::cout << programmer.tiredness() << std::endl;
}

```
</td>

<td>

```cpp
class Human {
public:
  void Sleep() { tiredness_ = 0.0F; }
  float tiredness() const { return tiredness_; }
protected:
  void IncreaseTiredness(float increment) { tiredness_ += increment; }
private:
  float tiredness_{};
};

class Programmer : public Human {
public:
  void Code() { IncreaseTiredness(0.1F); }
};

class Biker : public Human {
public:
  void Shred() { IncreaseTiredness(0.5F); }
};

int main() {
    Biker biker{};
    biker.Shred();
    std::cout << biker.tiredness() << std::endl;
    biker.Sleep();
    std::cout << biker.tiredness() << std::endl;

    Programmer programmer{};
    programmer.Code();
    std::cout << programmer.tiredness() << std::endl;
    programmer.Sleep();
    std::cout << programmer.tiredness() << std::endl;
}
```
</td>
</tr>
</table>

In this case we must be sure that the implementation of the `Sleep` function is exactly the same for all the classes that inherit from `Human`.


## public vs protected vs private inheritance

## Multiple inheritance

## Problems with inheritance
- Hard to follow implementation
- Tempting to overuse protected

## final

## Implementation inheritance

https://google.github.io/styleguide/cppguide.html#Inheritance
