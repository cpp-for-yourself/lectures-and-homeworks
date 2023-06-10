#include <iostream>
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

int main() {
  Chatbot chatbot{};
  chatbot.Train({{"How much is 2 + 2?",
                  "What color is the sky?",
                  "What is the answer to life and everything?"},
                 {"4", "It depends", "42"}});
  const auto question = "Are you self aware?";
  std::cout << "Asking chatbot: " << question << std::endl;
  std::cout << "Chatbot answered: " << chatbot.GetAnswer(question).text
            << std::endl;
  return 0;
}
