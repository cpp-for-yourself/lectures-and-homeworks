set(LIBRARY_NAME some_library)
add_library(${LIBRARY_NAME} ${LIBRARY_NAME}.cpp)
target_link_libraries(${LIBRARY_NAME} PUBLIC cxx_setup)

install(
    TARGETS ${LIBRARY_NAME}
    EXPORT ${LIBRARY_NAME}_export
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
    RUNTIME DESTINATION bin
)

install(EXPORT ${LIBRARY_NAME}_export
    FILE ${LIBRARY_NAME}_export.cmake
    NAMESPACE ${PROJECT_NAME}::
    DESTINATION lib/cmake/${PROJECT_NAME}
)

install(
    DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
    DESTINATION include
    FILES_MATCHING PATTERN "*.hpp"
)
