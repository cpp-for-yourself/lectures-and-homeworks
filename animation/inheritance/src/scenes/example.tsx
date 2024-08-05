import { createRef } from '@motion-canvas/core/lib/utils';
import { makeScene2D, Code, lines } from '@motion-canvas/2d';
import { all, waitFor, waitUntil } from '@motion-canvas/core/lib/flow';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';

import { store, simplify } from '../functions/functions'

export default makeScene2D(function* (view) {
  const codeRef = createRef<Code>();

  yield view.add(<Code
    ref={codeRef}
    fontSize={30}
    fontFamily={'Fira Mono'}
    fontWeight={500}
    offsetX={-1}
    x={-600}
  />);


  const duration = 1.0

  const code_image_jpeg = `\
#include <filesystem>
#include <vector>

// Assuming JpegIo is defined.

class Image {
 public:
  Image(const std::filesystem::path& path, const JpegIo& io) {
    colors_ = io.Read(path);
  }

  void Save(const std::filesystem::path& path, const JpegIo& io) const {
    io.Write(path, colors_);
  }

 private:
  std::vector<Color> colors_{};
};

int main() {
  const Image image{"path.jpeg", JpegIo{}};
  image.Save("other_path.jpeg", JpegIo{});
  return 0;
}`


  yield* codeRef().code(code_image_jpeg, 0).wait(duration);
  yield* waitFor(duration);

  const code_image_png = `\
#include <filesystem>
#include <vector>

// Assuming PngIo is defined.

class Image {
 public:
  Image(const std::filesystem::path& path, const PngIo& io) {
    colors_ = io.Read(path);
  }

  void Save(const std::filesystem::path& path, const PngIo& io) const {
    io.Write(path, colors_);
  }

 private:
  std::vector<Color> colors_{};
};

int main() {
  const Image image{"path.png", PngIo{}};
  image.Save("other_path.png", PngIo{});
  return 0;
}`
  yield* codeRef().code(code_image_png, duration).wait(duration);
  yield* waitFor(duration);

  const code_image_png_jpeg = `\
#include <filesystem>
#include <vector>

// Assuming PngIo, JpegIo are defined.

class Image {
 public:
  Image(const std::filesystem::path& path, const PngIo& io) {
    colors_ = io.Read(path);
  }

  void Save(const std::filesystem::path& path, const PngIo& io) const {
    io.Write(path, colors_);
  }

  Image(const std::filesystem::path& path, const JpegIo& io) {
    colors_ = io.Read(path);
  }

  void Save(const std::filesystem::path& path, const JpegIo& io) const {
    io.Write(path, colors_);
  }

 private:
  std::vector<Color> colors_{};
};

int main() {
  const Image image{"path.jpeg", JpegIo{}};
  image.Save("other_path.png", PngIo{});
  return 0;
}`

  yield* all(
    codeRef().code(code_image_png_jpeg, duration).wait(duration),
    codeRef().fontSize(25, duration)
  );
  yield* waitFor(duration);


  const code_image_interface = `\
#include <filesystem>
#include <vector>

// Assuming IoInterface, PngIo, JpegIo are defined.

class Image {
 public:
  Image(const std::filesystem::path& path, const IoInterface& io) {
    colors_ = io.Read(path);
  }

  void Save(const std::filesystem::path& path, const IoInterface& io) const {
    io.Write(path, colors_);
  }

 private:
  std::vector<Color> colors_{};
};

int main() {
  const Image image{"path.jpeg", JpegIo{}};
  image.Save("other_path.png", PngIo{});
  return 0;
}`
  yield* all(
    codeRef().code(code_image_interface, duration).wait(duration),
    codeRef().fontSize(30, duration)
  );
  yield* waitFor(duration);

  const code_image_interface_jpeg = `\
#include <filesystem>
#include <vector>

// Assuming IoInterface, PngIo, JpegIo are defined.

class Image {
 public:
  Image(const std::filesystem::path& path, const IoInterface& io) {
    colors_ = io.Read(path);
  }

  void Save(const std::filesystem::path& path, const IoInterface& io) const {
    io.Write(path, colors_);
  }

 private:
  std::vector<Color> colors_{};
};

int main() {
  const Image image{"path.jpeg", JpegIo{}};
  image.Save("other_path.jpeg", JpegIo{});
  return 0;
}`
  yield* all(
    codeRef().code(code_image_interface_jpeg, duration).wait(duration),
    codeRef().fontSize(30, duration)
  );

  const code_image_interface_png = `\
#include <filesystem>
#include <vector>

// Assuming IoInterface, PngIo, JpegIo are defined.

class Image {
 public:
  Image(const std::filesystem::path& path, const IoInterface& io) {
    colors_ = io.Read(path);
  }

  void Save(const std::filesystem::path& path, const IoInterface& io) const {
    io.Write(path, colors_);
  }

 private:
  std::vector<Color> colors_{};
};

int main() {
  const Image image{"path.png", PngIo{}};
  image.Save("other_path.png", PngIo{});
  return 0;
}`
  yield* all(
    codeRef().code(code_image_interface_png, duration).wait(duration),
    codeRef().fontSize(30, duration)
  );

  yield* all(
    codeRef().code(code_image_interface, duration).wait(duration),
    codeRef().fontSize(30, duration)
  );
  yield* waitFor(duration);

  const code_image_template = `\
#include <vector>

// Assuming the JpegSavingStrategy is implemented.

class Image {
 public:
  template <typename SavingStrategy>
  void Save(const SavingStrategy& strategy) const {
    strategy.Save(pixels_);
  }

 private:
  std::vector<Color> pixels_{};
};

int main() {
  Image image{}; // Somehow create an image.
  image.Save(JpegSavingStrategy{"image.jpg"});
  return 0;
}`

  yield* all(
    codeRef().code(code_image_template, 0).wait(duration),
    codeRef().fontSize(30, 0)
  );
  yield* waitFor(duration);

  const code_base_derived = `\
#include <iostream>

// Using struct here but the same holds for classes
struct Base {
  void DoSmth() const { std::cout << "Base DoSmth" << std::endl; }
  void BaseMethod() const { std::cout << "BaseMethod" << std::endl; }
  // Doesn't have to be int
  int base_data{};
};

// Using struct here but the same holds for classes
struct Derived : public Base {
  void DoSmth() const { std::cout << "Derived DoSmth" << std::endl; }
  void DerivedMethod() const { std::cout << "DerivedMethod" << std::endl; }
  // Also can be any other type
  float derived_data{};
};

int main() {
  const Derived object{};
  object.BaseMethod();
  object.DerivedMethod();
  object.DoSmth();
  std::cout << "&object.base_data:    " << &object.base_data << std::endl;
  std::cout << "&object.derived_data: " << &object.derived_data << std::endl;
}`

  yield* all(
    codeRef().code(code_base_derived, 0).wait(duration),
    codeRef().fontSize(30, 0)
  );
  yield* waitFor(duration);

  const code_base_derived_base_ref = `\
#include <iostream>

// Using struct here but the same holds for classes
struct Base {
  void DoSmth() const { std::cout << "Base DoSmth" << std::endl; }
  void BaseMethod() const { std::cout << "BaseMethod" << std::endl; }
  // Doesn't have to be int
  int base_data{};
};

// Using struct here but the same holds for classes
struct Derived : public Base {
  void DoSmth() const { std::cout << "Derived DoSmth" << std::endl; }
  void DerivedMethod() const { std::cout << "DerivedMethod" << std::endl; }
  // Also can be any other type
  float derived_data{};
};

int main() {
  const Derived derived{};
  const Base& base{derived};
  base.BaseMethod();
  base.DoSmth();
}`

  yield* all(
    codeRef().code(code_base_derived_base_ref, duration).wait(duration),
    codeRef().fontSize(30, duration)
  );
  yield* waitFor(duration);

  const code_is_integral_old = `\
template <typename T>
struct is_integral {
  static constexpr inline bool value{};
};`

  yield* all(
    codeRef().code(code_is_integral_old, 0).wait(duration),
    codeRef().fontSize(30, 0)
  );
  yield* waitFor(duration);

  const code_is_integral_and_const = `\
template<class T, T v>
struct integral_constant {
    static constexpr inline T value = v;
};

template <typename T>
struct is_integral {
  static constexpr inline bool value{};
};`

  yield* all(
    codeRef().code(code_is_integral_and_const, duration).wait(duration),
    codeRef().fontSize(30, duration)
  );
  yield* waitFor(duration);

  const code_is_integral_and_const_true_false = `\
template<class T, T v>
struct integral_constant {
    static constexpr inline T value = v;
};

using true_type = integral_constant<bool, true>;
using false_type = integral_constant<bool, false>;

template <typename T>
struct is_integral {
  static constexpr inline bool value{};
};`

  yield* all(
    codeRef().code(code_is_integral_and_const_true_false, duration).wait(duration),
    codeRef().fontSize(30, duration)
  );
  yield* waitFor(duration);

  const code_is_integral_final = `\
template<class T, T v>
struct integral_constant {
    static constexpr inline T value = v;
};

using true_type = integral_constant<bool, true>;
using false_type = integral_constant<bool, false>;

template <typename T>
struct is_integral : public false_type {};

// Specializations for any types we deem integral.
template <>
struct is_integral<int> : public true_type {};

static_assert(is_integral<int>::value);
static_assert(is_integral<float>::value == false);`

  yield* all(
    codeRef().code(code_is_integral_final, duration).wait(duration),
    codeRef().fontSize(30, duration)
  );
  yield* waitFor(duration);

  const code_virtual_initial = `\
#include <iostream>

// 😱 We do not follow best practices for simplicity here.
// This struct misses lots of special functions.
// Some of them must be virtual, some deleted. Stay tuned.
struct Base {
  virtual void DoSmth() const { std::cout << "Base DoSmth" << std::endl; }
};

// 😱 We do not follow best practices for simplicity here.
// This struct misses lots of special functions.
// Some of them must be virtual, some deleted. Stay tuned.
struct Derived : public Base {
  void DoSmth() const override { std::cout << "Derived DoSmth" << std::endl; }
};

int main() {
  const Derived derived{};
  const Base base{};
  const Base& base_ref = derived;
  base.DoSmth();      // Calls Base implementation.
  derived.DoSmth();   // Calls Derived implementation.
  base_ref.DoSmth();  // Calls Derived implementation.
}`

  yield* all(
    codeRef().code(code_virtual_initial, 0).wait(duration),
    codeRef().fontSize(30, 0)
  );
  yield* waitFor(duration);

  const base_derived_no_virtual = `\
#include <iostream>

struct Base {
  // 😱 Careful! No virtual destructor! Other methods missing!
  ~Base() { std::cout << "Base cleanup" << std::endl; }
};

struct Derived : public Base {
  ~Derived() { std::cout << "Important cleanup" << std::endl; }
};

int main() {
  // 😱 Code for illustrating a memory leak only! Avoid using new!
  Base* ptr = new Derived;
  delete ptr;  // Important cleanup is never printed!
}`

  yield* all(
    codeRef().code(base_derived_no_virtual, 0).wait(duration),
    codeRef().fontSize(30, 0)
  );
  yield* waitFor(duration);

  const base_derived_virtual = `\
#include <iostream>

struct Base {
  // 😱 Still other methods missing!
  virtual ~Base() { std::cout << "Base cleanup" << std::endl; }
};

struct Derived : public Base {
  ~Derived() override { std::cout << "Important cleanup" << std::endl; }
};

int main() {
  // 😱 This will work but please don't use new!
  Base* ptr = new Derived;
  delete ptr;
}`

  yield* all(
    codeRef().code(base_derived_virtual, duration).wait(duration),
    codeRef().fontSize(30, duration)
  );
  yield* waitFor(duration);


  yield* all(
    codeRef().code(code_virtual_initial, 0).wait(duration),
    codeRef().fontSize(30, 0)
  );
  yield* waitFor(duration);

  const code_virtual_better = `\
#include <iostream>

struct Base {
  virtual void DoSmth() { std::cout << "Base DoSmth" << std::endl; }

  Base() = default;

  Base(const Base&) = delete;
  Base(Base&&) = delete;
  Base& operator=(const Base&) = delete;
  Base& operator=(Base&&) = delete;
  virtual ~Base() = default;
};

struct Derived : public Base {
  void DoSmth() override { std::cout << "Derived DoSmth" << std::endl; }
};

int main() {
  Derived derived{};
  Base base{};
  Base& base_ref = derived;
  base.DoSmth();      // Calls Base implementation.
  derived.DoSmth();   // Calls Derived implementation.
  base_ref.DoSmth();  // Calls Derived implementation.
}`

  yield* all(
    codeRef().code(code_virtual_better, duration).wait(duration),
    codeRef().fontSize(30, duration)
  );
  yield* waitFor(duration);

  const code_virtual_better_noncopyable = `\
#include <iostream>

struct Noncopyable {
  Noncopyable() = default;
  Noncopyable(const Noncopyable&) = delete;
  Noncopyable(Noncopyable&&) = delete;
  Noncopyable& operator=(const Noncopyable&) = delete;
  Noncopyable& operator=(Noncopyable&&) = delete;
  ~Noncopyable() = default;
};

struct Base : public Noncopyable {
  virtual void DoSmth() const { std::cout << "Base DoSmth" << std::endl; }
  virtual ~Base() = default;
};

struct Derived : public Base {
  void DoSmth() const override { std::cout << "Derived DoSmth" << std::endl; }
};

int main() {
  const Derived derived{};
  const Base base{};
  const Base& base_ref = derived;
  base.DoSmth();      // Calls Base implementation.
  derived.DoSmth();   // Calls Derived implementation.
  base_ref.DoSmth();  // Calls Derived implementation.
}`

  yield* all(
    codeRef().code(code_virtual_better_noncopyable, duration).wait(duration),
    codeRef().fontSize(30, duration)
  );
  yield* waitFor(duration);

  const dynamic_cast = `\
#include <iostream>

struct Base : public Noncopyable {
  virtual ~Base() {}
};

struct OtherBase : public Noncopyable {
  virtual ~OtherBase() {}
};

struct Derived : public Base {};

int main() {
  const Derived object{};
  const Base& base_ref{object};
  const OtherBase other_base{};
  const OtherBase& other_base_ref{other_base};
  const Derived& derived_ref = dynamic_cast<const Derived&>(base_ref);
  // other_derived_ptr will be nullptr because it is not derived from OtherBase.
  const Derived* other_derived_ptr =
      dynamic_cast<const Derived*>(&other_base_ref);
  // ❌ The following will throw a std::bad_cast.
  // const Derived& other_derived_ref = dynamic_cast<const
  // Derived&>(other_base_ref);
}`

  yield* all(
    codeRef().code(dynamic_cast, 0).wait(duration),
    codeRef().fontSize(30, 0)
  );
  yield* waitFor(duration);

  yield* all(
    codeRef().code(code_virtual_better_noncopyable, 0).wait(duration),
    codeRef().fontSize(30, 0)
  );
  yield* waitFor(duration);

  const code_virtual_better_noncopyable_interface = `\
#include <iostream>

struct Noncopyable {
  Noncopyable() = default;
  Noncopyable(const Noncopyable&) = delete;
  Noncopyable(Noncopyable&&) = delete;
  Noncopyable& operator=(const Noncopyable&) = delete;
  Noncopyable& operator=(Noncopyable&&) = delete;
  ~Noncopyable() = default;
};

struct Base : public Noncopyable {
  virtual void DoSmth() const = 0;
  virtual ~Base() = default;
};

struct Derived final : public Base {
  void DoSmth() const override { std::cout << "Derived DoSmth" << std::endl; }
};

struct AnotherDerived final : public Base {
  void DoSmth() const override { std::cout << "AnotherDerived DoSmth" << std::endl; }
};

int main() {
  const Derived derived{};
  const AnotherDerived another_derived{};
  const Base* base_ptr = &derived;
  base_ptr->DoSmth();  // Calls Derived implementation.
  base_ptr = &another_derived;
  base_ptr->DoSmth();  // Calls AnotherDerived implementation.
}`

  yield* all(
    codeRef().code(code_virtual_better_noncopyable_interface, duration).wait(duration),
    codeRef().fontSize(25, duration)
  );
  yield* waitFor(duration);

  yield* all(
    codeRef().code(code_image_interface, 0).wait(duration),
    codeRef().fontSize(30, 0)
  );
  yield* waitFor(duration);

  const code_image_interface_noncopyable = `\
#include <filesystem>
#include <vector>

// Assuming IoInterface, PngIo, JpegIo are defined.

struct Noncopyable {
  Noncopyable() = default;
  Noncopyable(const Noncopyable&) = delete;
  Noncopyable(Noncopyable&&) = delete;
  Noncopyable& operator=(const Noncopyable&) = delete;
  Noncopyable& operator=(Noncopyable&&) = delete;
  ~Noncopyable() = default;
};

class Image {
 public:
  Image(const std::filesystem::path& path, const IoInterface& io) {
    colors_ = io.Read(path);
  }

  void Save(const std::filesystem::path& path, const IoInterface& io) const {
    io.Write(path, colors_);
  }

 private:
  std::vector<Color> colors_{};
};

int main() {
  const Image image{"path.jpeg", JpegIo{}};
  image.Save("other_path.png", PngIo{});
  return 0;
}`
  yield* all(
    codeRef().code(code_image_interface_noncopyable, duration),
    codeRef().fontSize(30, duration),
    codeRef().y(150, duration)
  );

  const code_image_interface_defined = `\
#include <filesystem>
#include <vector>

// Assuming PngIo, JpegIo are defined.

struct Noncopyable {
  Noncopyable() = default;
  Noncopyable(const Noncopyable&) = delete;
  Noncopyable(Noncopyable&&) = delete;
  Noncopyable& operator=(const Noncopyable&) = delete;
  Noncopyable& operator=(Noncopyable&&) = delete;
  ~Noncopyable() = default;
};

struct IoInterface : public Noncopyable {
  virtual std::vector<Color> Read(const std::filesystem::path& path) const = 0;
  virtual void Write(const std::filesystem::path& path,
                     const std::vector<Color>& data) const = 0;
  virtual ~IoInterface() = default;
};

class Image {
 public:
  Image(const std::filesystem::path& path, const IoInterface& io) {
    colors_ = io.Read(path);
  }

  void Save(const std::filesystem::path& path, const IoInterface& io) const {
    io.Write(path, colors_);
  }

 private:
  std::vector<Color> colors_{};
};

int main() {
  const Image image{"path.jpeg", JpegIo{}};
  image.Save("other_path.png", PngIo{});
  return 0;
}`
  yield* all(
    codeRef().code(code_image_interface_defined, duration),
    codeRef().fontSize(30, duration),
    codeRef().y(250, duration)
  );
  yield* waitFor(duration);

  const code_image_interface_and_strategies = `\
#include <filesystem>
#include <iostream>
#include <vector>

// Assuming PngIo, JpegIo are defined.

struct Noncopyable {
  Noncopyable() = default;
  Noncopyable(const Noncopyable&) = delete;
  Noncopyable(Noncopyable&&) = delete;
  Noncopyable& operator=(const Noncopyable&) = delete;
  Noncopyable& operator=(Noncopyable&&) = delete;
  ~Noncopyable() = default;
};

struct IoInterface : public Noncopyable {
  virtual std::vector<Color> Read(const std::filesystem::path& path) const = 0;
  virtual void Write(const std::filesystem::path& path,
                     const std::vector<Color>& data) const = 0;
  virtual ~IoInterface() = default;
};

struct JpegIo final : public IoInterface {
  std::vector<Color> Read(const std::filesystem::path& path) const override {
    std::cout << "Reading JPEG from path: " << path << std::endl;
    return {};
  }
  void Write(const std::filesystem::path& path,
                     const std::vector<Color>& data) const override {
    std::cout << "Writing JPEG to path: " << path << std::endl;
  }
};

struct PngIo final : public IoInterface {
  std::vector<Color> Read(const std::filesystem::path& path) const override {
    std::cout << "Reading PNG from path: " << path << std::endl;
    return {};
  }
  void Write(const std::filesystem::path& path,
                     const std::vector<Color>& data) const override {
    std::cout << "Writing PNG to path: " << path << std::endl;
  }
};

class Image {
 public:
  Image(const std::filesystem::path& path, const IoInterface& io) {
    colors_ = io.Read(path);
  }

  void Save(const std::filesystem::path& path, const IoInterface& io) const {
    io.Write(path, colors_);
  }

 private:
  std::vector<Color> colors_{};
};

int main() {
  const Image image{"path.jpeg", JpegIo{}};
  image.Save("other_path.png", PngIo{});
  return 0;
}`
  yield* all(
    codeRef().code(code_image_interface_and_strategies, duration),
    codeRef().fontSize(25, duration),
    codeRef().y(50, duration)
  );
  yield* waitFor(duration);

  yield* all(
    codeRef().y(-600, duration)
  );
  yield* waitFor(duration);

  yield* all(
    codeRef().fontSize(12, duration),
    codeRef().y(0, duration)
  );
  yield* waitFor(duration);


  const code_virtual_explanation_1 = `\
#include <iostream>

// 😱 This struct misses some special functions. Stay tuned.
struct Base {
  virtual void DoSmth() const {}
  virtual void DoSmthElse() const {}
};

// 😱 This struct misses some special functions. Stay tuned.
struct Derived : public Base {
  void DoSmth() const override {}
};

int main() {
  const Derived derived{};
  const Base& base_ref = derived;
  base_ref.DoSmth();  // Calls Derived implementation.
  base_ref.DoSmthElse();  // Calls Base implementation as Derived has no override.
}`

  yield* all(
    codeRef().code(code_virtual_explanation_1, 0),
    codeRef().fontSize(25, 0),
    codeRef().x(-800, 0)
  );
  yield* waitFor(duration);

  const code_virtual_explanation_2 = `\
#include <iostream>

// 😱 This struct misses some special functions. Stay tuned.
struct Base {
  virtual void DoSmth() const {}
  virtual void DoSmthElse() const {}

  vTable* v_ptr;  // Added by the compiler.
};

// 😱 This struct misses some special functions. Stay tuned.
struct Derived : public Base {
  void DoSmth() const override {}
};

int main() {
  const Derived derived{};
  const Base& base_ref = derived;
  base_ref.DoSmth();  // Calls Derived implementation.
  base_ref.DoSmthElse();  // Calls Base implementation as Derived has no override.
}`

  yield* all(
    codeRef().code(code_virtual_explanation_2, duration),
    codeRef().fontSize(25, duration),
    codeRef().y(0, duration)
  );
  yield* waitFor(duration);

  const code_virtual_explanation_base_ref = `\
#include <iostream>

// 😱 This struct misses some special functions. Stay tuned.
struct Base {
  virtual void DoSmth() const {}
  virtual void DoSmthElse() const {}

  vTable* v_ptr;  // Added by the compiler.
};

// 😱 This struct misses some special functions. Stay tuned.
struct Derived : public Base {
  void DoSmth() const override {}
};

int main() {
  const Base base{};
  const Base& base_ref = base;
  base_ref.DoSmth();  // What is called here?
  base_ref.DoSmthElse();  // What is called here?
}`

  yield* all(
    codeRef().code(code_virtual_explanation_base_ref, duration),
    codeRef().fontSize(25, duration),
    codeRef().y(0, duration)
  );
  yield* waitFor(duration);

  yield* waitFor(duration * 3);
});
