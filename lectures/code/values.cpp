#include <iostream>

std::byte *AllocateMemory(std::size_t length) { return new std::byte[length]; }
void FreeMemory(std::byte *ptr) { delete[] ptr; }

struct HugeObject {
  HugeObject() { std::cout << "Default constructor" << std::endl; }

  explicit HugeObject(std::size_t data_length)
      : length{data_length}, ptr{AllocateMemory(length)} {
    std::cout << "Allocated " << data_length << " bytes" << std::endl;
  }

  HugeObject &operator=(const HugeObject &object) {
    if (this == &object) { return *this; }  // Do not self-assign.
    FreeMemory(ptr);
    length = object.length;
    ptr = AllocateMemory(length);
    std::copy(object.ptr, object.ptr + length, ptr);
    std::cout << "Copied data from another object" << std::endl;
    return *this;
  }

  HugeObject &operator=(HugeObject &&object) {
    FreeMemory(ptr);
    length = object.length;
    ptr = object.ptr;
    object.ptr = nullptr;
    std::cout << "Stole data from another object" << std::endl;
    return *this;
  }

  ~HugeObject() {
    FreeMemory(ptr);
    std::cout << "Destroyed" << std::endl;
  }

  std::size_t length{};
  std::byte *ptr{};
};

struct HugeObjectStorage {
  HugeObject member_object;
};

int main() {
  HugeObject object{100};
  HugeObjectStorage storage{};
  storage.member_object = object;
  storage.member_object = HugeObject{200};
  storage.member_object = std::move(object);
  return 0;
}
