Memory and smart pointers
--

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50% style="margin: 0.5rem"></a>
</p>

Understanding how memory is allocated and using smart pointers, alongside with understanding move semantics that we've [already looked at](move_semantics.md), are key elements to ensure memory safety when writing code in C++.

So this is exactly what we'll focus on today: what kinds of memory are there, how each kind is allocated and freed, why manually dealing with memory can quickly become a mess without using smart pointers, and how they help.

<!-- Intro -->

### We need a system to allocate and free memory
We'll start by talking about memory a bit more in-depth than we did until now. When we create variables in our code they have to be allocated somewhere. They also should eventually free that memory to be reused, otherwise we might run out of free memory.

Let's pause for a second and talk about what it really means: "to run out of memory". In a simplified manner, it really just means that, given that we have a variable to allocate, we don't have any place to fit it into memory.

So all in all "managing memory" means to keep track of places where we can put variables we need to allocate memory for.

This is generally not a trivial task. These variables can be of various size, some tiny and some quite large. Furthermore we want to be able to allocate arrays in continuous chunk of memory, making them similar to LARGE variables.

But then we have some more information about how we allocate our data. For example, if we look at all the examples that we've seen in this course until now, we will notice that we only allocated variables within scopes. Even better, we allocated them sequentially and freed their memory in reverse order at the end of the scope.

This simplifies our task immensely! What is typically done is this. We designate a small part of our memory, typically 8MB on Linux and MacOS, to managing such local variables with a stack-like data structure. This is also known as "allocate a variable on the stack". What it really means is that the addresses of any variable we allocate are stored on a stack, one after another. Whenever we allocate a new variable we "push it on the stack". Whenever we reach the end of the scope, we "pop" all the variables that were allocated in this scope.

This way of dealing with allocating and freeing variables is amazing for local data. As long as the data does not need to persist beyond the end of the scope, this data structure is very efficient! We always know exactly where to allocate new memory and which memory to free at constant time, no additional operations needed!

<!-- Add the stack example -->

Things change the moment we want our data to persist beyond the end of the scope. Pause for a moment and think about what the problem with this is if we would still use the stack to manage this memory?

Most problems that I can think of are related to freeing memory. Let's for a moment assume that we could keep a variable in our stack for a longer time. And let's also assume that we allocated it in the middle of some scope, with some normal stack variables allocated before and after it. By the end of the scope we must free all memory of those variables. Which essentially means that we would need to pop all the variables above our persistent variable, then copy our variable somewhere, pop the rest of the normal variables and copy our persistent variable back. Not only this is not elegant but we also had to copy a potentially large chunk of memory around, which is slow. And we don't like slow! And the situation would be even worse if there would be more of these persistent variables we wanted to keep track of, which is actually typically the case.

So clearly we want to keep our stack quite small and used exclusively for any local variables we are using and find another way to find a place to allocate potentially large persistent data.

These data are usually allocated "on the heap". For those of you who know data structures you might think that this is related to the "heap" data structure - a binary tree with the parent being bigger or smaller than its children but that seems to be not the case, although the evidence is split on this one. If we trust Donald Knuth, the name is just coincidental but I could not find any definitive proof for either side, so if you have it, please leave it in the comments.

Anyway, the easiest way to think about the heap is an intuitive one - imagine a heap of stuff. We want to find an optimal place in this heap to put more stuff. This obviously takes some time but once such a place is found the memory can stay there until we don't need it anymore.

This also means that we need to manage this memory manually. We are the sole entity that decides the life and death of variables allocated on the heap, which can lead to all sorts of bugs.

The way we allocate memory on the heap in C++ are `new` and `new[]` operators. First one to allocate a single variable, second one to allocate an array of those. In order to free this memory we need to then call `delete` or `delete[]` respectively on these variables.

There is a number of common pitfalls here of course. Imagine we allocate some memory in a function. Now, if you remember the lectures about [libraries](headers_and_libraries.md) you know that the actual implementation can be hidden from us. Given that such a function only returns a pointer, there is no way for us to know if we should free the memory that is given to us and which operator to use. This leads to various memory-related bugs such as memory leaks or dangling pointers.

But don't despair. There is a solution to these problems. Using smart pointers we can allocate memory on a heap safely, knowing that it will definitely be freed. Essentially, smart pointers are RAII containers that implement certain specific ways to deal with the ownership of the data. The most used smart pointers are `unique_ptr` and `shared_ptr`. Just as their names suggest, the `unique_ptr` models a "unique ownership" over the data, while the `shared_ptr` shares this ownership in a smart way that frees the data once they are not used by anybody anymore.

Before, we talked extensively about move semantics in the context of ownership transfer. In these terms, `unique_ptr` and `shared_ptr` have their own tricks to implement the behavior that they need. The `unique_ptr` has both its copy constructor and copy assignment operator as `delete`d, such that an instance of a `unique_ptr` cannot be copied, but only moved, making sure there one and only one owner of the underlying data at any time. This is the smart pointer that you want to use most of the time.

The `shared_ptr` has a `static` entry (and we talked about using [`static` with classes](static_in_classes.md) before) that keeps track of how many instances of this `shared_ptr` point to the underlying data. If a new copy is created, this counter is incremented and if some instance is destroyed it gets decremented. Only once all of them are destroyed the data is freed.

And, as a bonus, these pointers, being pointers are also polymorphic, so we can create a `std::unique_ptr<Base>` from an instance of `std::unique_ptr<<Derived>`.

All in all, we should _almost never_ allocate memory manually. A good rule of thumb is to never write a manual `delete`, which leads us to also never writing a naked `new` (use `std::make_unique` and `std::make_shared` instead) and we should never have to deal with a memory leak or a dangling pointer.
