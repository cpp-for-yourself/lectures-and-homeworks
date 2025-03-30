find_package(core_project REQUIRED CONFIG)

add_executable(print_hello print_hello.cpp)
target_link_libraries(print_hello PRIVATE core_project::some_library)
