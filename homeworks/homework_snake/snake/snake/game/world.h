#ifndef SNAKE_GAME_WORLD_H_
#define SNAKE_GAME_WORLD_H_

#include <optional>

#include "core/matrix.h"
#include "core/vector_2d.h"

namespace snake::game {

class World {
 public:
  enum class CellType { kEmpty, kWall, kFruit };

  World(std::int32_t rows, std::int32_t cols) noexcept;

  /// @brief Returns the cell type at coordinate, or std::nullopt if out of bounds.
  [[nodiscard]] std::optional<CellType> cell(
      const core::Vector2i& coordinate) const noexcept;

  /// @brief Sets the cell type at the given coordinate.
  void SetCell(const core::Vector2i& coordinate, CellType type) noexcept;

  /// @brief Factory method to create a world bordered by walls.
  [[nodiscard]] static World CreateBoxWorld(std::int32_t rows,
                                            std::int32_t cols) noexcept;

  [[nodiscard]] auto rows() const noexcept { return world_.rows(); }
  [[nodiscard]] auto cols() const noexcept { return world_.cols(); }

 private:
  [[nodiscard]] inline CellType& cell_(
      const core::Vector2i& coordinate) noexcept {
    return world_(coordinate.row(), coordinate.col());
  }

  core::Matrix<CellType> world_;
};

}  // namespace snake::game

#endif  // SNAKE_GAME_WORLD_H_
