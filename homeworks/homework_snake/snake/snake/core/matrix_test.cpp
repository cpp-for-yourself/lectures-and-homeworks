#include <core/matrix.h>
#include <gtest/gtest.h>

using snake::core::Matrix;

TEST(Matrix, InitDefault) {
  Matrix<int> matrix_empty;
  ASSERT_EQ(0, matrix_empty.rows());
  ASSERT_EQ(0, matrix_empty.cols());
}

// TODO(student): Write unit tests for:
// - Initialization with dimensions and default values
// - Modifying and reading values with .at() and operator()
// - Out-of-bounds error handling (verifying std::out_of_range is thrown by .at())
// - Iterating over matrix elements using range-based for loops
