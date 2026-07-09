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

Parallel programming is the secret sauce that makes modern software feel fluid, allowing a web browser to handle 500 tabs of "research" without breaking a sweat, a bitcoin miner to utilize all CPU cores in the background, and a smartphone to show that cat video while we are "busy" doing important work. 

But it’s also one of the easiest ways to make our program crash in untraceable ways that only happen every other Tuesday when the moon is full. This is such a common scenario that there is even a saying: "Parallel programming is the art of doing two things at once and failing at both in ways that are impossible to debug."

But jokes aside, I'd like to talk about how we can use C++ to harness the power of our multi-core CPU to keep our programs fast and responsive, while avoiding the pitfalls that lead to non-deterministic crashes.

<!-- Intro -->

## Disclaimer
Ok, this is one of those topics where I absolutely must start with a disclaimer. No matter what I do there will be someone on the Internet to tell me I'm wrong. So here is the disclaimer: All of the things we talk about today come purely from what worked for me over the years. I do not claim that these ways are absolutely the best or the only ones out there and there definitely will remain dark corners that you folks will need to explore on your own. But I do hope that, despite this disclaimer, this video will turn out to be a decent overview of the topic.

Oh, also, we are not going to dive into the guts of how parallelism works in C++ or on our systems! It's a huge topic on its own and I am myself not comfortable with it enough to teach it without feeling like a fraud. So we'll just focus on the high-level usage of parallelism in C++ here.

## What is parallelism anyway?
But let's start by talking about what parallelism is. In a nutshell, **parallelism** is simply the ability to perform multiple computations or tasks at the same time. Instead of executing instructions one after another sequentially, a parallel program divides the work so that multiple operations can happen simultaneously, often speeding up execution significantly.

Largely speaking, there are two main ways to achieve this at the software level: **multi-processing** and **multi-threading**. 

When we run an application, the operating system creates a **process**, which is essentially an isolated sandbox containing our program's code and its own private memory (the heap and stack we learned about in the [memory lecture](memory_and_smart_pointers.md)). 

In **multi-processing**, we spawn multiple processes to run at the same time. Because each process gets its own distinct memory space, they don't step on each other's toes. This makes multi-processing theoretically relatively safe, but data sharing between processes is often relatively slow and complex.

In **multi-threading**, however, the execution happens on multiple **threads** *inside* a single process. Every process starts with a single main thread, but it can ask the OS to spawn additional threads which allows us to perform multiple tasks at once. The crucial difference here is that **all threads within a single process share the exact same memory space.** Just as the threads can be created, every thread needs to be either *joined* with the spawning thread or *detached* from it at the end of its lifetime within our program. More on that towards the end of this video.

In this lecture, we will exclusively focus on **multi-threading**, which is probably the most common form of true parallelism in C++. Since threads can read and write to the exact same variables on the heap without restrictions, they can efficiently work together. This can be fantastic for performance... and absolutely terrifying for stability! If we don't carefully manage how they access those shared data, they will overwrite each other's work and crash our program. But before we look into how things can go wrong under the hood, let's look into the easiest ways to do things right!

### No parallelism is always safer and often faster
The safest way to do parallelism is to **not** do it at all. What I mean here is that many tasks that people *think* will run faster in parallel actually run slower. This is due to the overhead of creating and managing threads, as well as the overhead of synchronizing access to shared resources. In many cases, it is better to use a single-threaded approach to solve the problem. Every situation is different, but it is always worth considering whether parallelism is actually necessary. And always measure the performance of both approaches before making a decision.

### High-level Task-Based Parallelism
But there *are* cases when we *need* to employ parallelism. One example of such a case is common in many GUI frameworks, where there is a main thread that handles the UI, and background threads that handle heavy tasks, because nobody likes a frozen application, which happens if the UI thread does too much work.

If we have such a heavy task to run, we can use [`std::async`](https://en.cppreference.com/w/cpp/thread/async.html). This function takes a callable (like a [lambda](lambdas.md)) and a [launch policy](https://en.cppreference.com/w/cpp/thread/launch.html), and runs this callable asynchronously, potentially on a background thread. It returns a `std::future`, which is basically a promise like "I don't have the result now, but I will in the *future*." This future object handles getting us the result with a `.get()` call as well as what happens if the underlying code fails or when the result is not ready yet.

For the sake of example, let's say our application, given a path to a massive image (we'll fake it here), needs to load it from disk (we'll simulate this by sleeping for 5 seconds). Let's first see what happens if we just load the image on the main thread:

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

Let's fix this! Let's use `std::async` just like I described a minute ago to kick off the heavy `LoadMassiveImage` function on a background thread, freeing the main thread to update the UI. While we're at it, let's encapsulate our spinner logic into a reusable `Spinner` class that iterates through an array of progress spinner characters when we call `Spin()` and cleans them up on destruction. Which allows us to use it in the main thread by calling its `Spin()` function in a while loop:

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

  explicit Spinner(std::string message) : message_{std::move(message)} { Spin(); }

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
  std::future<Image> future_image = std::async(std::launch::async, LoadMassiveImage);

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

But let's focus closely on what we do here in the `main` function:
1. We kick off the heavy `LoadMassiveImage` function in a background thread using `std::async` with the `std::launch::async` policy, which returns a `std::future` that holds a promise of the result.
2. We create a `Spinner` in the main thread. We call `spinner.Spin()` in a loop to animate the spinner while the `std::future` is waiting for the result using the `.wait_for` function. This function checks if the result is ready, and if not, it waits for a specified amount of time before returning, here for `kSpinInterval` microseconds. If the result is ready, it returns immediately, otherwise it returns `std::future_status::timeout`. By the end of this scope, the snipper gets destroyed, printing the success message.
3. Finally, we call `.get()` on the future to wait for and retrieve the final `Image` data once the future is ready. This function blocks the main thread if the result is not ready yet but in our case we know it's there already. Note that here we don't handle the case if the `LoadMassiveImage` function throws an exception. In this case `std::future` will rethrow the exception when we call `.get()` on it. So in a production code we should wrap this call in a `try-catch` block.

### Execution Strategies (`std::launch`)
Notice that we passed `std::launch::async` as the first argument to `std::async`. This is the **launch policy**, which tells the C++ runtime exactly how it should execute our task. This parameter is the cause of one of the most common beginner pitfalls and is not very intuitive. Let's dive a bit deeper into the options we have:

* `std::launch::async`: Forces the task to be executed on a separate, dedicated background thread immediately. We used this in our example because we want the image to load in the background *while* our main thread is busy drawing and updating the loading spinner UI.
* `std::launch::deferred`: The task is **deferred**. This is also knows as "lazy evaluation". It does not execute immediately, and it doesn't even spawn a new thread. Instead, it waits until we actually call `.get()` or `.wait()` on the future, and then executes synchronously on the *same* thread that requested the result. This is useful when we want to define a task upfront but leave the details of if, when, and on which thread it will be executed to a later point in time. In some cases, depending on circumstances, we might even never need that result. However, I rarely see this being used in practice, at least in my field of robotics. <!-- If you have a good use-case for this - please tell me what it is in the comments! -->
* `std::launch::async | std::launch::deferred` -  the default case. If we don't specify a policy, the C++ runtime decides! It might run it on a new thread, or it might defer it, depending on system resources. What actually happens is implementation-defined so it is hard to rely on. So we usually specify `std::launch::async` explicitly when we need a strict guarantee that background work is happening immediately (like keeping our UI responsive). Honestly, it is a bit unfortunate that this is the default behavior, I'd rather have no default at all to avoid confusion! 
<!-- If anyone knows why this default was chosen historically, please also comment below! -->

### Parallel Algorithms
But what if we don't want to do *just one* heavy task in the background, but rather perform an operation (usually a much smaller one) on lots of elements simultaneously? 

Since C++17, many algorithms in the `<algorithm>` and `<numeric>` headers accept an [**execution policy**](https://en.cppreference.com/w/cpp/algorithm/execution_policy_tag_t.html) from the `<execution>` header. By passing a policy like `std::execution::par`, we tell the compiler "Hey, feel free to run this across all available CPU cores."

Imagine we want to apply a simple filter, e.g. color inversion, to every pixel of that "massive image" we've just loaded. To make it a complete example, we'll add some details to our `Image` struct from before, but we'll still keep it extremely simple. 

Our image now holds a vector of pixels, with each pixel holding an RGB value. A function for inverting the color of a pixel only needs that pixel as an input and so is completely independent of other pixels. Tasks like these are called [embarrassingly parallel](https://en.wikipedia.org/wiki/Embarrassingly_parallel), which means we don't have to worry about any data collisions during parallel execution. More on that a bit later.

<!-- 
`CPP_COPY_SNIPPET` parallelism_algorithms/main_sequential.cpp
`CPP_RUN_CMD` CWD:parallelism_algorithms c++ -std=c++17 -O3 main_sequential.cpp -o sequential
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
  std::cout << "Sequential time: " << time_taken.count() << " ms\n";
  return 0;
}
```

So we can create our image object and use standard algorithms to apply color inversion to it. First, we use the standard sequential `std::transform` algorithm.

It takes every pixel of an image, creates a new pixel from it by calling `Invert()` function and writes the result back to the image, overwriting the old pixel. 

We can compile this program with all the optimizations enabled:

```bash
c++ -std=c++17 -O3 main.cpp
```

On my machine, this program completes the image color inversion in about 60ms.

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

The code doesn't need to change much at all! Let's focus on that `std::transform` call. We only need to add the `std::execution::par` parameter to the `std::transform` algorithm as well as the `<execution>` header needed for it. We also need to slightly change that compile command from before by adding `-ltbb`, which links the TBB library to the resulting binary:

```
c++ -std=c++17 -O3 main.cpp -ltbb
```

These tiny changes suddenly make the execution time drop dramaticaly, to around 18ms on my machine running 12 threads. 

That's more than a 3x performance improvement for practically zero extra engineering effort, simply by typing `std::execution::par`. However, I have to mention that we shouldn't read into these numbers too much. Proper time measurement is non-trivial as it can be influenced by many factors such as what runs in the background, how much data is pre-loaded into the cache of our processor etc. But even with these caveats in mind, the performance improvement is drammatic enough for us to notice! 

Although one might notice that it is very far from being 12x better even though my machine has 12 threads! The reason for this is that while we can run multiple threads in parallel, there is overhead associated with how our task is broken down into chunks to be distributed among threads, how threads are scheduled and synchronized, and how the results are combined back to the output image. Given that our task is very simple, the overhead is quite noticeable! 

### Execution Policies (`std::execution`)
Now let's talk about that `std::execution::par` parameter. Similar to launch policies of `std::async`, standard algorithms from the `<algorithm>` header accept an optional execution policy parameter, that controls exactly *how* the algorithm parallelizes our work:

* `std::execution::seq`: Executes sequentially on the current thread. This is the same as not passing a policy at all. Useful for debugging, testing, or if the data size is too small to benefit from parallelism overhead.
* `std::execution::par`: Executes in parallel on multiple threads. The runtime breaks the container (like our `std::vector`) into chunks based on how many CPU cores we have. This is the most common way to parallelize an algorithm. Note that is is _our job_ to ensure that such parallel execution is safe. Again, more on that later.
* `std::execution::unseq` (C++20): Executes on a single thread, but allows the CPU to use SIMD (Single Instruction, Multiple Data) vector instructions to process multiple elements at the exact same time. This is also known as vectorization.
* `std::execution::par_unseq`: Allows both multi-threading (`par`) AND vectorization (`unseq`). Going deep into vectorization is beyond the scope of this course but I still want to add a warning here that while this option might seem like it should be fastest in most cases its performance highly depends on the hardware as well as the problem we are trying to solve. Measure when in doubt! Oh, and it is much easier to shoot one's leg off with this policy when it comes to data races which we'll discuss in a couple of minutes.

> [!NOTE]
> Speaking of warnings... Please note that if you're on macOS, using any parallel `std::execution` policy is more complex as Apple Clang [lacks full built-in support for standard parallel algorithms](https://en.cppreference.com/w/cpp/compiler_support/17#C.2B.2B17_library_features). Therefore, the primary target for compiling our examples using standard libraries in all of the examples here is typically Linux (e.g., using GCC). If you'd like to run them on MacOS, you'll need to install gcc or clang with tbb support. For example, you can install gcc with `brew install gcc` and then use the installed specific version of `g++` (e.g. `g++-15`) to compile (and link) the code like so:
> ```bash
> g++-15 -std=c++17 -O3 -I/opt/homebrew/include -L/opt/homebrew/lib main_parallel.cpp -ltbb -o parallel
> ```

### Raw TBB Parallelism

> [!NOTE]
> This is probably also a good time to talk about this `-ltbb` [linker](headers_and_libraries.md#linking-libraries-to-binaries) option! We also used it in the previous compilation command. The reason why we often need it to enable parallel version of the standard algorithms is because, under the hood, compilers often use [**Threading Building Blocks (oneTBB)**](https://github.com/uxlfoundation/oneTBB) library as the backend for these parallel algorithms. Originally developed by Intel and now transitioned to a more community driven project, TBB is (and has been for quite a while) an industry-standard library for task-based parallelism. But again, if you're on Apple Clang you'll need to switch to Clang (non-Apple) or GCC to use it.

This also then means that we are not confined to the limits of standard library when we want to write code that runs in parallel. If we need more control than the standard library algorithms provide, we can drop down an abstraction level and use Intel TBB directly. It provides a rich set of algorithms like `tbb::parallel_for`, `tbb::parallel_reduce`, concurrent data structures, and more.

Let's rewrite our color inversion example using `tbb::parallel_for`. The only two changes are regarding the replacement of the `std::transform` with the `tbb::parallel_for` and the matching changes in headers. This new code now explicitly tells TBB to split our vector index range into chunks ("blocked ranges") and process them across available worker threads:

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

  // tbb::parallel_for takes a range, and a lambda to process that range
  tbb::parallel_for(tbb::blocked_range<size_t>(0, image.pixels.size()),
                    [&](const tbb::blocked_range<size_t>& r) {
                      // This loop processes ONE chunk assigned to a thread
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

We can compile this example just as we compiled the previous one and it should run in about the same time as the parallel version of the standard algorithms, in around 18ms on my machine.

All in all, oneTBB is a very powerful library that gives us much more control over how our code runs in parallel. From deciding how many threads to use under the hood to precise details of how our algorithm splits the data and processes it in parallel. If you want a small challenge, go ahead and find a way to only use, say, half of the available threads rather than all of them with our TBB example!

### Worker threads and thread pools
So now we know how to kick off long-running tasks and how to use parallel algorithms to process many tiny tasks. Is that it? 

Not quite. Imagine instead of one huge image, like in the previous example, we receive a stream of thousands tiny images that all need their colors inverted.  

Our previous approaches are not well-suited for this. The `std::async` approach is too heavy. Spawning a brand new async task for every single tiny image would be devastating to performance, as every task would need a thread, and the OS overhead of creating a thread costs more computing time than actually inverting our tiny image. At the same time, the parallel versions of standard algorithms or even using raw TBB are a poor fit too, as they work well when we provide them a bunch of available data. But our images are streaming one by one? How many should we pass? Is 3 enough? 4? More?

Instead, we can use a different paradigm that is used quite often in real life: a **thread pool** working on a **concurrent queue** that stores the data. In this paradigm, at the thread pool creation, we spawn a fixed number of threads (typically derived from the number of CPU cores we have), have them sleep in the background, and wake them up to process data from the queue, which is designed to work correctly when multiple threads read and write to it at the same time.  

To understand how it all works, we need to dive into these three things:
- How to create (and cleanup) a thread
- How to protect shared data from corruption
- How to make threads go to sleep and wake them up when new data arrives

#### Step 1: How to create a thread
As we mentioned at the start of this lecture, every thread needs to be created (by forking off the spawning thread) and, when our work with it is done, it needs to be either joined back into the spawning thread or detached. Today, we won't talk about detatched threads (because we should almost never use them) and assume that every thread we create needs to be joined. This model is called [Fork–join model](https://en.wikipedia.org/wiki/Fork%E2%80%93join_model) and was first formulated, to the best of my knowledge, by Melvin E. Conway in 1963.

To create a thread in C++ we use a standard class that abstracts away the OS-level thread from us. From C++11 and until C++20 we use the `std::thread` class for that but in more modern C++ (C++20 onwards), we can use the `std::jthread` class instead. Essentially, both serve the same purpose but the `std::jthread` automatically joins the thread when it goes out of scope, which prevents a number of potential programming errors and makes it much safer to use.

Let's look at a simple example to understand better how it works in practice. Here we assume that every image is of `TinyImage` type that has an id and a fake "size" represented by a randomly generated integer. Every `TinyImage` can be processed by a function `ProcessImage()` which here simulates some work by sleeping for a duration proportional to its "size". At the start of our program we immediately push 10 such images into a `std::queue` in the main thread. 

Then we want to process them in a separate thread. To get this up and runnign we need to create a new thread, which we do by creating an object of `std::jthread` type by passing the function this thread will run, in our case `ProcessImages`, along with any arguments this function needs, into its constructor. In this particular example, since we want to modify the queue, we pass a pointer to it.

In its turn, the `ProcessImages` function runs a loop that, as long as the queue is not empty, takes one image at a time from it and processes it by calling `ProcessImage`.

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
struct TinyImage {
  int id{};
  int size{};
};

void ProcessImage(const TinyImage& image) {
  // Simulate some work. Its duration depends on the image's size.
  std::this_thread::sleep_for(std::chrono::milliseconds(image.size));
}

void ProcessImages(std::queue<TinyImage>* images) {
  if (!images) { return; } 
  while (!images->empty()) {
    const TinyImage image = std::move(images->front());
    images->pop();
    std::cout << "Thread " << std::this_thread::get_id() << " processing image " << image.id << "!\n";
    ProcessImage(image);
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

  std::cout << "Starting background thread...\n";
  std::jthread worker{ProcessImages, &images};

  std::cout << "Main thread is free to do other things!\n";
  // worker goes out of scope and is automatically joined when it finishes the work.
  return 0;
}
```

As we can see from the output, the main thread continues executing in parallel to the images being processed in the background until the queue is empty! When main reaches the end, the `worker` thread needs to be destroyed and, being a `std::jthread`, it will automatically wait for the background work to finish before it can safely join itself and be destroyed. So far so good!

#### Stopping threads cooperatively with `std::stop_token`

Speaking of destroying the `jthread` objects, when a `jthread` is destroyed, it not only joins the thread, but it also first requests the thread to stop. 

We can access this request in the thread function by having it accept a `std::stop_token` as its first argument. This allows the thread to stop what it's doing when the main thread wants it to shut down.

Let's look at a simple example where a background thread runs an infinite loop, but stops cleanly when the main thread requests it:

<!-- 
`CPP_COPY_SNIPPET` parallelism_stop_token/main.cpp
`CPP_RUN_CMD` CWD:parallelism_stop_token c++ -std=c++20 main.cpp
-->
```cpp
#include <chrono>
#include <iostream>
#include <thread>

namespace {
void BackgroundWork(std::stop_token stoken) {
  int count = 0;
  // Keep running as long as a stop has not been requested
  while (!stoken.stop_requested()) {
    std::cout << "Working... " << ++count << "\n";
    std::this_thread::sleep_for(std::chrono::milliseconds(200));
  }
  std::cout << "Stop requested! Cleaning up and exiting...\n";
}
} // namespace

int main() {
  std::cout << "Starting background thread...\n";
  std::jthread worker(BackgroundWork);

  std::this_thread::sleep_for(std::chrono::seconds(1));
  
  std::cout << "Main thread finished. Destroying worker...\n";
  // When worker goes out of scope, it automatically calls request_stop() 
  // on the stop_token, and then joins the thread.
  return 0;
}
```

When the `worker` thread goes out of scope, it automatically calls `request_stop()` on the `stop_token`. This breaks our loop as `stoken.stop_requested()` becomes true. Once the while loop terminates, the `BackgroundWork` function will return and the thread will automatically join.

This is incredibly useful because it gives us a built-in, standard way to cleanly shut down background tasks without needing custom boolean flags or complex logic.

#### Step 2: Adding another thread and a Mutex
Now we are ready to talk about what happens if we have multiple threads that try to modify the same data simultaneously. In that case, we will get a so-called **data race**, which can crash our program (in the best case scenario) or silently corrupt data. These silent issues are **undefined behavior** and are super hard to debug so we need to make sure we avoid them at all costs!

By the way, note how we pass a pointer into the `ProcessImages` function. That's because `std::jthread` doesn't support passing arguments by reference! The reason for this is that `jthread` needs to maintain a thread-local copy of any variable we pass into it. It _could_ of course just copy a mutable reference but it would be unsafe to do so as this would potentially silently create a data race, so `jthread` actively decays any reference type to a normal type and so a copy is performed. This way if we want to pass a reference we either need to wrap it in a `std::ref` or just pass a pointer as we did in our example. This way we can still get an unsafe behavior, but we opt-in to it. Now back to how we can deal with the data race scenarios just like ours.

To protect us from data races like this, we can use arguably the most common tool for dealing with such scenarios: a `std::mutex` object from the `<mutex>` header.

The word `mutex` itself comes from **mut**ual **ex**clusion. And indeed, when a thread locks the mutex, it takes exclusive ownership of the resource that the mutex protects. Any other thread trying to access that same resource must wait its turn, trying to lock the mutex that's already locked will block the thread until the mutex is unlocked.

Typically, we don't lock and unlock mutexes by ourselves but use RAII principle in the form of `std::lock_guard` that locks a given mutex at creation and automatically unlocks it when the lock guard object goes out of scope and dies. This ensures that the mutex is always unlocked if it has been locked, even if an [exception](error_handling.md#exceptions) is thrown and the end of the function is never reached.

Note that `std::lock_guard` is templated on the type of the mutex used but, from C++17 onwards, due to **class template argument deduction (CTAD)** we can let the compiler deduce it for us!

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
// Critical section, mutex is locked here.
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
    // Critical section, mutex is locked here.
}  // Mutex is automatically unlocked here.
```

Or, even simpler with CTAD:

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
    // Critical section, mutex is locked here.
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
struct TinyImage {
  int id{};
  int size{};
};

void ProcessImage(const TinyImage& image) {
  // Simulate some work. Its duration depends on the image's size.
  std::this_thread::sleep_for(std::chrono::milliseconds(image.size));
}

void ProcessImages(std::queue<TinyImage>* images, std::mutex* queue_mutex) {
  if (!images) { return; } 
  if (!queue_mutex) { return; } 
  while (true) {
    TinyImage image;
    {
      // Safely lock the queue to pop an image
      const std::lock_guard lock{*queue_mutex};
      if (images->empty()) { break; }
      image = std::move(images->front());
      images->pop();
      std::cout << "Thread " << std::this_thread::get_id() << " processing image " << image.id << "!\n";
    }  // The queue lock is automatically released here!
    
    ProcessImage(image);
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

Let's unpack what's happening here. We create the queue of images in the main thread as before. However, this time we also create a `std::mutex` to protect access to this queue. Then, instead of creating a single background `std::jthread`, we create two, passing the same queue and mutex to both.

The `ProcessImages` function also changed and now also takes a pointer to a mutex. This mutex protects access to the queue. Instead of processing the image under the mutex, we move each image into a local variable. Only this copy is protected by the mutex, minimizing the time we hold the lock. Once we have a local copy of an image it can be processed safely without locking the queue.

This works as intended, but passing the queue and the mutex as pointers is a bit ugly from my perspective and I would wrap it into a class, for example, `ImageProcessingPipeline`. 

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
struct TinyImage {
  int id{};
  int size{};
};

void ProcessImage(const TinyImage& image) {
  // Simulate some work. Its duration depends on the image's size.
  std::this_thread::sleep_for(std::chrono::milliseconds(image.size));
}

class ImageProcessingPipeline {
 public:
  ImageProcessingPipeline(size_t number_of_threads, std::queue<TinyImage>&& images) 
      : images_{std::move(images)} {
    std::cout << "Starting " << number_of_threads << " background threads...\n";
    for (size_t i = 0; i < number_of_threads; ++i) {
      worker_threads_.emplace_back(&ImageProcessingPipeline::ProcessImages, this);
    }
  }

 private:
  void ProcessImages() {
    while (true) {
      TinyImage image;
      {
        // Safely lock the queue to pop an image
        const std::lock_guard lock{queue_mutex_};
        if (images_.empty()) { break; }
        image = std::move(images_.front());
        images_.pop();
        std::cout << "Thread " << std::this_thread::get_id() << " processing image " << image.id << "!\n";
      } // The queue lock is automatically released here!
  
      ProcessImage(image);
    }
  }

  std::queue<TinyImage> images_{};
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

This class would then be responsible for safely managing the queue, mutex, and the worker threads. Here, we take the queue as an input and store it as a member variable. We also move the function `ProcessImages` to be a private member function, and start two worker threads by passing the number of threads to the constructor of the `ImageProcessingPipeline` class. 

Oh, and one more thing. Right now the queue is locked for every image we take off the queue. This is not quite optimal and we can definitely do better than that. We can instead lock the queue only once to get all images into a local queue and then process this local queue instead without keeping the mutex locked:

<!-- 
`CPP_COPY_SNIPPET` parallelism_jthread_2_class_swap/main.cpp
`CPP_RUN_CMD` CWD:parallelism_jthread_2_class_swap c++ -std=c++20 main.cpp
-->
```cpp
#include <chrono>
#include <iostream>
#include <mutex>
#include <queue>
#include <random>
#include <thread>

namespace {
struct TinyImage {
  int id{};
  int size{};
};

void ProcessImage(const TinyImage& image) {
  // Simulate some work. Its duration depends on the image's size.
  std::this_thread::sleep_for(std::chrono::milliseconds(image.size));
}

class ImageProcessingPipeline {
 public:
  ImageProcessingPipeline(size_t number_of_threads, std::queue<TinyImage>&& images) 
      : images_{std::move(images)} {
    std::cout << "Starting " << number_of_threads << " background threads...\n";
    for (size_t i = 0; i < number_of_threads; ++i) {
      worker_threads_.emplace_back(&ImageProcessingPipeline::ProcessImages, this);
    }
  }

 private:
  void ProcessImages() {
    while (true) {
      std::queue<TinyImage> local_images;
      {
        const std::lock_guard lock{queue_mutex_};
        if (images_.empty()) { break; }
        std::swap(local_images, images_);
      } // The queue lock is automatically released here!

      // Now we can process the local queue without locking the mutex
      while(!local_images.empty()) {
        const auto image = std::move(local_images.front());
        local_images.pop();
        std::cout << "Thread " << std::this_thread::get_id() << " processing image " << image.id << "!\n";
        ProcessImage(image);
      }
    }
  }

  std::queue<TinyImage> images_{};
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

#### Step 3: Sleeping with Condition Variables
One might argue (and be right) that it is strange to pass a pre-filled queue to the constructor of our `ImageProcessingPipeline`. In a real application, we would likely want to start our pipeline with an empty queue, keep the threads alive, and add images to the queue as they arrive over time.

However, if our threads simply constantly check `if (images_.empty())` in a `while (true)` loop, this is called **spinning** the threads. This can keep the CPU at 100% while doing absolutely nothing useful! Also, how would we know when to stop them?

Instead, we want the threads to go to **sleep** and only wake up when new work arrives. We can do this with a `std::condition_variable`. Conditional variables might seem a bit confusing at first, but in a nutshell here is how to work with one. We'll look at a toy example before we use this pattern for our image pipeline. 

There are three main puzzle pieces to using conditional variables. First, we need some data to protect, for example some `data_queue`. Then we need a **mutex** that protects these data. Finally, we need a **condition variable** itself.

Now the interplay between these is as follows. A single condition variable is shared among multiple threads. There are threads that want to work with the underlying data but can only do so under a certain condition. So they wait for the condition variable to be notified that this condition is now satisfied. 

When another thread makes a change to the data that makes the condition true, we call `cv.notify_once()` or `cv.notify_all()` depending on circumstances to notify one or all instances of our condition variable that the condition has been now met.

Once the condition variables in those threads receive a notification we sent out the threads wake up and continue their work.

More concretely, if we have some queue that needs to have data in it to be processed, we can fill it with data and notify the condition variable in the following way:

<!-- 
`CPP_SKIP_SNIPPET`
-->
```cpp
// Somewhere in a function that produces data. 
// Here we assume access to std::condition_variable cv, 
// queue_mutex and data_queue.
{
  const std::lock_guard lock{queue_mutex};
  data_queue.push(new_value);
}
// Notify one waiting thread that new data is available.
// Note that this happens _after_ releasing the lock!
cv.notify_one(); 
```

On the receiving side, we need to use `std::unique_lock` (not `std::lock_guard`) to guard the queue. The reason for this is that a condition variable keeps the lock unlocked until the condition becomes true and locks it after the wait is over. A typical code snippet for this would look something like this: 

<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
// Somewhere in a function that consumes data. 
// Here we assume access to std::condition_variable cv, 
// queue_mutex and data_queue.
std::unique_lock lock{queue_mutex};
cv.wait(lock, []{ return !data_queue.empty(); });
// We can work with the data_queue now. 
// The lock is locked.
```

Here we wait for the queue to not be empty. When a condition variable receives a wake-up call, it locks the lock, checks if the condition provided to it as a lambda (called a predicate) is true and if it *is* true, it keeps the lock locked and continues execution. Otherwise it unlocks the lock and goes back to sleep. 

Ok, these were the basics. Now let's modify our image processing pipeline to use condition variables so that we can submit images to it over time. Remember `std::stop_token` that we discussed earlier? We need to use it here to know when to actually stop waiting for new images. Since we are focusing on C++20, `std::condition_variable_any` seamlessly pairs with `std::stop_token` to automatically wake up and terminate all waiting threads when a stop is requested (e.g. when the pipeline is destroyed).

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
struct TinyImage {  
  int id{};
  int size{};
};

void ProcessImage(const TinyImage& image) {
  // Simulate some work. Its duration depends on the image's size.
  std::this_thread::sleep_for(std::chrono::milliseconds(image.size));
}

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
      const std::lock_guard lock{queue_mutex_};
      images_.push(std::move(img));
    }
    cv_.notify_one();
  }

private:
  void ProcessImages(std::stop_token stoken) {
    while (true) {
      std::queue<TinyImage> local_images;
      {
        // Safely lock the queue to pop an image
        std::unique_lock lock{queue_mutex_};
        // Wait until the queue has items OR we are told to stop
        const bool work_exists = cv_.wait(lock, stoken, [this] { return !images_.empty(); });
        if (!work_exists) { break; }
        std::swap(local_images, images_);
      } // The queue lock is automatically released here!

      while(!local_images.empty()) {
        const auto image = std::move(local_images.front());
        local_images.pop();
        std::cout << "Thread " << std::this_thread::get_id() << " processing image " << image.id << "!\n";
        ProcessImage(image);
      }
    }
  }

  std::queue<TinyImage> images_{};
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

Our example has grown quite a bit so let's zoom into the changes we've just made. We obviously added a condition variable to our class and we use it all over the place. Let's start by looking at the new `Submit` member function. Here, we receive an rrfef to an image and move it into the queue while keeping the queue locked with the `queue_mutex_`. We then notify the condition variable to wake one of the potentially sleeping threads up. Note that we do this without holding the lock.

We use this `Submit` function from the main function after creating out pipeline. Note how we don't create a queue ahead of time anymore and pass just the number of threads to the pipeline's constructor. Speaking of which, now the constructor creates the specified number of worker threads using `std::jthread`. Each `std::jthread` is given a `std::stop_token` which we can use to signal the thread to stop. This stop token is passed directly to the thread's entry function, which in our case is `ProcessImages`.

The `ProcessImages` function stayed largely the same but did change a bit too. It still has a loop that continuously processes the queue of images. We still swap the local queue with the main queue to avoid holding the main queue's lock for too long and we process the items locally. What changed, though, is that now we use the condition variable to wait for new items to arrive in the queue. This wait will make the thread sleep until either the predicate of `images_` queue not being empty becomes true or the stop token is set. Once the wait is over the `wait` returns the result of the predicate evaluation, i.e., if there is work available and locks the lock. As long as there are images in the queue we want to process them which we do just as we did before. 

Let's stop for a short moment and see what happens if the stop token is set. The `wait` will return `true` if there still images in the queue. Once we process them we will go on another loop iteration and try to wait again. This time though the stop token remains set and the `wait` returns instantly, returning `false` which allows us to break from the loop and finally allow the thread to join.

#### Step 4: Putting it all together into a Generic Thread Pool
Our `ImageProcessingPipeline` is looking great, but it is heavily coupled to our `TinyImage` type. What if we want to process strings, files, or network requests in the background instead?

We can make our code completely generic by turning it into a template class templating it on the data type `T`, which we specify when we create an instance of our pipeline. This means that our queue is also templated on this type `T` now. Which means that we also need to use this type in the function we use to process our data as we can't assume their type anymore. So we pass a [`std::function`](std_function.md) `void(const T&)` to the constructor of our class and store it in a member variable. This function now dictates how to process each item. Finally, we rename the pipeline to a thread pool and do the same for all internal data, from mentioning images to talking about tasks instead:

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
struct TinyImage {
  int id{};
  int size{};
};

void ProcessImage(const TinyImage& image) {
  // Simulate some work. Its duration depends on the image's size.
  std::this_thread::sleep_for(std::chrono::milliseconds(image.size));
}

template <typename T> 
class ThreadPool {
public:
  ThreadPool(size_t number_of_threads,
             std::function<void(const T&)> process_task)
      : process_task_{std::move(process_task)} {
    std::cout << "Starting " << number_of_threads << " background threads...\n";
    for (size_t i = 0; i < number_of_threads; ++i) {
      worker_threads_.emplace_back([this](std::stop_token stoken) {
        this->ProcessItems(std::move(stoken));
      });
    }
  }

  void Submit(T&& item) {
    {
      std::lock_guard lock{queue_mutex_};
      tasks_.push(std::move(item));
    }
    cv_.notify_one();
  }

private:
  void ProcessItems(std::stop_token stoken) {
    while (true) {
      std::queue<T> local_items;
      {
        std::unique_lock lock{queue_mutex_};
        const bool work_exists = cv_.wait(lock, stoken, [this] { return !tasks_.empty(); });
        if (!work_exists) { break; }
        std::swap(local_items, tasks_);
      }

      while(!local_items.empty()) {
        const auto item = std::move(local_items.front());
        local_items.pop();
        process_task_(item);
      }
    }
  }

  std::queue<T> tasks_{};
  std::mutex queue_mutex_{};
  std::condition_variable_any cv_{};
  std::function<void(const T&)> process_task_{};
  std::vector<std::jthread> worker_threads_{};
};
} // namespace

int main() {
  std::mt19937 rng{std::random_device{}()};
  std::uniform_int_distribution<int> dist{10, 100};

  ThreadPool<TinyImage> pool{2, ProcessImage};
  for (int i = 1; i <= 10; ++i) {
    pool.Submit(TinyImage{i, dist(rng)});
  }

  return 0;
}
```

However, the logic stays *exactly* the same! We still create worker threads that process our tasks in a loop using a queue and a condition variable. And this is the simplest possible working thread pool that we implemented from scratch!

### What if I don't have C++20?
But we used C++20 here, and the rest of this course using C++17, so for consistency, just in case we are stuck in a codebase that uses C++17 (or even C++11), let's see how we can achieve the exact same generic thread pool behavior without `std::jthread`, `std::stop_token`, and `std::condition_variable_any`. 

Let's first focus on the constructor and the member variables:
1. We change to using `std::condition_variable` and `std::thread`. This requires a different way of creating the worker threads: we now only pass the function that they run and here, because it is a member function, we also give it a pointer to an object to which this function belongs, `this` object in our case. Note how we don't have a stop token anymore and have to maintain our own custom shared variable, say, `shutting_down_` that serves the same purpose. 
2. The fact that we don't have a stop token anymore and that we use `std::condition_variable` has an influence on how we wait for the condition variable to be notified. So let's focus on that too. The `ProcessItems` function doesn't get the stop token anymore and so we change the `wait` call predicate to include our `shutting_down_` variable and change the check for leftover work after the wait is over.
3. Finally, we now need an explicit destructor that sets the `shutting_down_` flag and manually wakes up all threads using `cv_.notify_all()` to unblock their `wait` calls and then explicitly loop through our vector of `std::thread`s and joins them before they are finally destroyed.

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
struct TinyImage {
  int id{};
  int size{};
};

void ProcessImage(const TinyImage& image) {
  // Simulate some work. Its duration depends on the image's size.
  std::this_thread::sleep_for(std::chrono::milliseconds(image.size));
}

template <typename T> 
class ThreadPool {
 public:
  ThreadPool(size_t number_of_threads,
             std::function<void(const T&)> process_task)
      : process_task_{std::move(process_task)} {
    std::cout << "Starting " << number_of_threads << " background threads...\n";
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

  void Submit(T&& item) {
    {
      std::lock_guard lock{queue_mutex_};
      tasks_.push(std::move(item));
    }
    cv_.notify_one();
  }

 private:
  void ProcessItems() {
    while (true) {
      std::queue<T> local_items;
      {
        std::unique_lock lock{queue_mutex_};
        cv_.wait(lock, [this] { return !tasks_.empty() || shutting_down_; });
        if (shutting_down_ && tasks_.empty()) { break; }
        std::swap(local_items, tasks_);
      }

      while(!local_items.empty()) {
        const auto item = std::move(local_items.front());
        local_items.pop();
        process_task_(item);
      }
    }
  }

  std::queue<T> tasks_{};
  std::mutex queue_mutex_{};
  std::condition_variable cv_{};
  std::function<void(const T&)> process_task_{};
  bool shutting_down_ = false;
  std::vector<std::thread> worker_threads_{};
};
} // namespace

int main() {
  std::mt19937 rng{std::random_device{}()};
  std::uniform_int_distribution<int> dist{10, 100};

  ThreadPool<TinyImage> pool{2, ProcessImage};
  for (int i = 1; i <= 10; ++i) {
    pool.Submit(TinyImage{i, dist(rng)});
  }

  return 0;
}
```

So you see, there are not that many changes, but if we have the luxury of being able to use C++20s `std::jthread` we definitely should as it avoid quite some boilerplate code and potential bugs. 

## Summary
And with this, I believe that this is everything one needs to know to understand the basics of multithreading in C++! At least these examples are a simplified version of what I've seen in many production codebases. Have I missed some pattern that you've seen?

Anyway, as a short summary, I hope I could convince you that writing parallel code in C++ is not all that complex. Here are the key takeaways again:

- When faced with large tasks that have to run in the background, `std::async` seems to be the right tool.
- When needing to parallelize many small-ish operations over a large corpus of data, available ahead of time, the parallel algorithms should do the trick. Or the oneTBB library if more control is needed.
- Finally, when more flexibility is needed and when the data is loaded dynamically, a thread pool is something that people typically reach for.
- And don't forget to protect any shared mutable state with a mutex! Well, technically, there is the whole so-called "lock free" programming paradigm that avoids mutexes, but it is its own completely different can of worms which we won't talk about in this course.

And remember, as the very first thing, try to avoid parallel code altogether. In 90% of the cases, a sequential implementation is fast enough and avoids all the pitfalls of parallel programming!

<!-- And that's all for now! Feel free to watch this video about std::function if you need a refresher on callables in C++ or this one, which the algorithm recommends you to watch! Catch you in the next video! Bye! -->
