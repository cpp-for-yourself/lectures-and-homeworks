import { createRef } from '@motion-canvas/core/lib/utils';
import { makeScene2D, Code, Camera, Node, lines } from '@motion-canvas/2d';
import { all, waitFor, waitUntil } from '@motion-canvas/core/lib/flow';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';
import { Stage } from '@motion-canvas/core';

export default makeScene2D(function* (view) {
  const codeRef = createRef<Code>();
  const camera_1 = createRef<Camera>();

  const scene = (
    <Node>
      <Code
        ref={codeRef}
        fontSize={50}
        fontFamily={'Fira Mono'}
        fontWeight={500}
        offset={-1} />
    </Node>
  );

  view.add(
    <>
      <Camera.Stage
        cameraRef={camera_1}
        scene={scene}
        size={[1920, 1080]}
        position={[0, 0]}
      />
    </>,
  );

  const duration = 1.0

  const static_polymorphism = `\
#include <iostream>
#include <string>

struct PngImage {
  void Save(const std::string& file_name) const {
    std::cout << "Saving " << file_name << ".png\\n";
  }
  // Some private image data would go here.
};

struct JpegImage {
  void Save(const std::string& file_name) const {
    std::cout << "Saving " << file_name << ".jpg\\n";
  }
  // Some private image data would go here.
};

template <typename Image>
void SaveImage(const Image& image, const std::string& file_name) {
  image.Save(file_name);
}

int main() {
  SaveImage(PngImage{}, "output");
  SaveImage(JpegImage{}, "output");
}`

  yield* all(
    codeRef().code(static_polymorphism, 0.0).wait(duration),
    camera_1().centerOn([1000, 700], 0.0),
    camera_1().zoom(0.5, 0.0),
  );

  const dynamic_polymorphism_1 = `\
#include <iostream>
#include <string>

// 💡 See lecture on inheritance for details.
struct Noncopyable {
  Noncopyable() = default;
  Noncopyable(const Noncopyable&) = delete;
  Noncopyable(Noncopyable&&) = delete;
  Noncopyable& operator=(const Noncopyable&) = delete;
  Noncopyable& operator=(Noncopyable&&) = delete;
  ~Noncopyable() = default;
};

struct Saveable : public Noncopyable {
  virtual void Save(const std::string& file_name) const = 0;
  virtual ~Saveable() = default;
};

struct PngImage {
  void Save(const std::string& file_name) const {
    std::cout << "Saving " << file_name << ".png\\n";
  }
  // Some private image data would go here.
};

struct JpegImage {
  void Save(const std::string& file_name) const {
    std::cout << "Saving " << file_name << ".jpg\\n";
  }
  // Some private image data would go here.
};

template <typename Image>
void SaveImage(const Image& image, const std::string& file_name) {
  image.Save(file_name);
}

int main() {
  SaveImage(PngImage{}, "output");
  SaveImage(JpegImage{}, "output");
}`

  yield* all(
    codeRef().code(dynamic_polymorphism_1, duration).wait(duration),
  );

  const dynamic_polymorphism_2 = `\
#include <iostream>
#include <memory>
#include <string>
#include <vector>

// 💡 See lecture on inheritance for details.
struct Noncopyable {
  Noncopyable() = default;
  Noncopyable(const Noncopyable&) = delete;
  Noncopyable(Noncopyable&&) = delete;
  Noncopyable& operator=(const Noncopyable&) = delete;
  Noncopyable& operator=(Noncopyable&&) = delete;
  ~Noncopyable() = default;
};

struct Saveable : public Noncopyable {
  virtual void Save(const std::string& file_name) const = 0;
  virtual ~Saveable() = default;
};

struct PngImage : public Saveable {
  void Save(const std::string& file_name) const override {
    std::cout << "Saving " << file_name << ".png\\n";
  }
  // Some private image data would go here.
};

struct JpegImage : public Saveable {
  void Save(const std::string& file_name) const override {
    std::cout << "Saving " << file_name << ".jpg\\n";
  }
  // Some private image data would go here.
};

void SaveImage(const Saveable& image, const std::string& file_name) {
  image.Save(file_name);
}

int main() {
  // A bunch of image pointers that can be put here at runtime.
  std::vector<std::unique_ptr<Saveable>> images;
  // This can be steered by user input or some other runtime events.
  images.push_back(std::make_unique<PngImage>());
  images.push_back(std::make_unique<JpegImage>());
  for (const auto& image : images) SaveImage(*image, "output");
}`
  yield* all(
    camera_1().centerOn([1000, 1600], duration),
  );

  yield* all(
    codeRef().code(dynamic_polymorphism_2, duration).wait(duration),
    camera_1().centerOn([1000, 1800], duration),
  );

  yield* all(
    codeRef().code(dynamic_polymorphism_2, 0.0).wait(duration),
    camera_1().zoom(0.35, 0.0),
    camera_1().centerOn([1000, 1400], 0.0),
  );

  // yield* all(
  //   camera_1().zoom(0.5, duration),
  //   camera_1().centerOn([1000, 1800], duration),
  // );

  const variant_polymorphism = `\
#include <iostream>
#include <string>
#include <variant>
#include <vector>

struct PngImage {
  void Save(const std::string& file_name) const {
    std::cout << "Saving " << file_name << ".png\\n";
  }
  // Some private image data would go here.
};

struct JpegImage {
  void Save(const std::string& file_name) const {
    std::cout << "Saving " << file_name << ".jpg\\n";
  }
  // Some private image data would go here.
};

// This alias is only here for convenience.
using Image = std::variant<PngImage, JpegImage>;

void SaveImage(const Image& image, const std::string& file_name) {
  std::visit([&](const auto& img) { img.Save(file_name); }, image);
}

int main() {
  // Just as before, this can happen at runtime.
  const std::vector<Image> images = {PngImage{}, JpegImage{}};
  for (const auto& image : images) SaveImage(image, "output");
}`

  yield* all(
    codeRef().code(variant_polymorphism, duration).wait(duration),
    camera_1().zoom(0.5, duration),
    camera_1().centerOn([1000, 900], duration),
  );

  // Visit part

  const visit_printer = `\
#include <iostream>
#include <string>
#include <variant>

struct Printer {
  void operator()(int value) const {
    std::cout << "Integer: " << value << '\\n';
  }
  void operator()(const std::string& value) const {
    std::cout << "String: " << value << '\\n';
  }
};

int main() {
  const Printer printer{};
  std::variant<int, std::string> value{};
  std::visit(printer, value);
  value = "Hello, variant!";
  std::visit(printer, value);
  value = 42;
  std::visit(printer, value);
}`

  yield* all(
    codeRef().code(visit_printer, 0.0).wait(duration),
    camera_1().centerOn([1000, 700], 0.0),
    camera_1().zoom(0.7, 0.0),
  );

  const visit_lambda = `\
#include <iostream>
#include <string>
#include <variant>

int main() {
  const auto Print = [](const auto& value) { std::cout << value << '\\n'; };

  std::variant<int, std::string> value{};
  std::visit(Print, value);
  value = "Hello, variant!";
  std::visit(Print, value);
  value = 42;
  std::visit(Print, value);
}`

  yield* all(
    codeRef().code(visit_lambda, duration).wait(duration),
    camera_1().centerOn([1000, 400], duration),
    camera_1().zoom(0.7, duration),
  );

  const visit_overloaded = `\
#include <iostream>
#include <string>
#include <variant>

// Helper type for nicer calling-site syntax.
// Can live in another file.
template <class... Ts>
struct Overloaded : Ts... {
  using Ts::operator()...;
};
// Explicit deduction guide (not needed as of C++20).
template <class... Ts>
Overloaded(Ts...) -> Overloaded<Ts...>;

int main() {
  std::variant<int, std::string> value{};

  const Overloaded visitor{
      [](int arg) { std::cout << "Int: " << arg << '\\n'; },
      [](const std::string& arg) { std::cout << "String: " << arg << '\\n'; }};

  std::visit(visitor, value);
  value = "Hello, variant!";
  std::visit(visitor, value);
  value = 42;
  std::visit(visitor, value);
}`

  yield* all(
    codeRef().code(visit_overloaded, duration).wait(duration),
    camera_1().centerOn([1000, 800], duration),
    camera_1().zoom(0.6, duration),
  );

  const visit_overloaded_full = `\
#include <iostream>
#include <string>
#include <variant>

// Helper type for nicer calling-site syntax.
// Can live in another file.
template <class... Ts>
struct Overloaded : Ts... {
  using Ts::operator()...;
};
// Explicit deduction guide (not needed as of C++20).
template <class... Ts>
Overloaded(Ts...) -> Overloaded<Ts...>;

int main() {
  std::variant<std::monostate, int, std::string> value{};

  const Overloaded visitor{
      [](auto arg) { std::cout << "Unknown type\\n"; },
      [](int arg) { std::cout << "Int: " << arg << '\\n'; },
      [](const std::string& arg) { std::cout << "String: " << arg << '\\n'; }};

  std::visit(visitor, value);
  value = "Hello, variant!";
  std::visit(visitor, value);
  value = 42;
  std::visit(visitor, value);
}`

  yield* all(
    codeRef().code(visit_overloaded_full, duration).wait(duration),
    camera_1().centerOn([1000, 850], duration),
    camera_1().zoom(0.6, duration),
  );

  yield* waitFor(duration * 3);
});
