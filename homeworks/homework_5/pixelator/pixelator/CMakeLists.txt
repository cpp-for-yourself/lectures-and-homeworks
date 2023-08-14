# TODO: Add your libraries here
# You must have the following libraries:
# - stb_image
# - drawer
# - pixelated_image
# - pixelate_image

if(BUILD_TESTING)
  include(GoogleTest)
  # TODO: Add your tests executable with all your tests here
  # Name it pixelator_tests
  gtest_discover_tests(pixelator_tests)
endif()
