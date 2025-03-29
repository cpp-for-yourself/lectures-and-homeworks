add_executable(print_hello print_hello.cpp)
target_link_libraries(print_hello PRIVATE cxx_setup some_library)

install(TARGETS print_hello)
