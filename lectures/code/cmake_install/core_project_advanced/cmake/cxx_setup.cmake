set(LIBRARY_NAME cxx_setup)
add_library(${LIBRARY_NAME} INTERFACE)
target_compile_options(${LIBRARY_NAME}
    INTERFACE
    -Wall -Wpedantic -Wextra
    $<$<CONFIG:Release>:-O3;-DNDEBUG>
)
target_compile_features(${LIBRARY_NAME}
    INTERFACE cxx_std_17)
target_include_directories(${LIBRARY_NAME}
    INTERFACE
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}>
    $<INSTALL_INTERFACE:include/>
)
add_library(${PROJECT_NAME}::${LIBRARY_NAME} ALIAS ${LIBRARY_NAME})

install(
    TARGETS ${LIBRARY_NAME}
    EXPORT ${LIBRARY_NAME}_export
    INCLUDES DESTINATION include
)

install(
    EXPORT ${LIBRARY_NAME}_export
    NAMESPACE ${PROJECT_NAME}::
    DESTINATION lib/cmake/${PROJECT_NAME}
)

