#pragma once

#include <fmt/core.h>

namespace some_library_header_only {

inline void PrintHello() noexcept { fmt::print("Hello, header-only world!\n"); }

} // namespace some_library_header_only