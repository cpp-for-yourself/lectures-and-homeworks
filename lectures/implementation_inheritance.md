<!--
https://isocpp.org/wiki/faq/proper-inheritance - for fun proper inheritance

https://isocpp.org/wiki/faq/private-inheritance - when to use private inheritance

Designing an interface is hard

Virtual destructors!

Also info here: https://en.cppreference.com/w/cpp/language/derived_class

Google style: https://google.github.io/styleguide/cppguide.html#Inheritance

> Composition is often more appropriate than inheritance. When using inheritance, make it public.

https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#c129-when-designing-a-class-hierarchy-distinguish-between-implementation-inheritance-and-interface-inheritance

https://google.github.io/styleguide/cppguide.html#Access_Control

Object slicing: https://www.learncpp.com/cpp-tutorial/object-slicing/
 -->

# Implementation inheritance

Inheritance is an important concept that enables a lot of techniques that we use in C++.

Largely speaking, there are two types of inheritance:
- Implementation inheritance
- Interface inheritance

The difference between these? One used to inherit a full implementation and the other one is used to implement a provided interface and is used to enable object oriented programming (OOP) with C++.

It is important to [keep these different styles of inheritance separate](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines#c129-when-designing-a-class-hierarchy-distinguish-between-implementation-inheritance-and-interface-inheritance) (for more details on this, please see the C++ Core Guidelines take on this) and some, like the Google C++ Code Style suggest to go as far as to avoid implementation inheritance altogether.

Today we only cover the implementation inheritance and I hope that I will be able to convince you that you probably should not use it very often.
<!-- intro -->

## What is implementation inheritance for
Honestly, as a design concept on its own it is not very useful and we will mostly use it as a start into understanding inheritance because the concept is quite simple. Although there are a couple of pretty advanced use cases that it enables like, for example, the [Curiously Recurring Template Pattern (aka CRTP)](https://en.wikipedia.org/wiki/Curiously_recurring_template_pattern) or [tag dispatch](https://en.cppreference.com/w/cpp/language/sfinae).

Essentially the implementation inheritance technically allows us to avoid repeating ourselves and save us some typing. In reality its use cases are pretty limited which we will see at the end of this video.

Anyway, here is how it works. Assume that we have a `Derived` class that inherits from a `Base` class, which we usually show with an arrow on a diagram):
```mermaid
graph RL;
  Derived --> Base
```
This can be written in code as follows:
```cpp
class Derived : public Base {};
```
This tells the compiler two things:
- That the object of the `Derived` class must contain a full copy of the `Base` class and append the its data to the data stored in the `Base` object
- That the object of the `Derived` class must have both the methods from the `Base` class as well as those from the `Derived` class itself


```cpp
#include <iostream>

// Using struct here but the same holds for classes
struct Base {
  void BaseMethod() {}
  // Doesn't have to be int
  int base_data{};
};

// Using struct here but the same holds for classes
struct Derived : public Base {
  void DerivedMethod() {}
  // Also can be any other type
  float derived_data{};
};

int main() {
  Derived object{};
  object.BaseMethod();
  object.DerivedMethod();
  std::cout << "&object.base_data:    " << &object.base_data << std::endl;
  std::cout << "&object.derived_data: " << &object.derived_data << std::endl;
}
```
> :bulb: In case you are confused by the `&` operator, do follow the lecture on [raw pointers](raw_pointers.md)

If we run the program it prints something like:
```
&object.base_data:    0x16d8dee18
&object.derived_data: 0x16d8dee1c
```



We can check this by running the above program and observing that the methods are being called and the address of the pointers to the data is sequential in memory.


## What is the implementation inheritance used for?


## What is `protected`
There is a new word there in our class: `protected`. It is an access modifier just like `public` or `private` and states that everything under this access modifier is available **only** to the descendants of the class it appears in.

## Design implications


While it can be used for many more things, we technically mostly use inheritance to express an **is-a** relationship between our types, e.g. `Programmer` is (arguably) a `Human`, a `Human` is an `Ape`, and `Ape` is an `Animal`

```mermaid
graph RL;
    Programmer --> Human --> Ape --> Animal
```

> :bulb: By the way, when drawing class diagrams we usually use this type of arrow to indicate the "is-a" relationship.

So we focus here on this use-case first and will touch upon the potential other use cases that are technically possible but are discouraged along with the suggestions of what to do instead towards the end of the video.

## public vs protected vs private inheritance
You might have noticed that we used the word `public` when using inheritance. But we could also technically use `protected` or `private` there. The difference is the following:
- Using `public` maintains the access levels of all data and methods of the base class
- Using `protected` makes all the `public` attributes of the base class `protected` and leaves its `protected` and `private` members as is
- Using `private` makes all the members of the base class `private`

These are a bit hard to grasp. For example, using `private` inheritance means that we don't have direct access to any member of the base class at all!

At this point, it is better to use composition as opposed to inheritance, i.e., just store an object of the base class as a member of the previously derived class. This relationship is usually called "implement in terms of". For example, if we want to implement a class `Zombie`, it would be wrong to inherit from `Human` as a zombie is not a human. But we could implement a zombie in terms of a human, meaning that we would still use the internal state of a human but only expose part of the interface to the outside.

## Multiple inheritance
There is a way to use multiple inheritance in C++ but it is heavily discouraged to use it with implementation inheritance. It is easy to show the reason. Imagine we have a class that inherits from a number of classes and we want to find an implementation of a certain function. How do we know where it is implemented? In bigger projects this becomes really cumbersome.

## final
We can also use the word `final` to forbid any future extensions of a particular class. I would suggest to be carefull with the use of it as it is very hard to know the future and this is equivalent to a stetement, "I'm 100% sure that nobody ever will need to extend this class"


https://google.github.io/styleguide/cppguide.html#Inheritance

## Summary
Overall, implmenetation inheritance can be useful to extend
