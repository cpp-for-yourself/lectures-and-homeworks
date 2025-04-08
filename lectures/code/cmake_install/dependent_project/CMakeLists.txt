cmake_minimum_required(VERSION 3.16..3.24)
project(dependent_project
    VERSION 0.0.1
    DESCRIPTION "Sample project that uses the core project"
    LANGUAGES CXX)

add_subdirectory(examples)
