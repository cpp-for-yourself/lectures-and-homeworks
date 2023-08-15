#include "ftxui/screen/color.hpp"
#include "ftxui/screen/screen.hpp"

namespace {
const ftxui::Color kYellowishColor = ftxui::Color::RGB(255, 200, 100);
}

int main() {
  const ftxui::Dimensions dimensions{ftxui::Dimension::Full()};
  ftxui::Screen screen{ftxui::Screen::Create(dimensions)};
  auto &pixel_left = screen.PixelAt(10, 10);
  pixel_left.background_color = kYellowishColor;
  pixel_left.character = ' ';
  auto &pixel_right = screen.PixelAt(11, 10);
  pixel_right.background_color = kYellowishColor;
  pixel_right.character = ' ';
  screen.Print();
  return 0;
}
