#ifndef LECTURES_CODE_CLASS_HEADERS_CMAKE_PROJECT_CHATBOT_CHATBOT_HPP
#define LECTURES_CODE_CLASS_HEADERS_CMAKE_PROJECT_CHATBOT_CHATBOT_HPP

#include <string>
#include <vector>

class Chatbot {
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

  void Train(const Data &data);

  Answer GetAnswer(const std::string &question) const;

 private:
  void IngestData(const Data &data);

  int smartness_{};
};

#endif /* LECTURES_CODE_CLASS_HEADERS_CMAKE_PROJECT_CHATBOT_CHATBOT_HPP */
