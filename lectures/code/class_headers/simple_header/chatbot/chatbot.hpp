#pragma once

#include <string>
#include <vector>

class Chatbot {
 public:
  struct Answer {
    float probability{};
    std::string text{};
  };

  struct Data {
    bool IsValid() const { return questions.size() == correct_answers.size(); }

    std::vector<std::string> questions{};
    std::vector<std::string> correct_answers{};
  };

  void Train(const Data &data) {
    if (!data.IsValid()) { return; }
    IngestData(data);
  }

  Answer GetAnswer(const std::string &question) const {
    if (smartness_ < 1) { return Answer{0.1, "I don't know"}; }
    if (smartness_ < 5) { return Answer{0.8, "Yes."}; }
    if (question.length() > 10) {
      return Answer{1.0, "You will regret this question..."};
    }
    return Answer{1.0, "Can't you ask anything more important?"};
  }

 private:
  void IngestData(const Data &data) {
    smartness_ += data.correct_answers.size();
  }

  int smartness_{};
};
