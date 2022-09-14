---
marp: true
theme: custom-theme
footer: ![width:80px](../lectures/images/C++ForYourselfIcon.png)
---

# The "hello world" program

Hello world program written in `hello.cpp` file just prints `Hello World!` to the terminal:
```c++
#include <stdio.h>

int main() {
    // We are trying to be friendly here!
    puts("Hello World!");
    return 0;
}
```
If we compile and run it we get the following:
```cmd
λ › c++ -std=c++17 -o hello hello.cpp
λ › ./hello
Hello World!
```

---
# Here is what we can learn from it

- [Some keywords](hello_world_dissection.md#some-words-and-symbols-are-more-special-than-other-🦄) like `return` or `int` _(and many more!)_
- Constants like `"Hello World!"` and `0`
- [Lots of whitespaces!](hello_world_dissection.md#whitespaces-mostly-play-no-role)
- [Different brackets:](hello_world_dissection.md#what-are-all-those-brackets-about)  `{}`, `()`, `<>`
- [Signs with special meaning:](hello_world_dissection.md#the--is-not-just-for-social-networks) `#`, `;`, `//`
- Includes like `#include <stdio.h>`
- [Functions](hello_world_dissection.md#functions-elevator-pitch) like `puts` and `main`

## Let's dig into all of these!
## 📺 Watch the related [YouTube video](https://youtu.be/t2h1geGSww4)! 

---
# Some words and symbols are more special than other 🦄
- In the code above, some words and symbols are highlighted
- This is done by **parsing** the language into meaningful parts
- Whitespaces and symbols **separate** these parts
- Some highlighted words are built-in and always the same:
  - `return` always marks an exit point from a function
  - `int` always represents an "integer number" type
  - See **all** C++ keywords at [`cppreference.com`](https://en.cppreference.com/w/cpp/keyword)
- Things like `"Hello World!"` and `0` are literal constants
- Other change their meaning depending on context, e.g. `puts` can appear elsewhere in the code and mean a different thing
- We will see many more of all of these later

---

<!-- _class: code_without_margins -->

# Whitespaces mostly play no role

If not inside of string constants like `"Hello World!"`
And not splitting key words or names of entities 🙌

#### All of the following programs are equivalent:

<div class="grid-container">
<div>

```C++
#include <stdio.h>

int      main() {
puts(   "Hello 🌍!"   )  ;

    return 0;
}
```
</div>

<div>

```C++
#include <stdio.h>




int main(){puts("Hello 🌍!");
return 0;}
```
</div>

<div>

```C++
#include <stdio.h>
int main() 
{puts(
             "Hello 🌍!"
    );
    return 0;
}
```
</div>

<div>


```C++
#include <stdio.h>
int main() {             puts
(
"Hello 🌍!");
return
0
;}
```
</div>
</div>

---

# Use clang-format tool to deal with this madness!

- 🤬 People tend to argue (a lot!) about how to style their code 
- 💡 Avoid long discussions by using a tool `clang-format`!

#### To style the `hello.cpp` do the following:

```cmd
λ › clang-format -i hello.cpp
```
This rewrites the original `hello.cpp` file with the styled version of itself

#### You can also tweak the style!
Just put a `.clang-format` file into a directory up the tree from your source files, here are the [possible settings](https://clang.llvm.org/docs/ClangFormatStyleOptions.html)

---
<!-- _class: center -->

# A "good" clang-format config

- 🤔 Different people will have different opinions here 
- ✅ This is the `.clang-format` file I use for my projects:
```yaml
---
Language: Cpp
BasedOnStyle: Google
AllowShortBlocksOnASingleLine: true
AllowShortCaseLabelsOnASingleLine: true
AllowShortFunctionsOnASingleLine: All
AllowShortLoopsOnASingleLine: true
AllowShortIfStatementsOnASingleLine: true
BinPackArguments: false
BinPackParameters: false
...
```

- 🤝 The most important thing is to have **a** format file in the project, regardless of which style it enforces 

---

# What are all those brackets about?
- `{}` are mostly used to:
  - Initialize variables
  - Define **"scopes"** `[stay tuned!]`
- `()` are mostly used for:
  - Arithmetic operations
  - For writing and calling functions
  - Sometimes for initializing variables `[older style]`
- `<>` are mostly used in:
  - Comparison operations
  - Includes `[stay tuned!]`
  - Templates `[later in the course]`

---

# The `#` is not just for social networks!

- In the C++ world, a line that starts with a `#` marks a **preprocessor directive**, e.g. `#include`
- Preprocessor is just a **text replacement tool**
- It is the **first** step of the full compilation process:
    <div class="mermaid" style="width: 100%" data-processed="true">
    %%{init: {'theme':'neutral',  'themeVariables': { 'fontSize': '30pt'}}}%%
    graph LR
        Preprocessor -->  Compilation --> Assembly --> Linker
    </div>
- We'll talk about the other steps later


--- 
# An example is worth a 1000 words

- An `#include` is just a _text_ substitution
- Let's compile `hello.cpp` with a flag `--save-temps`:
    ```cmd
    λ › c++ -std=c++17 -o hello --save-temps hello.cpp  
    ``` 
- This keeps a bunch of files, we care about `hello.ii`:
    ```cmd
    λ › tail -n 4 hello.ii
    int main() {
        puts("Hello 🌍!");
        return 0;
    }
    ```
- This file _ends_ with our program
- Above our code there is the contents of the `stdio.h` file
--- 

# Let's get #inclusive

- There are two ways to use `#include` (just a _convention_):
  - `#include "file"` - searches for the `file` first in the folder where the current source file lives
  - `#include <file>` - searches for the `file` first in the include path `[stay tuned]`
- `#include <file>` and `#include "file"` simply replace themselves with the content of the `file`
- `file` can be any file with any extension, but usually has extension `.h` or `.hpp`

---

# The `;` symbol

- There are multiple types of **statements** in C++
- We clearly can't rely on whitespaces to separate them
- So most *(but not all!)* statements require a `;` at the end
- Helps separate one statements from another
- We will learn which statements need a `;` in the future
- For now just prepare to type `;` _a lot!_ :wink:

---

# ~~No~~ comments 🙊

- Comments are statements that are relevant **only** to us
- Compiler **completely ignores** them
- Symbol `//` comments out the whole line
- Symbols `/*` and `*/` comment out everything between them
- Let's add comments to our example from before:
    ```c++
    int main() {
    // This is some important comment!
    return /* another comment here */ 0;
    }
    ```
- Compiling with `--save-temps` yields `hello.ii`:
    ```c++
    int main() {

      return 0;
    }
    ```

---
# Functions elevator pitch

- Functions help **encapsulate** and **decouple** functionality
- In the example above, `puts` is a function that prints a string `Hello World!` to screen
- A function like `puts` can easily be 100s of lines long
- `main` is a function too! And a special one at that :rainbow::unicorn:
- Exists in **every** C++ program - it's where the program starts!
- We can (and will!) write lots of our own functions
- Let's write one right now!

--- 
# The `PrintSmth` function
- This is **not** the most useful function in the world! 
- We also won't talk about a strict definition of what is a function here, we will cover it later
- We aim at building intuition here!

```c++
#include <stdio.h>

void PrintSmth() {
    puts("Smth");
}

int main() {
    PrintSmth();  // This is how to call it!
    return 0;
}
```

---

# What does it do? <br>(It's not very useful :shrug:)
- The function just calls `puts` with the text `"Smth"`
- But it _is_ our own function!
- And we can call it from the `main` function
- We have a new keyword here: `void`
- `void` stands for **"nothing"**
- In our case it means that the function returns nothing

---

![bg](https://fakeimg.pl/1280x1024/226699/fff/?text=Good%20luck!&font=bebas)
