#include <game/game.h>
#include <game/snake.h>
#include <game/world.h>

#include <chrono>
#include <iostream>
#include <thread>

#include "core/vector_2d.h"

using snake::core::Vector2i;
using snake::game::Game;
using snake::game::Heading;
using snake::game::Snake;
using snake::game::World;

int main() {
  auto world = World::CreateBoxWorld(20, 20);
  world.SetCell(Vector2i::FromXY(6, 5), World::CellType::kFruit);

  Snake snake{Vector2i::FromXY(5, 5), Heading::kRight};
  Game game{std::move(world), std::move(snake)};

  const std::chrono::milliseconds cycle_period{5};
  game.Start(cycle_period);
  std::this_thread::sleep_for(std::chrono::milliseconds{200});
  game.End();

  std::cout << "Simulation finished with score: " << game.score() << std::endl;
  return 0;
}
