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
    fontSize={35}
    fontFamily={'Fira Mono'}
    fontWeight={500}
  />);


  const code = `
  struct Foo {
    template <typename ClassT>
    void Bar(ClassT value) {}  // 1️⃣
    void Bar(int value) {}     // 2️⃣

    template <typename ClassT>
    static void StaticBar(ClassT value) {}   // 3️⃣
    static void StaticBar(double value) {}   // 4️⃣
  };

  int main() {
    Foo foo{};
    // What gets called in every case?
    foo.Bar(42);
    foo.Bar(42.42);
    Foo::StaticBar(42);
    Foo::StaticBar(42.42);
  }`

  const code2 = `
  struct Foo {
    template <typename ClassT>
    void Bar(ClassT value) {}  // 1️⃣
    void Bar(int value) {}     // 2️⃣

    template <typename ClassT>
    static void StaticBar(ClassT value) {}   // 3️⃣
    static void StaticBar(double value) {}   // 4️⃣
  };

  // Specialize our template out-of-class anywhere
  // in the code after the class declaration.
  template<>
  void Foo::Bar(double value) {}  // 5️⃣

  int main() {
    Foo foo{};
    // What gets called in every case?
    foo.Bar(42);
    foo.Bar(42.42);
    Foo::StaticBar(42);
    Foo::StaticBar(42.42);
  }`

  const code_coordinate = `
  #include <iostream>

  class Coordinate {
    public:
      Coordinate(int row, int col) : row_{row}, col_{col} {}

      int row() const { return row_; }
      int col() const { return col_; }

      void Print() const {
        std::cout << "int coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
      }

    private:
      int row_{};
      int col_{};
  };

  int main() {
      const Coordinate coordinate{42, 23};
      coordinate.Print();
      return 0;
  }`

  const code_float_coordinate = `
  #include <iostream>

  class Coordinate {
     public:
      Coordinate(int row, int col) : row_{row}, col_{col} {}

      int row() const { return row_; }
      int col() const { return col_; }

      void Print() const {
        std::cout << "int coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
      }

     private:
      int row_{};
      int col_{};
  };

  class FloatCoordinate {
     public:
      FloatCoordinate(float row, float col) : row_{row}, col_{col} {}

      float row() const { return row_; }
      float col() const { return col_; }

      void Print() const {
        std::cout << "float coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
      }

     private:
      float row_{};
      float col_{};
  };

  int main() {
      const Coordinate coordinate{42, 23};
      coordinate.Print();
      const FloatCoordinate other_coordinate{42.42F, 23.23F};
      other_coordinate.Print();
      return 0;
  }`

  const code_template_coordinate = `
  #include <iostream>

  template <typename ScalarT>
  class Coordinate {
     public:
      Coordinate(ScalarT row, ScalarT col) : row_{row}, col_{col} {}

      ScalarT row() const { return row_; }
      ScalarT col() const { return col_; }

      void Print() const {
        std::cout << "Generic coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
      }

     private:
      ScalarT row_{};
      ScalarT col_{};
  };

  int main() {
    const Coordinate<int> coordinate{42, 23};
    coordinate.Print();
    const Coordinate<float> other_coordinate{42.42F, 23.23F};
    other_coordinate.Print();
    return 0;
  }`

  const code_template_coordinate_ctad = `
  #include <iostream>

  template <typename ScalarT>
  class Coordinate {
     public:
      Coordinate(ScalarT row, ScalarT col) : row_{row}, col_{col} {}

      ScalarT row() const { return row_; }
      ScalarT col() const { return col_; }

      void Print() const {
        std::cout << "Generic coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
      }

     private:
      ScalarT row_{};
      ScalarT col_{};
  };

  int main() {
    // In C++17 the compiler is able to figure out the types
    const Coordinate coordinate{42, 23};
    coordinate.Print();
    const Coordinate other_coordinate{42.42F, 23.23F};
    other_coordinate.Print();
    return 0;
  }`

  const code_template_coordinate_specialization = `
  #include <iostream>

  template <typename ScalarT>
  class Coordinate {
     public:
      Coordinate(ScalarT row, ScalarT col) : row_{row}, col_{col} {}

      ScalarT row() const { return row_; }
      ScalarT col() const { return col_; }

      void Print() const {
        std::cout << "Generic coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
      }

     private:
      ScalarT row_{};
      ScalarT col_{};
  };

  // Full class template specialization for ScalarT = float.
  template<>
  class Coordinate<float> {
     public:
      Coordinate(float row, float col) : row_{row}, col_{col} {}

      float row() const { return row_; }
      float col() const { return col_; }

      void Print() const {
        std::cout << "float coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
      }

     private:
      float row_{};
      float col_{};
  };

  int main() {
      // Creates a new implicit instantiation of Coordinate<int>
      const Coordinate coordinate{42, 23};
      coordinate.Print();
      // Uses the explicit instantiation of Coordinate<float>
      const Coordinate other_coordinate{42.42F, 23.23F};
      other_coordinate.Print();
      return 0;
  }`

  const code_template_coordinate_specialization_no_print = `
  #include <iostream>

  template <typename ScalarT>
  class Coordinate {
     public:
      Coordinate(ScalarT row, ScalarT col) : row_{row}, col_{col} {}

      ScalarT row() const { return row_; }
      ScalarT col() const { return col_; }

      void Print() const {
        std::cout << "Generic coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
      }

     private:
      ScalarT row_{};
      ScalarT col_{};
  };

  // Full class template specialization for ScalarT = float.
  template<>
  class Coordinate<float> {
     public:
      Coordinate(float row, float col) : row_{row}, col_{col} {}

      float row() const { return row_; }
      float col() const { return col_; }

     private:
      float row_{};
      float col_{};
  };

  int main() {
      // Creates a new implicit instantiation of Coordinate<int>
      const Coordinate coordinate{42, 23};
      coordinate.Print();
      // Uses the explicit instantiation of Coordinate<float>
      const Coordinate other_coordinate{42.42F, 23.23F};
      // ❌ Won't compile! No Print() function in explicit specialization
      other_coordinate.Print();
      return 0;
  }`

  const code_class_function_specialization = `
  #include <iostream>

  template <typename ScalarT>
  class Coordinate {
     public:
      Coordinate(ScalarT row, ScalarT col) : row_{row}, col_{col} {}

      ScalarT row() const { return row_; }
      ScalarT col() const { return col_; }

      void Print() const {
        std::cout << "Generic coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
      }

     private:
      ScalarT row_{};
      ScalarT col_{};
  };

  template<>
  void Coordinate<float>::Print() const {
      std::cout << "float coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
  }

  int main() {
      // In C++17 the compiler is able to figure out the types
      const Coordinate coordinate{42, 23};
      coordinate.Print();
      const Coordinate other_coordinate{42.42F, 23.23F};
      other_coordinate.Print();
      return 0;
  }`

  const code_cast_to = `
  #include <iostream>

  template <typename ScalarT>
  class Coordinate {
     public:
      Coordinate(ScalarT row, ScalarT col) : row_{row}, col_{col} {}

      ScalarT row() const { return row_; }
      ScalarT col() const { return col_; }

      void Print() const {
        std::cout << "Generic coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
      }

      template <typename OtherScalarT>
      Coordinate<OtherScalarT> CastTo() const {
          std::cout << "Non-trivial cast" << std::endl;
          return Coordinate<OtherScalarT>{
            static_cast<OtherScalarT>(row_), static_cast<OtherScalarT>(col_)};
      }

     private:
      ScalarT row_{};
      ScalarT col_{};
  };

  template<>
  void Coordinate<float>::Print() const {
      std::cout << "float coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
  }

  int main() {
      // In C++17 the compiler is able to figure out the types
      const Coordinate coordinate{42, 23};
      coordinate.Print();
      const Coordinate other_coordinate{42.42F, 23.23F};
      other_coordinate.Print();
      return 0;
  }`

  const code_cast_to_specialization = `
  #include <iostream>

  template <typename ScalarT>
  class Coordinate {
     public:
      Coordinate(ScalarT row, ScalarT col) : row_{row}, col_{col} {}

      ScalarT row() const { return row_; }
      ScalarT col() const { return col_; }

      void Print() const {
        std::cout << "Generic coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
      }

      template <typename OtherScalarT>
      Coordinate<OtherScalarT> CastTo() const {
          std::cout << "Non-trivial cast" << std::endl;
          return Coordinate<OtherScalarT>{
            static_cast<OtherScalarT>(row_), static_cast<OtherScalarT>(col_)};
      }

     private:
      ScalarT row_{};
      ScalarT col_{};
  };

  template<>
  void Coordinate<float>::Print() const {
      std::cout << "float coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
  }

  template <>
  template <>
  Coordinate<int> Coordinate<int>::CastTo<int>() const {
      std::cout << "Trivial cast" << std::endl;
      return *this;
  }

  int main() {
      // In C++17 the compiler is able to figure out the types
      const Coordinate coordinate{42, 23};
      coordinate.Print();
      const Coordinate other_coordinate{42.42F, 23.23F};
      other_coordinate.Print();
      return 0;
  }`

  const code_cast_to_specialization_main = `
  #include <iostream>

  template <typename ScalarT>
  class Coordinate {
     public:
      Coordinate(ScalarT row, ScalarT col) : row_{row}, col_{col} {}

      ScalarT row() const { return row_; }
      ScalarT col() const { return col_; }

      void Print() const {
        std::cout << "Generic coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
      }

      template <typename OtherScalarT>
      Coordinate<OtherScalarT> CastTo() const {
          std::cout << "Non-trivial cast" << std::endl;
          return Coordinate<OtherScalarT>{
            static_cast<OtherScalarT>(row_), static_cast<OtherScalarT>(col_)};
      }

     private:
      ScalarT row_{};
      ScalarT col_{};
  };

  template<>
  void Coordinate<float>::Print() const {
      std::cout << "float coordinate: [" << row_ << ", " << col_ << "]" << std::endl;
  }

  template <>
  template <>
  Coordinate<int> Coordinate<int>::CastTo<int>() const {
      std::cout << "Trivial cast" << std::endl;
      return *this;
  }

  int main() {
      // In C++17 the compiler is able to figure out the types
      const Coordinate coordinate{42.42F, 23.23F};
      coordinate.Print();
      const auto int_coordinate = coordinate.CastTo<int>();
      int_coordinate.Print();
      const auto another_int_coordinate = int_coordinate.CastTo<int>();
      another_int_coordinate.Print();
      return 0;
  }`

  const zoom_fn = (in_zoom: number) => new Vector2(in_zoom, in_zoom);

  const duration = 1.0

  yield* codeRef().code(code, 0).wait(duration);
  yield* codeRef().code(code2, duration);
  yield* waitFor(duration);

  yield* codeRef().code(code_coordinate, 0).wait(duration);
  yield* all(
    codeRef().code(code_float_coordinate, duration),
    codeRef().fontSize(20, duration)
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().code(code_template_coordinate, duration),
    codeRef().fontSize(30, duration)
  );
  yield* waitFor(duration);
  yield* codeRef().selection(codeRef().findAllRanges(/template/g), duration);
  yield* waitFor(duration);
  yield* codeRef().selection(codeRef().findFirstRange(/ScalarT/g), duration);
  yield* waitFor(duration);
  yield* codeRef().selection(codeRef().findFirstRange(/typename/g), duration);
  yield* waitFor(duration);
  yield* codeRef().selection(codeRef().findAllRanges(/ScalarT/g), duration);
  yield* waitFor(duration);
  yield* codeRef().selection(codeRef().findAllRanges(/Coordinate<\w*>/g), duration);
  yield* waitFor(duration);

  yield* codeRef().selection(DEFAULT);
  yield* waitFor(duration);
  yield* all(
    codeRef().code(code_template_coordinate_ctad, duration),
    codeRef().fontSize(30, duration)
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().code(code_template_coordinate_specialization, duration),
    codeRef().y(-350, duration),
    codeRef().selection(lines(20, Infinity), duration)
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().code(code_template_coordinate_specialization_no_print, duration),
    codeRef().y(-350, duration)
  );
  yield* waitFor(duration);

  yield* codeRef().selection(DEFAULT);
  yield* all(
    codeRef().code(code_template_coordinate_ctad, 0),
    codeRef().y(0, 0)
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().code(code_class_function_specialization, duration),
    codeRef().fontSize(25, duration)
  );
  yield* waitFor(duration);
  yield* codeRef().selection(codeRef().findAllRanges(/template<>/g), duration);
  yield* waitFor(duration);
  yield* codeRef().selection(codeRef().findAllRanges(/Coordinate<float>::/g), duration);
  yield* waitFor(duration);


  yield* codeRef().selection(DEFAULT);
  yield* waitFor(duration);
  yield* all(
    codeRef().code(code_cast_to, duration),
    codeRef().fontSize(35, duration)
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().code(code_cast_to_specialization, duration),
    codeRef().fontSize(30, duration),
    codeRef().y(-150, duration)
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().fontSize(35, duration),
    codeRef().y(-650, duration)
  );
  yield* all(
    codeRef().code(code_cast_to_specialization_main, duration),
  );
  yield* waitFor(duration);



  const is_integral_base = `
  template <typename T>
  struct is_integral {
    static constexpr inline bool value{};
  };`


  yield* all(
    codeRef().code(is_integral_base, 0),
    codeRef().fontSize(45, 0),
    codeRef().y(0, 0)
  );
  yield* waitFor(duration);

  const is_integral_not_working = `
  template <typename T>
  struct is_integral {
    static constexpr inline bool value{};
  };

  // ❌ Does not compile!
  static_assert(is_integral<int>::value);
  static_assert(!is_integral<double>::value);`

  yield* all(
    codeRef().code(is_integral_not_working, duration),
  );
  yield* waitFor(duration);

  const is_integral_specialization_int = `
  template <typename T>
  struct is_integral {
    static constexpr inline bool value{};
  };

  template <>
  struct is_integral<int> {
    static constexpr inline bool value{true};
  };

  // ✅ Compiles now!
  static_assert(is_integral<int>::value);
  static_assert(!is_integral<double>::value);`

  yield* all(
    codeRef().code(is_integral_specialization_int, duration),
  );
  yield* waitFor(duration);

  const code_is_valid = `
  #include <vector>

  template<typename ScalarT>
  [[nodiscard]] bool IsValid(const Coordinate<ScalarT>& coordinate) {
    return true; // Actually do something useful here!
  }

  template<typename CoordinateT>
  [[nodiscard]] bool ValidateCoordinates(const std::vector<CoordinateT>& coordinates) {
    for (const auto& coordinate : coordinates) {
      if (!IsValid(coordinate)) return false;
    }
    return true;
  }`

  yield* all(
    codeRef().code(code_is_valid, 0),
    codeRef().fontSize(35, 0),
    codeRef().y(0, 0)
  );
  yield* waitFor(duration);

  const code_is_valid_main = `
  #include <iostream>
  #include <vector>

  template<typename ScalarT>
  [[nodiscard]] bool IsValid(const Coordinate<ScalarT>& coordinate) {
    return true; // Actually do something useful here!
  }

  template<typename CoordinateT>
  [[nodiscard]] bool ValidateCoordinates(const std::vector<CoordinateT>& coordinates) {
    for (const auto& coordinate : coordinates) {
      if (!IsValid(coordinate)) return false;
    }
    return true;
  }

  int main() {
    const std::vector<int> wrong_input{1, 2, 3};
    std::cout << ValidateCoordinates(wrong_input) << std::endl;
  }`

  yield* all(
    codeRef().code(code_is_valid_main, duration),
  );
  yield* waitFor(duration);

  const code_is_valid_static_assert = `
  #include <iostream>
  #include <vector>

  template<typename ScalarT>
  [[nodiscard]] bool IsValid(const Coordinate<ScalarT>& coordinate) {
    return true; // Actually do something useful here!
  }

  template<typename CoordinateT>
  [[nodiscard]] bool ValidateCoordinates(const std::vector<CoordinateT>& coordinates) {
    static_assert(
      IsCoordinate<CoordinateT>::value,
      "Contents of the container are not coordinates");
    for (const auto& coordinate : coordinates) {
      if (!IsValid(coordinate)) return false;
    }
    return true;
  }

  int main() {
    const std::vector<int> wrong_input{1, 2, 3};
    std::cout << ValidateCoordinates(wrong_input) << std::endl;
  }`

  yield* all(
    codeRef().code(code_is_valid_static_assert, duration),
    codeRef().y(-20, duration)
  );
  yield* waitFor(duration);

  const code_is_valid_concept = `
  #include <iostream>
  #include <vector>

  template<typename ScalarT>
  [[nodiscard]] bool IsValid(const Coordinate<ScalarT>& coordinate) {
    return true; // Actually do something useful here!
  }

  // Requires C++20!
  template <CoordinateLike CoordinateT>
  [[nodiscard]] bool ValidateCoordinates(const std::vector<CoordinateT>& coordinates) {
    for (const auto& coordinate : coordinates) {
      if (!IsValid(coordinate)) return false;
    }
    return true;
  }

  int main() {
    const std::vector<int> wrong_input{1, 2, 3};
    std::cout << ValidateCoordinates(wrong_input) << std::endl;
  }`

  yield* all(
    codeRef().code(code_is_valid_concept, duration),
    codeRef().y(-20, duration)
  );
  yield* waitFor(duration);

  const is_coordinate = `
  template <typename T>
  struct IsCoordinate {
    static constexpr inline bool value{};
  };`

  const is_coordinate_specialization = `  \n
  template <>
  struct IsCoordinate<Coordinate<int>> {
    static constexpr inline bool value{true};
  };

  template <>
  struct IsCoordinate<Coordinate<float>> {
    static constexpr inline bool value{true};
  };`

  const is_coordinate_asserts = `  \n
  static_assert (
      !IsCoordinate<void>::value &&
      !IsCoordinate<int>::value &&
      !IsCoordinate<float>::value &&
      IsCoordinate<Coordinate<int>>::value &&
      IsCoordinate<Coordinate<float>>::value
  );`

  yield* all(
    codeRef().code(is_coordinate, 0),
    codeRef().y(0, 0)
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().code.append(is_coordinate_specialization, duration),
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().code.append(is_coordinate_asserts, duration),
  );
  yield* waitFor(duration);

  const is_coordinate_partial = `
  template <typename T>
  struct IsCoordinate {
    static constexpr inline bool value{};
  };

  template <typename T>
  struct IsCoordinate<Coordinate<T>> {
    static constexpr inline bool value{true};
  };

  static_assert (
      !IsCoordinate<void>::value &&
      !IsCoordinate<int>::value &&
      !IsCoordinate<float>::value &&
      IsCoordinate<Coordinate<int>>::value &&
      IsCoordinate<Coordinate<float>>::value
  );`

  yield* all(
    codeRef().code(is_coordinate_partial, duration),
  );
  yield* waitFor(duration);
  yield* codeRef().selection(codeRef().findLastRange(/template <typename T>/g), duration / 2);
  yield* waitFor(duration);
  yield* codeRef().selection(DEFAULT, duration / 2);
  yield* waitFor(duration);
  yield* codeRef().selection(codeRef().findLastRange(/<Coordinate<T>>/g), duration / 2);
  yield* waitFor(duration);
  yield* codeRef().selection(codeRef().findLastRange(/IsCoordinate<Coordinate<T>>/g), duration / 2);
  yield* waitFor(duration);
  yield* codeRef().selection(DEFAULT, duration / 2);
  yield* waitFor(duration);
  yield* codeRef().selection(codeRef().findLastRange(/typename T>/g), duration / 2);
  yield* waitFor(duration);
  yield* codeRef().selection(codeRef().findLastRange(/Coordinate<T>/g), duration / 2);
  yield* waitFor(duration);
  yield* codeRef().selection(codeRef().findLastRange(/IsCoordinate<Coordinate<T>>/g), duration / 2);
  yield* waitFor(duration);
  yield* codeRef().selection(DEFAULT, duration / 2);
  yield* waitFor(duration);
  yield* codeRef().selection(codeRef().findLastRange(/IsCoordinate<Coordinate<int>>::value/g), duration / 2);
  yield* waitFor(duration);
  yield* codeRef().selection(lines(1, 4), duration / 2);
  yield* waitFor(duration);
  yield* codeRef().selection([lines(1, 4), lines(5, 9)], duration / 2);
  yield* waitFor(duration);

  yield* waitFor(duration * 3);
});
