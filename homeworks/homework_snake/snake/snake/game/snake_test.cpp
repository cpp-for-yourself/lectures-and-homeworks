#include <game/heading.h>
#include <game/snake.h>
#include <gtest/gtest.h>

#include "core/vector_2d.h"

using snake::game::Heading;
using snake::game::Snake;

TEST(Snake, Init) {
  Snake snake{snake::core::Vector2i::FromXY(10, 10), Heading::kUp};
  EXPECT_EQ(snake.length(), 1);
  EXPECT_EQ(snake.heading(), Heading::kUp);
  EXPECT_EQ(snake.head_position().x(), 10);
  EXPECT_EQ(snake.head_position().y(), 10);
}

// TODO(student): Write unit tests for:
// - Heading bitwise operator& (verifying opposite directions yield 0)
// - Changing heading via Turn() (verifying 180-degree reversals are ignored)
// - Advancing in each direction
// - Eating fruit and the growth invariant (verifying length only grows on Advance())
// - Self-collision detection (verifying Advance() returns false when snake hits itself)
