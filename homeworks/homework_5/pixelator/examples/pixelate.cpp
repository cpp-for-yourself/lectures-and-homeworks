#include "pixelator/drawer.hpp"
#include "pixelator/pixelate_image.hpp"
#include "pixelator/stb_image_data_view.hpp"

#include <cstddef>
#include <filesystem>
#include <iostream>
#include <utility>

namespace {
using pixelator::Drawer;
using pixelator::PixelateImage;
using pixelator::StbImageDataView;
}  // namespace

int main(int argc, char **argv) {
  if (argc < 2) { std::cerr << "No image provided." << std::endl; }

  const StbImageDataView image{argv[1]};
  if (image.empty()) {
    std::cerr << "Image could not be loaded" << std::endl;
    exit(1);
  }
  Drawer drawer{ftxui::Dimension::Full()};

  drawer.Set(PixelateImage(image, drawer.size()));
  drawer.Draw();
  return 0;
}
