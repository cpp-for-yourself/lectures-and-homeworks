import { createRef } from '@motion-canvas/core/lib/utils';
import { makeScene2D, Code, LezerHighlighter, lines } from '@motion-canvas/2d';
import { all, waitFor, waitUntil } from '@motion-canvas/core/lib/flow';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';
import { tags } from '@lezer/highlight';
import { HighlightStyle } from '@codemirror/language';

import { parser as parser_css } from '@lezer/css';
import { parser as parser_cpp } from '@lezer/cpp';

const MyStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#569CD6' }, // VSCode Keyword color
  { tag: tags.controlKeyword, color: '#C586C0' }, // VSCode Control Keyword color
  { tag: tags.operatorKeyword, color: '#C586C0' }, // VSCode Control Keyword color
  { tag: tags.comment, color: 'gray' }, // VSCode Comment color
  { tag: tags.className, color: '#4EC9B0' }, // VSCode Class Name color
  { tag: tags.constant(tags.variableName), color: '#B5CEA8' }, // VSCode Constant color
  { tag: tags.function(tags.variableName), color: '#DCDCAA' }, // VSCode Function color
  { tag: tags.function(tags.propertyName), color: '#DCDCAA' }, // VSCode Function color
  { tag: tags.propertyName, color: '#DCDCAA' }, // VSCode Function color
  { tag: tags.number, color: '#B5CEA8' }, // VSCode Number color
  { tag: tags.string, color: '#CE9178' }, // VSCode String color
  { tag: tags.typeName, color: '#4EC9B0' }, // VSCode Type Name color
  { tag: tags.squareBracket, color: '#C586C0' }, // VSCode Square Bracket color
  { tag: tags.bracket, color: '#C586C0' }, // VSCode Bracket color
  { tag: tags.brace, color: '#DDDD22' }, // VSCode Brace color
  { tag: tags.processingInstruction, color: '#C586C0' }, // VSCode Brace color
  { tag: tags.arithmeticOperator, color: '#D16969' }, // VSCode Arithmetic Operator color
]);

const CssHighlighter = new LezerHighlighter(parser_css, MyStyle);
const CppHighlighter = new LezerHighlighter(parser_cpp, MyStyle);

export default makeScene2D(function* (view) {
  const codeRef = createRef<Code>();

  yield view.add(<Code
    ref={codeRef}
    fontSize={25}
    fontFamily={'Fira Mono'}
    fontWeight={500}
    offsetX={-1}
    x={-600}
    highlighter={CppHighlighter}
  />);

  const duration = 1.0

  const lambda_intro_1 = `\
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

int main() {
  std::vector<Person> people{
      {"Gandalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
}`
  const lambda_intro_2 = `\
#include <algorithm>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

int main() {
  std::vector<Person> people{
      {"Gandalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  std::sort(people.begin(), people.end());
}`

  const lambda_intro_3 = `\
#include <algorithm>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

int main() {
  std::vector<Person> people{
      {"Gandalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  // ❌ Won't compile, cannot compare Person objects.
  std::sort(people.begin(), people.end());
}`

  yield* codeRef().code(lambda_intro_1, duration).wait(duration);
  yield* codeRef().code(lambda_intro_2, duration).to(lambda_intro_3, duration).wait(duration);


  const error_message = `\
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:71,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h: In instantiation of 'constexpr bool __gnu_cxx::__ops::_Iter_less_iter::operator()(_Iterator1, _Iterator2) const [with _Iterator1 = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Iterator2 = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >]':
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:82:17:   required from 'void std::__move_median_to_first(_Iterator, _Iterator, _Iterator, _Iterator, _Compare) [with _Iterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1924:34:   required from '_RandomAccessIterator std::__unguarded_partition_pivot(_RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1958:38:   required from 'void std::__introsort_loop(_RandomAccessIterator, _RandomAccessIterator, _Size, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Size = long int; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1974:25:   required from 'void std::__sort(_RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:4859:18:   required from 'void std::sort(_RAIter, _RAIter) [with _RAIter = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >]'
<source>:14:41:   required from here
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:43:23: error: no match for 'operator<' (operand types are 'Person' and 'Person')
   43 |       { return *__it1 < *__it2; }
      |                ~~~~~~~^~~~~~~~
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:67,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1096:5: note: candidate: 'template<class _IteratorL, class _IteratorR, class _Container> bool __gnu_cxx::operator<(const __gnu_cxx::__normal_iterator<_IteratorL, _Container>&, const __gnu_cxx::__normal_iterator<_IteratorR, _Container>&)'
 1096 |     operator<(const __normal_iterator<_IteratorL, _Container>& __lhs,
      |     ^~~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1096:5: note:   template argument deduction/substitution failed:
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:71,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:43:23: note:   'Person' is not derived from 'const __gnu_cxx::__normal_iterator<_IteratorL, _Container>'
   43 |       { return *__it1 < *__it2; }
      |                ~~~~~~~^~~~~~~~
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:67,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1104:5: note: candidate: 'template<class _Iterator, class _Container> bool __gnu_cxx::operator<(const __gnu_cxx::__normal_iterator<_Iterator, _Container>&, const __gnu_cxx::__normal_iterator<_Iterator, _Container>&)'
 1104 |     operator<(const __normal_iterator<_Iterator, _Container>& __lhs,
      |     ^~~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1104:5: note:   template argument deduction/substitution failed:
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:71,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:43:23: note:   'Person' is not derived from 'const __gnu_cxx::__normal_iterator<_Iterator, _Container>'
   43 |       { return *__it1 < *__it2; }
      |                ~~~~~~~^~~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h: In instantiation of 'bool __gnu_cxx::__ops::_Val_less_iter::operator()(_Value&, _Iterator) const [with _Value = Person; _Iterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >]':
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1826:20:   required from 'void std::__unguarded_linear_insert(_RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Val_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1854:36:   required from 'void std::__insertion_sort(_RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1886:25:   required from 'void std::__final_insertion_sort(_RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1977:31:   required from 'void std::__sort(_RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:4859:18:   required from 'void std::sort(_RAIter, _RAIter) [with _RAIter = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >]'
<source>:14:41:   required from here
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:96:22: error: no match for 'operator<' (operand types are 'Person' and 'Person')
   96 |       { return __val < *__it; }
      |                ~~~~~~^~~~~~~
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:67,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1096:5: note: candidate: 'template<class _IteratorL, class _IteratorR, class _Container> bool __gnu_cxx::operator<(const __gnu_cxx::__normal_iterator<_IteratorL, _Container>&, const __gnu_cxx::__normal_iterator<_IteratorR, _Container>&)'
 1096 |     operator<(const __normal_iterator<_IteratorL, _Container>& __lhs,
      |     ^~~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1096:5: note:   template argument deduction/substitution failed:
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:71,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:96:22: note:   'Person' is not derived from 'const __gnu_cxx::__normal_iterator<_IteratorL, _Container>'
   96 |       { return __val < *__it; }
      |                ~~~~~~^~~~~~~
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:67,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1104:5: note: candidate: 'template<class _Iterator, class _Container> bool __gnu_cxx::operator<(const __gnu_cxx::__normal_iterator<_Iterator, _Container>&, const __gnu_cxx::__normal_iterator<_Iterator, _Container>&)'
 1104 |     operator<(const __normal_iterator<_Iterator, _Container>& __lhs,
      |     ^~~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1104:5: note:   template argument deduction/substitution failed:
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:71,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:96:22: note:   'Person' is not derived from 'const __gnu_cxx::__normal_iterator<_Iterator, _Container>'
   96 |       { return __val < *__it; }
      |                ~~~~~~^~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h: In instantiation of 'bool __gnu_cxx::__ops::_Iter_less_val::operator()(_Iterator, _Value&) const [with _Iterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Value = Person]':
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_heap.h:139:48:   required from 'void std::__push_heap(_RandomAccessIterator, _Distance, _Distance, _Tp, _Compare&) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Distance = long int; _Tp = Person; _Compare = __gnu_cxx::__ops::_Iter_less_val]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_heap.h:246:23:   required from 'void std::__adjust_heap(_RandomAccessIterator, _Distance, _Distance, _Tp, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Distance = long int; _Tp = Person; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_heap.h:355:22:   required from 'void std::__make_heap(_RandomAccessIterator, _RandomAccessIterator, _Compare&) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1666:23:   required from 'void std::__heap_select(_RandomAccessIterator, _RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1937:25:   required from 'void std::__partial_sort(_RandomAccessIterator, _RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1953:27:   required from 'void std::__introsort_loop(_RandomAccessIterator, _RandomAccessIterator, _Size, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Size = long int; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:1974:25:   required from 'void std::__sort(_RandomAccessIterator, _RandomAccessIterator, _Compare) [with _RandomAccessIterator = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >; _Compare = __gnu_cxx::__ops::_Iter_less_iter]'
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algo.h:4859:18:   required from 'void std::sort(_RAIter, _RAIter) [with _RAIter = __gnu_cxx::__normal_iterator<Person*, std::vector<Person> >]'
<source>:14:41:   required from here
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:67:22: error: no match for 'operator<' (operand types are 'Person' and 'Person')
   67 |       { return *__it < __val; }
      |                ~~~~~~^~~~~~~
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:67,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1096:5: note: candidate: 'template<class _IteratorL, class _IteratorR, class _Container> bool __gnu_cxx::operator<(const __gnu_cxx::__normal_iterator<_IteratorL, _Container>&, const __gnu_cxx::__normal_iterator<_IteratorR, _Container>&)'
 1096 |     operator<(const __normal_iterator<_IteratorL, _Container>& __lhs,
      |     ^~~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1096:5: note:   template argument deduction/substitution failed:
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:71,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:67:22: note:   'Person' is not derived from 'const __gnu_cxx::__normal_iterator<_IteratorL, _Container>'
   67 |       { return *__it < __val; }
      |                ~~~~~~^~~~~~~
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:67,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1104:5: note: candidate: 'template<class _Iterator, class _Container> bool __gnu_cxx::operator<(const __gnu_cxx::__normal_iterator<_Iterator, _Container>&, const __gnu_cxx::__normal_iterator<_Iterator, _Container>&)'
 1104 |     operator<(const __normal_iterator<_Iterator, _Container>& __lhs,
      |     ^~~~~~~~
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_iterator.h:1104:5: note:   template argument deduction/substitution failed:
In file included from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/stl_algobase.h:71,
                 from /opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/algorithm:61,
                 from <source>:1:
/opt/compiler-explorer/gcc-10.1.0/include/c++/10.1.0/bits/predefined_ops.h:67:22: note:   'Person' is not derived from 'const __gnu_cxx::__normal_iterator<_Iterator, _Container>'
   67 |       { return *__it < __val; }
      |                ~~~~~~^~~~~~~
Compiler returned: 1`

  yield* all(
    codeRef().highlighter(CssHighlighter, 0),
    codeRef().fontSize(7, 0),
    codeRef().x(-900, 0),
    codeRef().y(1100, 0),
    codeRef().code(error_message, 0),
  );
  yield* waitFor(duration);

  yield* all(
    codeRef().y(0, duration),
  );
  yield* waitFor(duration);

  yield* all(
    codeRef().fontSize(35, duration),
    codeRef().x(-2400, duration),
    codeRef().y(2000, duration),
  );
  yield* waitFor(duration);

  yield* all(
    codeRef().highlighter(CppHighlighter, 0),
    codeRef().fontSize(25, 0),
    codeRef().x(-600, 0),
    codeRef().y(0, 0),
    codeRef().code(lambda_intro_3, 0),
  );
  yield* waitFor(duration);

  const lambda_intro_4 = `\
#include <algorithm>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

int main() {
  std::vector<Person> people{
      {"Gandalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  std::sort(
      people.begin(), people.end(),
      [](const auto& left, const auto& right) { return left.age < right.age; });
}`
  yield* all(
    codeRef().code(lambda_intro_4, duration),
  );
  yield* waitFor(duration);

  const lambda_intro_5 = `\
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

void Print(const std::vector<Person>& persons, const std::string& tag) {
  std::cout << tag << std::endl;
  for (const auto& person : persons) {
    std::cout << person.name << " " << person.age << "\\n";
  }
}

int main() {
  std::vector<Person> people{
      {"Gandalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people, "> Before sorting:");
  std::sort(
      people.begin(), people.end(),
      [](const auto& left, const auto& right) { return left.age < right.age; });
  Print(people, "> Sorted by age ascending:");
}`
  yield* all(
    codeRef().code(lambda_intro_5, duration),
  );
  yield* waitFor(duration);

  yield* all(
    codeRef().code('', 0),
    codeRef().fontSize(70, 0),
  );
  const lambda_simple_1 = `\
int main() {
  [](){}();
}`
  yield* all(
    codeRef().code(lambda_simple_1, duration),
  );
  yield* waitFor(duration);

  const lambda_simple_2 = `\
// ✅ Yep, this compiles 🙃
int main() {
  [](){}();
}`
  yield* all(
    codeRef().code(lambda_simple_2, duration),
  );
  yield* waitFor(duration);

  yield* all(
    codeRef().code(lambda_intro_5, 0),
    codeRef().fontSize(25, 0),
  );
  yield* waitFor(duration);

  const function_ptr = `\
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

void Print(const std::vector<Person>& persons, const std::string& tag) {
  std::cout << tag << std::endl;
  for (const auto& person : persons) {
    std::cout << person.name << " " << person.age << "\\n";
  }
}

bool less(const Person& p1, const Person& p2) { return p1.age < p2.age; }

int main() {
  std::vector<Person> people{
      {"Gandalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people, "> Before sorting:");
  std::sort(people.begin(), people.end(), &less);
  Print(people, "> Sorted by age ascending:");
}`
  yield* all(
    codeRef().code(function_ptr, duration),
    codeRef().fontSize(25, duration),
  );
  yield* waitFor(duration);

  const function_ptr_1 = `\
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

void Print(const std::vector<Person>& persons, const std::string& tag) {
  std::cout << tag << std::endl;
  for (const auto& person : persons) {
    std::cout << person.name << " " << person.age << "\\n";
  }
}

bool less(const Person& p1, const Person& p2) { return p1.age < p2.age; }

int main() {
  std::vector<Person> people{
      {"Gandalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people, "> Before sorting:");
  std::sort(people.begin(), people.end(), less);
  Print(people, "> Sorted by age ascending:");
}`
  yield* all(
    codeRef().code(function_ptr_1, duration),
    codeRef().fontSize(25, duration),
  );
  yield* waitFor(duration);

  const functor = `\
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

void Print(const std::vector<Person>& persons, const std::string& tag) {
  std::cout << tag << std::endl;
  for (const auto& person : persons) {
    std::cout << person.name << " " << person.age << "\\n";
  }
}

class ComparisonToQueryAge {
 public:
  explicit ComparisonToQueryAge(int query_age) : query_age_{query_age} {}

  bool operator()(const Person& p1, const Person& p2) const {
    return std::abs(p1.age - query_age_) < std::abs(p2.age - query_age_);
  }

 private:
  int query_age_{};
};

int main() {
  std::vector<Person> people{
      {"Gandalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people, "> Before sorting:");
  std::sort(people.begin(), people.end(), ComparisonToQueryAge{4242});
  Print(people, "> Sorted by age difference to 4242, ascending:");
}`
  yield* all(
    codeRef().code(functor, duration),
    codeRef().fontSize(22, duration),
  );
  yield* waitFor(duration);

  const my_sort = `\
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

void Print(const std::vector<Person>& persons, const std::string& tag) {
  std::cout << tag << std::endl;
  for (const auto& person : persons) {
    std::cout << person.name << " " << person.age << "\\n";
  }
}

template <class Iterator, class Comparator>
void MySort(Iterator begin, Iterator end, Comparator comparator) {
  // The actual algorithm is not important here.
  for (Iterator i = begin + 1; i != end; ++i) {
    Iterator j = i;
    // We call comparator(*iter_1, *iter_2) somewhere in our algorithm.
    while (j != begin && comparator(*j, *(j - 1))) {
      std::iter_swap(j, j - 1);
      --j;
    }
  }
}

int main() {
  std::vector<Person> people{
      {"Gandalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people, "> Before sorting:");
}`

  yield* all(
    codeRef().code(my_sort, 0),
    codeRef().fontSize(22, 0),
  );
  yield* waitFor(duration);

  const my_sort_2 = `\
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

void Print(const std::vector<Person>& persons, const std::string& tag) {
  std::cout << tag << std::endl;
  for (const auto& person : persons) {
    std::cout << person.name << " " << person.age << "\\n";
  }
}

bool less(const Person& p1, const Person& p2) { return p1.age < p2.age; }

template <class Iterator, class Comparator>
void MySort(Iterator begin, Iterator end, Comparator comparator) {
  // The actual algorithm is not important here.
  for (Iterator i = begin + 1; i != end; ++i) {
    Iterator j = i;
    // We call comparator(*iter_1, *iter_2) somewhere in our algorithm.
    while (j != begin && comparator(*j, *(j - 1))) {
      std::iter_swap(j, j - 1);
      --j;
    }
  }
}

int main() {
  std::vector<Person> people{
      {"Gandalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people, "> Before sorting:");
  MySort(people.begin(), people.end(), less);
  Print(people, "> Sorted by age ascending:");
  MySort(people.begin(), people.end(), &less);
  Print(people, "> Sorted by age ascending:");
}`

  yield* all(
    codeRef().code(my_sort_2, duration),
    codeRef().fontSize(20, duration),
  );
  yield* waitFor(duration);

  const my_sort_3 = `\
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

void Print(const std::vector<Person>& persons, const std::string& tag) {
  std::cout << tag << std::endl;
  for (const auto& person : persons) {
    std::cout << person.name << " " << person.age << "\\n";
  }
}

class ComparisonToQueryAge {
 public:
  explicit ComparisonToQueryAge(int query_age) : query_age_{query_age} {}

  bool operator()(const Person& p1, const Person& p2) const {
    return std::abs(p1.age - query_age_) < std::abs(p2.age - query_age_);
  }

 private:
  int query_age_{};
};

bool less(const Person& p1, const Person& p2) { return p1.age < p2.age; }

template <class Iterator, class Comparator>
void MySort(Iterator begin, Iterator end, Comparator comparator) {
  // The actual algorithm is not important here.
  for (Iterator i = begin + 1; i != end; ++i) {
    Iterator j = i;
    // We call comparator(*iter_1, *iter_2) somewhere in our algorithm.
    while (j != begin && comparator(*j, *(j - 1))) {
      std::iter_swap(j, j - 1);
      --j;
    }
  }
}

int main() {
  std::vector<Person> people{
      {"Gandalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people, "> Before sorting:");
  MySort(people.begin(), people.end(), less);
  Print(people, "> Sorted by age ascending:");
  MySort(people.begin(), people.end(), ComparisonToQueryAge{4242});
  Print(people, "> Sorted by age difference to 4242, ascending:");
  MySort(people.begin(), people.end(), &less);
  Print(people, "> Sorted by age ascending:");
}`

  yield* all(
    codeRef().code(my_sort_3, duration),
    codeRef().fontSize(15, duration),
  );
  yield* waitFor(duration);

  yield* all(
    codeRef().code(functor, 0),
    codeRef().fontSize(22, 0),
  );
  yield* waitFor(duration);

  const lambdas = `\
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

int main() {
  const auto Print = [](const auto& persons, const auto& tag) {
    std::cout << tag << std::endl;
    for (const auto& person : persons) {
      std::cout << person.name << " " << person.age << "\\n";
    }
  };

  std::vector<Person> people{
      {"Gandalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people, "> Before sorting:");

  std::sort(people.begin(), people.end(),
            [](const auto& p1, const auto& p2) { return p1.age < p2.age; });
  Print(people, "> Sorted by age ascending:");

  const int query_age = 4242;
  std::sort(people.begin(), people.end(),
            [query_age](const auto& p1, const auto& p2) -> bool {
              return std::abs(p1.age - query_age) < std::abs(p2.age - query_age);
            });
  Print(people, "> Sorted by age difference to 4242, ascending:");
}`
  yield* all(
    codeRef().code(lambdas, duration),
  );
  yield* waitFor(duration);

  const lambdas_by_ref = `\
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Person {
  std::string name;
  int age;
};

int main() {
  const auto Print = [](const auto& persons, const auto& tag) {
    std::cout << tag << std::endl;
    for (const auto& person : persons) {
      std::cout << person.name << " " << person.age << "\\n";
    }
  };

  std::vector<Person> people{
      {"Gandalf", 55'000}, {"Frodo", 33}, {"Legolas", 2'931}, {"Gimli", 139}};
  Print(people, "> Before sorting:");

  std::sort(people.begin(), people.end(),
            [](const auto& p1, const auto& p2) { return p1.age < p2.age; });
  Print(people, "> Sorted by age ascending:");

  const int query_age = 4242;
  std::sort(people.begin(), people.end(),
            [&query_age](const auto& p1, const auto& p2) -> bool {
              return std::abs(p1.age - query_age) < std::abs(p2.age - query_age);
            });
  Print(people, "> Sorted by age difference to 4242, ascending:");
}`
  yield* all(
    codeRef().code(lambdas_by_ref, duration),
  );
  yield* waitFor(duration);

  const lambda_capturing = `\
#include <iostream>

int main() {
  int one{};
  float two{};
  double three{};
  const auto Lambda = [&one, two, &three] {
    // Do something with one, two, three.
    std::cout << one << " " << two << " " << three << std::endl;
  };
  Lambda();
}`
  yield* all(
    codeRef().code(lambda_capturing, 0),
    codeRef().fontSize(25, 0),
  );
  yield* waitFor(duration);

  const lambda_capturing_all = `\
#include <iostream>

int main() {
  int one{};
  float two{};
  double three{};
  const auto Lambda = [=] {
    // All variables are captured by copy.
    std::cout << one << " " << two << " " << three << std::endl;
  };
  Lambda();
}`
  yield* all(
    codeRef().code(lambda_capturing_all, duration),
    codeRef().fontSize(25, duration),
  );
  yield* waitFor(duration);

  const lambda_capturing_all_with_some = `\
#include <iostream>

int main() {
  int one{};
  float two{};
  double three{};
  const auto Lambda = [=, &two] {
    // two is captured by reference, all the others by copy.
    std::cout << one << " " << two << " " << three << std::endl;
  };
  Lambda();
}`
  yield* all(
    codeRef().code(lambda_capturing_all_with_some, duration),
    codeRef().fontSize(25, duration),
  );
  yield* waitFor(duration);

  const lambda_capturing_all_by_ref = `\
#include <iostream>

int main() {
  int one{};
  float two{};
  double three{};
  const auto Lambda = [&] {
    // All variables are captured by reference.
    std::cout << one << " " << two << " " << three << std::endl;
  };
  Lambda();
}`
  yield* all(
    codeRef().code(lambda_capturing_all_by_ref, duration),
    codeRef().fontSize(25, duration),
  );
  yield* waitFor(duration);

  const lambda_capturing_all_by_ref_some_by_copy = `\
#include <iostream>

int main() {
  int one{};
  float two{};
  double three{};
  const auto Lambda = [&, two] {
    // two is captured by copy, all the others by reference.
    std::cout << one << " " << two << " " << three << std::endl;
  };
  Lambda();
}`
  yield* all(
    codeRef().code(lambda_capturing_all_by_ref_some_by_copy, duration),
    codeRef().fontSize(25, duration),
  );
  yield* waitFor(duration);

  const lambda_capturing_this = `\
#include <iostream>

struct Foo {
  void Bar() {
    [this] {
      // The whole current object is captured by reference.
      std::cout << one << " " << two << " " << three << std::endl;
    }();  // We call this lambda in-place for illustration purposes.
  }

  int one{};
  float two{};
  double three{};
};

int main() {
  Foo foo{};
  foo.Bar();
}`
  yield* all(
    codeRef().code(lambda_capturing_this, duration),
    codeRef().fontSize(25, duration),
  );
  yield* waitFor(duration);

  const sandwich_bad = `\
#include <iostream>
#include <string>

// 😱 Comments tend to drift out of sync with code.
Sandwich MakeGourmetSandwich() {
    Sandwich sandwich{};

    // Step 1: Prepare the bread
    sandwich += "Choosing the finest sourdough...\\n";
    sandwich += "Lightly toasting it to perfection...\\n";
    sandwich += "Spreading a generous amount of garlic aioli...\\n";

    // Step 2: Prepare the ingredients
    sandwich += "Grilling marinated chicken...\\n";
    sandwich += "Adding fresh arugula and juicy tomatoes...\\n";
    sandwich += "Topping it off with caramelized onions...\\n";

    // Step 3: Assemble the masterpiece
    sandwich += "Assembling the sandwich with care...\\n";
    sandwich += "Adding a drizzle of truffle oil...\\n";
    sandwich += "Plating it elegantly...\\n";

    return sandwich;
}`
  yield* all(
    codeRef().code(sandwich_bad, 0),
    codeRef().fontSize(25, 0),
  );
  yield* waitFor(duration);

  const sandwich_better = `\
#include <iostream>
#include <string>

// ✅ Every step is encapsulated in a lambda.
Sandwich MakeGourmetSandwich() {
    Sandwich sandwich{};

    const auto PrepareBread = [&sandwich]() {
        sandwich += "Choosing the finest sourdough...\\n";
        sandwich += "Lightly toasting it to perfection...\\n";
        sandwich += "Spreading a generous amount of garlic aioli...\\n";
    };

    const auto PrepareIngredients = [&sandwich]() {
        sandwich += "Grilling marinated chicken...\\n";
        sandwich += "Adding fresh arugula and juicy tomatoes...\\n";
        sandwich += "Topping it off with caramelized onions...\\n";
    };

    const auto PlateSandwich = [&sandwich]() {
        sandwich += "Assembling the sandwich with care...\\n";
        sandwich += "Adding a drizzle of truffle oil...\\n";
        sandwich += "Plating it elegantly...\\n";
    };

    PrepareBread();
    PrepareIngredients();
    PlateSandwich();

    return sandwich;
}`
  yield* all(
    codeRef().code(sandwich_better, duration),
    codeRef().fontSize(25, duration),
  );
  yield* waitFor(duration);

  const funny_lambda = `\
[](){}();`
  yield* all(
    codeRef().code(funny_lambda, 0),
    codeRef().fontSize(85, 0),
    codeRef().x(-200, 0),
  );
  yield* waitFor(duration);

  yield* waitFor(duration);

});
