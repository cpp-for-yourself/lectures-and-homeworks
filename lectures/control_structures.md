---
marp: true
math: katex
theme: custom-theme
footer: ![width:80px](images/C++ForYourselfIcon.png)
---

# Control structures

#### Today:
- `if` statements and ternary operator
- Loops: `for` and `while`

### 📺 Watch the related [YouTube video](https://youtu.be/jzgTxosgGIA)! 

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
# If statement
<!--
`CPP_SETUP_START`
int main() {
  bool STATEMENT{};
  bool OTHER_STATEMENT{};
  $PLACEHOLDER
  return 0;
}
`CPP_SETUP_END`
-->
```cpp
if (STATEMENT) {
  // This is executed if STATEMENT == true
} else if (OTHER_STATEMENT) {
  // This is executed if:
  // (STATEMENT == false) && (OTHER_STATEMENT == true)
} else {
  // This is executed if neither is true
}
```
- Used to conditionally execute code
- All the `else` cases can be omitted if needed
- `STATEMENT` can be **any boolean expression**
- 💡 Curly brackets can be omitted for single-line statements
  <!--
  `CPP_SETUP_START`
  
  inline void DoThis(){}
  
  int main() {
    bool STATEMENT{};
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  if (STATEMENT)
    DoThis();
  ```
- 🎨 Always use curly brackets as it's harder to make a mistake
- ✅ Use `clang-format` to indent your code for you!

---
# Ternary operator

- There is a short-hand version of writing an if statement
- Let's look at an example
  <!--
  `CPP_SETUP_START`
  inline bool GetRandomTrueOrFalse() {return false;}
  inline void CallIfTrue() {}
  inline void CallIfFalse() {}
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  bool condition = GetRandomTrueOrFalse();
  condition ? CallIfTrue() : CallIfFalse();
  ``` 
- This is **equivalent** to the following `if` statement:
  <!--
  `CPP_SETUP_START`
  inline bool GetRandomTrueOrFalse() {return false;}
  inline void CallIfTrue() {}
  inline void CallIfFalse() {}
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  bool condition = GetRandomTrueOrFalse();
  if (condition) {
    CallIfTrue();
  } else {
    CallIfFalse();
  }
  ```
- ✅ You can use it for simple cases
- :x: Don't use for complex scenarios

---
# Switch statement
<!--
`CPP_SETUP_START`
constexpr int kConst1{42};
constexpr int kConst2{23};
inline int GetNumber() {return 42;}
int main() {
  $PLACEHOLDER
  return 0;
}
`CPP_SETUP_END`
-->
```cpp
const int statement = GetNumber();
switch(statement) {
  case kConst1:
    // This runs if statement == kConst1
    break;
  case kConst2:
    // This runs if statement == kConst2
    break;
  default:  // optional
    // This runs if no other options worked
    break;
}
```
- Used to conditionally execute code
- Can have many `case` statements
- `break` exits the `switch` block
- `statement` can be any integer-like type
- If you covered all cases, you don't need `default`

---
# Omitting the `break`
- If the `break` is omitted from a `case` we call it a **fallthrough**
- It means that the **next** case will be executed too
- ✅ Always use `[[fallthrough]]` [C++ attribute](https://en.cppreference.com/w/cpp/language/attributes) to annotate situation where you want a fallthrough 🔼1️⃣7️⃣
<!--
`CPP_SETUP_START`
constexpr int kConst1{42};
constexpr int kConst2{23};
int main() {
  $PLACEHOLDER
  return 0;
}
`CPP_SETUP_END`
-->
```cpp
// Somewhere in main
const int statement = 1;
switch (statement) {
case kConst1:
  // This runs if (statement == kConst1)
  [[fallthrough]];  // Explicitly fall through
case kConst2:
  // This runs if:
  // (statement == kConst2) or (statement == kConst1)
  break;
default:  // optional
  break;
}
```

---

# While loop
<!--
`CPP_SETUP_START`
int main() {
  bool STATEMENT{};
  $PLACEHOLDER
  return 0;
}
`CPP_SETUP_END`
-->
```cpp
while (STATEMENT) {
  // Loop while STATEMENT == true.
}
```
- Example `while` loop:
<!--
`CPP_SETUP_START`
inline int GetRandomBool() {return false;}
int main() {
  bool STATEMENT{};
  $PLACEHOLDER
  return 0;
}
`CPP_SETUP_END`
-->
```cpp
bool condition = true;
while (condition) {
  condition = GetRandomBool();
}
```
- Usually used when the exact number of iterations is unknown before-wise
- Easy to form an endless loop by mistake

---
# Do while loop
- Sometimes you want the first iteration to always run
- Use `do ... while();` construct for this!
  ```cpp
  #include <iostream>

  int main() {
    int number = 42;
    do {
      number--;
      std::cout << number << std::endl;
    } while (number != 0);
    return 0;
  }
  ```
- Notice that the check only happens _after_ the first iteration!
- 💡 This is not used very often


---


# For loop
<!--
`CPP_SETUP_START`
#define INITIAL_CONDITION int i = 0
#define END_CONDITION i < 42
#define INCREMENT ++i
int main() {
  $PLACEHOLDER
  return 0;
}
`CPP_SETUP_END`
-->
```cpp
for (INITIAL_CONDITION; END_CONDITION; INCREMENT) {
  // This happens until END_CONDITION == false
}
```
- Example `for` loop:
<!--
`CPP_SETUP_START`
int main() {
  const auto kIterationCount{100};
  $PLACEHOLDER
  return 0;
}
`CPP_SETUP_END`
-->
```cpp
for (int i = 0; i < kIterationCount; ++i) {
  // This happens kIterationCount times.
}
```
- In C++ `for` loops are _very_ fast. Use them!
- Use `for` when the number of iterations is known and `while` otherwise

---
# 🔼1️⃣1️⃣ Range for loop
- ✅ Iterate over a standard containers with simpler syntax: 
  `std::array`, `std::vector`, or even `std::map`, *etc*.
- Allows us to avoid mistakes with indices and shows intent
  <!--
  `CPP_SETUP_START`
  #include<vector>
  #include<iostream>
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  const std::vector<int> numbers{42, 23};
  for (const auto &number : numbers) {
    std::cout << number << std::endl;
  }
  ```
  <!--
  `CPP_SETUP_START`
  #include<map>
  #include<iostream>
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  const std::map<int, double> container{{42, 23.23}, {23, 42.42}};
  for (const auto &[key, value] : container) {
    std::cout << key << " " << value << std::endl;
  }
  ```
- 🚨 Make sure to use `&` to get a reference when iterating over containers. Otherwise, the data is copied, which is slow!
- :bulb: Modify data in the container by not using `const`
  Try it out on your own!

---
<!-- _footer: ![width:0px](images/C++ForYourselfIcon.png) -->


# Endless loops
![bg right contain](images/cats.gif)

- We can create loops that never end with both `while` and `for`
- ✅ `while` expresses the intent better
  <!--
  `CPP_SETUP_START`
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  while(true) {
    // Do this forever
  }
  ```
- Syntax for `for` is less obvious:
  <!--
  `CPP_SETUP_START`
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  for(;;) {
    // Do this forever
  }
  ```
  

---
# Exit loops and iterations
- We have control over loop iterations
- Use `continue` to skip to next iteration
- Use `break` to exit the loop
<!--
`CPP_SETUP_START`
int GetRandomInt() {return 42;}
$PLACEHOLDER
`CPP_SETUP_END`
-->
```cpp
#include <iostream>
int main() {
  while (true) {
    int i = GetRandomInt();
    if (i % 2 == 0) {
      std::cout << i << std::endl;
      continue;
    }
    break;
  }
}
```
---


![bg](https://fakeimg.pl/1280x1024/226699/fff/?text=Good%20luck!&font=bebas)