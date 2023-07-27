# Add your libraries here
# You must have the following libraries:
# - stb_image
# - drawer
# - pixelated_image
# - pixelate_image

if(BUILD_TESTING)
  include(GoogleTest)
  # Add your tests executable with all your tests here
  # Name it tui_pixelator_tests
  gtest_discover_tests(tui_pixelator_tests)
endif()
