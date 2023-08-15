// Make sure to have this in EXACTLY one cpp file
// The best place for this is the cpp file of your library
// that holds a class that wraps around the stb_image data
// For more see here: https://github.com/nothings/stb#faq
#define STB_IMAGE_IMPLEMENTATION
#include "stb/stb_image.h"

#include <filesystem>
#include <iostream>

namespace {
static constexpr auto kLoadAllChannels{0};

// A dummy color structure. Use ftxui::Color in actual code.
struct Color {
  int red;
  int green;
  int blue;
};

}  // namespace

int main(int argc, char **argv) {
  if (argc < 2) { std::cerr << "No image provided.\n"; }
  const std::filesystem::path image_path{argv[1]};
  if (!std::filesystem::exists(image_path)) {
    std::cerr << "No image file: " << image_path << std::endl;
    std::exit(1);
  }

  // Load the data
  int rows{};
  int cols{};
  int channels{};
  // This call also populates rows, cols, channels.
  auto image_data{
      stbi_load(image_path.c_str(), &cols, &rows, &channels, kLoadAllChannels)};
  std::cout << "Loaded image of size: [" << rows << ", " << cols << "] with "
            << channels << " channels\n";
  if (!image_data) {
    std::cerr << "Failed to load image data from file: " << image_path
              << std::endl;
    std::exit(1);
  }

  // The data is stored sequentially, in this order per pixel: red, green, blue,
  // alpha This patterns repeats for every pixel of the image, so the resulting
  // data layout is: [rgbargbargba...]
  int query_row = 3;
  int query_col = 2;
  const auto index{channels * (query_row * cols + query_col)};
  const Color color{
      image_data[index], image_data[index + 1], image_data[index + 2]};
  std::cout << "Color at pixel: [" << query_row << ", " << query_col
            << "] =  RGB: (" << color.red << ", " << color.green << ", "
            << color.blue << ")\n";

  // We must explicitly free the memory allocated for this image.
  // The reason for this is that stb_image is a C library,
  // which has no classes and no RAII in the form about which we talked before.
  // Now you see why people want to write C++ and not C? ;)
  stbi_image_free(image_data);
  return 0;
}
