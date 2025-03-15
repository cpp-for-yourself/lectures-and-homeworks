set(LIBRARY_NAME header_only)

add_library(${LIBRARY_NAME} INTERFACE)
target_link_libraries(${LIBRARY_NAME} INTERFACE cxx_setup fmt::fmt)
add_library(${PROJECT_NAME}::${LIBRARY_NAME} ALIAS ${LIBRARY_NAME})

install(
    TARGETS ${LIBRARY_NAME}
    EXPORT ${LIBRARY_NAME}_export
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
