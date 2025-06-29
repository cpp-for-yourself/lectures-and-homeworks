// For simplicity, I don't use actual abseil here as it would require CMake
// which would complicate this example.
#define CHECK_GE(expr, value)
#define CHECK_LT(expr, value)

#include <algorithm>
#include <expected>
#include <format>
#include <iostream>
#include <utility>
#include <vector>

struct ChangeEntry {
  int index{};
  int value{};
};

class Game {
 public:
  Game(std::vector<int>&& ref_numbers,
       std::vector<int>&& player_numbers,
       int budget)
      : ref_numbers_{std::move(ref_numbers)},
        player_numbers_{std::move(player_numbers)},
        budget_{budget} {}

  void Print() const {
    std::cout << "Budget: " << budget_ << std::endl;
    std::cout << "Reference numbers: ";
    for (auto number : ref_numbers_) { std::cout << number << "\t"; }
    std::cout << std::endl;
    std::cout << "Player numbers:    ";
    for (auto number : player_numbers_) { std::cout << number << "\t"; }
    std::cout << std::endl;
  }

  bool CheckIfPlayerWon() const {
    int win_loss_counter{};
    for (auto i = 0UL; i < player_numbers_.size(); ++i) {
      const auto difference = player_numbers_[i] - ref_numbers_[i];
      if (difference > 0) win_loss_counter++;
      if (difference < 0) win_loss_counter--;
    }
    return win_loss_counter > 0;
  }

  void ChangePlayerNumberIfPossible(const ChangeEntry& change_entry) {
    // Checking:
    //   (change_entry.index >= 0)
    //   (change_entry.index < player_numbers_.size())
    CHECK_GE(change_entry.index, 0);
    CHECK_LT(change_entry.index, player_numbers_.size());
    auto& player_number = player_numbers_[change_entry.index];
    const auto difference = std::abs(change_entry.value - player_number);
    if (difference > budget_) { return; }
    player_number = change_entry.value;
    budget_ -= difference;
  }

  const std::vector<int>& ref_numbers() const { return ref_numbers_; }
  const std::vector<int>& player_numbers() const { return player_numbers_; }
  bool UserHasBudget() const { return budget_ > 0; }

 private:
  std::vector<int> ref_numbers_{};
  std::vector<int> player_numbers_{};
  int budget_{};
};

// Requires C++23
std::expected<ChangeEntry, std::string> GetNextChangeEntryFromUser(
    const Game& game) {
  game.Print();
  ChangeEntry entry{};
  std::cout << "Please enter number to change: ";
  std::cin >> entry.index;
  if ((entry.index < 0) || (entry.index >= game.player_numbers().size())) {
    return std::unexpected(std::format("Index {} must be in [0, {}) interval",
                                       entry.index,
                                       game.player_numbers().size()));
  }
  std::cout << "Please provide a new value: ";
  std::cin >> entry.value;
  return entry;
}

int main() {
  Game game{{42, 49, 23}, {10, 40, 24}, 10};
  while (game.UserHasBudget()) {
    const auto change_entry = GetNextChangeEntryFromUser(game);
    if (!change_entry) {  // Also possible: change_entry.has_value().
      std::cerr << change_entry.error() << std::endl;
      continue;
    }
    game.ChangePlayerNumberIfPossible(change_entry.value());
  }
  game.Print();
  if (game.CheckIfPlayerWon()) {
    std::cout << "You win!\n";
  } else {
    std::cout << "Not win today. Try again!\n";
  }
}
