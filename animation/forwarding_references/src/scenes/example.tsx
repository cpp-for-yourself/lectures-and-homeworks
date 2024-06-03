import { createRef } from '@motion-canvas/core/lib/utils';
import { makeScene2D, Code, lines } from '@motion-canvas/2d';
import { all, waitFor, waitUntil } from '@motion-canvas/core/lib/flow';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';

import { store, simplify } from '../functions/functions'

export default makeScene2D(function* (view) {
  const codeRef = createRef<Code>();

  yield view.add(<Code
    ref={codeRef}
    fontSize={50}
    fontFamily={'Fira Mono'}
    fontWeight={500}
    offsetX={-1}
    x={-600}
  />);


  const code_move = `\
  void DoSmth(SomeType&& value);`



  const duration = 1.0

  yield* codeRef().code(code_move, 0).wait(duration);

  const code_forward = `\
  template <class SomeType>
  void DoSmth(SomeType&& value);`

  yield* codeRef().code(code_forward, duration).wait(duration);

  const code_forward_with_body = `\
  #include <utility>

  template <class SomeType>
  void DoSmth(SomeType&& value) {
    DoSmthElse(std::forward<SomeType>(value));
  }`

  yield* all(
    codeRef().x(-600, duration),
    codeRef().code(code_forward_with_body, duration).wait(duration)
  );

  const forwarding_code = `\
  class Container {
     public:
      void Put(const Data& data) { data_ = data; }

     private:
      Data data_{};
  };`

  yield* all(
    codeRef().code(forwarding_code, 0).wait(duration),
    codeRef().fontSize(30, 0)
  );

  const forwarding_code_with_data = `\
  #include <iostream>

  // 😱 Missing other special class methods!
  struct Data {
      Data& operator=(const Data& other) {
          std::cout << "Copy assignment" << std::endl;
          return *this;
      }

      Data& operator=(Data&& other) {
          std::cout << "Move assignment" << std::endl;
          return *this;
      }
  };

  class Container {
     public:
      void Put(const Data& data) { data_ = data; }

     private:
      Data data_{};
  };`

  yield* all(
    codeRef().code(forwarding_code_with_data, duration).wait(duration)
  );

  const forwarding_code_with_data_and_main = `\
  #include <iostream>

  // 😱 Missing other special class methods!
  struct Data {
      Data& operator=(const Data& other) {
          std::cout << "Copy assignment" << std::endl;
          return *this;
      }

      Data& operator=(Data&& other) {
          std::cout << "Move assignment" << std::endl;
          return *this;
      }
  };

  class Container {
     public:
      void Put(const Data& data) { data_ = data; }

     private:
      Data data_{};
  };

  int main() {
      Container container{};
      Data data{};
      container.Put(data);
  }`

  yield* all(
    codeRef().fontSize(28, duration),
    codeRef().code(forwarding_code_with_data_and_main, duration).wait(duration)
  );

  yield* all(
    codeRef().selection([lines(4, 7)], duration).wait(duration),
  );

  const forwarding_code_with_data_and_main_temp = `\
  #include <iostream>

  // 😱 Missing other special class methods!
  struct Data {
      Data& operator=(const Data& other) {
          std::cout << "Copy assignment" << std::endl;
          return *this;
      }

      Data& operator=(Data&& other) {
          std::cout << "Move assignment" << std::endl;
          return *this;
      }
  };

  class Container {
     public:
      void Put(const Data& data) { data_ = data; }

     private:
      Data data_{};
  };

  int main() {
      Container container{};
      container.Put(Data{});
  }`
  yield* all(
    codeRef().selection(DEFAULT, 0).wait(duration),
  );
  yield* all(
    codeRef().selection(lines(23, 27), duration),
  );
  yield* all(
    codeRef().fontSize(28, duration),
    codeRef().selection(lines(23, 26), duration),
    codeRef().code(forwarding_code_with_data_and_main_temp, duration).wait(duration)
  );

  yield* all(
    codeRef().selection([lines(23, 26), lines(4, 7)], duration).wait(duration),
  );
  yield* all(
    codeRef().selection([lines(23, 26), lines(4, 7), lines(17, 18)], duration).wait(duration),
  );

  const forwarding_code_with_moving_data_and_main_temp = `\
  #include <iostream>
  #include <utility>

  // 😱 Missing other special class methods!
  struct Data {
      Data& operator=(const Data& other) {
          std::cout << "Copy assignment" << std::endl;
          return *this;
      }

      Data& operator=(Data&& other) {
          std::cout << "Move assignment" << std::endl;
          return *this;
      }
  };

  class Container {
     public:
      void Put(const Data& data) { data_ = data; }

      void Put(Data&& data) { data_ = std::move(data); }

     private:
      Data data_{};
  };

  int main() {
      Container container{};
      container.Put(Data{});
  }`

  yield* all(
    codeRef().selection(DEFAULT, 0).wait(duration),
  );

  yield* all(
    codeRef().fontSize(28, duration),
    codeRef().selection(lines(20, 21), duration),
    codeRef().code(forwarding_code_with_moving_data_and_main_temp, duration).wait(duration)
  );

  yield* all(
    codeRef().selection(codeRef().findAllRanges(/std::move\(data\)/g), duration).wait(duration)
  );

  const forwarding_code_with_moving_data_and_main_move = `\
  #include <iostream>
  #include <utility>

  // 😱 Missing other special class methods!
  struct Data {
      Data& operator=(const Data& other) {
          std::cout << "Copy assignment" << std::endl;
          return *this;
      }

      Data& operator=(Data&& other) {
          std::cout << "Move assignment" << std::endl;
          return *this;
      }
  };

  class Container {
     public:
      void Put(const Data& data) { data_ = data; }

      void Put(Data&& data) { data_ = std::move(data); }

     private:
      Data data_{};
  };

  int main() {
      Container container{};
      Data data{};
      container.Put(data);
      container.Put(Data{});
  }`

  yield* all(
    codeRef().fontSize(26, duration),
    codeRef().selection(lines(25, 31), duration),
    codeRef().code(forwarding_code_with_moving_data_and_main_move, duration).wait(duration)
  );

  const container_overloads_code = `\
  // Assume Data is defined in this header
  #include "data.hpp"
  // Needed for std::move
  #include <utility>

  class Container {
     public:
      void Put(const Data& data) { data_ = data; }

      void Put(Data&& data) { data_ = std::move(data); }

     private:
      Data data_{};
  };`

  yield* all(
    codeRef().fontSize(35, 0),
    codeRef().selection(DEFAULT, 0),
    codeRef().code(container_overloads_code, 0).wait(duration)
  );

  const container_overloads_code_no_const = `\
  // Assume Data is defined in this header
  #include "data.hpp"
  // Needed for std::move
  #include <utility>

  class Container {
     public:
      void Put(Data&& data) { data_ = std::move(data); }

     private:
      Data data_{};
  };`

  yield* all(
    codeRef().code(container_overloads_code_no_const, duration).wait(duration)
  );

  const container_overloads_code_template = `\
  // Assume Data is defined in this header
  #include "data.hpp"
  // Needed for std::move
  #include <utility>

  class Container {
     public:
      template <typename T>
      void Put(T&& data) { data_ = std::move(data); }

     private:
      Data data_{};
  };`

  yield* all(
    codeRef().code(container_overloads_code_template, duration).wait(duration)
  );

  const container_forward_code = `\
  // Assume Data is defined in this header
  #include "data.hpp"
  // Needed for std::forward
  #include <utility>

  class Container {
     public:
      template <typename T>
      void Put(T&& data) { data_ = std::forward<T>(data); }

     private:
      Data data_{};
  };`

  yield* all(
    codeRef().code(container_forward_code, duration).wait(duration)
  );

  const container_forward_code_with_main = `\
  // Needed for std::forward
  #include <utility>

  // 😱 Missing other special class methods!
  struct Data {
      Data& operator=(const Data& other) {
          std::cout << "Copy assignment" << std::endl;
          return *this;
      }

      Data& operator=(Data&& other) {
          std::cout << "Move assignment" << std::endl;
          return *this;
      }
  };

  class Container {
     public:
      template <typename T>
      void Put(T&& data) { data_ = std::forward<T>(data); }

     private:
      Data data_{};
  };

  int main() {
      Container container{};
      Data data{};
      container.Put(data);
      container.Put(Data{});
  }`

  yield* all(
    codeRef().fontSize(26, duration),
    codeRef().code(container_forward_code_with_main, duration).wait(duration)
  );
  yield* waitFor(duration);


  yield* all(
    codeRef().fontSize(55, duration),
    codeRef().y(-250, duration),
    codeRef().selection(codeRef().findAllRanges(/template/g), duration).wait(duration)
  );

  yield* all(
    codeRef().y(-750, duration),
    codeRef().selection(lines(25, 30), duration).wait(duration)
  );

  const container_forward_code_with_main_42 = `\
  // Needed for std::forward
  #include <utility>

  // 😱 Missing other special class methods!
  struct Data {
      Data& operator=(const Data& other) {
          std::cout << "Copy assignment" << std::endl;
          return *this;
      }

      Data& operator=(Data&& other) {
          std::cout << "Move assignment" << std::endl;
          return *this;
      }
  };

  class Container {
     public:
      template <typename T>
      void Put(T&& data) { data_ = std::forward<T>(data); }

     private:
      Data data_{};
  };

  int main() {
      Container container{};
      container.Put(42);  // ❌ Won't compile.
  }`

  yield* all(
    codeRef().fontSize(55, duration),
    codeRef().selection(lines(25, 28), duration),
    codeRef().x(-700, duration),
    codeRef().code(container_forward_code_with_main_42, duration).wait(duration)
  );
  yield* waitFor(duration);


  const container_forward_multi_param = `\
  // Assume Data is defined in this header
  #include "data.hpp"
  // Needed for std::forward
  #include <utility>

  class Container {
     public:
      template <typename T, typename S>
      void Put(T&& data_1, S&& data_2) {
        data_1_ = std::forward<T>(data_1);
        data_2_ = std::forward<S>(data_2);
      }

     private:
      Data data_1_{};
      Data data_2_{};
  };`

  yield* all(
    codeRef().selection(DEFAULT, 0),
    codeRef().y(0, 0),
    codeRef().x(-800, 0),
    codeRef().fontSize(40, 0),
    codeRef().code(container_forward_code, 0).wait(duration)
  );
  yield* all(
    codeRef().code(container_forward_multi_param, duration).wait(duration)
  );
  yield* all(
    codeRef().selection(codeRef().findAllRanges(/Data data_\d_{};/g), duration).wait(duration)
  );
  yield* all(
    codeRef().selection(lines(7, 11), duration).wait(duration)
  );

  const container_forward_multi_param_with_main = `\
  // Needed for std::forward
  #include <utility>

  // 😱 Missing other special class methods!
  struct Data {
      Data& operator=(const Data& other) {
          std::cout << "Copy assignment" << std::endl;
          return *this;
      }

      Data& operator=(Data&& other) {
          std::cout << "Move assignment" << std::endl;
          return *this;
      }
  };

  class Container {
     public:
      template <typename T, typename S>
      void Put(T&& data_1, S&& data_2) {
        data_1_ = std::forward<T>(data_1);
        data_2_ = std::forward<S>(data_2);
      }

     private:
      Data data_1_{};
      Data data_2_{};
  };

  int main() {
      Container container{};
      Data data{};
      container.Put(data, Data{});
      std::cout << "-----" << std::endl;
      container.Put(Data{}, data);
      std::cout << "-----" << std::endl;
      container.Put(Data{}, std::move(data));
  }`

  yield* all(
    codeRef().selection(lines(15, Infinity), duration),
    codeRef().y(-300, duration),
    codeRef().x(-800, duration),
    codeRef().fontSize(35, duration),
    codeRef().code(container_forward_multi_param_with_main, duration).wait(duration)
  );

  yield* all(
    codeRef().selection(lines(15, 27), duration),
    codeRef().y(-100, duration),
    codeRef().fontSize(35, duration).wait(duration),
  );

  const container_forward_multi_param_explicit_with_main = `\
  // Needed for std::forward
  #include <utility>

  // 😱 Missing other special class methods!
  struct Data {
      Data& operator=(const Data& other) {
          std::cout << "Copy assignment" << std::endl;
          return *this;
      }

      Data& operator=(Data&& other) {
          std::cout << "Move assignment" << std::endl;
          return *this;
      }
  };

  class Container {
     public:
      void Put(Data&& data_1, Data&& data_2) {
        data_1_ = std::move(data_1);
        data_2_ = std::move(data_2);
      }
      void Put(const Data& data_1, Data&& data_2) {
        data_1_ = data_1;
        data_2_ = std::move(data_2);
      }
      void Put(Data&& data_1, const Data& data_2) {
        data_1_ = std::move(data_1);
        data_2_ = data_2;
      }
      void Put(const Data& data_1, const Data& data_2) {
        data_1_ = data_1;
        data_2_ = data_2;
      }

     private:
      Data data_1_{};
      Data data_2_{};
  };

  int main() {
      Container container{};
      Data data{};
      container.Put(data, Data{});
      std::cout << "-----" << std::endl;
      container.Put(Data{}, data);
      std::cout << "-----" << std::endl;
      container.Put(Data{}, std::move(data));
  }`

  yield* all(
    codeRef().y(-150, duration),
    codeRef().selection(lines(15, 38), duration),
    codeRef().fontSize(35, duration),
    codeRef().code(container_forward_multi_param_explicit_with_main, duration).wait(duration)
  );

  yield* waitFor(duration);

  const forward_explained_code = `\
  #include <type_traits>

  template <class T>
  T&& forward(std::remove_reference_t<T>& t) {
    return static_cast<T&&>(t);
  }

  template <class T>
  T&& forward(std::remove_reference_t<T>&& t) {
    return static_cast<T&&>(t);
  }`

  yield* all(
    codeRef().y(0, 0),
    codeRef().selection(DEFAULT, 0),
    codeRef().fontSize(50, 0),
    codeRef().code(forward_explained_code, 0).wait(duration)
  );

  yield* all(
    codeRef().selection(codeRef().findAllRanges(/std::remove_reference_t[\w<>&\s]*/g), duration).wait(duration)
  );

  yield* all(
    codeRef().selection(codeRef().findAllRanges(/std::remove_reference_t/g), duration).wait(duration)
  );


  const forward_explained_code_with_print = `\
  #include <iostream>
  #include <type_traits>
  #include <utility>

  template <class T>
  T&& forward(std::remove_reference_t<T>& t) {
    return static_cast<T&&>(t);
  }

  template <class T>
  T&& forward(std::remove_reference_t<T>&& t) {
    return static_cast<T&&>(t);
  }

  void Print(int&) { std::cout << "lvalue" << std::endl; }

  void Print(int&&) { std::cout << "rvalue" << std::endl; }

  template <class SomeType>
  void DoSmth(SomeType&& value) {
    Print(forward<SomeType>(value));
  }

  int main() {
    int number{};
    DoSmth(number);             // DoSmth(int&)
    DoSmth(42);                 // DoSmth(int&&)
    DoSmth(std::move(number));  // DoSmth(int&&)
  }`

  yield* all(
    codeRef().selection(DEFAULT, 0).wait(duration),
  );

  yield* all(
    codeRef().selection(DEFAULT, duration),
    codeRef().fontSize(25, duration),
    codeRef().code(forward_explained_code_with_print, duration).wait(duration)
  );

  yield* all(
    codeRef().fontSize(55, duration),
    codeRef().y(-500, duration),
    codeRef().selection([
      ...codeRef().findAllRanges(/int number.*/g),
      ...codeRef().findAllRanges(/DoSmth\(number\);.*/g),
    ], duration).wait(duration),
  );

  yield* all(
    codeRef().selection([
      ...codeRef().findAllRanges(/int number.*/g),
      ...codeRef().findAllRanges(/DoSmth\(number\);.*/g),
      lines(17, 21)
    ], duration).wait(duration),
  );



  const forward_explained_code_with_print_do_smth_explicit = `\
  #include <iostream>
  #include <type_traits>
  #include <utility>

  template <class T>
  T&& forward(std::remove_reference_t<T>& t) {
    return static_cast<T&&>(t);
  }

  template <class T>
  T&& forward(std::remove_reference_t<T>&& t) {
    return static_cast<T&&>(t);
  }

  void Print(int&) { std::cout << "lvalue" << std::endl; }

  void Print(int&&) { std::cout << "rvalue" << std::endl; }

  template <>
  void DoSmth<int&>(int& && value) {
    Print(forward<int&>(value));
  }

  int main() {
    int number{};
    DoSmth(number);             // DoSmth(int&)
    DoSmth(42);                 // DoSmth(int&&)
    DoSmth(std::move(number));  // DoSmth(int&&)
  }`

  yield* all(
    codeRef().fontSize(55, duration),
    codeRef().y(-500, duration),
    codeRef().code(forward_explained_code_with_print_do_smth_explicit, duration).wait(duration)
  );

  const forward_explained_code_with_print_do_smth_explicit_collapsed = `\
  #include <iostream>
  #include <type_traits>
  #include <utility>

  template <class T>
  T&& forward(std::remove_reference_t<T>& t) {
    return static_cast<T&&>(t);
  }

  template <class T>
  T&& forward(std::remove_reference_t<T>&& t) {
    return static_cast<T&&>(t);
  }

  void Print(int&) { std::cout << "lvalue" << std::endl; }

  void Print(int&&) { std::cout << "rvalue" << std::endl; }

  template <>
  void DoSmth<int&>(int& value) {
    Print(forward<int&>(value));
  }

  int main() {
    int number{};
    DoSmth(number);             // DoSmth(int&)
    DoSmth(42);                 // DoSmth(int&&)
    DoSmth(std::move(number));  // DoSmth(int&&)
  }`

  yield* all(
    codeRef().fontSize(55, duration),
    codeRef().y(-500, duration),
    codeRef().code(forward_explained_code_with_print_do_smth_explicit_collapsed, duration).wait(duration)
  );

  yield* all(
    codeRef().fontSize(45, duration),
    codeRef().y(100, duration),
    codeRef().selection([lines(4, 12), ...codeRef().findAllRanges(/forward<int&>\(value\)/g)], duration).wait(duration),
  );

  const forward_explained_code_forward_explicit = `\
  #include <iostream>
  #include <type_traits>
  #include <utility>

  template <>
  int& && forward<int&>(std::remove_reference_t<int&>& t) {
    return static_cast<int& &&>(t);
  }

  template <>
  int& && forward<int&>(std::remove_reference_t<int&>&& t) {
    return static_cast<int& &&>(t);
  }

  void Print(int&) { std::cout << "lvalue" << std::endl; }

  void Print(int&&) { std::cout << "rvalue" << std::endl; }

  template <>
  void DoSmth<int&>(int& value) {
    Print(forward<int&>(value));
  }

  int main() {
    int number{};
    DoSmth(number);             // DoSmth(int&)
    DoSmth(42);                 // DoSmth(int&&)
    DoSmth(std::move(number));  // DoSmth(int&&)
  }`


  yield* all(
    codeRef().code(forward_explained_code_forward_explicit, duration).wait(duration),
  );

  const forward_explained_code_forward_explicit_no_refs = `\
  #include <iostream>
  #include <type_traits>
  #include <utility>

  template <>
  int& && forward<int&>(int& t) {
    return static_cast<int& &&>(t);
  }

  template <>
  int& && forward<int&>(int&& t) {
    return static_cast<int& &&>(t);
  }

  void Print(int&) { std::cout << "lvalue" << std::endl; }

  void Print(int&&) { std::cout << "rvalue" << std::endl; }

  template <>
  void DoSmth<int&>(int& value) {
    Print(forward<int&>(value));
  }

  int main() {
    int number{};
    DoSmth(number);             // DoSmth(int&)
    DoSmth(42);                 // DoSmth(int&&)
    DoSmth(std::move(number));  // DoSmth(int&&)
  }`


  yield* all(
    codeRef().selection([lines(4, 8), ...codeRef().findAllRanges(/forward<int&>\(value\)/g)], duration).wait(duration),
    codeRef().code(forward_explained_code_forward_explicit_no_refs, duration).wait(duration),
  );

  const forward_explained_code_forward_explicit_no_refs_collapsed = `\
  #include <iostream>
  #include <type_traits>
  #include <utility>

  template <>
  int& forward<int&>(int& t) {
    return static_cast<int&>(t);
  }

  template <>
  int& forward<int&>(int&& t) {
    return static_cast<int&>(t);
  }

  void Print(int&) { std::cout << "lvalue" << std::endl; }

  void Print(int&&) { std::cout << "rvalue" << std::endl; }

  template <>
  void DoSmth<int&>(int& value) {
    Print(forward<int&>(value));
  }

  int main() {
    int number{};
    DoSmth(number);             // DoSmth(int&)
    DoSmth(42);                 // DoSmth(int&&)
    DoSmth(std::move(number));  // DoSmth(int&&)
  }`


  yield* all(
    codeRef().selection([lines(4, 8), ...codeRef().findAllRanges(/forward<int&>\(value\)/g)], duration).wait(duration),
    codeRef().code(forward_explained_code_forward_explicit_no_refs_collapsed, duration).wait(duration),
  );

  yield* all(
    codeRef().selection([
      lines(4, 8),
      lines(14, 15),
      ...codeRef().findAllRanges(/Print\(forward<int&>\(value\)\);/g)
    ], duration).wait(duration),
  );


  // ----------------------
  yield* all(
    codeRef().y(0, 0),
    codeRef().selection(DEFAULT, 0),
    codeRef().fontSize(25, 0),
    codeRef().code(forward_explained_code_with_print, 0).wait(duration)
  );

  yield* all(
    codeRef().fontSize(55, duration),
    codeRef().y(-500, duration),
    codeRef().selection([
      ...codeRef().findAllRanges(/int number.*/g),
      ...codeRef().findAllRanges(/DoSmth\(42\);.*/g),
      ...codeRef().findAllRanges(/DoSmth\(std::move\(number\)\);.*/g),
    ], duration).wait(duration),
  );

  yield* all(
    codeRef().selection([
      ...codeRef().findAllRanges(/int number.*/g),
      ...codeRef().findAllRanges(/DoSmth\(42\);.*/g),
      ...codeRef().findAllRanges(/DoSmth\(std::move\(number\)\);.*/g),
      lines(17, 21)
    ], duration).wait(duration),
  );



  const forward_explained_code_with_print_do_smth_explicit_rvalue = `\
  #include <iostream>
  #include <type_traits>
  #include <utility>

  template <class T>
  T&& forward(std::remove_reference_t<T>& t) {
    return static_cast<T&&>(t);
  }

  template <class T>
  T&& forward(std::remove_reference_t<T>&& t) {
    return static_cast<T&&>(t);
  }

  void Print(int&) { std::cout << "lvalue" << std::endl; }

  void Print(int&&) { std::cout << "rvalue" << std::endl; }

  template <>
  void DoSmth<int>(int&& value) {
    Print(forward<int>(value));
  }

  int main() {
    int number{};
    DoSmth(number);             // DoSmth(int&)
    DoSmth(42);                 // DoSmth(int&&)
    DoSmth(std::move(number));  // DoSmth(int&&)
  }`

  yield* all(
    codeRef().fontSize(55, duration),
    codeRef().y(-500, duration),
    codeRef().code(forward_explained_code_with_print_do_smth_explicit_rvalue, duration).wait(duration)
  );

  yield* all(
    codeRef().fontSize(45, duration),
    codeRef().y(100, duration),
    codeRef().selection([
      lines(4, 12),
      ...codeRef().findAllRanges(/forward<int>\(value\)/g)], duration).wait(duration),
  );

  const forward_explained_code_forward_explicit_rvalue = `\
  #include <iostream>
  #include <type_traits>
  #include <utility>

  template <>
  int&& forward<int>(std::remove_reference_t<int>& t) {
    return static_cast<int&&>(t);
  }

  template <>
  int&& forward<int>(std::remove_reference_t<int>&& t) {
    return static_cast<int&&>(t);
  }

  void Print(int&) { std::cout << "lvalue" << std::endl; }

  void Print(int&&) { std::cout << "rvalue" << std::endl; }

  template <>
  void DoSmth<int>(int&& value) {
    Print(forward<int>(value));
  }

  int main() {
    int number{};
    DoSmth(number);             // DoSmth(int&)
    DoSmth(42);                 // DoSmth(int&&)
    DoSmth(std::move(number));  // DoSmth(int&&)
  }`


  yield* all(
    codeRef().code(forward_explained_code_forward_explicit_rvalue, duration).wait(duration),
  );

  const forward_explained_code_forward_explicit_no_refs_rvalue = `\
  #include <iostream>
  #include <type_traits>
  #include <utility>

  template <>
  int&& forward<int>(int& t) {
    return static_cast<int&&>(t);
  }

  template <>
  int&& forward<int>(int&& t) {
    return static_cast<int&&>(t);
  }

  void Print(int&) { std::cout << "lvalue" << std::endl; }

  void Print(int&&) { std::cout << "rvalue" << std::endl; }

  template <>
  void DoSmth<int>(int&& value) {
    Print(forward<int>(value));
  }

  int main() {
    int number{};
    DoSmth(number);             // DoSmth(int&)
    DoSmth(42);                 // DoSmth(int&&)
    DoSmth(std::move(number));  // DoSmth(int&&)
  }`


  yield* all(
    codeRef().code(forward_explained_code_forward_explicit_no_refs_rvalue, duration).wait(duration),
  );

  yield* all(
    codeRef().selection([
      lines(4, 8),
      ...codeRef().findAllRanges(/forward<int>\(value\)/g)], duration).wait(duration),
  );

  yield* all(
    codeRef().selection([
      lines(4, 8),
      lines(16, 17),
      ...codeRef().findAllRanges(/Print\(forward<int>\(value\)\);/g)
    ], duration).wait(duration),
  );

  const forward_second_overload = `\
  #include <type_traits>
  #include <utility>

  template <class T>
  T&& forward(std::remove_reference_t<T>& t) {
    return static_cast<T&&>(t);
  }

  template <class T>
  T&& forward(std::remove_reference_t<T>&& t) {
    return static_cast<T&&>(t);
  }

  int main() {
    // We can also use std::forward here of course.
    forward<int>(42);
    int number{};
    forward<int>(std::move(number));
  }`

  yield* all(
    codeRef().fontSize(42, duration),
    codeRef().y(0, duration),
    codeRef().selection(DEFAULT, duration).wait(duration),
    codeRef().code(forward_second_overload, duration).wait(duration),
  );


  yield* waitFor(duration * 3);
});
