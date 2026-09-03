#include <game/coordinate_generator.h>
#include <game/game.h>
#include <game/snake.h>
#include <game/world.h>
#include <ui/ncurses_drawer.h>

#include <chrono>

#include "core/vector_2d.h"

using snake::core::Vector2i;
using snake::game::CoordinateGenerator;
using snake::game::Game;
using snake::game::Heading;
using snake::game::Snake;
using snake::game::World;
using snake::ui::NcursesDrawer;

int main() {
  const auto initial_snake_length = 5;

  // 1. Create the drawer and the world
  NcursesDrawer drawer;
  auto world = World::CreateBoxWorld(drawer.world_rows(), drawer.world_cols());
  CoordinateGenerator generator{world.rows(), world.cols()};
  drawer.DrawWorld(world);

  // 2. Create the snake centered in the arena
  Snake snake{Vector2i::FromRowCol(world.rows() / 2, world.cols() / 2),
              Heading::kRight,
              initial_snake_length};

  // 3. Create the game
  Game game{std::move(world), std::move(snake)};

  // 4. Register game callbacks to the drawer
  game.RegisterCycleEndCallback(
      std::bind(&NcursesDrawer::DrawGame, &drawer, std::placeholders::_1));
  game.SetRandomCoordinateGeneratorFunction(
      std::bind(&CoordinateGenerator::Generate, &generator));
  game.RegisterGameOverCallback(
      std::bind(&NcursesDrawer::OnGameEnd, &drawer, std::placeholders::_1));

  // 5. Start the game engine thread (tick every 100ms)
  const std::chrono::milliseconds cycle_period{100};
  game.Start(cycle_period);

  // 6. Connect drawer input events to the game
  drawer.RegisterSnakeDirectionChangeCallback(
      std::bind(&Game::OnSnakeControlEvent, &game, std::placeholders::_1));
  drawer.RegisterOnExitCallback(std::bind(&Game::End, &game));

  // 7. Run user input loop on the main thread
  drawer.WaitForInput();
  drawer.DrawEndGameScreen(game.score());
  return 0;
}
