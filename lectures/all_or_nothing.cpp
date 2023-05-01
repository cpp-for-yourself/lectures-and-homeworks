#include <cstddef>
#include <iostream>

std::byte *AllocateMemory(std::size_t length) { return new std::byte[length]; }
void FreeMemory(std::byte *ptr) { delete[] ptr; }

// 😱 Note that this class does not follow best style.
class HugeObject {
 public:
  HugeObject() = default;

  explicit HugeObject(std::size_t data_length)
      : length_{data_length}, ptr_{AllocateMemory(length_)} {}

  HugeObject(const HugeObject &object)
      : length_{object.length_}, ptr_{AllocateMemory(length_)} {
    std::copy(object.ptr_, object.ptr_ + length_, ptr_);
  }

  HugeObject(HugeObject &&object) : length_{object.length_}, ptr_{object.ptr_} {
    object.ptr_ = nullptr;
  }

  HugeObject &operator=(const HugeObject &object) {
    if (this == &object) { return *this; }  // Do not self-assign.
    FreeMemory(ptr_);  // In case we already owned some memory from before.
    length_ = object.length_;
    ptr_ = AllocateMemory(length_);
    std::copy(object.ptr_, object.ptr_ + length_, ptr_);
    return *this;
  }

  HugeObject &operator=(HugeObject &&object) {
    if (this == &object) { return *this; }  // Do not self-assign.
    FreeMemory(ptr_);  // In case we already owned some memory from before.
    length_ = object.length_;
    ptr_ = object.ptr_;
    object.ptr_ = nullptr;
    return *this;
  }

  std::byte const *ptr() const { return ptr_; }

  ~HugeObject() { FreeMemory(ptr_); }

 private:
  std::size_t length_{};
  std::byte *ptr_{};
};

int main() {
  const HugeObject object{42};
  std::cout << "Data address: " << object.ptr() << std::endl;
  return 0;
}

// int main() {
//   const HugeObject object{42};
//   std::cout << "object data address: " << object.ptr() << std::endl;
//   const HugeObject other_object{object};
//   std::cout << "other_object data address: " << other_object.ptr() << std::endl;
//   return 0;
// }

// int main() {
//   const HugeObject object{42};
//   std::cout << "object data address: " << object.ptr() << std::endl;
//   HugeObject other_object{23};
//   other_object = object;
//   std::cout << "other_object data address: " << other_object.ptr() << std::endl;
//   return 0;
// }

// int main() {
//   HugeObject object{42};
//   std::cout << "object data address: " << object.ptr() << std::endl;
//   const HugeObject other_object{std::move(object)};
//   std::cout << "object data address: " << object.ptr() << std::endl;
//   std::cout << "other_object data address: " << other_object.ptr() << std::endl;
//   return 0;
// }
