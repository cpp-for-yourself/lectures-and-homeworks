add_subdirectory(core)
add_subdirectory(game)
add_subdirectory(ui)

add_executable(main main.cpp)
target_link_libraries(main PRIVATE game ui)
target_compile_features(main PRIVATE cxx_std_17)
