---
marp: true
math: katex
theme: custom-theme
paginate: true
# footer: ![width:80px](images/C++ForYourselfIcon.png)
---

# Functions introduction

#### Today:
- What is a function
- Declaration and definition
- Passing by reference
- Overloading
- Using default arguments

### 📺 Watch the related [YouTube video](https://youtu.be/RaSw0g2aPig)! 

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
# Function help organize the code
- Functions look smth like this:
  <!--
  `CPP_SETUP_START`
  using ReturnType = int;
  using ParamType1 = int;
  using ParamType2 = int;
  constexpr auto return_value{42};
  $PLACEHOLDER
  int main() {
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  ReturnType DoSmth(ParamType1 in_1, ParamType2 in_2) {
    // Some awesome code here.
    return return_value;
  }
  ```
- We can then call such a function as follows:
  <!--
  `CPP_SETUP_START`
  constexpr auto param1{42};
  constexpr auto param2{42};
  int DoSmth(int a, int b) {return a+b;}
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  const auto smth = DoSmth(param1, param2);
  ```
- Functions **split** execution into logical chunks
- They **bundle common functionality** together
- They also keep the overall project code **readable**
- 🎓 You might have heard about the [**DRY**](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) principle:
  - Stands for **D**on't **R**epeate **Y**ourself
  - Impossible without functions in C++
---
# Some technical details
- Functions **create a [scope](cpp_basic_types_and_variables.md#all-variables-live-in-scopes)**
- A function is fully defined by:
  - Its name
  - Its return type
  - Its parameter types
  - Qualifiers (more on this later)
- There is a **single return value** from a function
- There can be multiple `return` statements in a function
- The function stops when a `return` statement is reached
- If the return type is `void` --- no explicit `return` required

---
# How to write good functions
- 🎓🚨 [**Write short functions**](https://google.github.io/styleguide/cppguide.html#Write_Short_Functions) --- they must do **one thing only**
- :bulb: If your function has too many parameters, think if it does too much! You might want to split it into multiple functions!
- 🎨 Function name should describe an action
- 🎨 Name must clearly state **what the function does**
- 🎨 Name functions in `CamelCase`
- 🎨 Use `snake_case` for all function arguments


---
# ✅ Use `[[nodiscard]]` attribute
- 🔼1️⃣7️⃣ You can use it like this:
  ```cpp
  [[nodiscard]] double SquareNumber(double input) { 
    return input * input; 
  }
  int main() { SquareNumber(42.0); }  // ❌ generates warning
  ```
- Forces the output of the function to actually be used
- When we compile the above we get:
  ```css
  λ › c++ -std=c++17 -O3 -o test test.cpp  
  test.cpp:3:14: warning: ignoring return value of function 
  declared with 'nodiscard' attribute [-Wunused-result]
  int main() { SquareNumber(2.0); }
              ^~~~~~ ~~~
  1 warning generated.
  ```
- No warning if result is actually used:
  <!--
  `CPP_SETUP_START`
  [[nodiscard]] double SquareNumber(double input) { 
    return input * input; 
  }
  int main() {
    $PLACEHOLDER
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  const auto smth = SquareNumber(42.0);
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
- :scream: Names of the variables mean nothing
- :scream: Function does not have a single purpose

---
# Declaration vs definition
- Function declaration can be separated from the implementation details
- Function **declaration** sets up an interface
- Function **definition** holds the implementation of the function that can even be hidden from the user (stay tuned)
  <!--
  `CPP_SETUP_START`
  #include<iostream>
  using namespace std;
  $PLACEHOLDER
  int main() {
    return 0;
  }
  `CPP_SETUP_END`
  -->
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
- **Quick for small objects** (e.g., [fundamental](cpp_basic_types_and_variables.md#variables-of-fundamental-types) types)
- **Slow for bigger objects** (usually any other type)
- ✅ **Pass bigger objects by reference** to avoid copying!
  <!--
  `CPP_SETUP_START`
  #include <string>
  $PLACEHOLDER
  int main() {
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  void DoSmthSmall(float number);                // Ok ✅
  void DoSmthBig(std::string huge_string);       // Slow 😱
  void DoSmthWithRef(std::string& huge_string);  // Faster
  ```

---
# What is passing by reference?

![center width:800](images/pass_by_ref.gif)

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
</div>

---
# Do you see any problems?
Is the string `hello` still the same after calling the function?
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
void DoSmthWithRef(std::string& huge_string);
// Then somewhere in some function
std::string hello = "some_important_long_string";
DoSmthWithRef(hello);
// 🤔 Is hello the same here?
```

<div class="grid-container">
<div>

### Could be the same:
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
void DoSmthWithRef(hello) {
  print(hello);
}
```

</div>

<div>

### Could be changed:
<!--
`CPP_SKIP_SNIPPET`
-->
```cpp
void DoSmthWithRef(hello) {
  hello.clear();
}
```
  
</div>
</div>

### 😱 Value of `hello` unknown without reading the function implementation!

---
# Solution: use const references
- Pass a `const` reference to the function!
- Great speed as we pass a reference
- Passed object stays intact, guaranteed because it's `const`!
  <!--
  `CPP_SETUP_START`
  #include <string>
  $PLACEHOLDER
  int main() {
    return 0;
  }
  `CPP_SETUP_END`
  -->
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
  <!--
  `CPP_SETUP_START`
  $PLACEHOLDER
  int main() {
    return 0;
  }
  `CPP_SETUP_END`
  -->
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
- Compiler infers which function to call from input parameters
- We cannot overload based on return type
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
- Default parameters have a default value:
  <!--
  `CPP_SETUP_START`
  $PLACEHOLDER
  int main() {
    return 0;
  }
  `CPP_SETUP_END`
  -->
  ```cpp
  void DoSmth(int number = 42);
  ```
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
