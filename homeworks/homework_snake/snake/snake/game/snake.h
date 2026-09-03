#ifndef SNAKE_GAME_SNAKE_H_
#define SNAKE_GAME_SNAKE_H_

#include <absl/container/flat_hash_set.h>

#include <cstddef>
#include <deque>
#include <utility>

#include "core/vector_2d.h"
#include "game/heading.h"

namespace snake::game {

///
/// @brief      This class encapsulates the snake.
///
class Snake {
 public:
  using CellHash = absl::Hash<std::pair<std::int32_t, std::int32_t>>;
  using CellHashSet =
      absl::flat_hash_set<std::pair<std::int32_t, std::int32_t>, CellHash>;

  ///
  /// @brief      Construct a snake given its starting position and heading.
  ///
  /// @param[in]  start_coordinate  The starting coordinate of the snake.
  /// @param[in]  heading           The starting heading of the snake.
  /// @param[in]  expected_length   The initial expected length (default 1).
  ///
  explicit Snake(const core::Vector2i& start_coordinate, Heading heading,
                 std::size_t expected_length = 1UL) noexcept
      : heading_{heading}, expected_length_{expected_length} {
    [[maybe_unused]] auto res = AddNewCoordinateToBody(start_coordinate);
  }

  /// @brief Move the snake by one cell in the direction of its heading.
  /// @return True if the snake could advance, false if it collided with itself.
  [[nodiscard]] bool Advance() noexcept;

  /// @brief Change direction. Opposites (180 turns) are rejected.
  void Turn(Heading heading) noexcept;

  /// @brief Notify the snake that it ate a fruit and needs to grow.
  void EatFruit() noexcept;

  [[nodiscard]] std::size_t length() const noexcept { return body_.size(); }
  [[nodiscard]] inline Heading heading() const noexcept { return heading_; }

  [[nodiscard]] inline const core::Vector2i& head_position() const noexcept {
    return head();
  }
  [[nodiscard]] inline const core::Vector2i& head() const noexcept {
    static const core::Vector2i empty{};
    return body_.empty() ? empty : body_.front();
  }
  [[nodiscard]] inline const std::deque<core::Vector2i>& body() const noexcept {
    return body_;
  }

  /// @brief Fast O(1) membership check using hash set.
  [[nodiscard]] bool Contains(const core::Vector2i& cell) const noexcept;

 private:
  [[nodiscard]] const core::Vector2i& tail() const noexcept {
    return body_.back();
  }

  [[nodiscard]] bool AddNewCoordinateToBody(
      const core::Vector2i& coordinate) noexcept;

  void RemoveOldBodyPartIfNeeded() noexcept;

  std::deque<core::Vector2i> body_{};
  Heading heading_{};
  std::size_t expected_length_{};
  CellHashSet body_hash_{};
};

}  // namespace snake::game

#endif  // SNAKE_GAME_SNAKE_H_
