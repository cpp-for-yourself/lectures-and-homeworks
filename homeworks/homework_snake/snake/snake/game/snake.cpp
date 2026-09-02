#include <game/snake.h>

#include <optional>

#include "core/vector_2d.h"

namespace snake::game {

void Snake::Turn(Heading heading) noexcept {
  // TODO(student): Only update heading_ if (heading_ & heading) is non-zero
  if (heading_ & heading) { heading_ = heading; }
}

void Snake::EatFruit() noexcept {
  // TODO(student): Increment expected length
  expected_length_++;
}

bool Snake::Advance() noexcept {
  // TODO(student): Compute directional increment based on heading_
  std::optional<core::Vector2i> increment{};
  switch (heading_) {
    case Heading::kDown: increment = core::Vector2i::FromXY(0, 1); break;
    case Heading::kUp: increment = core::Vector2i::FromXY(0, -1); break;
    case Heading::kLeft: increment = core::Vector2i::FromXY(-1, 0); break;
    case Heading::kRight: increment = core::Vector2i::FromXY(1, 0); break;
  }
  if (!AddNewCoordinateToBody(head_position() + *increment)) { return false; }
  RemoveOldBodyPartIfNeeded();
  return true;
}

bool Snake::AddNewCoordinateToBody(const core::Vector2i& cell) noexcept {
  // If cell already in body, self-collision occurred
  if (Contains(cell)) { return false; }
  body_.push_front(cell);
  body_hash_.insert({cell.row(), cell.col()});
  return true;
}

bool Snake::Contains(const core::Vector2i& cell) const noexcept {
  return body_hash_.contains({cell.row(), cell.col()});
}

void Snake::RemoveOldBodyPartIfNeeded() noexcept {
  if (body_.size() <= expected_length_) { return; }
  const auto& tail = body_.back();
  body_hash_.erase({tail.row(), tail.col()});
  body_.pop_back();
}

}  // namespace snake::game
