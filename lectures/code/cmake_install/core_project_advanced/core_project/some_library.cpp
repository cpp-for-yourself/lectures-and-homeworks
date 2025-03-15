#include "core_project/some_library.hpp"

#include <iostream>

namespace core_project {

void PrintHello() noexcept { 
    std::cout << "Hello world!" << std::endl;
 }

} // namespace core_project