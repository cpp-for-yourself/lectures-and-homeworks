# The guessing game

Your task here is to implement a program that will generate a random number and ask the user to guess it. It will then output the number of guesses the user required to guess the number.

😅 If you get stuck, discuss it in [GitHub Discussions](https://github.com/orgs/cpp-for-yourself/discussions/categories/homeworks-q-a).

## Prerequisites
- Everything you needed for the [Homework 2](../homework_2/homework.md)
- [Control structures lecture](../../lectures/control_structures.md)
- [Random number generation](../../lectures/random_numbers.md)

If you get lost while submitting homework, just watch the [tutorial video](https://youtu.be/Nl0u04XgxGQ) again 😉

## Formal requirements

You will write a C++ program that communicates with the user by using screams. It must:
1. Print a welcome statement: 
    ```
    Welcome to the GUESSING GAME!
    I will generate a number and you will guess it!
    ```
2. Ask the user (and read the answer) for the **smallest** number of the allowed range: 
    ```
    Please provide the smallest number: 
    ```
3. Ask the user (and read the answer) for the **largest** number of the allowed range:
    ```
    Please provide the largest number: 
    ```
4. Generate the random number that the user will have to guess and write the message about it to `stdout`:
   ```
   I've generated a number. Try to guess it!
   ``` 
5. Ask the user for the next guess and read it:
    ```
    Please provide the next guess:
    ```
6. If the user gave a number which is **smaller** than the generated one print:
    ```
    Your number is too small. Try again!
    ```
    Then repeat from `5.`
7. If the user gave a number which is **larger** than the generated one print:
    ```
    Your number is too big. Try again!
    ```
    Then repeat from `5.`
8. If the user guessed the number, print:
    ```
    You've done it! You guessed the number N in K guesses!
    ```
    Here, `N` is the generated number, `K` is the number of attempts that the user needed to guess it.

Overall, the terminal will look something like this for the fully working program:
```
λ › ./guessing_game
Welcome to the GUESSING GAME!
I will generate a number and you will guess it!
Please provide the smallest number: 
1
Please provide the largest number: 
100
I've generated a number. Try to guess it!
Please provide the next guess: 50
Your number is too big. Try again!
Please provide the next guess: 25
Your number is too big. Try again!
Please provide the next guess: 10
Your number is too small. Try again!
Please provide the next guess: 11
You've done it! You guessed the number 11 in 8 guesses!
```

🚨 Note the difference in whitespaces for different inputs. It is important to match them **exactly** in order to submit the homework and have a ✅ for all tasks!

## What you need to implement this
You might have already guessed that this program will use some loops and conditional statements. You will have to play this game until the user guesses the correct number and stop the loop when they do.

You will also have to check if a certain situation occurs and stop the game then.

Don't forget that to start the game you will need to generate a random number in a given range.


## Where to put the solution
- Work with **your fork** of the [homeworks](https://github.com/cpp-for-yourself/homeworks) repository
- Here is the folder structure for this homework with respect to your `homeworks` repository root:
  - `homeworks/`
    - `homework_3/`
      - `guessing_game/`
        - `guessing_game.cpp` <-- **put your code here!**

---
# Good luck! 🍀
