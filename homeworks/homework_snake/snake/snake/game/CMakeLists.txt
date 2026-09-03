find_package(Threads REQUIRED)

add_library(no_pedantic_flag INTERFACE)
target_compile_options(no_pedantic_flag INTERFACE -Wno-pedantic)

add_library(game
  snake.cpp
  game.cpp
  world.cpp)
target_link_libraries(game PUBLIC core Threads::Threads absl::flat_hash_map no_pedantic_flag)

add_executable(
  test_game
  snake_test.cpp
  world_test.cpp
  game_test.cpp
)
target_link_libraries(test_game PRIVATE game gtest_main)

include(GoogleTest)
gtest_discover_tests(test_game)
