#include "game/world.h"

#include <optional>

#include "core/vector_2d.h"

namespace snake::game {

World::World(std::int32_t rows, std::int32_t cols) noexcept
    : world_{rows, cols, CellType::kEmpty} {}

std::optional<World::CellType> World::cell(
    const core::Vector2i& coordinate) const noexcept {
  // TODO(student): Check bounds [0, rows) and [0, cols), return std::nullopt if outside
  if ((coordinate.row() < 0) || (coordinate.row() >= world_.rows()) ||
      (coordinate.col() < 0) || (coordinate.col() >= world_.cols())) {
    return {};
  }
  return world_(coordinate.row(), coordinate.col());
}

void World::SetCell(const core::Vector2i& coordinate, CellType type) noexcept {
  // TODO(student): Set the cell value
  cell_(coordinate) = type;
}

World World::CreateBoxWorld(std::int32_t rows, std::int32_t cols) noexcept {
  // TODO(student): Create a world and fill outer boundaries with Wall cells
  World world{rows, cols};
  for (auto r = 0; r < rows; ++r) {
    world.cell_(core::Vector2i::FromRowCol(r, 0)) = CellType::kWall;
    world.cell_(core::Vector2i::FromRowCol(r, cols - 1)) = CellType::kWall;
  }
  for (auto c = 0; c < cols; ++c) {
    world.cell_(core::Vector2i::FromRowCol(0, c)) = CellType::kWall;
    world.cell_(core::Vector2i::FromRowCol(rows - 1, c)) = CellType::kWall;
  }
  return world;
}

}  // namespace snake::game
