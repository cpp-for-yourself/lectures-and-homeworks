Const correctness
---

<p align="center">
  <a href="https://youtu.be/WsBdxq319OY"><img src="https://img.youtube.com/vi/WsBdxq319OY/maxresdefault.jpg" alt="Video" align="right" width=50%></a>
</p>

- [Modeling an example of passing the phone](#modeling-an-example-of-passing-the-phone)
- [Rule 1: pass by const reference](#rule-1-pass-by-const-reference)
- [Rule 2: create const objects](#rule-2-create-const-objects)
- [Rules 3 and 4: return data by const reference, mark functions that don't change the object as const](#rules-3-and-4-return-data-by-const-reference-mark-functions-that-dont-change-the-object-as-const)
  - [The `const` class methods can be confusing to beginners](#the-const-class-methods-can-be-confusing-to-beginners)
- [Rule 5: don't mark class data as const unless you're implementing a view](#rule-5-dont-mark-class-data-as-const-unless-youre-implementing-a-view)
- [Summary](#summary)


Const correctness is a paradigm of how and when to use `const` with our objects and functions "correctly" to simplify the process of writing and reading of the code while using the compiler to protect us from changing data that should stay constant.

<!-- Visual example
We can even illustrate its usefulness in a somewhat dorky but still "real life" example. So... imagine a friend wants to borrow your phone...

Dialog starts:
- P1: Hey dude, how's it going?
- P2: Good, good, I'm coding this cool project in C++ about...
- P1: Yeah, yeah... That sounds great! Listen, can I borrow your phone for a sec?
- P2: **taking out the phone** Sure... why?
- P1: Nothing much, just need to check the weather tonight in Interlaken...
- P2: **handing over the phone** Ah, ok, here you go.
- P1: **taking the phone and clicking it** Thanks, man!
**"a few moments later"**
- P1: That's it! I'm done! Thanks a lot!
- P2: **taking the phone** Sure! My pleasure... **looking at the phone, camera zooms in on a message to Bjarne that Java is cooler than C++** Wait... What the? WTF?

Cut!!!! Stop! Whoah! That escalated quickly! What went wrong here? Well, we gave out too much access to an object that was important to us - a phone. What can we do to avoid this situation? Well, if we followed the "const correctness" paradigm we could have easily avoided this. In this particular situation, we could have provided a "view" over our phone instead of handing out the phone itself. Let's see how it would have played out:

**Rewind**
- P1: Listen, can I borrow your phone for a sec?
- P2: **taking out the phone** Sure... why?
- P1: Nothing much, just need to check the weather tonight in Interlaken...
- P2: **showing the phone** Sure, here, have a look!

See how by providing only a view of our phone we have eliminated a possibility of changing our phone object. And, you've guessed it, "providing a view" is just a fancy way of saying that we give out a const reference instead of the object itself. Now let's dig into how this and other similar situations would be represented in code and what exactly _is_ this "const correctness" when applied to C++, shall we?

 -->

<!-- Intro -->

# Modeling an example of passing the phone
So let's say our friend wants to borrow our phone, how would we represent it in C++?

I'd argue that both we and our friend would be objects of some classes, say `GoodPerson` and `MehPerson`. A `GoodPerson` would own a phone, i.e., the `Phone` object would be part of the data owned by the `GoodPerson`. And, being a `GoodPerson` open to the world, we will start by modelling a `GoodPerson` as a `struct` (see the [lecture on classes](classes_intro.md) for more on `struct` vs `class`). The `MehPerson` would have a function `DoStuff` that takes a reference to a phone:
<!--
`CPP_SETUP_START`
using Phone = int;
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` persons/persons.h
-->
```cpp
struct GoodPerson {
  Phone phone;
};

class MehPerson {
 public:
  // Imagine the implementation is hidden in a library - no way for us to know
  // what this function actually does with the phone it gets.
  void DoStuff(Phone &phone);
};
```

We can then model the situation of passing over the phone by creating an object of each of these classes and passing the phone object from one to another to do stuff with it:
<!--
`CPP_SETUP_START`
#include "persons.h"
void MehPerson::DoStuff(Phone &phone) {}
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` persons/main.cpp
`CPP_RUN_CMD` CWD:persons c++ -std=c++17 main.cpp
-->
```cpp
int main() {
  GoodPerson me{};
  MehPerson my_friend{};
  my_friend.DoStuff(me.phone);
  return 0;
}
```

# Rule 1: pass by const reference
If you followed me talking about [functions](functions.md) before, then you will instantly see an issue with the `DoStuff` function: it takes a non-const `Phone` object. Which allows the `MehPerson` class to modify the `Phone` object in any way it wants. Even worse, the implementation of `MehPerson` can be hidden away into a [pre-compiled library](headers_and_libraries.md) from us so we can't know for sure what is happening there!

Which leads us to **rule #1** of const correctness:

> **Rule 1️⃣**: Always pass big objects you don't intend to change by a `const` reference to any function. Pass small objects by copy.

This is nothing new to us as we have talked about it before when we talked about functions. However, it does not help us much here, does it? The function `DoStuff` does not belong to us. For all we know, it belongs to some other library. But _they_ are interested in _our_ `Phone` object, right? So we _do_ have some form of control.

# Rule 2: create const objects
One way to enforce const correctness here would be to not have a mutable `Phone` object in the first place. And a way to achieve this would be to become an extremely stable person and create the object that represents us in the previous example as a `const` object in the first place:
<!--
`CPP_SETUP_START`
using Phone = int;
struct GoodPerson {
  Phone phone;
};
class MehPerson {
 public:
  void DoStuff(const Phone &phone) {}
};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` persons/main.cpp
`CPP_RUN_CMD` CWD:persons c++ -std=c++17 main.cpp
-->
```cpp
int main() {
  const GoodPerson me{};
  MehPerson my_friend{};
  my_friend.DoStuff(me.phone);  // ❌ Won't compile unless DoStuff takes a const reference or a copy of the Phone
}
```

Which leads us to our **rule #2** of const correctness:
> **Rule 2️⃣**: Make every object `const` unless it explicitly needs to be changed. If you can design an object that does not need to change throughout its lifetime - do so.

The bad news here is that it is hard to achieve at all times. Think about it, while I believe that I am a very stable person, in no way I could model myself as a `const` object. Not even talking about the physiological or moral things, what if I want to buy a new `Phone` and replace my instance with this new one? So the `GoodPerson` object cannot be `const` here and such cases are quite common.

# Rules 3 and 4: return data by const reference, mark functions that don't change the object as const
So how else can we make sure that the `DoStuff` function must take a constant `Phone` reference?

We _do_ have another trick up our sleeves. It's time for the `GoodPerson` `struct` to close up a little and become a `class`. This allows us a lot more control over how the others get access to our data.

In our case, we would make `GoodPerson` a class that takes a reference to a temporary `Phone` (an rref) object in its constructor. We would then move the underlying `Phone` object into its `private` data and hold it there.

We also have to think of how to expose this internal `Phone` object to the world, so we implement a "getter" function. This function would return a `const` reference to our internal `Phone` object. Furthermore, this function is not supposed to change the underlying object in any way and we have a mechanism to indicate this to the compiler: we mark the whole function `const` too!

<!--
`CPP_SETUP_START`
using Phone = int;
class MehPerson {
 public:
  void DoStuff(const Phone &phone) {}
};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` persons/main.cpp
`CPP_RUN_CMD` CWD:persons c++ -std=c++17 main.cpp
-->
```cpp
#include <utility>  // For std::move

class GoodPerson {
 public:
  explicit GoodPerson(Phone &&phone) : phone_{std::move(phone)} {}
  const Phone &phone() const { return phone_; }

 private:
  Phone phone_;
};

int main() {
  GoodPerson me{Phone{}};
  MehPerson my_friend{};
  my_friend.DoStuff(me.phone());
}
```

Which allows us to formulate rules 3 and 4 of const correctness:
> **Rule 3️⃣**: Prefer returning a `const` reference to the private data of complex types of any object if you need to expose them to the user of your class. Return a copy for simple types instead. Only return a non-`const` reference if your class implements a data-agnostic container, e.g., a `std::vector` or alike.

> **Rule 4️⃣**: Mark every class method as `const` unless it is explicitly _supposed_ to change the underlying object. Prefer `const` methods when designing a class.


## The `const` class methods can be confusing to beginners
It is important to note here, that if a class method is not marked as `const` the compiler assumes that this method _can_ change the underlying object.

<!-- RERECORD -->
I want to note that in my experience, the `const` class functions are the reason most of the beginners struggle with `const` correctness in C++. Let's illustrate why.

You have a class `Foo` with a function `bar` that is a "getter" and does not change the content of the `Foo` object:
<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` foo/main.cpp
`CPP_RUN_CMD` CWD:foo c++ -std=c++17 -c main.cpp
-->
```cpp
class Foo {
 public:
  int bar() { return bar_; }

 private:
  int bar_{};
};
```

Now the `Foo` object is passed by a `const` reference to some function called `Whatever` that calls `bar()` on it:
<!--
`CPP_SETUP_START`
class Foo {
 public:
  int bar() const { return bar_; }

 private:
  int bar_{};
};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` foo_new/main.cpp
`CPP_RUN_CMD` CWD:foo_new c++ -std=c++17 -c main.cpp
-->
```cpp
void Whatever(const Foo& foo) {
  foo.bar();
}

int main() {
  Foo foo{};
  Whatever(foo);
  return 0;
}
```

What will happen if we try to compile this code? The compiler will complain:
```
main.cpp:4:3: error: 'this' argument to member function 'bar' has type 'const Foo', but function is not marked const
   foo.bar();
   ^~~
```

At this point a lot of beginners will become frustrated: they know that they don't change the `foo` object, they pass a `const` reference to the `Whatever` function and seem to be doing everything right. But the compiler sees that the `foo.bar()` method is not marked as `const` and assumes the worst. So it will complain that calling a non-`const` method on a `const` reference to an object might change the underlying object, which is forbidden. I've seen many frustrated students struggle with this concept but I, for one, like how it's implemented. Anyway, if you follow rules 3 and 4 that we just introduced, you should be fine :wink:

<!-- Until here! -->

# Rule 5: don't mark class data as const unless you're implementing a view
Finally, there is just one more place where `const` can be used and that I have to mention here. We can actually have `const` _data_ within a class. So, coming back to our example, we _could_ make the `Phone` object constant within our `GoodPerson` structure:
<!--
`CPP_SETUP_START`
using Phone = int;
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` const_person/main.cpp
`CPP_RUN_CMD` CWD:const_person c++ -std=c++17 -c main.cpp
-->
```cpp
struct GoodPerson {
  const Phone phone;  // 😱 not the best idea.
};
```

However, this is nearly never a good idea.
<!-- If you _do_ know of a good use-case, please write it in the comments. -->
Think of what will happen to all the copy constructors and move constructors of our `GoodPerson` class. Granted, we probably won't want to clone or copy ourselves or move into somebody's ownership but the same would happen with any other class that has `const` data. Basically, making any data of a class `const` makes it impossible to copy or move, destroying the value semantics for this class. Essentially by having `const` data any object of such a class is doomed to live and die within a single scope with no way to be copied or moved to any different scope.

This is rarely useful with one significant outlier - the view paradigm. As one typical example consider this: say, a certain class has its interface but we would want it to have a different interface when we work with it. One way to achieve this is to introduce a thin wrapper around the class in question that holds a `const` reference to the object of interest and introduces new interface to working with this object. Feels a bit hand-wavy, right? Let's think of a concrete example then.

Let's say, our friend and us from the previous example figure that the `MehPerson` class does not need the whole `Phone` object. They just need the weather! So they change the `DoStuff` function to take a const reference to the `Weather` object instead, which the `Phone` object readily provides:
<!--
`CPP_SETUP_START`
#include <utility>
using Weather = int;
struct Phone {
  Weather weather() const { return weather_; }
  Weather weather_;
};
class GoodPerson {
 public:
  explicit GoodPerson(Phone &&phone) : phone_{std::move(phone)} {}
  const Phone &phone() const { return phone_; }

 private:
  Phone phone_;
};
class MehPerson {
 public:
  void DoStuff(const Weather &phone) {}
};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` weather/main.cpp
`CPP_RUN_CMD` CWD:weather c++ -std=c++17 main.cpp
-->
```cpp
int main() {
  GoodPerson me{Phone{}};
  MehPerson my_friend{};
  my_friend.DoStuff(me.phone().weather());
  return 0;
}
```

However, the `Weather` object only has a function to get a forecast by GNSS coordinate:
<!--
`CPP_SETUP_START`
using Latitude = int;
using Longitude = int;
using Forecast = int;
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` weather_details/main.cpp
`CPP_RUN_CMD` CWD:weather_details c++ -std=c++17 -c main.cpp
-->
```cpp
class Weather {
 public:
  Forecast GetWeatherForLocation(const Latitude& latitude, const Longitude& longitude) const;
  // Other stuff in the Weather object
};
```
This is convenient for a very precise forecast but our friend wants to know the weather in Interlaken, remember? So they wrap the constant `Weather` reference into a view object, that uses some other functions and provides a better interface, calling the `weather.GetWeatherForLocation(lat, lon)` under the hood:
<!--
`CPP_SETUP_START`
using Latitude = int;
using Longitude = int;
using Forecast = int;
struct LatLon {
  Latitude latitude;
  Longitude longitude;
};
struct Weather {
  Forecast GetWeatherForLocation(Latitude, Longitude) const {return {};}
};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` weather_view/view.h
-->
```cpp
#include <string>

// Get latitude and longitude provided a city name
LatLon GetGnssCoordinatesForCity(const std::string& city_name);

class CityWeatherView {
 public:
  explicit CityWeatherView(const Weather &weather) : weather_{weather} {}

  Forecast GetWeatherForCity(const std::string &city_name) const {
    const auto lat_lon = GetGnssCoordinatesForCity(city_name);
    // ❓Question: should GetWeatherForLocation be a const method?
    return weather_.GetWeatherForLocation(lat_lon.latitude, lat_lon.longitude);
  }

 private:
  const Weather &weather_;
};
```

Such a `CityWeatherView` is not copyable or movable and exists for the sole purpose of simplifying the interface to the `Weather` object. This class is then typically used locally within some scope, say the `DoStuff` method of the `MehPerson` class:
<!--
`CPP_SETUP_START`
#include "view.h"
class MehPerson {
 public:
  void DoStuff(const Weather &weather);
};
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` weather_view/main.cpp
`CPP_RUN_CMD` CWD:weather_view c++ -std=c++17 -c main.cpp
-->
```cpp
void MehPerson::DoStuff(const Weather &weather) {
  const CityWeatherView weather_view{weather};
  const auto forecast = weather_view.GetWeatherForCity("interlaken");
  // Do smth with the forecast.
}
```

While you might argue that in this example we don't need the view class as we could've just called the `GetGnssCoordinatesForCity` function directly from the `DoStuff` function, imagine what would happen if this would happen in many parts of the code base? And what if the view helper function was longer than a couple of lines? These lines of code would then get copied in all the places that they would be needed, requiring us to repeat ourselves all the time, making changes that will inevitably come next much harder.

Anyway, this leads us to our last rule of const correctness:
> **Rule 5️⃣**: Never make class data const unless it is a const reference to other object when you are implementing a view over that object.

:bulb: There is a slight caveat to that: we can and should mark the class `static` data const, but we'll talk about it some other time.

# Summary
Ok, we're done now! If you follow these 5 rules you should have no problem with `const` in C++. Not only that, you will actually employ the compiler as your friend who is able to look over your shoulder and find the mistakes in your logic. In the end, if you're trying to call a function not marked as `const` on a `const` object - you probably didn't really mean it! If the compiler does not catch this, you will have to spend time searching for the logic bug, which, in my experience, is _much_ harder. With time, using these rules will become second nature and will help you writing high-quality code that ends up saving you and the others time and nerves.

<!-- And with this, I wish you a great day and see you in the next videos! And if you by chance need a refresher on move semantics, just click on the video over here. Ok, that's it! Bye!  -->
