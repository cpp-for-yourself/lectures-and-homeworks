import { createRef } from '@motion-canvas/core/lib/utils';
import { makeScene2D, Code, Camera, lines } from '@motion-canvas/2d';
import { all, waitFor, waitUntil } from '@motion-canvas/core/lib/flow';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';

export default makeScene2D(function* (view) {
  const codeRef = createRef<Code>();
  const camera = createRef<Camera>();

  yield view.add(
    <Camera ref={camera}><Code
      ref={codeRef}
      fontSize={50}
      fontFamily={'Fira Mono'}
      fontWeight={500}
      offsetX={0}
      x={0} />
    </Camera>,);

  const duration = 1.0

  const game_1 = `\
#include <vector>

// 😱 Warning! No error handling!
class Game {
 public:
  Game(std::vector<int>&& ref_numbers,
       std::vector<int>&& player_numbers,
       int budget)
      : ref_numbers_{std::move(ref_numbers)},
        player_numbers_{std::move(player_numbers)},
        budget_{budget} {}

  const std::vector<int>& ref_numbers() const { return ref_numbers_; }
  const std::vector<int>& player_numbers() const { return player_numbers_; }
  bool UserHasBudget() const { return budget_ > 0; }

 private:
  std::vector<int> ref_numbers_{};
  std::vector<int> player_numbers_{};
  int budget_{};
};`

  yield* all(
    codeRef().code(game_1, 0.0).wait(duration),
    camera().zoom(0.7, 0.0)
  );

  const game_2 = `\
#include <iostream>
#include <vector>

// 😱 Warning! No error handling!
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
    for (auto number : ref_numbers_) { std::cout << number << "\\t"; }
    std::cout << std::endl;
    std::cout << "Player numbers:    ";
    for (auto number : player_numbers_) { std::cout << number << "\\t"; }
    std::cout << std::endl;
  }

  const std::vector<int>& ref_numbers() const { return ref_numbers_; }
  const std::vector<int>& player_numbers() const { return player_numbers_; }
  bool UserHasBudget() const { return budget_ > 0; }

 private:
  std::vector<int> ref_numbers_{};
  std::vector<int> player_numbers_{};
  int budget_{};
};`


  yield* all(
    codeRef().code(game_2, duration).wait(duration),
    camera().zoom(0.5, duration),
  );


  const game_3 = `\
#include <algorithm>
#include <iostream>
#include <vector>

// 😱 Warning! No error handling!
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
    for (auto number : ref_numbers_) { std::cout << number << "\\t"; }
    std::cout << std::endl;
    std::cout << "Player numbers:    ";
    for (auto number : player_numbers_) { std::cout << number << "\\t"; }
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

  const std::vector<int>& ref_numbers() const { return ref_numbers_; }
  const std::vector<int>& player_numbers() const { return player_numbers_; }
  bool UserHasBudget() const { return budget_ > 0; }

 private:
  std::vector<int> ref_numbers_{};
  std::vector<int> player_numbers_{};
  int budget_{};
};`

  yield* all(
    codeRef().code(game_3, duration).wait(duration),
    camera().centerOn([0, 500], duration),
  );

  const game_4 = `\
#include <algorithm>
#include <iostream>
#include <vector>

// 😱 Warning! No error handling!
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
    for (auto number : ref_numbers_) { std::cout << number << "\\t"; }
    std::cout << std::endl;
    std::cout << "Player numbers:    ";
    for (auto number : player_numbers_) { std::cout << number << "\\t"; }
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
};`

  yield* all(
    codeRef().code(game_4, duration).wait(duration),
    camera().centerOn([0, 800], duration),
  );

  const game_5 = `\
#include <algorithm>
#include <iostream>
#include <vector>

// 😱 Warning! No error handling!
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
    for (auto number : ref_numbers_) { std::cout << number << "\\t"; }
    std::cout << std::endl;
    std::cout << "Player numbers:    ";
    for (auto number : player_numbers_) { std::cout << number << "\\t"; }
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

// 😱 We should handle failure to get a proper value.
ChangeEntry GetNextChangeEntryFromUser(const Game& game) {
  game.Print();
  ChangeEntry entry{};
  std::cout << "Please enter number to change: ";
  std::cin >> entry.index;
  std::cout << "Please provide a new value: ";
  std::cin >> entry.value;
  return entry;
}`

  yield* all(
    codeRef().code(game_5, duration).wait(duration),
    camera().centerOn([0, 1500], duration),
  );

  const game_6 = `\
#include <algorithm>
#include <iostream>
#include <vector>

// 😱 Warning! No error handling!
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
    for (auto number : ref_numbers_) { std::cout << number << "\\t"; }
    std::cout << std::endl;
    std::cout << "Player numbers:    ";
    for (auto number : player_numbers_) { std::cout << number << "\\t"; }
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

// 😱 We should handle failure to get a proper value.
ChangeEntry GetNextChangeEntryFromUser(const Game& game) {
  game.Print();
  ChangeEntry entry{};
  std::cout << "Please enter number to change: ";
  std::cin >> entry.index;
  std::cout << "Please provide a new value: ";
  std::cin >> entry.value;
  return entry;
}

int main() {
  Game game{{42, 49, 23}, {10, 40, 24}, 10};
  while (game.UserHasBudget()) {
    const auto change_entry = GetNextChangeEntryFromUser(game);
    game.ChangePlayerNumberIfPossible(change_entry);
  }
  game.Print();
  if (game.CheckIfPlayerWon()) {
    std::cout << "You win!\\n";
  } else {
    std::cout << "Not win today. Try again!\\n";
  }
}
`

  yield* all(
    codeRef().code(game_6, duration).wait(duration),
    camera().centerOn([0, 1800], duration),
  );

  const game_check_header = `\
#include <absl/log/check.h>

#include <algorithm>
#include <iostream>
#include <vector>

// 😱 Warning! No error handling!
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
    for (auto number : ref_numbers_) { std::cout << number << "\\t"; }
    std::cout << std::endl;
    std::cout << "Player numbers:    ";
    for (auto number : player_numbers_) { std::cout << number << "\\t"; }
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

// 😱 We should handle failure to get a proper value.
ChangeEntry GetNextChangeEntryFromUser(const Game& game) {
  game.Print();
  ChangeEntry entry{};
  std::cout << "Please enter number to change: ";
  std::cin >> entry.index;
  std::cout << "Please provide a new value: ";
  std::cin >> entry.value;
  return entry;
}

int main() {
  Game game{{42, 49, 23}, {10, 40, 24}, 10};
  while (game.UserHasBudget()) {
    const auto change_entry = GetNextChangeEntryFromUser(game);
    game.ChangePlayerNumberIfPossible(change_entry);
  }
  game.Print();
  if (game.CheckIfPlayerWon()) {
    std::cout << "You win!\\n";
  } else {
    std::cout << "Not win today. Try again!\\n";
  }
}
`
  yield* all(
    camera().centerOn([0, 0], 0),
    camera().zoom(0.2, 0),
    waitFor(duration)
  );

  yield* all(
    camera().centerOn([-300, -2000], duration),
    camera().zoom(1, duration),
    waitFor(duration)
  );

  yield* all(
    codeRef().code(game_check_header, duration).wait(duration),
  );

  const game_check = `\
#include <absl/log/check.h>

#include <algorithm>
#include <iostream>
#include <vector>

// 😱 Warning! No error handling!
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
    for (auto number : ref_numbers_) { std::cout << number << "\\t"; }
    std::cout << std::endl;
    std::cout << "Player numbers:    ";
    for (auto number : player_numbers_) { std::cout << number << "\\t"; }
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

// 😱 We should handle failure to get a proper value.
ChangeEntry GetNextChangeEntryFromUser(const Game& game) {
  game.Print();
  ChangeEntry entry{};
  std::cout << "Please enter number to change: ";
  std::cin >> entry.index;
  std::cout << "Please provide a new value: ";
  std::cin >> entry.value;
  return entry;
}

int main() {
  Game game{{42, 49, 23}, {10, 40, 24}, 10};
  while (game.UserHasBudget()) {
    const auto change_entry = GetNextChangeEntryFromUser(game);
    game.ChangePlayerNumberIfPossible(change_entry);
  }
  game.Print();
  if (game.CheckIfPlayerWon()) {
    std::cout << "You win!\\n";
  } else {
    std::cout << "Not win today. Try again!\\n";
  }
}
`

  yield* all(
    camera().centerOn([0, 100], duration),
    camera().zoom(0.7, duration),
  );

  yield* waitFor(0.5 * duration);

  yield* all(
    codeRef().code(game_check, duration).wait(duration),
  );

  const game_assert = `\
#include <cassert>

#include <algorithm>
#include <iostream>
#include <vector>

// 😱 Warning! No error handling!
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
    for (auto number : ref_numbers_) { std::cout << number << "\\t"; }
    std::cout << std::endl;
    std::cout << "Player numbers:    ";
    for (auto number : player_numbers_) { std::cout << number << "\\t"; }
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

  // 😱 Beware of using asserts in release code.
  void ChangePlayerNumberIfPossible(const ChangeEntry& change_entry) {
    assert(change_entry.index >= 0);
    assert(change_entry.index < player_numbers_.size());
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

// 😱 We should handle failure to get a proper value.
ChangeEntry GetNextChangeEntryFromUser(const Game& game) {
  game.Print();
  ChangeEntry entry{};
  std::cout << "Please enter number to change: ";
  std::cin >> entry.index;
  std::cout << "Please provide a new value: ";
  std::cin >> entry.value;
  return entry;
}

int main() {
  Game game{{42, 49, 23}, {10, 40, 24}, 10};
  while (game.UserHasBudget()) {
    const auto change_entry = GetNextChangeEntryFromUser(game);
    game.ChangePlayerNumberIfPossible(change_entry);
  }
  game.Print();
  if (game.CheckIfPlayerWon()) {
    std::cout << "You win!\\n";
  } else {
    std::cout << "Not win today. Try again!\\n";
  }
}
`
  yield* all(
    codeRef().code(game_assert, duration).wait(duration),
  );

  yield* all(
    camera().centerOn([0, -600], duration)
  );

  yield* all(
    codeRef().code(game_check, 0).wait(duration),
    camera().centerOn([0, 0], 0),
    camera().zoom(0.2, 0),
  );

  yield* all(
    camera().centerOn([0, 1300], duration),
    camera().zoom(0.7, duration),
  );

  const game_before_recoverable = `\
#include <absl/log/check.h>

#include <algorithm>
#include <iostream>
#include <vector>

// 😱 Warning! No error handling!
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
    for (auto number : ref_numbers_) { std::cout << number << "\\t"; }
    std::cout << std::endl;
    std::cout << "Player numbers:    ";
    for (auto number : player_numbers_) { std::cout << number << "\\t"; }
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

// 😱 We should handle failure to get a proper value.
ChangeEntry GetNextChangeEntryFromUser(const Game& game) {
  game.Print();
  ChangeEntry entry{};
  std::cout << "Please enter number to change: ";
  std::cin >> entry.index;  // <-- This value is NOT arbitrary!
  std::cout << "Please provide a new value: ";
  std::cin >> entry.value;
  return entry;
}

int main() {
  Game game{{42, 49, 23}, {10, 40, 24}, 10};
  while (game.UserHasBudget()) {
    const auto change_entry = GetNextChangeEntryFromUser(game);
    game.ChangePlayerNumberIfPossible(change_entry);
  }
  game.Print();
  if (game.CheckIfPlayerWon()) {
    std::cout << "You win!\\n";
  } else {
    std::cout << "Not win today. Try again!\\n";
  }
}
`
  yield* all(
    codeRef().code(game_before_recoverable, duration).wait(duration),
  );
  yield* waitFor(duration);

  const game_exceptions_func = `\
#include <absl/log/check.h>

#include <algorithm>
#include <iostream>
#include <vector>

// 😱 Warning! No error handling!
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
    for (auto number : ref_numbers_) { std::cout << number << "\\t"; }
    std::cout << std::endl;
    std::cout << "Player numbers:    ";
    for (auto number : player_numbers_) { std::cout << number << "\\t"; }
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

// 😱 I'm not a fan of using exceptions.
ChangeEntry GetNextChangeEntryFromUser(const Game& game) {
  game.Print();
  ChangeEntry entry{};
  std::cout << "Please enter number to change: ";
  std::cin >> entry.index;
  if ((entry.index < 0) || (entry.index >= game.player_numbers().size())) {
    throw std::out_of_range("Wrong number index provided.");
  }
  std::cout << "Please provide a new value: ";
  std::cin >> entry.value;
  return entry;
}

int main() {
  Game game{{42, 49, 23}, {10, 40, 24}, 10};
  while (game.UserHasBudget()) {
    const auto change_entry = GetNextChangeEntryFromUser(game);
    game.ChangePlayerNumberIfPossible(change_entry);
  }
  game.Print();
  if (game.CheckIfPlayerWon()) {
    std::cout << "You win!\\n";
  } else {
    std::cout << "Not win today. Try again!\\n";
  }
}
`
  yield* all(
    codeRef().code(game_exceptions_func, duration).wait(duration),
  );
  yield* waitFor(duration);

  const game_exceptions = `\
#include <absl/log/check.h>

#include <algorithm>
#include <iostream>
#include <vector>

// 😱 Warning! No error handling!
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
    for (auto number : ref_numbers_) { std::cout << number << "\\t"; }
    std::cout << std::endl;
    std::cout << "Player numbers:    ";
    for (auto number : player_numbers_) { std::cout << number << "\\t"; }
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

// 😱 I'm not a fan of using exceptions.
ChangeEntry GetNextChangeEntryFromUser(const Game& game) {
  game.Print();
  ChangeEntry entry{};
  std::cout << "Please enter number to change: ";
  std::cin >> entry.index;
  if ((entry.index < 0) || (entry.index >= game.player_numbers().size())) {
    throw std::out_of_range("Wrong number index provided.");
  }
  std::cout << "Please provide a new value: ";
  std::cin >> entry.value;
  return entry;
}

int main() {
  Game game{{42, 49, 23}, {10, 40, 24}, 10};
  while (game.UserHasBudget()) {
    try {
      const auto change_entry = GetNextChangeEntryFromUser(game);
      game.ChangePlayerNumberIfPossible(change_entry);
    } catch (const std::out_of_range& e) {
      std::cerr << e.what() << std::endl;
    }
  }
  game.Print();
  if (game.CheckIfPlayerWon()) {
    std::cout << "You win!\\n";
  } else {
    std::cout << "Not win today. Try again!\\n";
  }
}
`
  yield* all(
    camera().centerOn([0, 2100], duration),
    camera().zoom(0.7, duration),
  );

  yield* all(
    codeRef().code(game_exceptions, duration).wait(duration),
  );
  yield* waitFor(duration);

  const game_exceptions_catch_all = `\
#include <absl/log/check.h>

#include <algorithm>
#include <iostream>
#include <vector>

// 😱 Warning! No error handling!
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
    for (auto number : ref_numbers_) { std::cout << number << "\\t"; }
    std::cout << std::endl;
    std::cout << "Player numbers:    ";
    for (auto number : player_numbers_) { std::cout << number << "\\t"; }
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

// 😱 I'm not a fan of using exceptions.
ChangeEntry GetNextChangeEntryFromUser(const Game& game) {
  game.Print();
  ChangeEntry entry{};
  std::cout << "Please enter number to change: ";
  std::cin >> entry.index;
  if ((entry.index < 0) || (entry.index >= game.player_numbers().size())) {
    throw std::out_of_range("Wrong number index provided.");
  }
  std::cout << "Please provide a new value: ";
  std::cin >> entry.value;
  return entry;
}

int main() {
  Game game{{42, 49, 23}, {10, 40, 24}, 10};
  while (game.UserHasBudget()) {
    try {
      const auto change_entry = GetNextChangeEntryFromUser(game);
      game.ChangePlayerNumberIfPossible(change_entry);
    } catch (const std::out_of_range& e) {
      std::cerr << e.what() << std::endl;
    } catch (...) {
      // 😱 Not very useful, is it?
      std::cerr << "Oops, something happened.\\n";
    }
  }
  game.Print();
  if (game.CheckIfPlayerWon()) {
    std::cout << "You win!\\n";
  } else {
    std::cout << "Not win today. Try again!\\n";
  }
}
`

  yield* all(
    codeRef().code(game_exceptions_catch_all, duration).wait(duration),
  );
  yield* waitFor(duration);

  yield* waitFor(duration * 3);
});
