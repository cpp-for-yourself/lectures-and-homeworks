---
marp: true
math: katex
theme: custom-theme
footer: ![width:80px](images/C++ForYourselfIcon.png)
---

# Random number generation

#### Today:
- How to generate random numbers in modern C++
- What's wrong with `rand()`

### 📺 Watch the related [YouTube video](https://youtu.be/IUoqMTGGo6k)! 

---
# Special symbols used in slides
- 🎨 - Style recommendation
- 🎓 - Software design recommendation
- 😱 - **Not** a good practice! Avoid in real life!
- ✅ - Good practice!
- ❌ - Whatever is marked with this is wrong
- 🚨 - Alert! Important information!
- 💡 - Hint or a useful exercise
- 🔼1️⃣7️⃣ - Holds for this version of C++(here, `17`) and **above**
- 🔽1️⃣1️⃣ - Holds for versions **until** this one C++(here, `11`)

Style (🎨) and software design (🎓) recommendations mostly come from [Google Style Sheet](https://google.github.io/styleguide/cppguide.html) and the [CppCoreGuidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)

---
# What are random numbers?
[![bg 60%](images/random_number.png)](https://xkcd.com/221/)

---
# What are random numbers?
- Random numbers should be **hard to predict**
  (under the definition of *"hard"*)
- Mostly, we generate **pseudo-random** numbers instead
- There are multiple algorithms for this:
  - **[Linear congruential generator](https://en.wikipedia.org/wiki/Linear_congruential_generator)** - Fast and small storage
  - **[Lagged Fibonacci generator](https://en.wikipedia.org/wiki/Lagged_Fibonacci_generator)** - Very fast, uses more storage
  - **[Mersenne Twister](https://en.wikipedia.org/wiki/Mersenne_Twister)** - Slower, uses more storage but generates very high quality pseudo random numbers
- We will **not** go into details here!
- If you want to learn more, you can:
  - Read a book [Random Numbers and Computers](https://link.springer.com/book/10.1007/978-3-319-77697-2) 
  - Read this [technical report](https://www.pcg-random.org/pdf/hmc-cs-2014-0905.pdf) for a slightly advanced intro

---
# But how do I use it?
- 🔼1️⃣1️⃣ Include `<random>`
- ✅ There is a great [summary of pseudo random number generation on cppreference.com](https://en.cppreference.com/w/cpp/numeric/random)
- Implements **all** the algorithms listed on previous slide
- Here is a summary of how it works:
  1. We need a **"random device"** that is our source of non-deterministic uniform (maybe pseudo-) random numbers
  2. We pass this device into a **"random number engine"** from the previous slide
  3. We pass this engine into a **"random number distribution"** which generates the resulting numbers we want

---
# Let's see it in practice
```cpp
#include <iostream>
#include <random>

int main() {
  std::random_device random_device;
  std::mt19937 random_engine{random_device()};
  std::uniform_real_distribution distribution{23.0, 42.0};
  for (auto i = 0; i < 5; ++i) {
    std::cout << distribution(random_engine) << std::endl;
  }
  return 0;
}
```
This gives an output that looks smth like this:
```
33.9856
30.8976
40.8357
37.9964
27.8459
```

---
# What's wrong with `rand()`?
- It is available from the `<cstdlib>` header
- [`rand()`](https://en.cppreference.com/w/cpp/numeric/random/rand) is a C function (**not** C++) 
- The only option before `C++11`
- :scream: Let's see how it's typically used:
  <!--
  `CPP_SETUP_START`
  #include <cstdlib>
  constexpr static int seed{};
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  // Somewhere in main
  std::srand(seed);  // Initialize random seed
  int random_variable = std::rand();
  ```
- :scream: It uses global state (seed is set globally)
- The **quality** of the generated random sequence is not guaranteed
- ✅ Always use methods from `<random>` instead!

---
![bg](https://fakeimg.pl/1280x1024/226699/fff/?text=Good%20luck!&font=bebas)