#include <game/world.h>
#include <gtest/gtest.h>

#include "core/vector_2d.h"

namespace snake::game {

TEST(World, Init) {
  auto rows = 10;
  auto cols = 15;
  const World world(rows, cols);
  EXPECT_EQ(world.rows(), rows);
  EXPECT_EQ(world.cols(), cols);
}

// TODO(student): Write unit tests for:
// - Setting and querying cell types via SetCell and cell()
// - Bounds checking with std::optional (verifying out-of-bounds returns std::nullopt)
// - CreateBoxWorld (verifying outer boundary cells are kWall and interior are kEmpty)

}  // namespace snake::game
