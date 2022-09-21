---
marp: true
math: katex
theme: custom-theme
footer: ![width:80px](images/C++ForYourselfIcon.png)
---

# Functions introduction

#### Today:
- What is a function
- Declaration and definition
- Passing by reference
- Overloading
- Using default arguments

### 📺 Watch the related [YouTube video](blah)! 

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
# Organize your code in Functions!
- Code can be organized into functions that look smth like this:
  ```cpp
  ReturnType DoSmth(ParamType1 in_1, ParamType2 in_2) {
    // Some awesome code here.
    return return_value;
  }
  ```
- Functions **create a [scope](1.2_cpp_basic_types_and_variables.md#all-variables-live-in-scopes)**
- A function is fully defined by its name and argument types
- There is a **single return value** from a function
- If the `ReturnType` is `void` --- no `return` is required
- 🎓‼️ [**Write short functions**](https://google.github.io/styleguide/cppguide.html#Write_Short_Functions) --- they must do **one thing only**
- 🎨 Name **must** show what the function does
- 🎨 Name functions in `CamelCase`
- 🎨 Use `snake_case` for all function arguments
- 🎨 Function name should have a verb in it

---
# ✅ Use `[[nodiscard]]` attribute
- 🔼1️⃣7️⃣ You can use it like this:
  ```cpp
  [[nodiscard]] double DoSmth(double input) { 
    return input * input; 
  }
  int main() { DoSmth(42.0); }
  ```
- Forces the output of the function to actually be used
- When we compile the above we get:
  ```cmd
  λ › c++ -std=c++17 -O3 -o test test.cpp  
  test.cpp:3:14: warning: ignoring return value of function 
  declared with 'nodiscard' attribute [-Wunused-result]
  int main() { DoSmth(2.0); }
              ^~~~~~ ~~~
  1 warning generated.
  ```
- No warning if result is actually used:
  ```cpp
  auto smth = DoSmth(42.0);
  ```
- Helps to avoid logical errors while programming

---
# Good function example
```cpp
#include <vector>
using std::vector;

[[nodiscard]] vector<int> 
CreateFibonacciSequence(std::size_t length) {
  // Vector of size `length`, filled with 1s.
  vector<int> result(length, 1);
  if (length < 3) { return result; }
  for (auto i = 2UL; i < length; ++i) {
    result[i] = result[i - 1UL] + result[i - 2UL];
  }
  return result;
}
int main() {
  const auto fibonacci_sequence = CreateFibonacciSequence(10UL);
  // Do something with fibonacci_sequence.
  return 0;
}
```
- ✅ Is small enough to see all the code at once
- ✅ Name clearly states what the function does
- ✅ Conceptually, does a single thing only

---
# :scream: Bad function example
```cpp
#include <vector>
using std::vector;

vector<std::size_t> Func(std::size_t a, bool b) {
  if (b) { return vector<std::size_t>(10, a); }
  vector<std::size_t> vec(a);
  for (auto i = 0UL; i < a; ++i) { vec[i] = a * i; }
  if (vec.size() > a * 2) { vec[a] /= 2.0f; }
  return vec;
}

int main() {
  const auto smth = Func(10, true);
  // Do smth with smth.
  return 0;
}
```
- :scream: It is **really** hard to understand what it does at a glance!
- :scream: Name of the function means nothing
- :scream: Names of variables mean nothing
- :scream: Function does not have a single purpose

---
# Declaration vs definition
- Function declaration can be separated from the implementation details
- Function **declaration** sets up an interface
- Function **definition** holds the implementation of the function that can even be hidden from the user (stay tuned)
  ```cpp
  void FuncName();  // Ends with a ";"

  // Somewhere further in the code.
  void FuncName() {
    // Implementation details.
    cout << "This function is called FuncName! ";
    cout << "Did you expect anything useful from it?";
  }
  ```
- The name, the argument types (including `&`, `const` etc.) 
  and the return type have to be **exactly** the same

---
# Passing big objects
- Objects are copied by default when passed into functions
  (the compiler can sometimes avoid the copy, stay tuned)
- If objects are big (i.e., **not** [fundamental](1.2_cpp_basic_types_and_variables.md#variables-of-fundamental-types)) copying is slow
- **Pass by reference** to avoid copying lots of data
  ```cpp
  void DoSmth(std::string huge_string);          // Slow.
  void DoSmthWithRef(std::string& huge_string);  // Faster.
  ```
- Is the string still the same?
  ```cpp
  std::string hello = "some_important_long_string";
  DoSmthWithRef(hello);
  ```
- :scream: **Unknown** without looking into `DoSmthWithRef` code!

---
![center width:800](images/pass_by_ref.gif)

I'll change the function `fillCup` to `Fill` in the examples

<div class="grid-container">
<div>

### Pass by reference:
- `void Fill(Cup &cup);`
- The object that `cup` references is full afterwards
  
</div>

<div>

### Pass by value:
- `void Fill(Cup cup);`
- A **copy** `cup` of the original object is full
- The original is still empty
  
</div>


---
# Solution: use const references
- Pass `const` reference to the function
- Great speed as we pass a reference
- Passed object stays intact, guaranteed!
  ```cpp
  void DoSmth(const std::string& huge_string);
  ```
- Non-`const` references are mostly used in older code written before C++11, often for performance reasons
- Most of the times these reasons do not hold in modern C++
- 🔼1️⃣1️⃣ Returning an object from function is **mostly** fast
- 🔼1️⃣7️⃣ Returning an object from function is **always** fast
- 🎓🎨 Avoid using non-`const` references, see [Google style](https://google.github.io/styleguide/cppguide.html#Inputs_and_Outputs)
- 💡 Sometimes passing by non-const reference is still faster than returning an object from a function 
  **Measure before doing this!**

---
# :scream: Never return a reference to a function-local object
- Objects created in a function live within its scope
- When function ends, all its variables die
- Returning a reference to a local object leads to UB:
  ```cpp
  int& ReallyNastyFunction() {
    int local_variable{};
    return local_variable;  // 😱 Don't do this!
  }
  ```
- Modern compilers will warn about it
- **Always** make sure your program compiles without warnings!


---
# Function overloading - writing functions with the same names
- Compiler infers which function to call from input arguments
- We cannot overload based on return type
- Return type is not part of the function signature
  ```cpp
  #include <iostream>
  #include <string>
  using std::cout;
  using std::endl;
  using std::string;
  string GetNames(int num) { return "int"; }
  string GetNames(const string& str) { return "string"; }
  string GetNames(int num, float other) { return "int_float"; }
  int main() {
    cout << GetNames(1) << endl;
    cout << GetNames("hello") << endl;
    cout << GetNames(42, 42.0F) << endl;
    return 0;
  }
  ```
- 🎓 [All overloads should do semantically the same thing](https://google.github.io/styleguide/cppguide.html#Function_Overloading)

---
# 🤔 Use default arguments?
- Only **set in declaration** not in definition
- **Pros:** simplify _some_ function calls
- **Cons:**
  - Evaluated upon every call
  - Values are hidden in declaration
  - Can lead to unexpected behavior when overused
  - Gets confusing when having overloaded functions
- 🎓 [Only use them when readability gets much better](https://google.github.io/styleguide/cppguide.html#Default_Arguments)


---
# Example: default arguments
```cpp
#include <iostream>
using std::string;
using std::cout;
using std::endl;
string SayHello(const string& to_whom = "world") {
  return "Hello " + to_whom + "!";
}
int main() {
  // 🤔 This is a good example how it can get confusing.
  cout << SayHello() << endl;
  cout << SayHello("students") << endl;
  return 0;
}
```

---


![bg](https://fakeimg.pl/1280x1024/226699/fff/?text=Good%20luck!&font=bebas)
