#include "game/world.h"

#include <optional>

#include "core/vector_2d.h"

namespace snake::game {

World::World(std::int32_t rows, std::int32_t cols) noexcept
    : world_{rows, cols, CellType::kEmpty} {}

std::optional<World::CellType> World::cell(
    const core::Vector2i&) const noexcept {
  // TODO(student): Check bounds [0, rows) and [0, cols),
  // Return std::nullopt if outside
  return {};
}

void World::SetCell(const core::Vector2i&, CellType) noexcept {
  // TODO(student): Set the cell value
}

World World::CreateBoxWorld(std::int32_t rows, std::int32_t cols) noexcept {
  // TODO(student): Create a world and fill outer boundaries with Wall cells
  return World{rows, cols};
}

}  // namespace snake::game
