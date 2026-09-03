#include <game/game.h>

#include <algorithm>
#include <mutex>
#include <thread>

namespace snake::game {

Game::Game(World&& world, Snake&& snake)
    : world_{std::move(world)}, snake_{std::move(snake)} {}

void Game::Start(const std::chrono::milliseconds& initial_cycle_period) {
  is_running_ = true;
  GenerateFruit();
  game_thread_ = std::thread{&Game::GameLoop, this, initial_cycle_period};
}

void Game::End() noexcept { is_running_ = false; }

void Game::OnSnakeControlEvent(Heading) noexcept {
  // TODO(student): Thread-safe turn of the snake
}

void Game::GameLoop(const std::chrono::milliseconds& initial_cycle_period) {
  auto cycle_period{initial_cycle_period};
  while (is_running_) {
    const auto now = std::chrono::steady_clock::now();
    const auto new_loop_delay = NextCycle(cycle_period);
    if (new_loop_delay.has_value()) {
      cycle_period = new_loop_delay.value();
    } else {
      is_running_ = false;
    }
    if (cycle_end_callback_) { cycle_end_callback_(*this); }
    const auto elapsed = std::chrono::steady_clock::now() - now;
    const auto left_to_wait = cycle_period - elapsed;
    if (left_to_wait.count() < 0) {
      // Running at maximum speed
      continue;
    }
    std::this_thread::sleep_for(left_to_wait);
  }
  if (game_over_callback_) { game_over_callback_(*this); }
}

std::optional<std::chrono::milliseconds> Game::NextCycle(
    const std::chrono::milliseconds&) {
  // TODO(student):
  // 1. Lock the mutex to protect snake_ and world_
  // 2. Advance the snake; return std::nullopt if self-collision occurs
  // 3. Check world collision at snake head; return std::nullopt if wall/out of
  // bounds
  // 4. Check fruit collision; eat fruit, clear world cell, generate new fruit,
  // speed up loop
  // 5. Return new cycle duration
  return {};
}

void Game::GenerateFruit() noexcept {
  if (!generate_random_coordinate_) { return; }
  fruit_position_.reset();
  while (!fruit_position_.has_value()) {
    const auto potential_fruit_position = generate_random_coordinate_();
    const auto cell = world_.cell(potential_fruit_position);
    if (cell != World::CellType::kEmpty) { continue; }
    if (snake_.Contains(potential_fruit_position)) { continue; }
    fruit_position_ = potential_fruit_position;
  }
  world_.SetCell(fruit_position_.value(), World::CellType::kFruit);
}

}  // namespace snake::game
