import { createRef } from '@motion-canvas/core/lib/utils';
import { makeScene2D, Code, lines } from '@motion-canvas/2d';
import { all, waitFor, waitUntil } from '@motion-canvas/core/lib/flow';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';

export default makeScene2D(function* (view) {
  const codeRef = createRef<Code>();
  const code2Ref = createRef<Code>();

  yield view.add(<Code
    ref={codeRef}
    fontSize={25}
    fontFamily={'Fira Mono'}
    fontWeight={500}
    offsetX={-1}
    x={-600}
  />);

  yield view.add(<Code
    ref={code2Ref}
    fontSize={25}
    fontFamily={'Fira Mono'}
    fontWeight={500}
    offsetX={-1}
    x={100}
  />);


  const duration = 1.0

  const code_good_names = `\
// 😱 Manual allocation is bad, especially in functions!
namespace {

struct Pool {
  static int* GetPtr() { return &data_; }
  inline static int data_{};
};

int* AllocateVariable() {
  return new int;
}

int* AllocateArray(int size) {
  return new int[size];
}

int* BorrowDataFromPool() {
  return Pool::GetPtr();
}

}  // namespace

int main() {
  auto* ptr_1 = AllocateVariable();
  auto* ptr_2 = AllocateArray(20);
  auto* ptr_3 = BorrowDataFromPool();
  delete ptr_1;
  delete[] ptr_2;
  return 0;
}`

  const code_flipped_names_1 = `\
// 😱 Manual allocation is bad, especially in functions!
namespace {

struct Pool {
  static int* GetPtr() { return &data_; }
  inline static int data_{};
};

// 😱 Implementation changed, but not the name!
int* AllocateVariable() {
  return Pool::GetPtr();
}

int* AllocateArray(int size) {
  return new int[size];
}

int* BorrowDataFromPool() {
  return Pool::GetPtr();
}

}  // namespace

int main() {
  auto* ptr_1 = AllocateVariable();
  auto* ptr_2 = AllocateArray(20);
  auto* ptr_3 = BorrowDataFromPool();
  delete[] ptr_2;
  return 0;
}`

  const code_flipped_names_2 = `\
// 😱 Manual allocation is bad, especially in functions!
namespace {

struct Pool {
  static int* GetPtr() { return &data_; }
  inline static int data_{};
};

// 😱 Implementation changed, but not the name!
int* AllocateVariable() {
  return Pool::GetPtr();
}

int* AllocateArray(int size) {
  return new int[size];
}

// 😱 Implementation changed, but not the name!
int* BorrowDataFromPool() {
  return new int;
}

}  // namespace

int main() {
  auto* ptr_1 = AllocateVariable();
  auto* ptr_2 = AllocateArray(20);
  auto* ptr_3 = BorrowDataFromPool();
  delete ptr_3;
  delete[] ptr_2;
  return 0;
}`

  const code_bad_names = `\
namespace {

struct Pool {
  static int* GetPtr() { return &data_; }
  inline static int data_{};
};

int* Foo() {
  return Pool::GetPtr();
}

int* Bar(int size) {
  return new int[size];
}

int* Buzz() {
  return new int;
}

}  // namespace

int main() {
  auto* ptr_1 = Foo();
  auto* ptr_2 = Bar(20);
  auto* ptr_3 = Buzz();
  delete ptr_3;
  delete[] ptr_2;
  return 0;
}`

  const code_with_include = `\
#include "lib.hpp"

int main() {
  auto* ptr_1 = Foo();
  auto* ptr_2 = Bar(20);
  auto* ptr_3 = Buzz();
  // 😱 What should we do with these pointers?
  return 0;
}`

  const code_declarations = `\
int* Foo();
int* Bar(int number);
int* Buzz();`


  yield* codeRef().code(code_good_names, 0).wait(duration);
  yield* waitFor(duration);

  yield* codeRef().code(code_flipped_names_1, duration);
  yield* codeRef().code(code_flipped_names_2, duration).wait(duration);
  yield* waitFor(duration);

  yield* codeRef().code(code_bad_names, duration).wait(duration);
  yield* waitFor(duration);

  yield* all(
    code2Ref().code(code_with_include, duration).wait(duration),
    codeRef().code(code_declarations, duration).wait(duration)
  );
  yield* waitFor(duration);

  const code_object_empty = `\
class Object {
 private:
  int* data_{};
};`

  yield* code2Ref().code('', 0);
  yield* codeRef().code(code_object_empty, 0);
  yield* codeRef().fontSize(35, 0);
  yield* codeRef().x(-200, 0);
  yield* waitFor(duration);

  const code_object_construct = `\
// 😱 Missing crucial special functions.
class Object {
 public:
  explicit Object(int number) : data_{new int{number}} {}

 private:
  int* data_{};
};`

  yield* all(
    codeRef().code(code_object_construct, duration).wait(duration),
    codeRef().x(-450, duration)
  );
  yield* waitFor(duration);

  const code_object_destroy = `\
// 😱 Missing crucial special functions.
class Object {
 public:
  explicit Object(int number) : data_{new int{number}} {}

  ~Object() { delete data_; }

 private:
  int* data_{};
};`

  yield* all(
    codeRef().code(code_object_destroy, duration).wait(duration),
    codeRef().x(-450, duration)
  );
  yield* waitFor(duration);

  const code_object_copy_move_complete = `\
class Object {
 public:
  explicit Object(int number) : data_{new int{number}} {}

  ~Object() { delete data_; }

  Object(const Object& other)
      : data_{other.data_ ? new int{*other.data_} : nullptr} {}

  Object(Object&& other) : data_{other.data_} { other.data_ = nullptr; }

  Object& operator=(const Object& other) {
    if (other.data_) {
      data_ = new int{*other.data_};
    }
    return *this;
  }

  Object& operator=(Object&& other) {
    data_ = other.data_;
    other.data_ = nullptr;
    return *this;
  }

 private:
  int* data_{};
};`

  yield* all(
    codeRef().code(code_object_copy_move_complete, duration).wait(duration),
    codeRef().x(-600, duration),
    codeRef().fontSize(30, duration)
  );
  yield* waitFor(duration);


  const unique_ptr = `\
// Simplified.
template<typename T>
class unique_ptr {
 public:
  explicit unique_ptr(T* ptr) : ptr_{ptr} {}

  ~unique_ptr() { delete ptr_; }

  unique_ptr(const unique_ptr& other) = delete;
  unique_ptr& operator=(const unique_ptr& other) = delete;

  unique_ptr(unique_ptr&& other) : ptr_{other.ptr_} { other.ptr_ = nullptr; }
  unique_ptr& operator=(unique_ptr&& other) {
    ptr_ = other.ptr_;
    other.ptr_ = nullptr;
    return *this;
  }

  // Missing getters and some other functions like reset.

 private:
  T* ptr_{};
};
`

  yield* all(
    codeRef().code(unique_ptr, 0).wait(duration),
    codeRef().x(-600, duration),
    codeRef().fontSize(30, duration)
  );
  yield* waitFor(duration);

});
