# Fortune teller program

Your task here is to implement a fortune teller program. It will receive some inputs from the user and will tell them which type of C++ programmer they are.

😅 If you get stuck, discuss it in [GitHub Discussions](https://github.com/orgs/cpp-for-yourself/discussions/categories/homeworks-q-a).

## Prerequisites
- [Fundamental types and variables](../../lectures/cpp_basic_types_and_variables.md)
- [I/O streams](../../lectures/io_streams.md)
- [Sequence containers](../../lectures/more_useful_types.md)
- [Associative containers](../../lectures/associative_containers.md)

If you get lost while submitting homework, just watch the [tutorial video](https://youtu.be/Nl0u04XgxGQ) again 😉

## Formal requirements

A C++ program that communicates with the user by using screams. It must:
1. Print a welcome statement: 
    ```
    Welcome to the fortune teller program!
    ```
2. Ask the user for their name: 
    ```
    Please enter your name:
    ```
3. Read the name that the user inputs into the terminal when the user presses <kbd>Enter</kbd>
4. Ask the user when they were born:
    ```
    Please enter the time of year when you were born:
    (pick from 'spring', 'summer', 'autumn', 'winter')
    ```
5. Ask for an adjective:
    ```
    Please enter an adjective:
    ```
    And read it from the terminal as the user presses <kbd>Enter</kbd>
6. Ask for another adjective:
    ```
    Please enter another adjective:
    ```
    And read it from the terminal as the user presses <kbd>Enter</kbd>
7. Print the fortune telling that is based on the inputs that the user provided. For example:
    ```
    Igor, the fearless STL guru that finds errors quicker than the compiler
    ```

## How to create the resulting message

You will construct the message following this pattern:
```
<NAME>, the <ADJECTIVE> <NOUN> that <ENDING>
```

### How to get `<NAME>`
You read the name directly from the user input from point 2. above.

### How to get `<ADJECTIVE>`
Read the two adjectives from the user inputs in 5. and 6. and store them in an array or vector. Use the modulo division by the size of the array of your adjectives on the length of the provided `<NAME>` to get an index that you can use to get an adjective from your array of adjectives

### How to get `<NOUN>`
That's where the information you got in 4. comes in handy. Use the time of year that the user provided as a key to get the noun from the following key/value pairs:
```
"spring" <-> "STL guru"
"summer" <-> "C++ expert"
"autumn" <-> "coding beast"
"winter" <-> "software design hero"
```

### How to get `<ENDING>`
Store these three values in an array:
```
"eats UB for breakfast"
"finds errors quicker than the compiler",
"is not afraid of C++ error messages"
```
Retrieve one of them following the same procedure as when getting the `<ADJECTIVE>` but modulo-divide by the size of this new array here

## Where to put the solution
- Work with **your fork** of the [homeworks](https://github.com/cpp-for-yourself/homeworks) repository
- Here is the folder structure for this homework with respect to your `homeworks` repository root:
  - `homeworks/`
    - `homework_2/`
      - `fortune_teller/`
        - `fortune_teller.cpp` <-- **put your code here!**

---
# Good luck! 🍀
