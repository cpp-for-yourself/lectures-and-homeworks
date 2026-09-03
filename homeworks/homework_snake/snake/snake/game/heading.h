#ifndef SNAKE_GAME_HEADING_H_
#define SNAKE_GAME_HEADING_H_

#include <type_traits>

namespace snake::game {

///
/// @brief      This enum describes a heading direction.
///
/// @details    It is designed so that opposite headings, when combined
///             through a logical "and" (&), always yield 0:
///             e.g. (kUp & kDown == 0), (kLeft & kRight == 0).
///             Any orthogonal combination does NOT return 0,
///             e.g. (kLeft & kUp != 0).
///
enum class Heading {
  kUp = 0b0101,
  kDown = 0b1010,
  kLeft = 0b0011,
  kRight = 0b1100,
};

/// @brief Overloaded operator& to check for opposite directions.
[[nodiscard]] inline std::underlying_type_t<Heading> operator&(Heading,
                                                               Heading) {
  // TODO(student): Combine underlying values with bitwise &
  return 0;
}

}  // namespace snake::game

#endif  // SNAKE_GAME_HEADING_H_
