// Copyright Igor Bogoslavskyi, year 2025.
// In case of any problems with the code please contact me.
// Email: <name>.<family_name>@gmail.com.

#pragma once

#include <fmt/color.h>
#include <fmt/format.h>
#include <sys/ioctl.h>
#include <sys/termios.h>
#include <unistd.h>

#include <cstdint>
#include <iostream>
#include <limits>
#include <string>
#include <string_view>

#include "core/vector_2d.h"

namespace snake::ui {

struct TerminalIo {
  using Size = core::Vector2i;

  enum class AsciiColor {
    Black = 0,
    Red = 1,
    Green = 2,
    Yellow = 3,
    Blue = 4,
    Magenta = 5,
    Cyan = 6,
    White = 7
  };

  enum class AsciiModifier { kForeground = 3, kBackground = 4 };

  constexpr static inline int kError = -1;
  constexpr static inline int kAsciiEscape = 27;
  constexpr static inline char kEscape = '\033';

  // Make sure that special symbols do not overlap with normal characters.
  constexpr static inline int kArrowUp = std::numeric_limits<char>::max() + 1;
  constexpr static inline int kArrowDown = kArrowUp + 1;
  constexpr static inline int kArrowRight = kArrowDown + 1;
  constexpr static inline int kArrowLeft = kArrowRight + 1;

  TerminalIo() : size_{GetTerminalSize()} {
    set_raw_mode(true);
    show_cursor(false);
    clearscreen();
  }

  ~TerminalIo() {
    resetcolor();
    set_raw_mode(false);
    clearscreen();
    movecursor(0, 0);
    show_cursor(true);
  }

  void DrawText(std::int32_t row,
                std::int32_t col,
                std::string_view text,
                AsciiColor color_background,
                AsciiColor color_foreground = AsciiColor::White,
                bool bold = true) const {
    movecursor(row, col);
    std::cerr << fmt::format(
        "{}[{};{}{};{}{}m{}",
        kEscape,
        bold ? 1 : 0,
        static_cast<std::int32_t>(TerminalIo::AsciiModifier::kBackground),
        static_cast<std::int32_t>(color_background),
        static_cast<std::int32_t>(TerminalIo::AsciiModifier::kForeground),
        static_cast<std::int32_t>(color_foreground),
        text);
  }

  static inline std::string ReadFromBuffer() {
    int buffer_size{};
    ioctl(STDIN_FILENO, FIONREAD, &buffer_size);
    std::string input{};
    input.reserve(buffer_size);
    for (int i = 0; i < buffer_size; ++i) input.push_back(getchar());
    return input;
  }

  int Parse() const {
    const auto inputs = ReadFromBuffer();
    if (inputs.empty()) return kError;
    if (inputs.front() != kAsciiEscape) { return inputs.front(); }
    if (inputs.size() == 1) return inputs.front();  // Just the escape.
    if (inputs[1] != '[') return kError;
    switch (inputs[2]) {
      case 'A': return kArrowUp;
      case 'B': return kArrowDown;
      case 'C': return kArrowRight;
      case 'D': return kArrowLeft;
      default: return kError;
    }
  }

  const Size& size() const { return size_; }

  static inline Size GetTerminalSize() {
    winsize w;
    ioctl(0, TIOCGWINSZ, &w);
    return core::Vector2i::FromRowCol(w.ws_row, w.ws_col);
  }

  inline void set_raw_mode(bool raw_mode) {
    if (raw_mode) {
      tcgetattr(STDIN_FILENO, &old_tio_);
      termios tio = old_tio_;
      tio.c_lflag &= ~(ICANON | ECHO);  // Disable echo and canonical mode
      tcsetattr(STDIN_FILENO, TCSANOW, &tio);
      return;
    }
    tcsetattr(STDIN_FILENO, TCSANOW, &old_tio_);
  }

  static inline void show_cursor(bool flag) {
    std::cerr << (flag ? "\033[?25h" : "\033[?25l");
  }

  static inline void movecursor(std::int32_t row, std::int32_t col) {
    std::cerr << fmt::format("{}[{};{}H", kEscape, row, col);
  }

  static inline void resetcolor() { std::cerr << "\033[0m"; }

  static inline void clearscreen() { std::cerr << "\033[2J"; }

  int characters_in_buffer_{};
  Size size_{};
  termios old_tio_{};
};

}  // namespace snake::ui
