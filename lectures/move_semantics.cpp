#include <cstddef>
#include <algorithm>

std::byte *AllocateMemory(std::size_t length) { return new std::byte[length]; }
void FreeMemory(std::byte *ptr) { delete[] ptr; }

// 😱 Note that this struct does not follow best style.
// We only use it to illustrate the concept here.
struct HugeObject {
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length{data_length}, ptr{AllocateMemory(length)} {}

  HugeObject &operator=(const HugeObject &object) {
    if (this == &object) { return *this; }  // Do not self-assign.
    FreeMemory(ptr);  // In case we already owned some memory from before.
    length = object.length;
    ptr = AllocateMemory(length);
    std::copy(object.ptr, object.ptr + length, ptr);
    return *this;
  }

  HugeObject &operator=(HugeObject &&object) {
    if (this == &object) { return *this; }  // Do not steal from ourselves.
    FreeMemory(ptr);  // In case we already owned some memory from before.
    length = object.length;
    ptr = object.ptr;
    object.ptr = nullptr;
    return *this;
  }

  ~HugeObject() { FreeMemory(ptr); }

  std::size_t length{};
  std::byte *ptr{};
};

struct HugeObjectStorage {
  HugeObject member_object;
};

// int main() {
//   HugeObject object{100};
//   HugeObjectStorage storage{};
//   storage.member_object = object;
//   return 0;
// }

int main() {
  HugeObject object{100};
  HugeObjectStorage storage{};
  storage.member_object = object;
  storage.member_object = HugeObject{200};
  storage.member_object = std::move(object);
  return 0;
}
