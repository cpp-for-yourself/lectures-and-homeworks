# Indicate that we have header-only library
add_library(chatbot chatbot.cpp)
target_link_libraries(chatbot PUBLIC cxx_setup)

# A binary that uses the header-only library
add_executable(chatbot_example main.cpp)
target_link_libraries(chatbot_example PRIVATE chatbot cxx_setup)
