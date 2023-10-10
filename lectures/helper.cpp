#include <iostream>

struct Helper {
  Helper(int number) {
    std::cout << "Create helper with number: " << number << std::endl;
  }
  ~Helper() { std::cout << "Destroy helper" << std::endl; }
  // 😱 Implement the rest for the rule of all or nothing!
};

Helper& GetHelper(int number) {
  // Will only be initialized when encountered for the first time
  static Helper helper{number};
  return helper;
}

int main() {
  auto& helper_1 = GetHelper(42);
  auto& helper_2 = GetHelper(23);
  std::cout << "Is same object: " << (&helper_1 == &helper_2) << std::endl;
}
