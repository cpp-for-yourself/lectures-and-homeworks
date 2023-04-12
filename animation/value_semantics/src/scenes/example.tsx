import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {createRef} from '@motion-canvas/core/lib/utils';
import {
  CodeBlock,
  edit,
  insert,
  lines,
  word,
  remove,
  CodeModification,
} from '@motion-canvas/2d/lib/components/CodeBlock';
import {all, waitFor, waitUntil} from '@motion-canvas/core/lib/flow';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';

export default makeScene2D(function* (view) {
  const codeRef = createRef<CodeBlock>();

  yield view.add(<CodeBlock
    ref={codeRef}
    language="cpp"
    fontSize={50}
  />);


  const duration = 1.5

  const store = (...args: [TemplateStringsArray, ...any]) => args;

  function to_string([strings, ...values]: [TemplateStringsArray, ...any]): string {
    return strings.reduce((acc, str, i) => {
      const value = values[i] ?? '';
      return acc + str + value;
    }, ' ');
  }

  function append(
    template_1: TemplateStringsArray, args_1: string[],
    template_2: TemplateStringsArray, args_2: string[]) : [TemplateStringsArray, ...string[]] {
      let new_template = Array.from<string>(template_1);
      let new_args: Array<string> = args_1;
      new_template[template_1.length - 1] += template_2[0]
      new_template = new_template.concat(template_2.slice(1))
      new_args = new_args.concat(args_2)
      return [new_template as unknown as TemplateStringsArray, ...new_args];
  }

  const isCodeModification = (code: any): code is CodeModification => (code as CodeModification).from !== undefined;

  function simplify(
    args_in: [TemplateStringsArray, ...any]) : [TemplateStringsArray, ...string[]] {
      const template = args_in[0]
      const args = args_in.slice(1)
      if (args.every((arg) => (typeof(arg) == "string") || isCodeModification(arg))) {
          return args_in
      }
      let new_template: Array<any> = [];
      let new_args: Array<any> = [];
      let concatenate = false;
      for (let i = 0; i <= args.length; i++) {
          if (concatenate) {
              concatenate = false;
              new_template[new_template.length - 1] += template[i];
          } else {
              new_template.push(template[i]);
          }
          if (i == args.length) { break; }
          if (typeof(args[i]) == "string" || isCodeModification(args[i])) {
              new_args.push(args[i])
              continue;
          }
          let simplified_arg = simplify(args[i]);
          let simplified_template = simplified_arg[0]
          let simplified_args = simplified_arg.slice(1)
          const appended = append(
              new_template as unknown as TemplateStringsArray,
              new_args,
              simplified_template,
              simplified_args as string[]);
          new_template = Array.from<string>(appended[0])
          new_args = appended.slice(1)
          concatenate = true;
      }
      return [new_template as unknown as TemplateStringsArray, ...new_args]
  }


  const code = (operator:any = ``, main:any = ``, operator_move:any=``) => store`
  #include <cstddef>
  #include <algorithm>

  struct HugeObject {
    HugeObject() = default;

    explicit HugeObject(std::size_t data_length)
        : length{data_length}, ptr{AllocateMemory(length)} {}
    ${operator}${operator_move}
    ~HugeObject() { FreeMemory(ptr); }

    std::size_t length{};
    std::byte *ptr{};
  };
  ${main}
  `

  const copy = `ptr = AllocateMemory(length);
      std::copy(object.ptr, object.ptr + length, ptr);`
  const steal = `ptr = object.ptr;
      object.ptr = nullptr;`

  const operator_copy = (
      const_word:any = `const `,
      copy_or_steal:any = copy,
      ) => store`
    HugeObject &operator=(${const_word}HugeObject& object) {
      if (this == &object) { return *this; }
      FreeMemory(ptr);
      length = object.length;
      ${copy_or_steal}
      return *this;
    }
    `

  const operator_move = `

  HugeObject &operator=(HugeObject&& object) {
    if (this == &object) { return *this; }
    FreeMemory(ptr);
    length = object.length;
    ptr = object.ptr;
    object.ptr = nullptr;
    return *this;
  }
  `

  const assign_fail = `
    // ❌ Does not compile.
    storage.member_object = HugeObject{200};`

  const assign_int_fail = `
    // ❌ Does not compile either.
    int& answer = 42;`

  const main_fn = (comment:any = ``, assign_temp:any = ``) => store`
  struct HugeObjectStorage {
    HugeObject member_object;
  };

  int main() {
    HugeObject object{100};
    HugeObjectStorage storage{};
    storage.member_object = object;${assign_temp}
    return 0;
  } ${comment}`

  const comment = ` // storage and object are destroyed`

  const zoom_fn = (in_zoom: number) => new Vector2(in_zoom, in_zoom);

  yield * codeRef().edit(duration, false)(...simplify(code()));
  yield * codeRef().selection([...word(7, 30, 28)], duration);
  yield * waitFor(duration);
  yield * codeRef().selection([...word(9, 20, 15)], duration);
  yield * waitFor(duration);
  yield * codeRef().edit(duration, true)(...code(edit(``, to_string(operator_copy()))));
  yield * waitFor(duration);
  yield * codeRef().selection([...lines(9)], duration);
  yield * waitFor(duration);
  yield * all(
    codeRef().selection([...word(9, 26, 24)], duration),
    codeRef().scale(zoom_fn(1.5), duration),
    codeRef().position(new Vector2(-500, 200), duration),
  );
  yield * waitFor(duration);
  yield * all(
    codeRef().selection([...lines(14)], duration),
    codeRef().scale(zoom_fn(1.2), duration),
    codeRef().position(new Vector2(50, -200), duration),
  );
  yield * waitFor(duration);
  yield * all(
    codeRef().selection(DEFAULT, duration),
    codeRef().scale(zoom_fn(0.7), duration),
    codeRef().position(new Vector2(0, 0), duration),
  );
  yield * waitFor(duration);
  yield * all(
    codeRef().position(new Vector2(0, -300), duration),
    codeRef().edit(duration, true)(...simplify(code(operator_copy(), edit(``, to_string(main_fn()))))),
  );
  yield * all(
    codeRef().scale(zoom_fn(1.2), duration),
    codeRef().position(new Vector2(400, -800), duration),
  );
  yield * codeRef().selection([...lines(29)], duration);
  yield * codeRef().selection([...lines(30)], duration);
  yield * codeRef().selection([...lines(31)], duration);
  yield * codeRef().edit(duration, true)(...simplify(code(operator_copy(), main_fn(insert(comment)))));
  yield * waitFor(duration);

  // Show destructor
  yield * all(
    codeRef().selection(DEFAULT, duration),
    codeRef().scale(zoom_fn(0.5), duration),
    codeRef().position(new Vector2(0, 0), duration),
  );
  yield * waitFor(duration);
  yield * all(
    codeRef().selection(DEFAULT, duration),
    codeRef().scale(zoom_fn(1.2), duration),
    codeRef().selection([...lines(18 )], duration),
    codeRef().position(new Vector2(200, 0), duration),
  );
  yield * waitFor(duration);

  // Show const
  yield * all(
    codeRef().selection(DEFAULT, duration),
    codeRef().scale(zoom_fn(0.5), duration),
    codeRef().position(new Vector2(0, 0), duration),
  );
  yield * waitFor(duration);
  yield * all(
    codeRef().scale(zoom_fn(1.2), duration),
    codeRef().selection([...lines(9, 16)], duration),
    codeRef().position(new Vector2(0, 400), duration),
  );
  yield * waitFor(duration);
  yield * all(
    codeRef().scale(zoom_fn(3.0), duration),
    codeRef().selection([...word(9, 26, 5)], duration),
    codeRef().position(new Vector2(100, 1400), duration),
  );
  yield * waitFor(duration);

  // Remove const
  yield * all(
    codeRef().edit(duration, false)(...simplify(code(operator_copy(edit('const ', '')), main_fn(comment)))),
    codeRef().selection([...word(9, 26, 12)], duration),
  );
  yield * all(
    codeRef().scale(zoom_fn(1.2), duration),
    codeRef().position(new Vector2(0, 400), duration),
    codeRef().selection([...lines(9, 16)], duration),
  );
  yield *codeRef().selection([...lines(13, 14)], duration);
  yield * codeRef().edit(duration, true)(...simplify(code(operator_copy('', edit(copy, steal)), main_fn(comment))));
  yield * waitFor(duration);

  // Look at the main again
  yield * all(
    codeRef().selection(DEFAULT, duration),
    codeRef().scale(zoom_fn(0.5), duration),
    codeRef().position(new Vector2(0, 0), duration),
  );
  yield * waitFor(duration);
  yield * all(
    codeRef().scale(zoom_fn(1.2), duration),
    codeRef().position(new Vector2(400, -800), duration),
  );
  yield * codeRef().selection([...lines(29)], duration);
  yield * codeRef().selection([...lines(30)], duration);
  yield * codeRef().selection([...lines(31)], duration);
  yield * codeRef().selection(DEFAULT, duration);

  yield * waitFor(duration);
  // Assign temp
  yield * all(
    codeRef().scale(zoom_fn(1.3), duration),
    codeRef().edit(duration, true)(
      ...simplify(
        code(
          operator_copy('', steal),
          main_fn(comment, insert(assign_fail))))),
    codeRef().position(new Vector2(200, -1100), duration),
  );
  yield * waitFor(duration);
  yield * codeRef().edit(duration, true)(
    ...simplify(
      code(
        operator_copy('', steal),
        main_fn(comment, edit(assign_fail, assign_int_fail)))));
  yield * waitFor(duration);

  yield * all(
    codeRef().selection(DEFAULT, duration),
    codeRef().scale(zoom_fn(0.5), duration),
    codeRef().position(new Vector2(0, 0), duration),
    codeRef().edit(duration, false)(
      ...simplify(
        code(
          operator_copy('', steal),
          main_fn(comment, remove(assign_int_fail))))),
  );

  // Add move operator
  yield * waitFor(duration);
  yield * all(
    codeRef().scale(zoom_fn(1.0), duration),
    codeRef().position([0, 260], duration),
    codeRef().edit(duration, true)(
      ...simplify(
        code(
          operator_copy(insert('const '),
          edit(steal, copy)),
          main_fn(comment),
          insert(operator_move)))),
  );
  yield * waitFor(duration);
  yield * codeRef().selection([...word(9, 26, 24), ...lines(13, 14)], duration);
  yield * waitFor(duration);
  yield * codeRef().selection([...word(18, 26, 19), ...lines(22, 23)], duration);
  yield * waitFor(duration);

  const comment_temp_bind = `// Can be bound to a temporary`
  const comment_pick_overload = ` // The compiler picks Blah(int&&)`

  const blah_code = (
    comment_temp:any = ``,
    comment_pick:any = ``,
    blah_answer:any = ``,
    blah_answer_comment:any = ``,
    blah_move_answer:any = ``,
    blah_move_answer_comment:any = ``,
  ) => store`
  #include <iostream>

  void Blah(int&) {
    std::cout << "&" << std::endl;
  }

  void Blah(int&&) {
    std::cout << "&&" << std::endl;
  }

  int main() {
    int&& answer = 42;  ${comment_temp}
    Blah(42);${comment_pick}${blah_answer}${blah_answer_comment}${blah_move_answer}${blah_move_answer_comment}
  }`


  yield * waitFor(duration);
  yield * all(
    codeRef().edit(duration, false)(...blah_code()),
    codeRef().selection(DEFAULT, duration),
    codeRef().scale(zoom_fn(1.0), 0),
    codeRef().position(new Vector2(0, 0), 0),
  );
  yield * waitFor(duration);
  yield * codeRef().selection([...lines(11)], duration);
  yield * codeRef().edit(duration, false)(...simplify(blah_code(insert(comment_temp_bind))));
  yield * waitFor(duration);
  yield * codeRef().selection([...lines(12)], duration);
  yield * codeRef().edit(duration, false)(...simplify(blah_code(comment_temp_bind, insert(comment_pick_overload))));
  yield * waitFor(duration);
  yield * waitFor(duration);


  const final_main = `
  int main() {
    HugeObject object{100};
    HugeObjectStorage storage{};
    storage.member_object = object;
    storage.member_object = HugeObject{200};
    storage.member_object = std::move(object);
    return 0;
  }`

  yield * codeRef().selection(DEFAULT, 0),
  yield * codeRef().edit(duration, false)`${final_main}`;
  yield * waitFor(duration);
  yield * codeRef().selection([...lines(4)], duration);
  yield * codeRef().selection([...lines(5)], duration);
  yield * codeRef().selection([...lines(6)], duration);
  yield * waitFor(duration);

  const rref_comment = `  // Prints "&&"`
  const lref_comment = `  // Prints "&"`
  const blah_answer_ref = `
    Blah(answer);`
  const blah_answer_rref = `
    Blah(std::move(answer));`

  // Final rref example
  yield * codeRef().selection(DEFAULT, 0),
  yield * codeRef().edit(duration, false)(...blah_code());
  yield * codeRef().edit(duration, false)(...blah_code('', insert(rref_comment)));
  yield * codeRef().edit(duration, false)(...blah_code('', rref_comment, insert(blah_answer_ref)));
  yield * codeRef().edit(duration, false)(...blah_code(
    '', rref_comment, blah_answer_ref, insert(lref_comment)));
  yield * codeRef().edit(duration, false)(...blah_code(
    '', rref_comment, blah_answer_ref, lref_comment, insert(blah_answer_rref)));
  yield * codeRef().edit(duration, false)(...blah_code(
    '', rref_comment, blah_answer_ref, lref_comment, blah_answer_rref, insert(rref_comment)));

  yield * waitFor(duration);

  yield * waitFor(duration);

});
