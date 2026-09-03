#ifndef GAME_GAME_H_
#define GAME_GAME_H_

#include <game/snake.h>
#include <game/world.h>

#include <chrono>
#include <functional>
#include <mutex>
#include <optional>
#include <thread>

#include "core/vector_2d.h"

namespace snake::game {

///
/// @brief      This class describes a game of snake.
///
/// @details    Holds all the objects required to play the game of snake
///             and handles all interactions. The game loop is controlled
///             by this class and runs in a separate thread.
///
class Game {
  using CycleEndCallback = std::function<void(const Game&)>;
  using GameOverCallback = std::function<void(const Game&)>;
  using RandomCoordinateGeneratorFunction = std::function<core::Vector2i(void)>;

 public:
  Game(World&& world, Snake&& snake);

  /// When destroying the game we must join its thread.
  ~Game() {
    if (game_thread_.joinable()) game_thread_.join();
  }

  void RegisterCycleEndCallback(CycleEndCallback callback) noexcept {
    cycle_end_callback_ = callback;
  }

  void RegisterGameOverCallback(GameOverCallback callback) noexcept {
    game_over_callback_ = callback;
  }

  void SetRandomCoordinateGeneratorFunction(
      RandomCoordinateGeneratorFunction function) noexcept {
    generate_random_coordinate_ = function;
  }

  /// Start the main loop of the game and get the snake moving.
  void Start(const std::chrono::milliseconds& initial_cycle_period);

  /// Stop the game from running.
  void End() noexcept;

  /// Called upon a snake control event (e.g. arrow key pressed).
  void OnSnakeControlEvent(Heading heading) noexcept;

  [[nodiscard]] inline std::int32_t score() const noexcept {
    return snake_.length();
  }

  [[nodiscard]] inline bool is_running() const noexcept { return is_running_; }

  [[nodiscard]] inline const World& world() const noexcept { return world_; }
  [[nodiscard]] inline const Snake& snake() const noexcept { return snake_; }
  [[nodiscard]] inline const std::optional<core::Vector2i>& fruit_position()
      const noexcept {
    return fruit_position_;
  }

 private:
  void GameLoop(const std::chrono::milliseconds& initial_cycle_period);

  void GenerateFruit() noexcept;

  /// @brief Run the next cycle and get the new loop delay (or std::nullopt if game over)
  [[nodiscard]] std::optional<std::chrono::milliseconds> NextCycle(
      const std::chrono::milliseconds& cycle_period);

  World world_;
  Snake snake_;

  std::optional<core::Vector2i> fruit_position_{};
  bool is_running_{};

  std::mutex data_mutex_;
  std::thread game_thread_;

  CycleEndCallback cycle_end_callback_{};
  GameOverCallback game_over_callback_{};
  RandomCoordinateGeneratorFunction generate_random_coordinate_{};
};

}  // namespace snake::game

#endif  // GAME_GAME_H_
