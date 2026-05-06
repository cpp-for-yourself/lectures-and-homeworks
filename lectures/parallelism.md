Parallelism: Threads, Async, and Mutexes
--
<p align="center">
  <img src="images/parallelism.gif" alt="Parallelism" align="right" width=50% style="margin: 0.5rem">
</p>

- [Parallelism: Threads, Async, and Mutexes](#parallelism-threads-async-and-mutexes)
- [What is parallelism anyway?](#what-is-parallelism-anyway)
  - [No parallelism is often fastest](#no-parallelism-is-often-fastest)
  - [High-level Task-Based Parallelism](#high-level-task-based-parallelism)
  - [Parallel Algorithms](#parallel-algorithms)
  - [Worker Threads and Thread Pools](#worker-threads-and-thread-pools)
- [Under the Hood: Data Races, Mutexes, and Condition Variables](#under-the-hood-data-races-mutexes-and-condition-variables)
  - [Data Races](#data-races)
  - [Mutexes and Locks](#mutexes-and-locks)
  - [Condition Variables](#condition-variables)
  - [Deadlocks](#deadlocks)
- [Summary](#summary)

<!-- It's been a long time since the last video, but I have a good reason for that, so now all of this has to happen in the short sleep windows. Anyway. Today, I'd like to talk to you about parallel programming. -->

Parallel programming is the secret sauce that makes modern software feel fluid, allowing a web browser to handle 500 tabs of "research" without breaking a sweat, a bitcoin miner to utilize all CPU cores in the background, and a smartphone to show that cat video while we are "busy" doing important work. 

But it’s also one of the easiest ways to make our program crash in untraceable ways that only happen every other Tuesday when the moon is full. This is such a common scenario that there is even a saying: "Parallel programming is the art of doing two things at once and failing at both in ways that are impossible to debug."

But jokes aside, I'd like to talk about how we can use C++ to harness the power of our multi-core CPU to keep our programs fast and responsive, while avoiding the pitfalls that lead to non-deterministic crashes.

<!-- Intro -->

## Disclaimer
Ok, this is one of those topics where I absolutely must start with a disclaimer. No matter what I do there will be someone on the Internet to tell me I'm wrong. So here is the disclaimer: All of the things we talk about today come purely from what worked for me over the years. I do not claim that these ways are absolutely the best or the only ones out there and there definitely will remain dark corners that you folks will need to explore on your own. But I do hope that, despite this disclaimer, I will be able to provide a decent overview of the topic.

Oh, also, we are not going to dive into the guts of how parallelism works in C++ or on our systems! It's a huge topic on its own and I am myself not comfortable with it enough to teach it without feeling like a fraud. So we'll just focus on the high-level usage of parallelism in C++ here.

## What is parallelism anyway?
But let's start by talking about what parallelism is. In a nutshell, **parallelism** is simply the ability to perform multiple computations or tasks at the same time. Instead of executing instructions one after another sequentially, a parallel program divides the work so that multiple operations can happen simultaneously, often speeding up execution significantly.

Largely speaking, there are two main ways to achieve this at the software level: **multi-processing** and **multi-threading**. 

When we run an application, the operating system creates a **process**, which is essentially an isolated sandbox containing our program's code and its own private memory (the heap and stack we learned about in the [memory lecture](memory_and_smart_pointers.md)). 

In **multi-processing**, we spawn multiple processes to run at the same time. Because each process gets its own distinct memory space, they don't step on each other's toes. This makes multi-processing inherently safe, but data sharing between processes is often relatively slow and complex.

In **multi-threading**, however, the execution happens on multiple **threads** *inside* a single process. Every process starts with a single main thread, but it can ask the OS to spawn additional threads to perform multiple tasks at once. The crucial difference here is that **all threads within a single process share the exact same memory space.** Also, every thread has a lifetime: it needs to be created and, when our work with it is done, it needs to be either joined or detached. More on that towards the end of this video.

In this lecture, we will exclusively focus on **multi-threading**, which is probably the most common form of true parallelism in C++. Since threads can read and write to the exact same variables on the heap without restrictions, they can efficiently work together. This can be fantastic for performance... and absolutely terrifying for stability! If we don't carefully manage how they access those shared data, they will overwrite each other's work and crash our program. But before we look into how things can go wrong under the hood, let's look into the easiest ways to do things right!

### No parallelism is always safer and often faster
The safest way to do parallelism is to **not** do it at all. What I mean here is that many tasks that people *think* will run faster in parallel actually run slower. This is due to the overhead of creating and managing threads, as well as the overhead of synchronizing access to shared resources. In many cases, it is better to use a single-threaded approach to solve the problem. Every situation is different, but it is always worth considering whether parallelism is actually necessary. And always measure the performance of both approaches before making a decision.

### High-level Task-Based Parallelism
But there *are* cases when we *need* to employ parallelism. One example of such a case is common in many GUI frameworks, where there is a main thread that handles the UI, and background threads that handle heavy tasks, because nobody likes a frozen application, which happens if the UI thread does too much work.

If we have such a heavy task to run, we can use [`std::async`](https://en.cppreference.com/w/cpp/thread/async.html). This function takes a callable (like a [lambda](lambdas.md)) and a [launch policy](https://en.cppreference.com/w/cpp/thread/launch.html), and runs this callable asynchronously, potentially on a background thread. It returns a `std::future`, which is basically a promise like "I don't have the result now, but I will in the *future*."

For the sake of example, let's say our application given a path to a massive image (we'll fake it here) needs to load it from disk (we'll simulate this by sleeping for 5 seconds). Let's first see what happens if we just load the image on the main thread:

<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` parallelism_blocking/main.cpp
`CPP_RUN_CMD` CWD:parallelism_blocking c++ -std=c++17 main.cpp
-->
```cpp
#include <chrono>
#include <iostream>
#include <string>
#include <thread>

namespace {
constexpr std::chrono::milliseconds kLoadTime{5000};

struct Image {
  std::string data = "massive_image_data";
};

Image LoadMassiveImage(/* some path would go here */) {
  // Pretend this takes a long time to load a massive image.
  std::this_thread::sleep_for(kLoadTime);
  return Image{};
}
}  // namespace

int main() {
  std::cout << "Loading massive image..." << std::flush;
  // 😱 The main thread is completely frozen here for 5 seconds.
  // We can't update any UI, draw a spinner, or do anything else!
  const Image img = LoadMassiveImage();
  std::cout << "\rLoading massive image... ✅" << std::endl;
  return 0;
}
```

When we run this, the application just prints "Loading massive image..." and then hangs for 5 full seconds with no signs of life. The main thread is completely blocked. There is no way for us to draw any kind of progress spinner or update any other UI element while the image is loading. To the user, the application looks frozen — and, well, that's because it *is* frozen.

Let's fix this! Let's use `std::async` just like I described a minute ago to kick off the heavy `LoadMassiveImage` function on a background thread, freeing the main thread to update the UI. While we're at it, let's encapsulate our spinner logic into a reusable `Spinner` class that iterates through an array of progress spinner characters when we call `Spin()` and cleans them up on destruction:

<!--
`CPP_SETUP_START`
$PLACEHOLDER
`CPP_SETUP_END`
`CPP_COPY_SNIPPET` parallelism_async/main.cpp
`CPP_RUN_CMD` CWD:parallelism_async c++ -std=c++17 main.cpp
-->
```cpp
#include <array>
#include <chrono>
#include <future>
#include <iostream>
#include <string>
#include <thread>

namespace {
constexpr std::chrono::milliseconds kLoadTime{5000};
constexpr std::chrono::milliseconds kSpinInterval{100};

struct Image {
  std::string data = "massive_image_data";
};

Image LoadMassiveImage(/* some path would go here */) {
  // Pretend this takes a long time to load a massive image.
  std::this_thread::sleep_for(kLoadTime);
  return Image{};
}

class Spinner {
 public:
  static inline const std::array<std::string, 10> kFrames = {
      "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"};

  Spinner(std::string message) : message_{std::move(message)} { Spin(); }

  void Spin() {
    std::cout << "\r" << message_ << ' ' << kFrames[idx_++] << std::flush;
    idx_ %= kFrames.size();
  }

  ~Spinner() { std::cout << "\r" << message_ << " ✅\n"; }

 private:
  int idx_{};
  std::string message_{};
};
}  // namespace

int main() {
  // 🚀 Kick off the heavy task in the background.
  // std::launch::async forces it to run in a new thread.
  std::future<Image> future_image =
      std::async(std::launch::async, LoadMassiveImage);

  // ⏳ Start the spinner while we wait.
  {
    Spinner spinner("Loading massive image...");
    while (future_image.wait_for(kSpinInterval) ==
           std::future_status::timeout) {
      spinner.Spin();
    }
  }

  // ✅ Get the result of the std::future as it is ready now.
  // Blocks main thread if the result were not ready yet.
  const Image img = future_image.get();
  return 0;
}
```

Using this spinner class, we do the following in `main`:
1. We kick off the heavy `LoadMassiveImage` function in a background thread using `std::async` with the `std::launch::async` policy, which returns a `std::future` that holds a promise of the result.
2. We create a `Spinner` in the main thread. We call `spinner.Spin()` in a loop to animate the spinner while the `std::future` is waiting for the result.
3. We call `.get()` on the future to wait for and retrieve the final `Image` data once the future is ready.

### Execution Strategies (`std::launch`)
Notice that we passed `std::launch::async` as the first argument to `std::async`. This is the **launch policy**, which tells the C++ runtime exactly how it should execute our task. This parameter is the cause of one of the most common beginner pitfalls and is not very intuitive. Let's dive a bit deeper into the options we have:

* `std::launch::async`: Forces the task to be executed on a separate, dedicated background thread immediately. We used this in our example because we want the image to load in the background *while* our main thread is busy drawing and updating the loading spinner UI.
* `std::launch::deferred`: The task is **deferred** (lazy evaluation). It does not execute immediately, and it doesn't even spawn a new thread. Instead, it waits until we actually call `.get()` or `.wait()` on the future, and then executes synchronously on the *same* thread that requested the result. This is useful when we want to define a task upfront but leave the details of if, when, and on which thread it will be executed to a later point in time. In some cases, depending on circumstances, we might even never need that result. However, I rarely see this being used in practice, at least in my field of robotics.
* `std::launch::async | std::launch::deferred` (Default): If we don't specify a policy, the C++ runtime decides! It might run it on a new thread, or it might defer it, depending on system resources. What actually happens is implementation-defined so it is hard to rely on. So we usually specify `std::launch::async` explicitly when we need a strict guarantee that background work is happening immediately (like keeping our UI responsive). Honestly, it is a bit unfortunate that this is the default behavior, I'd rather have no default at all to avoid confusion! 
<!-- If anyone knows why this default was chosen, please comment below! -->

### Parallel Algorithms
But what if we don't want to do *just one* heavy task in the background, but rather perform an operation (usually a much smaller one) on lots of elements simultaneously? 

Since C++17, many algorithms in the `<algorithm>` and `<numeric>` headers accept an [**execution policy**](https://en.cppreference.com/w/cpp/algorithm/execution_policy_tag_t.html) from the `<execution>` header. By passing a policy like `std::execution::par`, we tell the compiler "Hey, feel free to run this across all available CPU cores."

Imagine we want to apply a simple filter, e.g. color inversion, to every pixel of that "massive image" we've just loaded. To make it a complete example, we'll add some details to our `Image` struct from before, but we'll still keep it extremely simple. 

Our image now holds a vector of pixels, with each pixel holding an RGB value. A function for inverting the color of a pixel only needs that pixel as an input and so is completely independent of other pixels. Tasks like these are called [embarrassingly parallel](https://en.wikipedia.org/wiki/Embarrassingly_parallel), which means we don't have to worry about any data collisions during parallel execution. More on that a bit later.

<!-- 
`CPP_COPY_SNIPPET` parallelism_algorithms/main_sequential.cpp
`CPP_RUN_CMD` CWD:parallelism_algorithms bash -c 'g++-15 -std=c++17 -O3 -I/opt/homebrew/include -L/opt/homebrew/lib main_sequential.cpp -o sequential 2>/dev/null || c++ -std=c++17 -O3 main_sequential.cpp -o sequential'
-->
```cpp
#include <algorithm>
#include <chrono>
#include <iostream>
#include <vector>

namespace {
using DoubleMilliseconds = std::chrono::duration<double, std::milli>;

struct Pixel {
  int r, g, b;
};

Pixel Invert(const Pixel& pixel) {
  return Pixel{255 - pixel.r, 255 - pixel.g, 255 - pixel.b};
}

// Using a struct to keep the example code short.
struct Image {
  Image(std::size_t width, std::size_t height, const Pixel value)
      : pixels(width * height, value) {}

  std::vector<Pixel> pixels;
};
}  // namespace

int main() {
  // A massive 100-megapixel image! Imagine it is filled with useful data.
  Image image{10'000, 10'000, Pixel{100, 200, 150}};

  std::cout << "Starting sequential color inversion...\n";
  const auto start = std::chrono::high_resolution_clock::now();

  std::transform(image.pixels.begin(),
                 image.pixels.end(),
                 image.pixels.begin(),
                 [](const Pixel& pixel) { return Invert(pixel); });

  const auto end = std::chrono::high_resolution_clock::now();
  const DoubleMilliseconds time_taken = end - start;
  std::cout << "Sequential time: " << time_taken.count() << " ms\n\n";
  return 0;
}
```

So we can create our image object and use standard algorithms to apply color inversion to it. First, we use the standard sequential `std::transform` algorithm.

It takes every pixel of an image, creates a new pixel from it by calling `Invert()` function and writes the result back to the image, overwriting the old pixel. 

We can compile this program with all the optimizations enabled:

```bash
c++ -std=c++17 -O3 main.cpp
```

On my machine, this program completes the image color inversion in about 12ms.

Now let's make this program run in parallel! 

<!-- 
`CPP_COPY_SNIPPET` parallelism_algorithms/main_parallel.cpp
`CPP_RUN_CMD` CWD:parallelism_algorithms bash -c 'g++-15 -std=c++17 -O3 -I/opt/homebrew/include -L/opt/homebrew/lib main_parallel.cpp -ltbb -o parallel 2>/dev/null || c++ -std=c++17 -O3 main_parallel.cpp -ltbb -o parallel'
-->
```cpp
#include <algorithm>
#include <chrono>
#include <execution>
#include <iostream>
#include <vector>

namespace {
using DoubleMilliseconds = std::chrono::duration<double, std::milli>;

struct Pixel {
  int r, g, b;
};

Pixel Invert(const Pixel& pixel) {
  return Pixel{255 - pixel.r, 255 - pixel.g, 255 - pixel.b};
}

// Using a struct to keep the example code short.
struct Image {
  Image(std::size_t width, std::size_t height, const Pixel value)
      : pixels(width * height, value) {}

  std::vector<Pixel> pixels;
};
}  // namespace

int main() {
  // A massive 100-megapixel image! Imagine it is filled with useful data.
  Image image{10'000, 10'000, Pixel{100, 200, 150}};

  std::cout << "Starting parallel color inversion...\n";
  const auto start = std::chrono::high_resolution_clock::now();

  std::transform(std::execution::par,
                 image.pixels.begin(),
                 image.pixels.end(),
                 image.pixels.begin(),
                 [](const Pixel& pixel) { return Invert(pixel); });

  const auto end = std::chrono::high_resolution_clock::now();
  const DoubleMilliseconds time_taken = end - start;
  std::cout << "Parallel time: " << time_taken.count() << " ms\n";
  return 0;
}
```

The code didn't change much at all! We only added the `std::execution::par` parameter to the `std::transform` algorithm as well as the `<execution>` header needed for it. We also need to slightly change that compile command from before by adding `-ltbb` to it:

```
c++ -std=c++17 -O3 main.cpp -ltbb
```

These tiny changes suddenly make the execution time drop dramaticaly, to around 5ms on my machine running 12 threads. 

That's nearly a 2.5x performance improvement for practically zero extra engineering effort, simply by typing `std::execution::par`. However, I have to mention that we shouldn't read into these numbers too much. Proper time measurement is non-trivial as it can be influenced by many factors such as what runs in the background, how much data is pre-loaded into the cache of our processor etc. But even with these caveats in mind, the performance improvement is drammatic enough for us to notice! Although one might notice that it is very far from being 12x better even though my machine has 12 threads! The reason for this is that while we can run multiple threads in parallel, there is overhead associated with how our task is broken down into chunks to be distributed among threads, how threads are scheduled and synchronized, and how the results are combined back to the output image.

### Execution Policies (`std::execution`)
Now let's talk about that `std::execution::par` parameter. Similar to launch policies of `std::async`, standard algorithms from the `<algorithm>` header accept an optional execution policy parameter, that controls exactly *how* the algorithm parallelizes our work:

* `std::execution::seq`: Executes sequentially on the current thread. This is the same as not passing a policy at all. Useful for debugging, testing, or if the data size is too small to benefit from parallelism overhead.
* `std::execution::par`: Executes in parallel on multiple threads. The runtime breaks the container (like our `std::vector`) into chunks based on how many CPU cores we have. This is the most common way to parallelize an algorithm. Note that is is _our job_ to ensure that such parallel execution is safe. Again, more on that later.
* `std::execution::unseq` (C++20): Executes on a single thread, but allows the CPU to use SIMD (Single Instruction, Multiple Data) vector instructions to process multiple elements at the exact same time (also known as vectorization).
* `std::execution::par_unseq`: Allows both multi-threading (`par`) AND vectorization (`unseq`). Going deep into vectorization is beyond the scope of this course but I still want to add a warning here that while this option might seem like it should be fastest in most cases its performance highly depends on the hardware as well as the problem we are trying to solve. Measure when in doubt!

> [!NOTE]
> Speaking of warnings... Please note that if you're on macOS, using any parallel `std::execution` policy is more complex as Apple Clang [lacks full built-in support for standard parallel algorithms](https://en.cppreference.com/w/cpp/compiler_support/17#C.2B.2B17_library_features). Therefore, the primary target for compiling our examples using standard libraries in all of the examples here is typically Linux (e.g., using GCC). If you'd like to run them on MacOS, you'll need to install gcc or clang with tbb support. For example, you can install gcc with `brew install gcc` and then use the installed specific version of `g++` (e.g. `g++-15`) to compile the code like so:
> ```bash
> g++-15 -std=c++17 -O3 -I/opt/homebrew/include -L/opt/homebrew/lib main_parallel.cpp -ltbb -o parallel
> ```

### Raw TBB Parallelism

> [!NOTE]
> This is a good time to talk about this `-ltbb` linker option! We also used it in the previous compilation command. The reason why we often need it to enable parallel version of the standard algorithms is because, under the hood, compilers often use [**Threading Building Blocks (oneTBB)**](https://github.com/uxlfoundation/oneTBB) library as the backend for these parallel algorithms. Originally developed by Intel and now transitioned to a more community driven project, TBB is (and has been for quite a while) an industry-standard library for task-based parallelism. But again, if you're on Apple Clang you'll need to switch to Clang (non-Apple) or GCC to use it.

This also then means that we are not confined to the limits of standard library when we want to write code that runs in parallel. If we need more control than the standard library algorithms provide, we can drop down an abstraction level and use Intel TBB directly. It provides a rich set of algorithms like `tbb::parallel_for`, `tbb::parallel_reduce`, and concurrent data structures.

Let's rewrite our color inversion example using `tbb::parallel_for`. This explicitly tells TBB to split our vector index range into chunks ("blocked ranges") and process them across available worker threads:

<!-- 
`CPP_COPY_SNIPPET` parallelism_algorithms/main_tbb.cpp
`CPP_RUN_CMD` CWD:parallelism_algorithms bash -c 'g++-15 -std=c++17 -O3 -I/opt/homebrew/include -L/opt/homebrew/lib main_tbb.cpp -ltbb -o tbb 2>/dev/null || c++ -std=c++17 -O3 main_tbb.cpp -ltbb -o tbb'
-->
```cpp
#include <tbb/blocked_range.h>
#include <tbb/parallel_for.h>

#include <chrono>
#include <iostream>
#include <vector>

namespace {
using DoubleMilliseconds = std::chrono::duration<double, std::milli>;

struct Pixel {
  int r, g, b;
};

Pixel Invert(const Pixel& pixel) {
  return Pixel{255 - pixel.r, 255 - pixel.g, 255 - pixel.b};
}

// Using a struct to keep the example code short.
struct Image {
  Image(std::size_t width, std::size_t height, const Pixel value)
      : pixels(width * height, value) {}

  std::vector<Pixel> pixels;
};
}  // namespace

int main() {
  // A massive 100-megapixel image! Imagine it is filled with useful data.
  Image image{10'000, 10'000, Pixel{100, 200, 150}};

  std::cout << "Starting raw TBB inversion...\n";
  const auto start = std::chrono::high_resolution_clock::now();

  // tbb::parallel_for takes a range, and a lambda to process that sub-range
  tbb::parallel_for(tbb::blocked_range<size_t>(0, image.pixels.size()),
                    [&](const tbb::blocked_range<size_t>& r) {
                      // This loop processes ONE chunk assigned to a specific thread
                      for (size_t i = r.begin(); i != r.end(); ++i) {
                        image.pixels[i] = Invert(image.pixels[i]);
                      }
                    });

  const auto end = std::chrono::high_resolution_clock::now();
  const DoubleMilliseconds time_taken = end - start;
  std::cout << "Raw TBB time: " << time_taken.count() << " ms\n";
  return 0;
}
```

We can compile this example just as we compiled the previous one and it should run in about the same time as the parallel version of the standard algorithms, in around 5ms on my machine.

All in all, TBB is a very powerful library that gives us much more control over how our code runs in parallel. From deciding how many threads to use under the hood to precise details of how our algorithm splits the data and processes it in parallel. If you want a small challenge, go ahead and find a way to only use, say, half of the available threads rather than all of them with our TBB example!

### Worker threads and thread pools
So now we know how to kick off long-running tasks and how to use parallel algorithms to process many tiny tasks. Is that it? Not quite. Imagine we receive a stream of thousands tiny images that all need their colors inverted before they can be displayed.

The `std::async` approach is too heavy for this. Spawning a brand new async task for every single tiny image would be devastating to performance, as every task would need a thread, and the OS overhead of creating a thread costs more computing time than actually inverting our tiny image. At the same time, the parallel versions of standard algorithms or even using raw TBB are a poor fit too, as they would need a complete vector of images to start processing, but here our images are streaming in one by one!

Instead, we can use a different paradigm that is used quite often in real life: a **thread pool** working on a **concurrent queue** that stores the data. In this paradigm, at the thread pool creation, we spawn a fixed number of threads (typically derived from the number of CPU cores we have), have them sleep in the background, and wake them up to process data from the queue, which is designed to work correctly when multiple threads read and write to it at the same time.  
<!-- TODO: add a diagram here -->

To understand how it all works, we need to dive into these three things:
- How to create (and cleanup) a thread
- How to protect shared data from corruption
- How to make threads go to sleep and wake them up when new data arrives

#### Step 1: How to create a thread
Let's start with the threads. To create a thread we could use `std::thread` but in more modern C++ (C++20 onwards), we can use `std::jthread` instead. As we mentioned at the start of this video, every thread needs to be created and, when our work with it is done, it needs to be either joined or detached. Unlike the older `std::thread`, `std::jthread` automatically joins the thread when it goes out of scope which makes it much safer to use!

Let's look at a simple example. Here we create 5 images of `TinyImage` type that have an id and a fake "size" represented by a randomly generated integer. We immediately push them into a `std::queue` in the main thread. Every `TinyImage` has a method `Process()` which simply simulates some work by sleeping for a duration proportional to its "size".

To create a new `std::jthread`, we simply pass the function this thread will run, in our case `ProcessImages`, along with any arguments this function needs, into its constructor.

<!-- 
`CPP_COPY_SNIPPET` parallelism_jthread_1/main.cpp
`CPP_RUN_CMD` CWD:parallelism_jthread_1 c++ -std=c++20 main.cpp
-->
```cpp
#include <chrono>
#include <iostream>
#include <queue>
#include <random>
#include <thread>

namespace {
// Using a struct instead of a class to keep the example code short.
struct TinyImage {
    void Process() const {
        // Simulate some work. Its duration depends on the image's size.
        std::this_thread::sleep_for(std::chrono::milliseconds(size));
    }
    int id{};
    int size{};
};

void ProcessImages(std::queue<TinyImage>* images) {
    // Don't forget to check this pointer for nullptr value!
    while (!images->empty()) {
        TinyImage img = images->front();
        images->pop();
        std::cout << "Thread " << std::this_thread::get_id() << " processing image " << img.id << "!\n";
        img.Process();
    }
}
}  // namespace

int main() {
    std::mt19937 rng{std::random_device{}()};
    std::uniform_int_distribution<int> dist{10, 100};

    std::queue<TinyImage> images{};
    for (int i = 1; i <= 5; ++i) {
        images.push(TinyImage{i, dist(rng)});
    }

    std::cout << "Starting background thread...\n";
    // Kick off a background thread passing the images queue
    std::jthread worker{ProcessImages, &images};

    std::cout << "Main thread is free to do other things!\n";
    // When main returns, `worker` goes out of scope and is automatically joined which will happen when it finishes the work.
    return 0;
}
```

As we can see from the output, the main thread continues executing in parallel to the images being processed in the background until the queue is empty! When main reaches the end, the `worker` thread needs to be destroyed and, being a `std::jthread`, it will automatically join itself, waiting for the background work to finish before the program terminates. So far so good!

#### Step 2: Adding another thread and a Mutex
One thread is neat, but we might want multiple threads to share the workload and process the same queue created in the main thread.

However, if multiple threads try to modify the queue simultaneously, we will get a **data race**, which will crash our program (in the best case scenario) or silently corrupt data. These silent issues are super hard to debug so we need to make sure we avoid them at all costs!

To protect us from data races like this, we can use a `std::mutex` object from the `<mutex>` header.

The word itself comes from **mut**ual **ex**clusion. And indeed, when a thread locks the mutex, it takes exclusive ownership of the resource that the mutex protects. Any other thread trying to access that same resource must wait its turn, trying to lock the mutex that's already locked will block the thread until the mutex is unlocked. 

Typically, we don't lock and unlock mutexes by ourselves but use RAII principle in the form of `std::lock_guard` that locks a given mutex at creation and automatically unlocks it when the lock guard object goes out of scope and dies. This ensures that the mutex is always unlocked, even if an [exception](error_handling.md) is thrown and the end of the function is never reached.

Note that a lock guard is templated on the type of the mutex used but, from C++17 onwards, due to **class template argument deduction (CTAD)** we can let the compiler deduce it for us!

<table>
<tr>
<th>Don't</th>
<th>Do</th>
</tr>
<tr>
<td>

<!--
`CPP_SETUP_START`
#include <mutex>

namespace {
std::mutex m;
}

`CPP_SETUP_END`
`CPP_COPY_SNIPPET` mutex_lock_dont/main.cpp
`CPP_RUN_CMD` CWD:mutex_lock_dont c++ -std=c++20 -c main.cpp
-->
```cpp
// Assuming there is a std::mutex object m
{
m.lock();
// Critical section
m.unlock();
}
```

</td>

<td>

<!--
`CPP_SETUP_START`
#include <mutex>

namespace {
std::mutex m;
}

`CPP_SETUP_END`
`CPP_COPY_SNIPPET` mutex_lock_do/main.cpp
`CPP_RUN_CMD` CWD:mutex_lock_do c++ -std=c++20 -c main.cpp
-->
```cpp
// Assuming there is a std::mutex object m.
{
    std::lock_guard<std::mutex> lock{m};
    // Critical section.
}  // Mutex is automatically unlocked here.
```

Or, even simpler:

<!--
`CPP_SETUP_START`
#include <mutex>

namespace {
std::mutex m;
}

`CPP_SETUP_END`
`CPP_COPY_SNIPPET` mutex_lock_do_ctad/main.cpp
`CPP_RUN_CMD` CWD:mutex_lock_do_ctad c++ -std=c++20 -c main.cpp
-->
```cpp
// Assuming there is a std::mutex object m.
{
    // Type is deducted using CTAD.
    std::lock_guard lock{m};
    // Critical section.
}  // Mutex is automatically unlocked here.
```

</td>
</tr>
</table>

But how does this translate to our `TinyImage` processing example?

<!-- 
`CPP_COPY_SNIPPET` parallelism_jthread_2/main.cpp
`CPP_RUN_CMD` CWD:parallelism_jthread_2 c++ -std=c++20 main.cpp
-->
```cpp
#include <chrono>
#include <iostream>
#include <mutex>
#include <queue>
#include <random>
#include <thread>

namespace {
// Using a struct instead of a class to keep the example code short.
struct TinyImage {
    void Process() const {
        // Simulate some work. Its duration depends on the image's size.
        std::this_thread::sleep_for(std::chrono::milliseconds(size));
    }
    int id{};
    int size{};
};

void ProcessImages(std::queue<TinyImage>* image_queue, std::mutex* queue_mutex) {
    // Don't forget to check these pointers for nullptr values! 
    while (true) {
        TinyImage img;
        {
            // Safely lock the queue to pop an image
            const std::lock_guard lock{*queue_mutex};
            if (image_queue->empty()) { break; }
            img = std::move(image_queue->front());
            image_queue->pop();
            std::cout << "Thread " << std::this_thread::get_id() << " processing image " << img.id << "!\n";
        } // The queue lock is automatically released here!
        
        img.Process();
    }
}
}  // namespace

int main() {
    std::mt19937 rng{std::random_device{}()};
    std::uniform_int_distribution<int> dist{10, 100};

    std::queue<TinyImage> images{};
    for (int i = 1; i <= 10; ++i) {
        images.push(TinyImage{i, dist(rng)});
    }

    std::mutex queue_mutex;

    std::cout << "Starting 2 background threads...\n";
    std::jthread worker1(ProcessImages, &images, &queue_mutex);
    std::jthread worker2(ProcessImages, &images, &queue_mutex);

    return 0;
}
```

Let's unpack what's happening here. We create the queue of images in the main thread as before. However, this time around we also create a `std::mutex` to protect access to this queue. Then, instead of creating a single background `std::jthread`, we create two, passing the same queue and mutex to both.

The `ProcessImages` function also changed and now also takes a pointer to a mutex. Now working with the queue is protected by the mutex. Once an image is copied into a local variable, the mutex is released and the image is processed independently. 

This works as intended but passing the queue and the mutex as pointers is a bit ugly from my perspective and I would wrap it into a tiny class, for example, `ImageProcessingPipeline`. 

<!-- 
`CPP_COPY_SNIPPET` parallelism_jthread_2_class/main.cpp
`CPP_RUN_CMD` CWD:parallelism_jthread_2_class c++ -std=c++20 main.cpp
-->
```cpp
#include <chrono>
#include <iostream>
#include <mutex>
#include <queue>
#include <random>
#include <thread>

namespace {
// Using a struct instead of a class to keep the example code short.
struct TinyImage {
    void Process() const {
        // Simulate some work. Its duration depends on the image's size.
        std::this_thread::sleep_for(std::chrono::milliseconds(size));
    }
    int id{};
    int size{};
};

class ImageProcessingPipeline {
 public:
    explicit ImageProcessingPipeline(size_t number_of_threads, std::queue<TinyImage>&& images) : image_queue_(std::move(images)) {
        std::cout << "Starting " << number_of_threads << " background threads...\n";
        for (size_t i = 0; i < number_of_threads; ++i) {
            worker_threads_.emplace_back(&ImageProcessingPipeline::ProcessImages, this);
        }
    }

 private:
    void ProcessImages() {
        while (true) {
            TinyImage img;
            {
                // Safely lock the queue to pop an image
                const std::lock_guard lock{queue_mutex_};
                if (image_queue_.empty()) { break; }
                img = std::move(image_queue_.front());
                image_queue_.pop();
                std::cout << "Thread " << std::this_thread::get_id() << " processing image " << img.id << "!\n";
            } // The queue lock is automatically released here!
        
            img.Process();
        }
    }

    std::queue<TinyImage> image_queue_{};
    std::mutex queue_mutex_{};
    std::vector<std::jthread> worker_threads_{};
};
}  // namespace

int main() {
    std::mt19937 rng{std::random_device{}()};
    std::uniform_int_distribution<int> dist{10, 100};

    std::queue<TinyImage> images{};
    for (int i = 1; i <= 10; ++i) {
        images.push(TinyImage{i, dist(rng)});
    }

    ImageProcessingPipeline pipeline{2, std::move(images)};

    return 0;
}
```

This class would then be responsible for safely managing the queue, mutex, and the worker threads. Here, we take the queue as an input, move the function `ProcessImages` to be a private member function, and start two worker threads by passing this number of threads to the constructor of the `IamgeProcessingPipeline` class. 

#### Step 3: Sleeping with Condition Variables
One might argue (and be right) that it is strange to pass a pre-filled queue to the constructor of our `ImageProcessingPipeline`. In a real application, we would likely want to start our pipeline with an empty queue, keep the threads alive, and add images to the queue as they arrive over time.

However, if our threads simply constantly check `if (image_queue_.empty())` in a `while (true)` loop, they will "spin", keeping the CPU at 100% while doing absolutely nothing useful. Also, how do we know when to stop them?

Instead, we want the threads to go to **sleep** and only wake up when new work arrives. We can do this with a `std::condition_variable`. With C++20, we use `std::condition_variable_any`, which seamlessly pairs with `std::jthread`'s built-in `std::stop_token` to easily wake up and terminate all threads when the program ends.

Let's modify our `ImageProcessingPipeline` class to have a `Submit` method and use condition variables to control when the threads should wake up and process new images:

<!-- 
`CPP_COPY_SNIPPET` parallelism_jthread_3/main.cpp
`CPP_RUN_CMD` CWD:parallelism_jthread_3 c++ -std=c++20 main.cpp
-->
```cpp
#include <chrono>
#include <condition_variable>
#include <iostream>
#include <mutex>
#include <queue>
#include <random>
#include <thread>

namespace {
// Using a struct instead of a class to keep the example code short.
struct TinyImage {
  void Process() const {
    // Simulate some work. Its duration depends on the image's size.
    std::this_thread::sleep_for(std::chrono::milliseconds(size));
  }
  int id{};
  int size{};
};

class ImageProcessingPipeline {
public:
  explicit ImageProcessingPipeline(size_t number_of_threads) {
    std::cout << "Starting " << number_of_threads << " background threads...\n";
    for (size_t i = 0; i < number_of_threads; ++i) {
      worker_threads_.emplace_back([this](std::stop_token stoken) {
        this->ProcessImages(std::move(stoken));
      });
    }
  }

  void Submit(TinyImage&& img) {
    {
      std::lock_guard lock{queue_mutex_};
      image_queue_.push(std::move(img));
    }
    cv_.notify_one();
  }

private:
  void ProcessImages(std::stop_token stoken) {
    while (true) {
      TinyImage img;
      {
        // Safely lock the queue to pop an image
        std::unique_lock lock{queue_mutex_};

        // Wait until the queue has items OR we are told to stop
        bool work_exists = cv_.wait(lock, stoken, [this] { return !image_queue_.empty(); });

        if (!work_exists) { break; }

        img = std::move(image_queue_.front());
        image_queue_.pop();
        std::cout << "Thread " << std::this_thread::get_id()
                  << " processing image " << img.id << "!\n";
      } // The queue lock is automatically released here!

      img.Process();
    }
  }

  std::queue<TinyImage> image_queue_{};
  std::mutex queue_mutex_{};
  std::condition_variable_any cv_{};
  std::vector<std::jthread> worker_threads_{};
};
} // namespace

int main() {
  std::mt19937 rng{std::random_device{}()};
  std::uniform_int_distribution<int> dist{10, 100};

  ImageProcessingPipeline pipeline{2};

  for (int i = 1; i <= 10; ++i) {
    pipeline.Submit(TinyImage{i, dist(rng)});
  }

  return 0;
}
```

#### Step 4: Putting it all together into a Generic Thread Pool
Our `ImageProcessingPipeline` is looking great, but it is heavily coupled to our `TinyImage` type. What if we want to process strings, files, or network requests in the background?

We can make our code completely generic by turning it into a template class! We will rename our class to `ThreadPool<T>`, templating it on the data type `T`. To ensure that our Thread Pool doesn't need to know anything about how the data is processed, we'll pass a `std::function` to the constructor, which will dictate how to process each item.

Here is what the transition to a generic thread pool looks like:

<!-- 
`CPP_COPY_SNIPPET` parallelism_jthread/main.cpp
`CPP_RUN_CMD` CWD:parallelism_jthread c++ -std=c++20 main.cpp
-->
```cpp
#include <chrono>
#include <condition_variable>
#include <functional>
#include <iostream>
#include <mutex>
#include <queue>
#include <random>
#include <thread>

namespace {
// Using a struct instead of a class to keep the example code short.
struct TinyImage {
  void Process() const {
    // Simulate some work. Its duration depends on the image's size.
    std::this_thread::sleep_for(std::chrono::milliseconds(size));
  }
  int id{};
  int size{};
};

template <typename T> 
class ThreadPool {
public:
  explicit ThreadPool(size_t number_of_threads,
                      std::function<void(T)>&& process_task)
      : process_task_{std::move(process_task)} {
    std::cout << "Starting Thread Pool with " << number_of_threads
              << " background threads...\n";
    for (size_t i = 0; i < number_of_threads; ++i) {
      worker_threads_.emplace_back([this](std::stop_token stoken) {
        this->ProcessItems(std::move(stoken));
      });
    }
  }

  void Submit(T&& item) {
    {
      std::lock_guard lock{queue_mutex_};
      queue_.push(std::move(item));
    }
    cv_.notify_one();
  }

private:
  void ProcessItems(std::stop_token stoken) {
    while (true) {
      T item;
      {
        std::unique_lock lock{queue_mutex_};

        bool work_exists = cv_.wait(lock, stoken, [this] { return !queue_.empty(); });

        if (!work_exists) { break; }

        item = std::move(queue_.front());
        queue_.pop();
      }

      process_task_(item);
    }
  }

  std::queue<T> queue_{};
  std::mutex queue_mutex_{};
  std::condition_variable_any cv_{};
  std::function<void(T)> process_task_{};
  std::vector<std::jthread> worker_threads_{};
};
} // namespace

int main() {
  std::mt19937 rng{std::random_device{}()};
  std::uniform_int_distribution<int> dist{10, 100};

  ThreadPool<TinyImage> pool{4, [](TinyImage img) {
                               std::cout
                                   << "Thread " << std::this_thread::get_id()
                                   << " processing image " << img.id << "!\n";
                               img.Process();
                             }};

  for (int i = 1; i <= 15; ++i) {
    pool.Submit(TinyImage{i, dist(rng)});
  }

  return 0;
}
```

<!-- TODO check if this prints gibberish or not -->

### What if I don't have C++20?
It's very common to work in a codebase stuck on C++17 (or even C++11). To achieve the exact same generic thread pool behavior without `std::jthread`, `std::stop_token`, and `std::condition_variable_any`, we have to do three manual things ourselves:
1. Maintain a shared `bool shutting_down_ = false;` flag to signal our intentions.
2. Manually wake up all threads using `cv_.notify_all()` in the destructor once we set the flag.
3. Explicitly loop through our vector of `std::thread`s and `.join()` them before they are completely destroyed!

Here is how our generic thread pool example would look if rewritten for C++17 standards:

<!-- 
`CPP_COPY_SNIPPET` parallelism_threadpool_17/main.cpp
`CPP_RUN_CMD` CWD:parallelism_threadpool_17 c++ -std=c++17 main.cpp
-->
```cpp
#include <chrono>
#include <condition_variable>
#include <functional>
#include <iostream>
#include <mutex>
#include <queue>
#include <random>
#include <thread>

namespace {
// Using a struct instead of a class to keep the example code short.
struct TinyImage {
  void Process() const {
    // Simulate some work. Its duration depends on the image's size.
    std::this_thread::sleep_for(std::chrono::milliseconds(size));
  }
  int id{};
  int size{};
};

template <typename T> class ThreadPool {
public:
  explicit ThreadPool(size_t number_of_threads,
                      std::function<void(T)> process_task)
      : process_task_{std::move(process_task)} {
    std::cout << "Starting Thread Pool (C++17) with " << number_of_threads
              << " background threads...\n";
    for (size_t i = 0; i < number_of_threads; ++i) {
      worker_threads_.emplace_back(&ThreadPool::ProcessItems, this);
    }
  }

  ~ThreadPool() {
    {
      std::lock_guard lock{queue_mutex_};
      shutting_down_ = true;
    }
    cv_.notify_all();

    for (auto &t : worker_threads_) { if (t.joinable()) { t.join(); } }
  }

  void Submit(T item) {
    {
      std::lock_guard lock{queue_mutex_};
      queue_.push(std::move(item));
    }
    cv_.notify_one();
  }

private:
  void ProcessItems() {
    while (true) {
      T item;
      {
        std::unique_lock lock{queue_mutex_};

        cv_.wait(lock, [this] { return !queue_.empty() || shutting_down_; });

        if (shutting_down_ && queue_.empty()) {
          break;
        }

        item = std::move(queue_.front());
        queue_.pop();
      }

      process_task_(item);
    }
  }

  std::queue<T> queue_{};
  std::mutex queue_mutex_{};
  std::condition_variable cv_{};
  std::function<void(T)> process_task_{};
  bool shutting_down_ = false;
  std::vector<std::thread> worker_threads_{};
};
} // namespace

int main() {
  std::mt19937 rng{std::random_device{}()};
  std::uniform_int_distribution<int> dist{10, 100};

  ThreadPool<TinyImage> pool{4, [](TinyImage img) {
                               std::cout
                                   << "Thread " << std::this_thread::get_id()
                                   << " processing image " << img.id << "!\n";
                               img.Process();
                             }};

  for (int i = 1; i <= 15; ++i) {
    pool.Submit(TinyImage{i, dist(rng)});
  }

  return 0;
}
```

It's not too much more code but if we can use `std::jthread` we definitely should as it avoid quite some boilerplate code and potential bugs. We can avoid huge classes of concurrency errors relating to abandoned threads crashing our application on exit.

## Summary
Parallelism is incredibly powerful, and modern CPUs demand it.
* Avoid raw threads and manual locking whenever possible. Let the abstraction layers do the heavy lifting!
* Use `<execution>` policies for data parallelism (like transforming a huge `std::vector`), `std::async` for high-level asynchronous tasks, and thread pools when processing endless queues of work.
* Shared mutable state is the root of all evil. If threads only *read* data, we have no problems. The moment one thread *writes* to data while another is reading/writing, we need synchronization (Mutexes) or we invoke the dreaded Undefined Behavior data race.
* Embrace RAII! Let `std::jthread` and `std::scoped_lock` handle the terrifying cleanup logic for us.

And remember, if all else fails, just put all the work on the main thread and pretend nobody noticed the 5-second lag spike. 🎮
