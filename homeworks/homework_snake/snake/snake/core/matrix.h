#ifndef SNAKE_CORE_MATRIX_H_
#define SNAKE_CORE_MATRIX_H_

#include <cstdint>
#include <vector>

namespace snake::core {

template <typename T>
class Matrix {
 public:
  Matrix() = default;
  explicit Matrix(std::int32_t rows, std::int32_t cols, T init_value = T{})
      : rows_{rows}, cols_{cols}, data_(rows * cols, init_value) {}

  [[nodiscard]] inline std::int32_t rows() const noexcept { return rows_; }
  [[nodiscard]] inline std::int32_t cols() const noexcept { return cols_; }

  inline void resize(std::int32_t rows, std::int32_t cols) {
    rows_ = rows;
    cols_ = cols;
    data_.resize(rows * cols);
  }

  // TODO(student): Implement checked access with at(row, col)
  [[nodiscard]] inline T& at(std::int32_t row, std::int32_t col) {
    return data_.at(index(row, col));
  }
  [[nodiscard]] inline const T& at(std::int32_t row, std::int32_t col) const {
    return data_.at(index(row, col));
  }

  // TODO(student): Implement fast unchecked access with operator()
  [[nodiscard]] inline T& operator()(std::int32_t row,
                                     std::int32_t col) noexcept {
    return data_[index(row, col)];
  }
  [[nodiscard]] inline const T& operator()(std::int32_t row,
                                           std::int32_t col) const noexcept {
    return data_[index(row, col)];
  }

  [[nodiscard]] inline std::vector<T>& data() noexcept { return data_; }
  [[nodiscard]] inline const std::vector<T>& data() const noexcept {
    return data_;
  }

  // Iterators for range-based for loops
  [[nodiscard]] inline auto begin() { return data_.begin(); }
  [[nodiscard]] inline auto begin() const { return data_.begin(); }
  [[nodiscard]] inline auto cbegin() const { return data_.cbegin(); }
  [[nodiscard]] inline auto end() { return data_.end(); }
  [[nodiscard]] inline auto end() const { return data_.end(); }
  [[nodiscard]] inline auto cend() const { return data_.cend(); }

 private:
  [[nodiscard]] inline std::int32_t index(std::int32_t row,
                                          std::int32_t col) const noexcept {
    // Flatten 2D coordinate into 1D array index
    return row * cols_ + col;
  }

  std::int32_t rows_{};
  std::int32_t cols_{};
  std::vector<T> data_{};
};

}  // namespace snake::core

#endif  // SNAKE_CORE_MATRIX_H_
