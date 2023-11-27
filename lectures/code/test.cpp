class Image {
 public:
  static inline int instance_counter{};

  Image() { instance_counter++; }
  Image(const Image&) { instance_counter++; }
  Image(Image&&) = default;
  Image& operator=(const Image&) = default;
  Image& operator=(Image&&) = default;
  ~Image() { instance_counter--; }
};

#include <iostream>

int main() {
  std::cout << "Current count: " << Image::instance_counter << std::endl;
  Image image;
  std::cout << "Current count: " << Image::instance_counter << std::endl;
  {
    Image image_copy{image};
    std::cout << "Current count: " << Image::instance_counter << std::endl;
  }
  std::cout << "Current count: " << Image::instance_counter << std::endl;
  return 0;
}
