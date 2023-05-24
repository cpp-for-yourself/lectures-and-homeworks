Headers with classes
---

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50%></a>
</p>

We now know a thing or two about classes. We know how to implement them and understand how valuable they are to write safe and efficient code as well as the great benefits that they bring for readability and abstraction.

There is only one thing missing. We still can't properly use them in our CMake projects, largely because we don't know how to create a library that holds the code that lives in classes.

What we _do_ know is how to use functions in such a scenario. Are classes any different? And here I have good news for you - no, no they are not! In fact, the situation is very much alike to how we create a library out of functions! The differences are pretty minor.

# What stays the same
Lots of things stay exactly as we had them before:
- We still **declare** stuff in a header (`*.hpp`) file
- We still **define** stuff in a source (`*.cpp`) file
- We still **create static, shared or header-only libraries** from these files
- We still use these libraries just like before. For a refresher, see [headers and libraries lecture](headers_and_libraries.md)

# What is different
That being said, some things _are_ different.
- We now have data, not only methods, so we'll have to learn where it lands
- The definitions in the source file must show that they belong to a class
- Our methods also have some attributes, like the trailing `const` modifier. We must somehow deal with those

# The `AI` illustrative example
Let's see all of this in detail. As always, we will be looking at an example. As the various AI models are so popular now, we'll write a very stupid one :wink:

Largely speaking any AI system is just a black box that "trains" by looking at lots of training data, storing them in some internal representation and then using this representation to work with new unseen test data.

Given that, our "chatbot" is a class and has the following interface:
- It returns us an `Answer` through a method `GetAnswer` that gets a question as an `std::string` parameter
- In order to be able to answer us we would have to train it, so it must be able to ingest some training `Data` into a method `Train` and do some magic to become smarter

That's about all the interface we need here. Now we would have to fill in some details:
- The `Answer` is going to be a very simple struct holding the actual answer and its probability (here is how you know our example is fictional, no chatbot is going to provide this to you anytime soon). Oh, and we can put this struct to be class-internal for our `Ai` class.
- The `Data` is also going to be a class-internal struct with its own data in the form of questions and correct answers to them as well as some function to check its validity. I know it should be a class, but let's just stick with struct here for simplicity.
- The `Ai` class must have some internal parameters that we train with our `Train` function and that influence its answers. We will just call it `smartness` of our system and represent it as an `int` :shrug: What? I did promise a _very_ stupid chatbot. :wink:
- We need some implementation for all of the methods we discussed above. The implementation is going to be really trivial, this is a lecture about C++, not machine learning after all.

Finally, we need a `main` function to test that the bot does something.

Putting it all together, we get a class that looks something like this:

`chatbot.cpp`:
```cpp
#include <string>
#include <vector>

class Ai {
public:
  struct Answer {
    float probability{};
    std::string text{};
  };

  struct Data {
    bool IsValid() const {
      return questions.size() == correct_answers.size();
    }

    std::vector<std::string> questions{};
    std::vector<std::string> correct_answers{};
  };

  void Train(const Data& data) {
    if (!data.IsValid()) { return; }
    IngestData(data);
  }

  Answer GetAnswer(const std::string& question) const {
    if (smartness_ < 1) {
      return Answer{0.1, "I don't know"};
    }
    if (smartness < 5) {
      return Answer{0.8, "Yes."};
    }
    return Answer{1.0, "You will regret this question..."};
  }

private:
  void IngestData(const Data& data);

  int smartness_{};
};

int main() {
  Ai ai{};
  ai.Train({{"How much is 2 + 2?", "What color is the sky?", "What is the answer to life and everything?"}, {"4", "It depends", "42"}});
  std::cout << "Ai answered: " << ai.GetAnswer("Are you self aware?") << std::endl;
  return 0;
}
```

This example is a bit simplistic (again, do run it on your own!), but covers quite a few things that can happen within a class. It has classes and structs declared inside of it, it has methods and data and some of the methods are even `const`.

Fow now we have it all in one file that we can easily compile. But what if we want to be serious about our development and make a library out of our `Ai` class that we can use from our CMake project? Well, we'll have to split our current file into a header and a source file with a separate file for the `main` function, [just as we did for functions](headers_and_libraries.md).

So what is it that we _actually_ have to do? Let's start by figuring out which parts of our class belong in a header file. We'll illustrate this by renaming our `chatbot.cpp` into `ai.hpp`, dropping the `main` function for now and adding an `ai.cpp` file that will have all of the implementation details.

Just as with functions we must start with adding an include statement at the top.

Generally speaking, only the methods (and static data, stay tuned) need to be defined in the source file. When we define these, we must tell the compiler that we are defining not a free standing function, but one from a class, thus the `Ai::` prefix. Note also, that we have the `Ai::Answer` as a return type. For return types we have to also tell the compiler if they are part of some class, the `Ai` class in this example. Let's do that right now. We remove all the implementation from the header files and make them pure declarations. These then appear in the source file with the class prefix before them. Note how it also works for all the classes inside of our `Ai` class.

Also note how the `const` postfix in functions that need it is present in _both_ the header and the source file.

And that's it. Now we just need to create a `CMakeLists.txt` file, create a library in it and link it to a binary that has the `main` function in it.


`ai.hpp`:
```cpp
#pragma once

namespace ai {

class Ai {
public:
  struct Answer {
    float probability{};
    std::string text{};
  };

  struct Data {
    bool IsValid() const;

    std::vector<std::string> questions{};
    std::vector<std::string> correct_answers{};
  };

  void Train(const Data& data);

  Answer GetAnswer(const std::string& question) const;

private:
  void IngestData(const Data& data) {
    // Do something smart with the data.
    smartness_ += data.correct_answers.size();
  }

  int smartness_{};
};

}  // namespace ai
```

`ai.cpp`:
```cpp
#include <ai/ai.hpp>

namespace ai {

bool Ai::Data::IsValid() const {
  return questions.size() == correct_answers.size();
}

void Ai::Train(const Data& data) {
  if (!data.IsValid()) { return; }
  IngestData(data);
}

void Ai::IngestData(const Data& data) {
  // Do something smart with the data.
  smartness_ += data.correct_answers.size();
}

Ai::Answer Ai::GetAnswer(const std::string& question) const {
  if (smartness_ < 10) {
    return Answer{0.1, "I don't know"};
  }
  if (smartness < 100) {
    return Answer{0.8, "Do it now!"};
  }
  return Answer{1.0, "You will regret this question..."};
}

}  // namespace ai
```
