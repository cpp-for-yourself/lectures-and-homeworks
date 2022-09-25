---
marp: true
theme: custom-theme
footer: ![width:80px](images/C++ForYourselfIcon.png)
---

# Using namespaces
#### Namespaces
- Namespaces
- Using `using`

### 📺 Watch the related YouTube video! 

---
# Prerequisites:
- [Hello world dissection lecture](hello_world_dissection.md)
- [Variables of fundamental types](cpp_basic_types_and_variables.md)

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
# Namespaces

- Variables (and other stuff) can live in namespaces
- Namespaces are defined with the keyword `namespace`:
  <!--
  `CPP_SKIP_SNIPPET`
  -->
  ```cpp
  namespace cpp_course {
  // Variables, functions etc.
  }  // namespace cpp_course
  ```
- Namespaces can live within other namespaces:
  <!--
  `CPP_SKIP_SNIPPET`
  -->
  ```cpp
  namespace foo {
  namespace bar {
  // Variables, functions etc.
  }  // namespace bar
  }  // namespace foo
  ```
- 🎨 End with comment: `// namespace <name>` 
  (`clang_format` will take care of this)
- 🎨 Name them like variables in `snake_case` ([source](https://google.github.io/styleguide/cppguide.html#Namespace_Names))
- 🎨 Do not indent the code inside the namespace ([source](https://google.github.io/styleguide/cppguide.html#Namespace_Formatting))

---
# Namespaces have special scopes
- Variables in namespaces **don't** die at the end of their namespace scope
- They still die with the global scope
- Namespaces allow to "partition" the global scope
- This avoids clashes between variable names
```cpp
#include <cstdio>
namespace foo {
constexpr auto kConstant{42};
}  // namespace foo
namespace bar {
constexpr auto kConstant{23};
}  // namespace bar
int main() {
  std::printf("%d\n", foo::kConstant);
  std::printf("%d\n", bar::kConstant);
  return 0;
}
```

---
# Access variables in namespaces

- Access variables within a namespace normally
- Namespaces can repeat
- Access variables from outside of a namespace using the `::`
  ```cpp
  namespace cpp_course {
  constexpr auto kNumber{42};
  }  // namespace cpp_course

  namespace cpp_course {
  constexpr auto kAnotherNumber{kNumber};
  }  // namespace cpp_course

  int main() {
    constexpr auto number{cpp_course::kNumber};
    constexpr auto another_number{cpp_course::kAnotherNumber};
    return 0;
  }
  ```
--- 
# Use unnamed namespaces!
- ✅ Use **"unnamed" namespaces** in source files
  ```cpp
  namespace {
  constexpr auto kConstant{42};
  }  // namespace

  int main() {
    constexpr auto number{kConstant};
    return 0;
  }
  ```
- They are sometimes also called **"anonymous" namespaces**
- This generates a namespace with a unique name available only in this "translation unit" (aka source file)
- Also has "linkage" implications 
  (stay tuned for when we talk about `static`)
- Only use them in `.cpp`, `.cc` files, never in `.h`, `.hpp` etc.
  (stay tuned for when we talk about headers)

---
# Use `using` when needed
- `using` lifts a variable from its scope into the current scope
- Can be used from **any** scope
```cpp
namespace cpp_course {
constexpr auto kNumber{42};
constexpr auto kAnotherNumber{kNumber};
}  // namespace cpp_course

int main() {
  using cpp_course::kAnotherNumber;
  // Now kAnotherNumber is available in this scope!
  constexpr auto number{cpp_course::kNumber};
  constexpr auto another_number{kAnotherNumber};
  return 0;
}
```
- :x: **Don't** use from **global scope** (unless in a `cpp` file)
- :x: **Never** use `using namespace foo;` 
  😱 It's too permissive and  pollutes the current namespace! 

---

![bg](https://fakeimg.pl/1280x1024/226699/fff/?text=Good%20luck!&font=bebas)
