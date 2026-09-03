#include <game/game.h>
#include <gtest/gtest.h>

#include "core/vector_2d.h"

using snake::game::Game;
using snake::game::Heading;
using snake::game::Snake;
using snake::game::World;

TEST(Game, InitAndStopGame) {
  const auto rows = 20;
  const auto cols = 20;
  const auto snake_starting_position = snake::core::Vector2i::FromXY(5, 5);
  const std::chrono::milliseconds cycle_period{20};
  Game game{World::CreateBoxWorld(rows, cols),
            Snake{snake_starting_position, Heading::kRight}};
  EXPECT_FALSE(game.is_running());
  game.Start(cycle_period);
  EXPECT_TRUE(game.is_running());
  game.End();
  EXPECT_FALSE(game.is_running());
  EXPECT_EQ(game.score(), 1);
}

// TODO(student): Write unit tests for:
// - Cycle end callback being invoked on each game tick
// - Changing snake direction asynchronously via OnSnakeControlEvent
// - Snake collision with walls ending the game
// - Snake eating fruit incrementing score
// - Game over callback being invoked when the snake dies
