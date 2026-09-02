#include <core/matrix.h>

#include <cstdint>

namespace snake::core {

template class Matrix<std::int8_t>;
template class Matrix<std::int16_t>;
template class Matrix<std::int32_t>;
template class Matrix<std::int64_t>;

template class Matrix<std::uint8_t>;
template class Matrix<std::uint16_t>;
template class Matrix<std::uint32_t>;
template class Matrix<std::uint64_t>;

template class Matrix<float>;
template class Matrix<double>;

}  // namespace snake::core
