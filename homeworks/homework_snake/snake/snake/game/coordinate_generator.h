// Copyright Igor Bogoslavskyi, year 2022.
// In case of any problems with the code please contact me.
// Email: <name>.<family_name>@gmail.com.

#ifndef SNAKE_GAME_COORDINATE_GENERATOR_H_
#define SNAKE_GAME_COORDINATE_GENERATOR_H_

#include <random>

#include "core/vector_2d.h"

namespace snake::game {

class CoordinateGenerator {
 public:
  CoordinateGenerator(std::int32_t max_rows, std::int32_t max_cols)
      : generator_engine_{random_device_()},
        row_generator_{0, max_rows - 1},
        col_generator_{0, max_cols - 1} {}

  core::Vector2i Generate() {
    return core::Vector2i::FromRowCol(row_generator_(generator_engine_),
                                      col_generator_(generator_engine_));
  }

 private:
  std::random_device random_device_;
  std::mt19937 generator_engine_;
  std::uniform_int_distribution<> row_generator_;
  std::uniform_int_distribution<> col_generator_;
};

}  // namespace snake::game

#endif  // SNAKE_GAME_COORDINATE_GENERATOR_H_