#include <game/snake.h>

#include <optional>

#include "core/vector_2d.h"

namespace snake::game {

void Snake::Turn(Heading) noexcept {
  // TODO(student): Only update heading_ if (heading_ & heading) is non-zero
}

void Snake::EatFruit() noexcept {
  // TODO(student): Increment expected length
  (void)expected_length_;
}

bool Snake::Advance() noexcept {
  // TODO(student): Compute directional increment based on heading_,
  // add new coordinate to body, remove old body part if needed,
  // and return false if snake hit itself.
  return false;
}

bool Snake::AddNewCoordinateToBody(const core::Vector2i&) noexcept {
  // TODO(student): Check self-collision, prepend to body, and update hash set
  return false;
}

bool Snake::Contains(const core::Vector2i&) const noexcept {
  // TODO(student): Return whether the cell is part of the snake body
  return false;
}

void Snake::RemoveOldBodyPartIfNeeded() noexcept {
  // TODO(student): Pop tail if body length exceeds expected_length_
}

}  // namespace snake::game
