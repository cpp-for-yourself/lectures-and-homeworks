# Writing a small TUI image viewer

<p align="center">
  <a href="https://youtu.be/blah"><img src="https://img.youtube.com/vi/blah/0.jpg" alt="Video" align="right" width=40%></a>
</p>

Today we will write a small TUI image viewer.

Here is what we'll do:
1. Load png image data from disk using `stb_image` library:
    ```c++
    static constexpr auto kLoadAllChannels{0};
    int width{};  // Width of the image in pixels
    int height{};  // Height of the image in pixels
    int channels{};  // Number of colors per pixels, e.g. for RGB will be 3, for RGBA will be 4
    // Load the image from disk using stb_image library.
    // This call populates the width, height, channels variables.
    std::byte* image_data = stbi_load(input_filename.c_str(), &width, &height, &channels, kLoadAllChannels);
    const auto size_of_data = width * height * channels;
    if (image_data) {
      // Image loaded successfully. We can process it here.
    }
    // As stb_image allocates data for our image, we must explicitly free these data using the function also provided within the stb_image library.
    stbi_image_free(image);
    ```
2. Write your custom `Image` class that wraps these data and allows for modern value semantics, like copying or moving: (**TODO**, hide from user)
   1. For every pixel in your image store a struct `Color` with values `red`, `green` and `blue` all integer values from $[0, 256)$ (i.e., smallest value is `0`, largest is `255`)
   2. Make sure you get the image in constructor and free its memory in destructor
   3. The image must be both **copyable** and **moveable**. Implement the necessary constructors/operators. Follow the [rule of all or nothing](../../lectures/all_or_nothing.md).
   4. Use `std::copy` when copying the data (we've done something similar in the [move semantics lecture](../../lectures/move_semantics.md)):
      ```c++
      std::byte* old_image_data{GetFromSomewhere()};
      std::byte* new_image_data = stbi__malloc(size_of_data);
      std::copy(old_image_data, old_image_data + size_of_data, new_image_data);
      // We can work with new_image_data _and_ old_image_data now. We need to free both data when we are done with them.
      stbi_image_free(old_data_data);
      stbi_image_free(new_image_data);
      ```
   5. Don't forget to test your class!
3. Implement a `Shrink` function for the image that reduces the size of the image and averages the pixels that fall into the new pixels
4. Use the provided `PixelDrawer` class to draw the pixels of your image to the screen:
   ```c++
   const Image image{GetSomewhere()};
   const tui::PixelDrawer drawer{};
   for (const auto& pixel : image) {
      drawer.DrawPixel(pixel);
   }
   ```
   > Note that the `PixelDrawer` will draw the pixels from top-left of the terminal


Note that you can still print some debug information if you want to by utilizing the `stderr` stream:
```cmd
./pixelate 2>stderr.txt
```

TODO, test code
```c++
#include <iostream>
#include <ncurses.h>
#include <vector>

struct Color {
  short r, g, b;
};

std::vector<Color> colors{
    {0, 0, 0},       {128, 0, 0},     {0, 128, 0},     {128, 128, 0},
    {0, 0, 128},     {128, 0, 128},   {0, 128, 128},   {192, 192, 192},
    {128, 128, 128}, {255, 0, 0},     {0, 255, 0},     {255, 255, 0},
    {0, 0, 255},     {255, 0, 255},   {0, 255, 255},   {255, 255, 255},
    {0, 0, 0},       {0, 0, 95},      {0, 0, 135},     {0, 0, 175},
    {0, 0, 215},     {0, 0, 255},     {0, 95, 0},      {0, 95, 95},
    {0, 95, 135},    {0, 95, 175},    {0, 95, 215},    {0, 95, 255},
    {0, 135, 0},     {0, 135, 95},    {0, 135, 135},   {0, 135, 175},
    {0, 135, 215},   {0, 135, 255},   {0, 175, 0},     {0, 175, 95},
    {0, 175, 135},   {0, 175, 175},   {0, 175, 215},   {0, 175, 255},
    {0, 215, 0},     {0, 215, 95},    {0, 215, 135},   {0, 215, 175},
    {0, 215, 215},   {0, 215, 255},   {0, 255, 0},     {0, 255, 95},
    {0, 255, 135},   {0, 255, 175},   {0, 255, 215},   {0, 255, 255},
    {95, 0, 0},      {95, 0, 95},     {95, 0, 135},    {95, 0, 175},
    {95, 0, 215},    {95, 0, 255},    {95, 95, 0},     {95, 95, 95},
    {95, 95, 135},   {95, 95, 175},   {95, 95, 215},   {95, 95, 255},
    {95, 135, 0},    {95, 135, 95},   {95, 135, 135},  {95, 135, 175},
    {95, 135, 215},  {95, 135, 255},  {95, 175, 0},    {95, 175, 95},
    {95, 175, 135},  {95, 175, 175},  {95, 175, 215},  {95, 175, 255},
    {95, 215, 0},    {95, 215, 95},   {95, 215, 135},  {95, 215, 175},
    {95, 215, 215},  {95, 215, 255},  {95, 255, 0},    {95, 255, 95},
    {95, 255, 135},  {95, 255, 175},  {95, 255, 215},  {95, 255, 255},
    {135, 0, 0},     {135, 0, 95},    {135, 0, 135},   {135, 0, 175},
    {135, 0, 215},   {135, 0, 255},   {135, 95, 0},    {135, 95, 95},
    {135, 95, 135},  {135, 95, 175},  {135, 95, 215},  {135, 95, 255},
    {135, 135, 0},   {135, 135, 95},  {135, 135, 135}, {135, 135, 175},
    {135, 135, 215}, {135, 135, 255}, {135, 175, 0},   {135, 175, 95},
    {135, 175, 135}, {135, 175, 175}, {135, 175, 215}, {135, 175, 255},
    {135, 215, 0},   {135, 215, 95},  {135, 215, 135}, {135, 215, 175},
    {135, 215, 215}, {135, 215, 255}, {135, 255, 0},   {135, 255, 95},
    {135, 255, 135}, {135, 255, 175}, {135, 255, 215}, {135, 255, 255},
    {175, 0, 0},     {175, 0, 95},    {175, 0, 135},   {175, 0, 175},
    {175, 0, 215},   {175, 0, 255},   {175, 95, 0},    {175, 95, 95},
    {175, 95, 135},  {175, 95, 175},  {175, 95, 215},  {175, 95, 255},
    {175, 135, 0},   {175, 135, 95},  {175, 135, 135}, {175, 135, 175},
    {175, 135, 215}, {175, 135, 255}, {175, 175, 0},   {175, 175, 95},
    {175, 175, 135}, {175, 175, 175}, {175, 175, 215}, {175, 175, 255},
    {175, 215, 0},   {175, 215, 95},  {175, 215, 135}, {175, 215, 175},
    {175, 215, 215}, {175, 215, 255}, {175, 255, 0},   {175, 255, 95},
    {175, 255, 135}, {175, 255, 175}, {175, 255, 215}, {175, 255, 255},
    {215, 0, 0},     {215, 0, 95},    {215, 0, 135},   {215, 0, 175},
    {215, 0, 215},   {215, 0, 255},   {215, 95, 0},    {215, 95, 95},
    {215, 95, 135},  {215, 95, 175},  {215, 95, 215},  {215, 95, 255},
    {215, 135, 0},   {215, 135, 95},  {215, 135, 135}, {215, 135, 175},
    {215, 135, 215}, {215, 135, 255}, {215, 175, 0},   {215, 175, 95},
    {215, 175, 135}, {215, 175, 175}, {215, 175, 215}, {215, 175, 255},
    {215, 215, 0},   {215, 215, 95},  {215, 215, 135}, {215, 215, 175},
    {215, 215, 215}, {215, 215, 255}, {215, 255, 0},   {215, 255, 95},
    {215, 255, 135}, {215, 255, 175}, {215, 255, 215}, {215, 255, 255},
    {255, 0, 0},     {255, 0, 95},    {255, 0, 135},   {255, 0, 175},
    {255, 0, 215},   {255, 0, 255},   {255, 95, 0},    {255, 95, 95},
    {255, 95, 135},  {255, 95, 175},  {255, 95, 215},  {255, 95, 255},
    {255, 135, 0},   {255, 135, 95},  {255, 135, 135}, {255, 135, 175},
    {255, 135, 215}, {255, 135, 255}, {255, 175, 0},   {255, 175, 95},
    {255, 175, 135}, {255, 175, 175}, {255, 175, 215}, {255, 175, 255},
    {255, 215, 0},   {255, 215, 95},  {255, 215, 135}, {255, 215, 175},
    {255, 215, 215}, {255, 215, 255}, {255, 255, 0},   {255, 255, 95},
    {255, 255, 135}, {255, 255, 175}, {255, 255, 215}, {255, 255, 255},
    {8, 8, 8},       {18, 18, 18},    {28, 28, 28},    {38, 38, 38},
    {48, 48, 48},    {58, 58, 58},    {68, 68, 68},    {78, 78, 78},
    {88, 88, 88},    {98, 98, 98},    {108, 108, 108}, {118, 118, 118},
    {128, 128, 128}, {138, 138, 138}, {148, 148, 148}, {158, 158, 158},
    {168, 168, 168}, {178, 178, 178}, {188, 188, 188}, {198, 198, 198},
    {208, 208, 208}, {218, 218, 218}, {228, 228, 228}, {238, 238, 238},
};

int findClosestColor(int r, int g, int b) {
  int closestColor = 0;
  double closestDistance = std::numeric_limits<double>::max();

  // Iterate over the standard 256 xterm colors
  for (int color = 0; color < 256; color++) {
    const auto color_palette = colors[color];

    // Calculate the distance between the RGB values
    double distance = (r - color_palette.r) * (r - color_palette.r) +
                      (g - color_palette.g) * (g - color_palette.g) +
                      (b - color_palette.b) * (b - color_palette.b);

    if (distance < closestDistance && color > 8) {
      closestColor = color;
      closestDistance = distance;
    }
  }

  return closestColor;
}

void set_colors(void) {
  int i;
  initscr();
  noecho();
  start_color();
  use_default_colors();

  for (i = 0; i < 256; i++) {
    init_pair(i, i, i);
    attron(COLOR_PAIR(i));
    printw("  ");
    refresh();
  }

  int previous{-1};
  for (i = 0; i < 256; i++) {
    std::cerr << "query color: " << i << " " << i << " " << i << std::endl;
    int closestColor = findClosestColor(i, i, i);
    if (closestColor == previous) {
      continue;
    }
    std::cerr << "closestColor: " << closestColor << " | "
              << colors[closestColor].r << " " << colors[closestColor].g << " "
              << colors[closestColor].b << " " << std::endl;
    attron(COLOR_PAIR(closestColor));
    printw("  ");
    refresh();
    previous = closestColor;
  }
  previous = -1;

  standend();
  getch();
  endwin();
}

int main(void) {
  set_colors();
  return 0;
}
```
