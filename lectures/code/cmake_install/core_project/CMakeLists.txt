cmake_minimum_required(VERSION 3.16..3.24)
project(core_project
 VERSION 0.0.1
 DESCRIPTION "Sample project with a library target"
 LANGUAGES CXX)

if(NOT CMAKE_BUILD_TYPE)
 set(CMAKE_BUILD_TYPE Release CACHE INTERNAL "Build type")
endif()

message(STATUS "CMAKE_BUILD_TYPE: ${CMAKE_BUILD_TYPE}")

add_subdirectory(core_project)
add_subdirectory(examples)

include(CMakePackageConfigHelpers)

# Create a config file that CMake looks for when we call FindPackage(core_project)
configure_package_config_file(${CMAKE_CURRENT_SOURCE_DIR}/cmake/Config.cmake.in
 "${CMAKE_CURRENT_BINARY_DIR}/${PROJECT_NAME}Config.cmake"
 INSTALL_DESTINATION "share/cmake/${PROJECT_NAME}"
)

# Create a versioned config file that CMake uses to compare version of the package.
write_basic_package_version_file(
 ${PROJECT_NAME}ConfigVersion.cmake
 VERSION ${PACKAGE_VERSION}
 COMPATIBILITY AnyNewerVersion
)

# Copy these files into the install directory.
install(
 FILES
 ${CMAKE_CURRENT_BINARY_DIR}/${PROJECT_NAME}Config.cmake
 ${CMAKE_CURRENT_BINARY_DIR}/${PROJECT_NAME}ConfigVersion.cmake
 DESTINATION
 share/cmake/${PROJECT_NAME}
)
