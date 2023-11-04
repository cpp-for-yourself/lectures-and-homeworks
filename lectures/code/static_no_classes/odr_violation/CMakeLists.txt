cmake_minimum_required(VERSION 3.16..3.24)
project(
  odr_violation
  VERSION 0.0.1
  DESCRIPTION "Our first project"
  LANGUAGES CXX)
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE
      Release
      CACHE STRING "" FORCE)
endif()
message(STATUS "CMAKE_BUILD_TYPE: ${CMAKE_BUILD_TYPE}")

add_library(cxx_setup INTERFACE)
target_compile_options(cxx_setup INTERFACE -Wall -Wpedantic -Wextra)
target_compile_features(cxx_setup INTERFACE cxx_std_17)
target_include_directories(cxx_setup INTERFACE ${PROJECT_SOURCE_DIR})

add_library(our_cool_lib our_cool_lib.cpp)
target_link_libraries(our_cool_lib PUBLIC cxx_setup)

add_library(other_lib other_lib.cpp)
target_link_libraries(other_lib PUBLIC cxx_setup)

add_executable(main main.cpp)
target_link_libraries(main PRIVATE other_lib our_cool_lib)
