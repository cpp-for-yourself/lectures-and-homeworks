import { createRef } from '@motion-canvas/core/lib/utils';
import { makeScene2D, Code, Camera, Node, lines } from '@motion-canvas/2d';
import { all, waitFor, waitUntil } from '@motion-canvas/core/lib/flow';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';
import { Stage } from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  const codeRef = createRef<Code>();
  const camera_1 = createRef<Camera>();
  const camera_2 = createRef<Camera>();
  const stage_2 = createRef<Node>();

  const scene = (
    <Node>
      <Code
        ref={codeRef}
        fontSize={50}
        fontFamily={'Fira Mono'}
        fontWeight={500}
        offsetX={0}
        x={0} />
    </Node>
  );

  view.add(
    <>
      <Camera.Stage
        cameraRef={camera_1}
        scene={scene}
        size={[1920, 1080]}
        position={[0, 0]}
      />
      <Node
        ref={stage_2}
        position={[900, 0]}
      >
        <Camera.Stage
          ref={stage_2}
          cameraRef={camera_2}
          scene={scene}
          size={[600, 200]}
          position={[500, -350]}
          fill={'#123'}
          radius={10}
          smoothCorners
        />
      </Node>

    </>,
  );

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
    camera_1().zoom(0.7, 0.0),
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
    camera_1().zoom(0.5, duration),
    codeRef().selection([
      lines(0, 0),
      lines(13, 13 + 9),
    ], duration)
  );


  const game_3 = `\
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
    camera_1().centerOn([0, 500], duration),
    codeRef().selection([
      lines(154 - 131, 162 - 131),
    ], duration)
  );

  const game_4 = `\
#include <algorithm>
#include <iostream>
#include <vector>

struct ChangeEntry {
  int index{};
  int value{};
};

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
    camera_2().centerOn([-800, -1200], 0),
    camera_2().zoom(0.6, 0),
  );

  yield* all(
    stage_2().position.x(0, duration / 2),
  );

  yield* all(
    codeRef().code(game_4, duration).wait(duration),
    stage_2().scale(1.3, duration),
    stage_2().position([-150, 150], duration),
    camera_2().zoom(0.35, duration),
    camera_2().centerOn([-800, -1450], duration),
    camera_1().centerOn([0, 700], duration),
    codeRef().selection([
      lines(0, 0),
      lines(4, 7),
      lines(221 - 183, 228 - 183),
    ], duration)
  );

  const game_5 = `\
#include <algorithm>
#include <iostream>
#include <vector>

struct ChangeEntry {
  int index{};
  int value{};
};

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
    stage_2().position.x(900, duration / 2),
    codeRef().code(game_5, duration).wait(duration),
    camera_1().centerOn([0, 1500], duration),
    codeRef().selection([
      lines(306 - 250, 316 - 250),
    ], duration)
  );

  yield* all(
    camera_2().centerOn([-800, -1200], 0),
    camera_2().zoom(0.6, 0),
    stage_2().scale(1.0, 0),
    stage_2().position([900, 0], 0),
  );

  const game_6 = `\
#include <algorithm>
#include <iostream>
#include <vector>

struct ChangeEntry {
  int index{};
  int value{};
};

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
}`

  yield* all(
    codeRef().code(game_6, duration).wait(duration),
    camera_1().centerOn([0, 1800], duration),
    codeRef().selection([
      lines(390 - 323, 403 - 323),
    ], duration)
  );

  yield* all(
    camera_1().centerOn([0, 0], 0),
    camera_1().zoom(0.2, 0),
    codeRef().selection(DEFAULT, 0),
    waitFor(duration)
  );

  const game_check = `\
#include <absl/log/check.h>

#include <algorithm>
#include <iostream>
#include <vector>

struct ChangeEntry {
  int index{};
  int value{};
};

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
}`

  yield* all(
    camera_2().centerOn([-700, -2400], 0),
    camera_1().centerOn([100, -100], duration),
    camera_1().zoom(0.7, duration),
    codeRef().selection([
      lines(454 - 416, 462 - 416),
    ], duration)
  );

  yield* waitFor(0.5 * duration);

  yield* all(
    codeRef().code(game_check, duration).wait(duration),
    stage_2().position.x(0, duration / 2),
    camera_2().centerOn([-700, -2600], duration),
    codeRef().selection([
      lines(0, 0),
      lines(456 - 416, 468 - 416),
    ], duration)
  );

  const game_assert = `\
#include <cassert>

#include <algorithm>
#include <iostream>
#include <vector>

struct ChangeEntry {
  int index{};
  int value{};
};

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
}`

  yield* all(
    codeRef().code(game_assert, duration).wait(duration),
    camera_2().centerOn([-700, -2550], duration),
    codeRef().selection([
      lines(0, 0),
      lines(597 - 556, 606 - 556),
    ], duration)
  );

  yield* all(
    stage_2().position.x(900, 0),
    waitFor(duration),
  );

  yield* all(
    camera_1().centerOn([0, -600], duration),
    waitFor(duration * 2),
    codeRef().selection([
      lines(0, 0),
      lines(587 - 556, 595 - 556),
    ], duration)
  );

  yield* all(
    codeRef().code(game_check, 0).wait(duration),
    camera_1().centerOn([0, 0], 0),
    codeRef().selection(DEFAULT, 0),
    camera_1().zoom(0.2, 0),
  );

  yield* all(
    camera_1().centerOn([0, 1300], duration),
    camera_1().zoom(0.7, duration),
    codeRef().selection([
      lines(702 - 639, 712 - 639),
    ], duration)
  );

  const game_before_recoverable = `\
#include <absl/log/check.h>

#include <algorithm>
#include <iostream>
#include <vector>

struct ChangeEntry {
  int index{};
  int value{};
};

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
}`

  yield* all(
    codeRef().code(game_before_recoverable, duration).wait(duration),
    codeRef().selection([
      lines(702 - 639, 712 - 639),
    ], duration)
  );
  yield* waitFor(duration);

  const game_exceptions_func = `\
#include <absl/log/check.h>

#include <algorithm>
#include <iostream>
#include <stdexcept>
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
}`

  yield* all(
    stage_2().position.x(0, duration / 2),
    camera_2().centerOn([-700, -2450], 0),
  );

  yield* all(
    codeRef().code(game_exceptions_func, duration).wait(duration),
    codeRef().selection([
      lines(4, 4),
      lines(795 - 732, 808 - 732),
    ], duration),
    camera_2().centerOn([-700, -2450], duration),
  );
  yield* waitFor(duration);

  const game_exceptions = `\
#include <absl/log/check.h>

#include <algorithm>
#include <iostream>
#include <stdexcept>
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
}`

  yield* all(
    camera_1().centerOn([0, 1900], duration),
    camera_1().zoom(0.45, duration),
    stage_2().position.x(900, duration / 2),
    codeRef().selection([
      lines(891 - 828, 922 - 828),
    ], duration),
    codeRef().code(game_exceptions, duration).wait(duration),
  );

  yield* waitFor(duration);

  const game_exceptions_catch_all = `\
#include <absl/log/check.h>

#include <algorithm>
#include <iostream>
#include <stdexcept>
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
}`

  yield* all(
    codeRef().code(game_exceptions_catch_all, duration).wait(duration),
    codeRef().selection([
      lines(891 - 828, 925 - 828),
    ], duration),
  );
  yield* waitFor(duration);


  // Recoverable errors
  yield* all(
    codeRef().selection(DEFAULT, 0).wait(duration),
    camera_1().centerOn([0, 1200], 0),
    camera_2().centerOn([-700, -2700], 0),
    camera_1().zoom(0.7, 0),
    codeRef().selection([
      lines(1, 5),
      lines(1111 - 1047, 1124 - 1047),
    ], 0),
  );

  const recoverable_value = `\
#include <absl/log/check.h>

#include <algorithm>
#include <iostream>
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

// 😱 Not a great idea!
ChangeEntry GetNextChangeEntryFromUser(const Game& game) {
  game.Print();
  ChangeEntry entry{};
  std::cout << "Please enter number to change: ";
  std::cin >> entry.index;
  if ((entry.index < 0) || (entry.index >= game.player_numbers().size())) {
    return {};  // 😱 How do we know this value indicates an error?
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
}`
  yield* all(
    stage_2().position.x(0, duration / 2),
  );

  yield* all(
    stage_2().position.x(0, duration / 2),
    camera_1().centerOn([0, 1400], duration),
    camera_2().centerOn([-700, -2500], duration),
    codeRef().selection([
      lines(1, 4),
      lines(1109 - 1047, 1122 - 1047),
    ], duration),
    codeRef().code(recoverable_value, duration).wait(duration),
  );

  yield* all(
    stage_2().position.x(900, duration / 2),
  );

  // Error codes

  const recoverable_error_codes = `\
#include <absl/log/check.h>

#include <algorithm>
#include <iostream>
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

// 😱 Mostly not a great idea in C++.
int GetNextChangeEntryFromUser(const Game& game, ChangeEntry& result) {
  game.Print();
  std::cout << "Please enter number to change: ";
  int index{};
  std::cin >> index;
  if ((index < 0) || (index >= game.player_numbers().size())) {
    return kError;  // Usually some constant defined elsewhere.
  }
  result.index = index;
  std::cout << "Please provide a new value: ";
  std::cin >> result.value;
  return kSuccess;  // Typically a 0, but using a constant is better.
}

std::string GetFailureReason(int constant) {
  // Some logic to return a message.
  if (constant == kError) { return "Provided index is out of range."; }
  return "Unknown error encountered.";
}

int main() {
  Game game{{42, 49, 23}, {10, 40, 24}, 10};
  while (game.UserHasBudget()) {
    // Cannot be const, cannot use auto, has to allocate.
    ChangeEntry change_entry{};
    const auto error_code = GetNextChangeEntryFromUser(game, change_entry);
    if (error_code != kSuccess) {
      std::cerr << GetFailureReason(error_code) << std::endl;
      continue;
    }
    game.ChangePlayerNumberIfPossible(change_entry);
  }
  game.Print();
  if (game.CheckIfPlayerWon()) {
    std::cout << "You win!\\n";
  } else {
    std::cout << "Not win today. Try again!\\n";
  }
}`

  yield* all(
    codeRef().selection([
      lines(1, 4),
      lines(1220 - 1158, 1234 - 1158),
    ], duration),
    camera_1().centerOn([0, 1000], duration),
    codeRef().code(recoverable_error_codes, duration).wait(duration),
  );

  yield* all(
    camera_1().zoom(0.6, duration),
    camera_1().centerOn([0, 2300], duration),
    codeRef().selection([
      lines(1, 4),
      lines(1235 - 1158, 1260 - 1158),
    ], duration),
    codeRef().code(recoverable_error_codes, duration).wait(duration),
  );


  // Optional

  const recoverable_optional = `\
#include <absl/log/check.h>

#include <algorithm>
#include <iostream>
#include <optional>
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

std::optional<ChangeEntry>
GetNextChangeEntryFromUser(const Game& game) {
  game.Print();
  ChangeEntry entry{};
  std::cout << "Please enter number to change: ";
  std::cin >> entry.index;
  if ((entry.index < 0) || (entry.index >= game.player_numbers().size())) {
    return {};   // <-- Create an empty optional, or std:nullopt.
  }
  std::cout << "Please provide a new value: ";
  std::cin >> entry.value;
  return entry;  // <-- Optional filled with a ChangeEntry object.
}

int main() {
  Game game{{42, 49, 23}, {10, 40, 24}, 10};
  while (game.UserHasBudget()) {
    const auto change_entry = GetNextChangeEntryFromUser(game);
    if (!change_entry) {  // Also possible: change_entry.has_value().
      std::cerr << "Error when getting a number index." << std::endl;
      continue;
    }
    game.ChangePlayerNumberIfPossible(change_entry.value());
  }
  game.Print();
  if (game.CheckIfPlayerWon()) {
    std::cout << "You win!\\n";
  } else {
    std::cout << "Not win today. Try again!\\n";
  }
}`

  yield* all(
    camera_1().centerOn([0, 900], 0),
    camera_2().centerOn([-700, -2850], 0),
    codeRef().selection([
      lines(1, 4),
      lines(1109 - 1047, 1123 - 1047),
    ], 0),
    waitFor(duration)
  );

  yield* all(
    stage_2().position.x(0, duration / 2),
  );

  yield* all(
    camera_1().zoom(0.6, duration),
    camera_1().centerOn([0, 1200], duration),
    camera_2().centerOn([-700, -2550], duration),
    codeRef().selection([
      lines(4, 4),
      lines(1110 - 1047, 1123 - 1047),
    ], duration),
    codeRef().code(recoverable_optional, duration).wait(duration),
  );

  yield* all(
    stage_2().position.x(900, duration / 2),
    camera_1().zoom(0.5, duration),
    camera_1().centerOn([200, 1850], duration),
    camera_2().centerOn([-700, -2550], duration),
    codeRef().selection([
      lines(4, 4),
      lines(1110 - 1047, 1223 - 1047),
    ], duration),
    codeRef().code(recoverable_optional, duration).wait(duration),
  );

  // Expected

  const recoverable_expected = `\
#include <absl/log/check.h>

#include <algorithm>
#include <expected>
#include <format>
#include <iostream>
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

// Requires C++23
std::expected<ChangeEntry, std::string>
GetNextChangeEntryFromUser(const Game& game) {
  game.Print();
  ChangeEntry entry{};
  std::cout << "Please enter number to change: ";
  std::cin >> entry.index;
  if ((entry.index < 0) || (entry.index >= game.player_numbers().size())) {
    return std::unexpected(
      std::format("Index {} must be in [0, {}) interval",
                  entry.index, game.player_numbers().size()));
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
    std::cout << "You win!\\n";
  } else {
    std::cout << "Not win today. Try again!\\n";
  }
}`

  yield* all(
    stage_2().position.y(-60, 0),
    stage_2().position.x(100, duration / 2),
  );

  yield* all(
    camera_1().zoom(0.45, duration),
    camera_1().centerOn([200, 1850], duration),
    camera_2().centerOn([-700, -2750], duration),
    codeRef().selection([
      lines(3, 4),
      lines(1111 - 1047, 1218 - 1047),
    ], duration),
    codeRef().code(recoverable_expected, duration).wait(duration),
  );


  yield* waitFor(duration * 3);
});
