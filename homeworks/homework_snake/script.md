# Video script

<!-- Talking head -->
Hey everyone! Welcome to the final project of the course!

Over the past lectures, you have learned an incredible amount of modern C++. We started from basic variables and scopes, tackled functions, move semantics, templates, lambdas, custom data structures, error handling, and even multithreading with mutexes!

Now, it is time to put all of these pieces together into one real, complete, interactive project. And what better way to celebrate your C++ journey than by building the classic, timeless arcade game: **Snake**!

<!-- Screen record: Show gameplay of snake in terminal -->
And yes, as you can see, this runs completely in your terminal, rendered with smooth colored blocks, responsive arrow controls, dynamic fruit generation, and real-time score tracking.

<!-- Talking head -->
Now, building a full game like this can feel daunting if you look at it as a giant monolith. But here is the secret that seasoned software engineers know: complex software is just a collection of small, well-designed components that talk to each other through clean interfaces.

Before we dive into the details, remember: the complete written homework description, the starter skeleton, and the automated tests are all available in the course repository linked right down below.

Let's break down the architecture of what you will be building.

<!-- Screen record: Diagram of decoupled architecture: UI <-> Game <-> World & Snake -->
The game is split into three main modules:

### 1. The Core Primitives (`core`)
First, we need solid mathematical and grid foundations.
You will implement a generic 2D vector template class, `Vector2D`, which provides `FromXY()` and `FromRowCol()` factory methods. Why both? Because in graphics and terminal programming, the horizontal coordinate is $X$ but the vertical row is $Y$. Trust me, keeping this clear from day one will save you hours of head-scratching!

You will also implement a generic `Matrix` class that represents a 2D grid stored in a flat `std::vector`. If this sounds familiar, that's because you already saw this 1D indexing technique when we worked with images in the Pixelator project.

### 2. The Game Entities (`game`)
Next, we bring the game world to life.
- You'll design a `Heading` enum that uses a neat bitwise trick so opposite directions cancel each other out, preventing the snake from immediately eating its own neck if you press the opposite arrow key.
- You will implement the `World` class, which manages the grid and walls, returning `std::optional<CellType>` to elegantly handle out-of-bounds checks without crashes.
- And of course, the `Snake` class itself. The snake's body is managed using a `std::deque` and a fast lookup set. When the snake moves, its head advances by one cell, and its tail pops unless it just devoured a fruit, in which case it grows.

### 3. The Game Engine & Concurrency (`game`)
This is where the magic happens.
The `Game` class controls the game loop and runs it in its own background thread.
Why a separate thread? Because we want the snake to keep moving at a steady, ticking pace while simultaneously listening for your keyboard input in real time.
You will implement the `NextCycle()` logic, synchronize shared state between threads using `std::mutex` and `std::lock_guard`, and invoke registered callbacks using `std::function` whenever the game state updates or the game ends.

<!-- Talking head -->
Now, I hear you asking: *"Igor, do I have to write raw terminal escape sequences and POSIX termios ioctls to capture arrow keys in the terminal?"*

The answer is: **absolutely not!**

<!-- Screen record: Show snake/ui folder -->
I want you to experience **productive struggle**—mastering templates, invariants, multithreading, and callbacks. I do *not* want you pulling your hair out debugging VT100 terminal escape sequences or terminal canonical modes in C.

So, I have completely pre-built the `ui` module for you! It contains `TerminalIo` and `NcursesDrawer`. It connects to your `Game` purely through callbacks. Your game logic doesn't know or care how the pixels are drawn—it just notifies the drawer via `std::function`. That's clean architecture in action!

<!-- Talking head -->
To tackle this project without getting overwhelmed, follow the milestones in the homework guide:
1. **Milestone 1**: Build your `Vector2D`, `Matrix`, and `Heading`.
2. **Milestone 2**: Implement `World` and `Snake`.
3. **Milestone 3**: Implement the `Game` engine loop, collisions, and thread synchronization.
4. **Milestone 4**: Wire the callbacks in `main.cpp`, run the binary, and play your game!

Notice that in the starter skeleton, I only give you very minimal smoke tests. Writing your own thorough unit tests for each class is a core part of this exercise! Think about edge cases—what happens when the snake turns 180 degrees? What happens when a coordinate is out of bounds? Test it all!

<!-- Screen record: Show tests passing and game launching -->
When you submit your homework, our automated checker will run your tests, and then inject our own rigorous validation tests to check all the requirements.

<!-- Talking head -->
Now, a very important word on your mindset for this project.

Please treat this as a **multi-stage journey**. It is intentionally designed to take time. Do not try to rush it, and do not try to finish it all in one heroic sitting. Give yourself multiple days, taking it strictly one milestone at a time.

You will make mistakes along the way. You will see compiler errors, off-by-one indices, and maybe even a deadlock. That is completely normal! Making mistakes is an essential part of learning to program, and there is no shortcut around it.

Because of that, I strongly recommend that you **do not use AI assistants** like ChatGPT or Copilot for this project. When you let an AI write the code or diagnose your bugs, you skip the very struggle that turns you into a real engineer. Face the challenge yourself. Wrestle with the design, write your own tests, and take immense pride in knowing that every single line of this game was built by your own mind.

If you get stuck, re-watch the lectures on move semantics, lambdas, or multithreading, and don't hesitate to start a discussion in our GitHub community linked below.

I am super proud of how far you've come in this course. Now go build yourself a game!

Thanks for watching, have fun coding, and I'll see you in the next one!
