// Copyright Igor Bogoslavskyi, year 2025.
// In case of any problems with the code please contact me.
// Email: <name>.<family_name>@gmail.com.

#include <ui/ncurses_drawer.h>

#include <chrono>
#include <cstdio>
#include <thread>

#include "core/vector_2d.h"
#include "game/game.h"
#include "game/heading.h"
#include "game/world.h"
#include "ui/terminal_input.h"

namespace snake::ui {

void NcursesDrawer::RegisterSnakeDirectionChangeCallback(
    SnakeDirectionChangeCallback callback) noexcept {
  snake_direction_change_callback_ = callback;
}

void NcursesDrawer::RegisterOnExitCallback(OnExitCallback callback) noexcept {
  on_exit_callback_ = callback;
}

void NcursesDrawer::DrawWorld(const game::World& world) const {
  for (auto row = 0; row < world.rows(); ++row) {
    for (auto col = 0; col < world.cols(); ++col) {
      const auto coordinate = core::Vector2i::FromRowCol(row, col);
      const auto cell = world.cell(coordinate);
      if (!cell) { continue; }
      if (cell.value() == game::World::CellType::kEmpty) {
        terminal_.DrawText(to_canvas_row(coordinate.row()),
                           to_canvas_col(coordinate.col()),
                           kCharSquare,
                           TerminalIo::AsciiColor::Black);
      }
      if (cell.value() == game::World::CellType::kWall) {
        terminal_.DrawText(to_canvas_row(coordinate.row()),
                           to_canvas_col(coordinate.col()),
                           kCharSquare,
                           TerminalIo::AsciiColor::White);
      }
    }
  }
}

void NcursesDrawer::DrawGame(const game::Game& game) {
  const std::string score_line{"CURRENT SCORE: " +
                               std::to_string(game.score())};
  terminal_.DrawText(0,
                     terminal_.size_.col() / 2 - score_line.size() / 2,
                     score_line,
                     TerminalIo::AsciiColor::White,
                     TerminalIo::AsciiColor::Black);

  if (previous_snake_.has_value()) {
    // Redraw the previous snake position as background.
    for (const auto coordinate : previous_snake_->body()) {
      terminal_.DrawText(to_canvas_row(coordinate.row()),
                         to_canvas_col(coordinate.col()),
                         kCharSquare,
                         TerminalIo::AsciiColor::Black);
    }
  }

  const auto& fruit_position = game.fruit_position();
  if (fruit_position) {
    terminal_.DrawText(to_canvas_row(fruit_position->row()),
                       to_canvas_col(fruit_position->col()),
                       kCharSquare,
                       TerminalIo::AsciiColor::Red);
  }

  const auto& snake = game.snake();
  for (const auto coordinate : snake.body()) {
    terminal_.DrawText(to_canvas_row(coordinate.row()),
                       to_canvas_col(coordinate.col()),
                       kCharSquare,
                       TerminalIo::AsciiColor::Cyan);
  }
  previous_snake_ = snake;
}

void NcursesDrawer::OnGameEnd(const game::Game&) { needs_redrawing_ = false; }

void NcursesDrawer::DrawEndGameScreen(std::int32_t score) {
  const std::string game_over{" GAME OVER "};
  const std::string score_line{" YOUR SCORE: " + std::to_string(score) + " "};

  const auto get_centered = [](const auto center, auto size) {
    return center - size / 2;
  };

  const auto center_row = terminal_.size_.row() / 2;
  const auto col_game_over =
      get_centered(terminal_.size().col() / 2, game_over.size());
  const auto col_score =
      get_centered(terminal_.size().col() / 2, score_line.size());
  terminal_.DrawText(center_row,
                     col_score,
                     score_line,
                     TerminalIo::AsciiColor::Black,
                     TerminalIo::AsciiColor::White);
  terminal_.DrawText(center_row - 1,
                     col_game_over,
                     game_over,
                     TerminalIo::AsciiColor::Black,
                     TerminalIo::AsciiColor::Red,
                     true);
  getchar();
}

void NcursesDrawer::WaitForInput() {
  while (true) {
    if (!needs_redrawing_) return;
    if (snake_direction_change_callback_) {
      switch (terminal_.Parse()) {
        case TerminalIo::kArrowRight: {
          snake_direction_change_callback_(game::Heading::kRight);
          break;
        }
        case TerminalIo::kArrowLeft: {
          snake_direction_change_callback_(game::Heading::kLeft);
          break;
        }
        case TerminalIo::kArrowUp: {
          snake_direction_change_callback_(game::Heading::kUp);
          break;
        }
        case TerminalIo::kArrowDown: {
          snake_direction_change_callback_(game::Heading::kDown);
          break;
        }
        case 'q': [[fallthrough]];
        case TerminalIo::kAsciiEscape: {
          if (on_exit_callback_) on_exit_callback_();
          return;
        }
      }
    }
    std::this_thread::sleep_for(std::chrono::milliseconds{10});
  }
}

std::int32_t NcursesDrawer::to_world_row(
    std::int32_t canvas_row) const noexcept {
  return canvas_row - 1;
}
std::int32_t NcursesDrawer::to_world_col(
    std::int32_t canvas_col) const noexcept {
  return (canvas_col - 1) / 2;
}

std::int32_t NcursesDrawer::to_canvas_row(
    std::int32_t world_row) const noexcept {
  return world_row + 1;
}
std::int32_t NcursesDrawer::to_canvas_col(
    std::int32_t world_col) const noexcept {
  return (world_col * 2) + 1;
}

}  // namespace snake::ui
