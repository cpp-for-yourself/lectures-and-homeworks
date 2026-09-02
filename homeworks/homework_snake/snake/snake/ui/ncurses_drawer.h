// Copyright Igor Bogoslavskyi, year 2022.
// In case of any problems with the code please contact me.
// Email: <name>.<family_name>@gmail.com.

#pragma once

#include <sys/ioctl.h>
#include <sys/termios.h>
#include <unistd.h>

#include <cstdint>
#include <functional>

#include "game/game.h"
#include "game/world.h"
#include "ui/terminal_input.h"

namespace snake::ui {

class NcursesDrawer {
  using SnakeDirectionChangeCallback = std::function<void(game::Heading)>;
  using OnExitCallback = std::function<void(void)>;

  static inline constexpr auto kCharSquare = "  ";

 public:
  void RegisterSnakeDirectionChangeCallback(
      SnakeDirectionChangeCallback callback) noexcept;

  void RegisterOnExitCallback(OnExitCallback callback) noexcept;

  void DrawWorld(const game::World& world) const;

  void DrawGame(const game::Game& game);

  void DrawEndGameScreen(std::int32_t score);

  void OnGameEnd(const game::Game& game);

  void WaitForInput();

  [[nodiscard]] inline std::int32_t world_rows() const noexcept {
    return to_world_row(terminal_.size().row()) - 1;
  }
  [[nodiscard]] inline std::int32_t world_cols() const noexcept {
    return to_world_col(terminal_.size().col()) - 1;
  }

 private:
  std::int32_t to_world_row(std::int32_t canvas_row) const noexcept;
  std::int32_t to_world_col(std::int32_t canvas_col) const noexcept;

  std::int32_t to_canvas_row(std::int32_t world_row) const noexcept;
  std::int32_t to_canvas_col(std::int32_t world_col) const noexcept;

  bool needs_redrawing_{true};

  SnakeDirectionChangeCallback snake_direction_change_callback_{};
  OnExitCallback on_exit_callback_{};

  std::optional<game::Snake> previous_snake_{};

  TerminalIo terminal_{};
};

}  // namespace snake::ui
