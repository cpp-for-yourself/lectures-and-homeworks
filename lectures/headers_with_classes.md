Headers with classes
---

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/maxresdefault.jpg" alt="Video" align="right" width=50%></a>
</p>

We now know a thing or two about classes. We know how to implement them and understand how valuable they are to write safe and efficient code as well as the great benefits that they bring for readability and abstraction.

There is only one thing missing. We still can't properly use them in our CMake projects, largely because we don't know how to create a library that holds the code in some classes.

What we _do_ know is how to use functions in such a scenario. Are classes any different? And here I have good news for you - no, no they are not! In fact, the situation is very much alike to how we create a library out of functions! The differences are pretty minor.

## What stays the same
- We still **declare** stuff in a header (`*.hpp`) file
- We still **define** stuff in a source (`*.cpp`) file
- We still **create libraries** from these files
- We still must link against these libraries to use them

## What is different
- We now have data, not only methods, so we'll have to learn where it lands
- The definitions in the source file must show that they belong to a class
- Our methods also have some attributes, like the trailing `const` modifier. We must somehow deal with those

Let's see all of this in detail. As always, we will be looking at an example.

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
  void IngestData(const Data& data);

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
    return Answer{0.8, "Here is the answer!"};
  }
  return Answer{1.0, "You will regret this questions..."};
}

}  // namespace ai
```

This example is a bit simplistic, but showcases everything that we might encounter when splitting our classes between header and source files.

Notice how the declarations of the class itself, its data and its methods all belong in the header file.

Only the methods (and static data, stay tuned) need to be defined in the source file. When we define these, we must tell the compiler that we are defining not a free standing function, but one from a class, thus the `Ai::` prefix. Note also, that we have the `Ai::Answer` as a return type. For return types we have to also tell the compiler if they are part of some class, the `Ai` class in this example.
