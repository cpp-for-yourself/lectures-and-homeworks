---
marp: true
math: katex
theme: custom-theme
# paginate: true
footer: ![width:80px](images/C++ForYourselfIcon.png)
---

# Enumeration types

#### Today:
- What are enumeration types
- How to use them
- How **not** to use them

### 📺 Watch the related [YouTube video](https://youtu.be/4kZyQ-TwH00)!

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
# 🔼1️⃣1️⃣ Enumeration classes
- Store an **enumeration** of options
  <!--
  `CPP_SETUP_START`
  using BaseType = int;
  $PLACEHOLDER
  int main() {
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  enum class FoodOptions : BaseType { kPizza, kPasta, kSushi };
  enum class ChoicesEnum { kYay, kNay };
  ```
- By default `BaseType` is `int`, can be any other integral type
- Enums can have any number of options
- The options are fixed upon `enum` definition
- Options are assigned consequent numbers
- Mostly used to pick a path in a `switch` statement
- Use values as:
  `FoodOptions::kPizza`, `ChoicesEnum::kYay`, ...
- 🎨 Name enum types in `CamelCase`
- 🎨 Name enum values as constants: `kSomeConstant`

---
# Example
```cpp
#include <iostream>
#include <string>

enum class OutputChannel { kStdOut, kStdErr };

// Note that output_channel is passed by value!
void Print(OutputChannel output_channel, const std::string& msg) {
  switch (output_channel) {
    case OutputChannel::kStdOut:
      std::cout << msg << std::endl;
      break;
    case OutputChannel::kStdErr:
      std::cerr << msg << std::endl;
      break;
  }
}
int main() {
  Print(OutputChannel::kStdOut, "hello");
  Print(OutputChannel::kStdErr, "world");
  return 0;
}
```

---
# Explicit values
- By default enum values start from `0`
- We can specify **custom values** if needed
  <!--
  `CPP_SETUP_START`
  $PLACEHOLDER
  int main() {
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  enum class EnumType {
    kOption1 = 10,      // Decimal
    kOption2 = 0x2,     // Hexadecimal
    kOption3 = 0b101010 // Binary
  };
  ```
- :bulb: Most of the times enums are used with default values

---
# :scream: The olden days enum
- Before C++11 you would define an enum without `class`:
  <!--
  `CPP_SKIP_SNIPPET`
  -->
  ```cpp
  enum MyEnum{kValue1, kValue2};  // 😱 Don't do this in C++11
  ```
- Old enums can be implicitly converted to int:
- These enums are **not** scoped like the `class` ones
  ```cpp
  enum OldEnum{kValue1, kValue2};  // Really, don't use it.
  enum class NewEnum{kValue1, kValue2};
  int main() {
    const OldEnum old_value = kValue1; // Note no OldEnum:: prefix
    const int some_value = kValue1;
    const NewEnum new_value = NewEnum::kValue1;
    return 0;
  }
  ```
- ❓😱 Do you see an issue with this?
  <!--
  `CPP_SKIP_SNIPPET`
  -->
  ```cpp
  enum EnumDecision{kRight, kWrong};
  enum EnumSide{kLeft, kRight};
  ```
  <br>Try to compile this!

---


![bg](https://fakeimg.pl/1280x1024/226699/fff/?text=Good%20luck!&font=bebas)
