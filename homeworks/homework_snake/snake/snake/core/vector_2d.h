#ifndef SNAKE_CORE_VECTOR_2D_H_
#define SNAKE_CORE_VECTOR_2D_H_

#include <cstdint>

namespace snake::core {

template <typename T>
struct Vector2D {
 public:
  Vector2D() noexcept = default;

  /// @brief Create a 2D vector from Cartesian (x, y) coordinates.
  [[nodiscard]] static Vector2D FromXY(T x, T y) noexcept {
    // TODO(student): Implement FromXY
    return Vector2D{x, y};
  }

  /// @brief Create a 2D vector from grid (row, col) coordinates.
  /// Note: row corresponds to y, col corresponds to x.
  [[nodiscard]] static Vector2D FromRowCol(T row, T col) noexcept {
    // TODO(student): Implement FromRowCol
    return Vector2D{col, row};
  }

  /// @brief Add two vectors coordinate-wise.
  [[nodiscard]] friend Vector2D operator+(const Vector2D& lhs,
                                          const Vector2D& rhs) noexcept {
    // TODO(student): Implement operator+
    return {lhs.x_ + rhs.x_, lhs.y_ + rhs.y_};
  }

  /// @brief Coordinate accessors.
  T x() const noexcept { return x_; }
  T y() const noexcept { return y_; }

  T row() const noexcept { return y_; }
  T col() const noexcept { return x_; }

 private:
  Vector2D(T x, T y) : x_{x}, y_{y} {}

  T x_{};
  T y_{};
};

using Vector2i = Vector2D<std::int32_t>;
using Vector2f = Vector2D<float>;
using Vector2d = Vector2D<double>;

}  // namespace snake::core

#endif  // SNAKE_CORE_VECTOR_2D_H_
