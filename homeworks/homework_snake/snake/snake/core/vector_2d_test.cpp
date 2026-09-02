#include <core/vector_2d.h>
#include <gtest/gtest.h>

using snake::core::Vector2D;

TEST(Vector2D, Init) {
  Vector2D<std::int32_t> vector_empty{};
  ASSERT_EQ(0, vector_empty.x());
  ASSERT_EQ(0, vector_empty.y());
  const auto vector_xy = Vector2D<std::int32_t>::FromXY(42, 23);
  ASSERT_EQ(42, vector_xy.x());
  ASSERT_EQ(23, vector_xy.y());
}

// TODO(student): Write unit tests for:
// - FromRowCol (verifying row -> y and col -> x)
// - Vector addition (operator+)
// - Coordinate getters
