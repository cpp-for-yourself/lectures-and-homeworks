# Indicate that we have a library
add_library(chatbot INTERFACE)
target_link_libraries(chatbot INTERFACE cxx_setup)

# A binary that uses the library
add_executable(chatbot_main main.cpp)
target_link_libraries(chatbot_main PRIVATE chatbot cxx_setup)
