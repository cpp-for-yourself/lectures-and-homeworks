
cmake_minimum_required(VERSION 3.16..3.24)
project(our_project VERSION 0.0.1
                    DESCRIPTION "Our first project"
                    LANGUAGES CXX)
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release CACHE STRING "" FORCE)
endif()
message(STATUS "CMAKE_BUILD_TYPE: ${CMAKE_BUILD_TYPE}")

add_library(cxx_setup INTERFACE)
target_compile_options(cxx_setup INTERFACE -Wall -Wpedantic -Wextra)
target_compile_features(cxx_setup INTERFACE cxx_std_17)
target_include_directories(cxx_setup INTERFACE ${PROJECT_SOURCE_DIR})

# 🚨 Make sure CMakeLists.txt file exists in the subdirectories!
add_subdirectory(${PROJECT_NAME})
add_subdirectory(executables)

# 💡 Some things are missing in this example
# 💡 For example tests, installation instructions, etc.
# 💡 We'll add those later in the course
