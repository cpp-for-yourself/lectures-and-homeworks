Keyword `static` inside classes
---

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>


The keyword [`static`](https://en.cppreference.com/w/cpp/keyword/static) is a very important keyword in C++ and is used a lot. Honestly, because of a very general name, it is probably a bit _overused_. Largely speaking, it can be used outside of classes and inside classes and these two cases are slightly different. Today we focus on the latter - using `static` inside classes. If you are interested in how and when (not) to use `static` _outside_ of classes, I'm linking that [lecture here](static_outside_classes.md).

Now with this distinction out of the way, let's talk about what `static` can be used for when used inside of classes. Basically, `static` can be applied to data or to functions and both of these cases have their uses.

One thing to remember is that when we mark our data or a class method `static` they no longer belong to an object of our class but to the class itself. If you are confused by this, hope it will become clearer with an example.

So, while we

<!-- Intro -->

<!--

What I want to talk about:

The name of any static data member and static member function must be different from the name of the containing class.

- data can be const and non-const.
  - If data is not inline - needs an out-of-class definition, even if initialized
  - If inline - does not need anything
  - Constexpr is implicitly inline
- Obeys access rules
- Methods cannot be const (think of why)

- Declaration vs definition
  - By default static data is just declared, not defined
  - Use constexpr or inline to define it in place
  - Static is only used in the declaration but not in definition

The confusing parts:
- Const declaration of some data with initializer - linker error


Static functions are much more alike to normal functions than they are to class methods.

Static data members of a class in namespace scope have external linkage, which means that the combination of namespace::Class::kData should be unique in the whole program.

An example could be a class that counts all its copies. Maybe a Rick'n'Morty reference? Like Rick that dives into multiple times/universes and needs to keep track of how many Ricks exist?
 -->
