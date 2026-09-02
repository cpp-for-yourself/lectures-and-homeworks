add_library(cxx_opts INTERFACE)
target_compile_features(cxx_opts INTERFACE cxx_std_17)
target_include_directories(cxx_opts INTERFACE
  $<BUILD_INTERFACE:${PROJECT_SOURCE_DIR}/snake>
  $<INSTALL_INTERFACE:include>)
target_compile_options(cxx_opts INTERFACE
  $<$<CONFIG:DEBUG>:-g3>
  $<$<CONFIG:DEBUG>:-Og>
  $<$<CONFIG:RELEASE>:-O3>
  -Wall -Wpedantic -Wextra
)

add_library(no_gcc_compat_flag INTERFACE)
target_compile_options(no_gcc_compat_flag INTERFACE
  $<$<CXX_COMPILER_ID:Clang,AppleClang>:-Wno-gcc-compat>
)

add_library(core
  matrix.cpp
  vector_2d.cpp)
target_link_libraries(core PUBLIC cxx_opts no_gcc_compat_flag)

add_executable(
  test_core
  matrix_test.cpp
  vector_2d_test.cpp
)
target_link_libraries(test_core PRIVATE core gtest_main)

include(GoogleTest)
gtest_discover_tests(test_core)
