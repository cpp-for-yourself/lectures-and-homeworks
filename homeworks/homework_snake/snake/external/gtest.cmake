CPMAddPackage(
  NAME googletest
  GITHUB_REPOSITORY google/googletest
  VERSION 1.15.2
  OPTIONS
    "INSTALL_GTEST OFF"
    "gtest_force_shared_crt"
    "CMAKE_CXX_STANDARD 17"
    "CMAKE_CXX_STANDARD_REQUIRED ON"
)
