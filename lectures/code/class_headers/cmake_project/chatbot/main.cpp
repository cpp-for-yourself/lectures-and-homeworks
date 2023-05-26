#include <chatbot/chatbot.hpp>
#include <iostream>

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
