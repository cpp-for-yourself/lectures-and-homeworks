Static keyword
---

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50%></a>
</p>

The keyword [`static`](https://en.cppreference.com/w/cpp/keyword/static) is a very important keyword in C++ and is used a lot. Honestly, probably, because of a very general name, it is a bit overused. Largely speaking, it can be used inside and outside classes and these two cases are very different. Today we focus on the latter - using `static` outside of classes. If you are interested in how and when to use `static` _inside_ of classes, I will link this lecture here when it's out.

Anyway, as for using `static` _outside_ of classes, I have good news for you. If you follow my advices from before then the rule-of-thumb for using `static` outside of classes in modern C++ (that is at least C++17) is very simple - don't! **Don't use `static` at all!**

<!-- Thanks for watching, subscribe and see you soon! Get up, walk away, wait. Come back. -->

What? Still here? I guess you did learn something about C++ and you know that nothing is as simple. But it _is_ not much harder than that, this I can promise you. Anyway, let's dive into this rule and talk about why it _mostly_ holds.

<!-- Intro -->

In order to explain why we _mostly_ don't want to use `static` for anything outside of classes we will need to think about _why_ we want to use `static` in the first place. The keyword `static` really controls two things:
- The storage duration
- The linkage

I can already feel the confused faces on the other side of the screen from me :wink:

Now, what do these words mean?

## Storage duration
### Automatic storage duration
Every object declared in C++ has a certain lifetime, or, in other words, a _storage duration_. Lots of objects live within a single scope and their memory gets freed upon the end of their scope. These objects are usually said to have **automatic storage duration**. But what if there is no scope? What happens with those variables declared outside of class or function scope?

### Static storage duration at namespace scope
These variables are said to be declared at **namespace scope**. Their data gets allocated at the start of the program and gets freed when the program terminates, which is to say that these data have the **static storage duration**. I believe that this is what inspired the name `static` back when it was introduced in C. Anyway, we _can_ use `static` for an object declaration at namespace scope to indicate that it has the static storage duration but we don't have to, as any such object has this storage duration by default. So the following definitions are equivalent in terms of storage duration:
```cpp
constexpr auto answer = 42;
const auto answer = 42;
auto answer = 42;  // 😱 please don't...

static constexpr auto answer = 42;
static const auto answer = 42;
static auto answer = 42;  // 😱 please don't...
```

### Static storage duration at function scope
Another use of `static` is to extend the storage duration of a local variable within some function scope to have the static storage duration.

Such a `static` variable will be initialized when first encountered during the program flow and destroyed when the program exits.

Let's illustrate it using an example. Assuming we have a `struct` `Helper` that prints something in its constructor and destructor, let's write a function `GetHelper` that creates a helper object and returns a reference to it. Note how this function returns a non-const reference to an object created within a function. If you followed the lecture on [functions](functions.md) your eye might start twitching now but in this situation it's all right - the helper object is `static`, so, once created it will exist until the end of the program - `static` ensures it has the static storage duration. If we call our `GetHelper` function twice we will see that the `Helper` object is only created once when the `static` variable definition is encountered for the first time by comparing the pointers to the object we receive.
```cpp
#include <iostream>

struct Helper {
  Helper(int number) {
    std::cout << "Create helper with number: " << number << std::endl;
  }
  ~Helper() { std::cout << "Destroy helper" << std::endl; }
  // 😱 Implement the rest for the rule of all or nothing!
};

Helper& GetHelper(int number) {
  // Will only be initialized when encountered for the first time
  static Helper helper{number};
  return helper;
}

int main() {
  auto& helper_1 = GetHelper(42);
  auto& helper_2 = GetHelper(23);
  std::cout << "Is same object: " << (&helper_1 == &helper_2) << std::endl;
}
```

Now this is where I lied to you a bit about _never_ needing to use `static`. There _are_ situations when you might want to create a static object within a function. However the ones that come to mind are hard to come by if we follow a good style. For completeness, I can think of using such method to deal with the "static initialization order fiasco" and for implementing a singleton design pattern. We will talk about the singleton pattern later (and why you probably don't want to use it) but I will skip "static initialization order fiasco" here. It should not hit you as long as you only create that rely only on values within the same cpp file and not across cpp files.
```cpp
const int kAnswer = 42;  // ✅ this is ok.
const int kValue = kValueFromOtherCppFile;  // ❌ not ok!
```

But tell me in the comments if you are interested to learn more about it!

### Summary
Let's sum up where `static` can be used and what it gives us. Generally speaking, when used outside of classes, `static` can be used in two places:
- outside of functions which adds nothing as any such variables or functions declared at namespace scope already have static storage duration.
- inside of functions to extend the local variable's automatic storage duration to static storage duration, which we mostly don't want to do.

## Linkage
Now it's time to talk about the second thing that `static` controls - linkage. We touched upon linkage before, when we talked about [libraries](headers_and_libraries.md), and especially the `inline` keyword.

First, let me explain what linkage is real quick. Any name that denotes some entity, be it an object, function, namespace, type, etc., _can_ have linkage but doesn't have to have it. There might be other entities that have the same name introduced by a declaration in some other scope. Linkage controls if these names should refer to the same entity. If the linkage is insufficient, multiple entities are generated.

What does it mean to have an "insufficient" linkage? Well, there is a couple of "levels" of linkage. Any entity can have:
- **No linkage** - a name can only be referred to from the same scope. Any mentions of the same name from other scopes will refer to other entities.
- **Internal linkage** - a name can be referred to from any scope within the same translation unit (think, same cpp file). Mentioning the same name from the same translation unit means that we want to reference the same entity. Other translation units can have their own entities with the same name without issues.
- **External linkage** - a name can be referred to from other translation units, i.e., it is globally visible.

When we declare data or functions at namespace scope we care about the linkage of these data or functions. If the linkage is external, we might get into trouble because of the [One Definition Rule (ODR)](https://en.cppreference.com/w/cpp/language/definition) violations. That rule states roughly this: that any symbol must have exactly one definition in the entire program, i.e., across all of its translation units. Only `inline` symbols can have more than one definition which are then all assumed to be exactly the same by the compiler. So, you see, if the linkage of a symbol is not _external_ there is no way to violate ODR with it.

Now, let's get back to talking about `static` and what it has to do with linkage.

By default, if we declare a function or a non-const variable _at namespace scope_, they get **external linkage**. Meaning that if we do this in a header file and include this file into two different cpp files that get linked together, we will technically violate ODR.

However, when using `static`, any variable or function declared _at namespace scope_ will get **internal linkage**, meaning that they will only be available from within the translation unit in which they are declared. So now if we declare them in a header file and include this header file into two different cpp files, we will get different symbols for our variables or functions. So despite having the same name they won't cause an ODR violation all the definitions are only visible within their own translation unit.

Sounds good, right? So why did I suggest not to use `static` then? Well, because there is no need to!

### The data
Well, it turns out that if we declare const (or constexpr) objects at namespace scope they _also_ get **internal linkage** by default. The only ones getting external linkage are the non-const data declared at namespace scope. And we talked about it before, right? We should only have const global data. So if we follow the guidelines from before, we can safely skip the `static` keyword and nothing will change.

That being said, with C++17 there is an even better option. If we declare our variables `const` or `constexpr`, they are guaranteed to not cause us trouble with ODR but there will be a copy of them in each translation unit they are included into. Sometimes we want to avoid this and we want to have a single symbol instead. That is where `inline` comes to our aid. If we add it to our constant definition, it's linkage will become **external** making it visible to any translation unit, but the `inline` keyword will protect us against ODR violations as it tells the compiler that it's ok to have multiple definitions of this symbol and to assume that they are all the same. This allows us to reuse the value across multiple translation units.

### The functions
The situation is very similar for functions. By default, functions declared at namespace scope have **external linkage** which causes all the same issues with ODR violations that we've just discussed. Same as with variables, declaring a function `static` changes it's linkage to **internal**, which allows us to avoid the ODR violations but causes multiple instances of the function definition to be present in various translation units. And, just as before, using `inline` is a better solution as it keeps the function's **external linkage** while allowing for multiple definitions of this function as long as we guarantee that they are all the same.

## Conclusion and a rule of thumb
So, I hope that by now you see that there is no need to use `static` outside of classes at all in modern C++. Here is a guideline to follow along with this:

### For functions and variables at namespace scope
- When declaring variables at namespace scope always declare them as `inline` `constexpr` or `const`. Do **not** declare them as `static`!
- When declaring functions at namespace scope, declare (and define) them as `inline`. Do **not** declare them as `static`!

This will guarantee their external linkage, i.e., visibility across the whole program, while not violating the ODR.

### For variables at local scopes
- When declaring a variable at local scope, do not declare it as `static` unless you are explicitly implementing a singleton-like design pattern (which you probably shouldn't do anyway)

### Final words
Understanding the key role that ODR plays here is key to understanding why `static` was introduced into the language in the first place. It was in the times when `inline` meant something different and could not be used as it can be now. So it was the only way to provide a definition of a function or a variable directly in the header. Thankfully, we live in better times now, which makes `static` close to obsolete when used outside of classes. Now if you want to know how to use `static` in classes you can see a video about that once it's ready and maybe also go back and refresh how `inline` plays a huge role in creating libraries in C++.
