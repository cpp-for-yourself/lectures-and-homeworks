---
marp: true
math: katex
theme: custom-theme
footer: ![width:80px](images/C++ForYourselfIcon.png)
---

# Sequence containers and friends

#### Variables of types from STL
**STL** stands for **S**tandard **T**emplate **L**ibrary
We're gonna talk about it a lot!

#### Today:
- `std::pair`
- `std::array`
- `std::vector` 
- `std::string`
- Aggregate initialization

### 📺 Watch the related [YouTube video](https://youtu.be/dwkSVkGsvFk)! 

---
# Prerequisites:
- [Variables of fundamental types](cpp_basic_types_and_variables.md)
- [Namespaces and using](namespaces_using.md)
- [Input output streams](io_streams.md)

---

# Disclaimer
- This lecture is beginner friendly 
- There are some best practices that would use different types, but those require more in-depth understanding and will be covered later
- What you see on this slide is the best practice **until this point** in the course 😉

---
# Special symbols used in slides
- 🎨 - Style recommendation
- 🎓 - Software design recommendation
- 😱 - **Not** a good practice! Avoid in real life!
- ✅ - Good practice!
- ❌ - Whatever is marked with this is wrong
- 🚨 - Alert! Important information!
- 💡 - Hint or a useful exercise
- 🔼1️⃣7️⃣ - Holds for this version of C++(here, 17) and **above**
- 🔽1️⃣1️⃣ - Holds for versions **until** this one C++(here, 11)

Style (🎨) and software design (🎓) recommendations mostly come from [Google Style Sheet](https://google.github.io/styleguide/cppguide.html) and the [CppCoreGuidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)

---
# Store value pairs in `std::pair`
- `#include <utility>` to use [`std::pair`](https://en.cppreference.com/w/cpp/utility/pair)
- Allows storing values of two types `std::pair<T1, T2>`
  <!--
  `CPP_SETUP_START`
  #include <utility>
  #include <string>
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  std::pair<int, std::string> pair{42, "The answer"};
  ```
- 🔼1️⃣7️⃣ The types will be guessed by the compiler:
  <!--
  `CPP_SETUP_START`
  #include <utility>
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  std::pair pair{42, "The answer"};
  ```
- Access the data with `.first` and `.second`
```cpp
#include <iostream>
#include <utility>

int main() {
  std::pair pair{"The answer", 42};
  std::cout << pair.first << " is " << pair.second << std::endl;
  return 0;
}
```

---

![bg](https://fakeimg.pl/1280x1024/226699/fff/?text=STL%0ASequence%0Acontainers&font=bebas)

---

# Use `std::array` for fixed size collections of items of same type
- 🔼1️⃣1️⃣ `#include <array>` to use [`std::array`](https://en.cppreference.com/w/cpp/container/array)
- 🚨 The size must be known at compile time
- Create from data: 
  🔼1️⃣7️⃣ `std::array arr = {1, 2, 3};` 
  🔼1️⃣7️⃣ `std::array arr{1, 2, 3};` 
  🔼1️⃣4️⃣ `std::array<int, 3UL> arr{1, 2, 3};` 
  🔼1️⃣1️⃣ `std::array<int, 3UL> arr = {1, 2, 3};` 
  1️⃣1️⃣ `std::array<int, 3UL> arr{{1, 2, 3}};` 
  - In the newer standards, compiler guesses type and size
  - 🚨 Beware of double brackets in `C++11`!

---

# Access elements in an array
- Check if container is empty with `arr.empty()`
- Get number of stored values with `arr.size()`
- Indexing from `0UL` up to `arr.size() - 1UL`
- Get element by index **without bound check** with `[index]`
  🚨 Make sure the element exists! **UB otherwise!**
- Get element by index **with bound check** with `.at(index)`
- Useful access aliases:
  - First item: `arr.front()` $\Leftrightarrow$ `arr[0UL]`
  - Last item: `arr.back()` $\Leftrightarrow$ `arr[arr.size() - 1UL]`
  ```cpp
  #include <array>
  #include <iostream>
  int main() {
    const std::array arr{1, 2, 3};
    std::cout << arr[0] << " " << arr.back() << std::endl;
    return 0;
  }
  ```
---

# Use `std::vector` when number of items is unknown before-wise
- `#include <vector>` to use [`std::vector`](https://en.cppreference.com/w/cpp/container/vector)
- Vector is implemented as a [**dynamic table**](https://en.wikipedia.org/wiki/Dynamic_array)
- Create similarly to the `std::array`:
  - 🔼1️⃣7️⃣ `std::vector vec{1, 2, 3};` 
  - 🔼1️⃣7️⃣ `std::vector vec = {1, 2, 3};` 
  - 🔼1️⃣1️⃣ `std::vector<int> vec{1, 2, 3};` 
  - 🔼1️⃣1️⃣ `std::vector<int> vec = {1, 2, 3};` 
- Access stored elements just like in `std::array`
  **But** we can also change the accessed values!
- ✅ Use `std::vector` a lot! It is **fast and flexible**!
- 💡 Think of it as a **default** container to store items
- 🚨 Cannot be `constexpr` (🔽2️⃣0️⃣)

---

# Modify contents of vectors
- Remove all elements: `vec.clear()`
- Add a new item in one of two ways:
  - 🔼1️⃣1️⃣ `vec.emplace_back(value)`
  - `vec.push_back(value)` - historically better known
- Resize vector with `vec.resize(new_size)`
  - If `new_size` is smaller than `vec.size()` the elements at the end of the vector will be destroyed
  - Otherwise, new uninitialized elements will be added
    Use `vec.resize(new_size, value)` to initialize them
- Remove last element with `vec.pop_back()`
  🚨 Make sure vector is not empty! **UB otherwise!**
- There are other ways to insert/remove elements, stay tuned
---

# Optimize vector resizing
- Adding elements to `std::vector` changes its size
- Changing size _might_ allocate memory, **which is slow**
- If we expect to add elements often, we can optimize!
- `reserve(n)` allocates enough memory to store `n` items but **does not change** the `size()` of the vector
- This is a very **important optimization**
- Do it if you know (even just approximately) the number of elements you plan to add in advance
  <!--
  `CPP_SETUP_START`
  #include <vector>
  #include <string>
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  // Somewhere in some function
  std::vector<std::string> vec;
  const int number_of_iterations = 100;
  // Always call reserve when you know the size.
  vec.reserve(number_of_iterations);
  for (int i = 0; i < number_of_iterations; ++i) {
    vec.emplace_back("hello");
  }
  ```


---

# Example usage of `std::vector`
```cpp
#include <iostream>
#include <string>
#include <vector>

using std::cout;
using std::endl;
using std::string;
using std::vector;

int main() {
  const vector numbers = {1, 2, 3};
  vector<std::string> jedi = {"Yoda", "Anakin"};
  jedi.reserve(jedi.size() + 1UL); // 💡optional
  jedi.push_back("Obi-Wan");
  cout << "Some Jedi: " << jedi.front() << endl;
  cout << "Last number: " << numbers.back() << endl;
  return 0;
}
```

---

# Strings are vectors of chars
- `#include <string>` to use [`std::string`](https://en.cppreference.com/w/cpp/string/basic_string)
- Access contents just like in vectors or arrays
- Concatenate strings with `+`
- `using std::string_literals::operator""s;`
  allows to use an `s` string literal suffix (like `f` for `float`)
```cpp
#include <iostream>
#include <string>
int main() {
  using std::string_literals::operator""s;
  const std::string hello = "Hello"s;
  std::cout << "Type your name:" << std::endl;
  std::string name{}; // Init empty
  std::cin >> name;   // Read name
  std::cout << hello + ", "s + name + "!"s << std::endl;
  std::cout << "Name length is: " << name.size() << std::endl;
  return 0;
}
```
- 🚨 Not available at compile time, cannot be `constexpr`

---

# Converting to and from strings

- Use [`std::to_string`](https://en.cppreference.com/w/cpp/string/basic_string/to_string) to convert variables of fundamental types to `std::string`
- Use `std::sto[i|d|f|ul]` etc. to convert from strings:
  - [`std::stoi`](https://en.cppreference.com/w/cpp/string/basic_string/stol) --- `std::string` $\rightarrow$ `int`
  - [`std::stof`](https://en.cppreference.com/w/cpp/string/basic_string/stof) --- `std::string` $\rightarrow$ `float`
  - [`std::stod`](https://en.cppreference.com/w/cpp/string/basic_string/stof) --- `std::string` $\rightarrow$ `double`
  - [`std::stoul`](https://en.cppreference.com/w/cpp/string/basic_string/stoul) --- `std::string` $\rightarrow$ `unsigned long`
  - There are more flavors (click the links :wink:)
<!--
`CPP_SETUP_START`
#include <string>
int main() {
  $PLACEHOLDER
  return 0;
}
`CPP_SETUP_END`
-->
```cpp
// Somewhere in some function
const int starting_number{42};
const std::string some_string{std::to_string(starting_number)};
int recovered_number{std::stoi(some_string)};
// It will even ignore the text after the number!
int another_number{std::stoi("42 is the number")};
// Try it with other types and negative numbers too!
```

---

# 🚨 Some related caveats

- Technically `std::string` is not a sequence container
- Be careful when creating containers with strings:
  **Reason:** compiler will use C-style `char` arrays instead of `std::string` as a storage type
- 💡 `std::vector` has a special 2-element constructor:
  <!--
  `CPP_SETUP_START`
  #include <vector>
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  const std::size_t size{10};
  const int content{42};

  // Creates a vector of 10 elements and fills it with value 42
  // 🚨 Note the round brackets! 🚨
  const std::vector vec_full_of_42(size, content);

  // 🚨 Using curly brackets creates vector with elements {10, 42}
  const std::vector vec_10_and_42{size, content}; 
  ```
- ❌ `std::vector<bool>` is **weird**!
  **Reason:** it does _not_ behave like a `vector`, which is confusing
  Use only if you know that you're doing (probably don't)

---
# 🔼1️⃣7️⃣ Aggregate initialization 
- Used to initialize multiple variables at the same time
- 🚨 We **must** use `auto`
- Also supports `const` and references (`&`)
- Example with `std::array`:
  <!--
  `CPP_SETUP_START`
  #include <array>
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  const std::array arr{1, 2, 3};
  // Initialize a = 1, b = 2, c = 3
  const auto [a, b, c] = arr;
  ```
- Example with `std::pair`:
  <!--
  `CPP_SETUP_START`
  #include <utility>
  #include <string>
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  using std::string_literals::operator""s;
  const std::pair pair{"Hello"s, "World"s};
  // Initialize hello = "Hello", world = "World"
  const auto& [hello, world] = pair;  // Note the &
  ```
---
# Other sequence containers
- There are more containers:
  - `std::deque` (we might cover later)
  - `std::list`
  - 🔼1️⃣1️⃣ `std::forward_list`
- The _can_ be useful but are a lot less often used
- I don't remember the last time I used `std::list` 🤷
- I'll leave lists for you to figure out on your own (later)

---

![bg](https://fakeimg.pl/1280x1024/226699/fff/?text=Good%20luck!&font=bebas)