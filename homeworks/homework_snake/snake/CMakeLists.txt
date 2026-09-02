cmake_minimum_required(VERSION 3.16)
project(snake LANGUAGES CXX)

if(NOT CMAKE_BUILD_TYPE OR CMAKE_BUILD_TYPE STREQUAL "")
  set(CMAKE_BUILD_TYPE "Release" CACHE STRING "" FORCE)
endif()

# Must appear in the top-level CMakeLists.txt
include(CTest)

# Add code to the build
add_subdirectory(external)
add_subdirectory(examples)
add_subdirectory(snake)
