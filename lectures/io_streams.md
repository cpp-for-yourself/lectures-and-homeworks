---
marp: true
theme: custom-theme
footer: ![width:80px](images/C++ForYourselfIcon.png)
---

# I/O streams

#### Streams are part of STL
**STL** stands for **S**tandard **T**emplate **L**ibrary
We're gonna talk about it a lot!

### 📺 Watch the related [YouTube video](https://youtu.be/hy3eOpZmxbY)! 

---
# Prerequisites:
- Working with terminal
- [Hello world dissection](hello_world_dissection.md)
- [Variables of fundamental types](cpp_basic_types_and_variables.md)

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
# I/O streams for input and output

- Handle `stdin`, `stdout` and `stderr`:
  - `std::cin` --- maps to `stdin`
  - `std::cout` --- maps to `stdout`
  - `std::cerr` --- maps to `stderr`
- `#include <iostream>` to use I/O streams
- Easier to use than `std::printf` but slower
- 💡 We will cover a better way for logging in the future but streams are totally good enough for now 👌

```cpp
#include <iostream>
int main() {
  int some_number{};
  std::cin >> some_number;
  std::cout << "number = " << some_number << std::endl;
  std::cerr << "boring error message" << std::endl;
  return 0;
}
```
---

![bg](https://fakeimg.pl/1280x1024/226699/fff/?text=Good%20luck!&font=bebas)