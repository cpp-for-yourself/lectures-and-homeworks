import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { createRef } from '@motion-canvas/core/lib/utils';
import {
  CodeBlock,
  edit,
  insert,
  lines,
  word,
  remove,
  CodeModification,
} from '@motion-canvas/2d/lib/components/CodeBlock';
import { all, waitFor, waitUntil } from '@motion-canvas/core/lib/flow';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';

export default makeScene2D(function* (view) {
  const codeRef = createRef<CodeBlock>();

  yield view.add(<CodeBlock
    ref={codeRef}
    language="cpp"
    fontSize={48}
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
    template_2: TemplateStringsArray, args_2: string[]): [TemplateStringsArray, ...string[]] {
    let new_template = Array.from<string>(template_1);
    let new_args: Array<string> = args_1;
    new_template[template_1.length - 1] += template_2[0]
    new_template = new_template.concat(template_2.slice(1))
    new_args = new_args.concat(args_2)
    return [new_template as unknown as TemplateStringsArray, ...new_args];
  }

  const isCodeModification = (code: any): code is CodeModification => (code as CodeModification).from !== undefined;

  function simplify(
    args_in: [TemplateStringsArray, ...any]): [TemplateStringsArray, ...string[]] {
    const template = args_in[0]
    const args = args_in.slice(1)
    if (args.every((arg) => (typeof (arg) == "string") || isCodeModification(arg))) {
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
      if (typeof (args[i]) == "string" || isCodeModification(args[i])) {
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

  const getter_code = `\n    std::byte const *ptr() const { return ptr_; }\n`

  const simple_main = (other_object: any = ``, const_word: any = `const `) => store`

  int main() {
    ${const_word}HugeObject object{42};
    std::cout << "object data address: "
              << object.ptr()
              << std::endl;${other_object}
    return 0;
  }`

  const copy_constructor_main_code = (create: any = ``) => store`
    ${create}
    std::cout << "other_object data address: "
              << other_object.ptr()
              << std::endl;`

  const copy_constructor = `const HugeObject other_object{object};`
  const move_constructor = `const HugeObject other_object{std::move(object)};
    std::cout << "object data address: "
              << object.ptr()
              << std::endl;`
  const copy_assignment = `HugeObject other_object{23};
    other_object = object;`

  const copy_constructor_code = (
    copying: any = `AllocateMemory(length_)`,
    std_copy: any = `\nstd::copy(object.ptr_, object.ptr_ + length_, ptr_);\n`) => store`
    HugeObject(const HugeObject &object)
        : length_{object.length_}, ptr_{${copying}} {${std_copy}}
  `

  const code = (
    main: any = ``,
    copy_constructor: any = ``,
    copy_assign: any = ``,
    move_constructor: any = ``,
    getter: any = getter_code,
    class_or_struct: any = `class`,
    public_keyword: any = `\n  public:`,
    private_keyword: any = `\n\n  private:`,
  ) => store`
  #include <cstddef>
  #include <iostream>

  // Note that this ${class_or_struct} does not follow best style.
  ${class_or_struct} HugeObject {${public_keyword}
    HugeObject() = default;

    explicit HugeObject(std::size_t data_length)
        : length_{data_length}, ptr_{AllocateMemory(length_)} {}
    ${copy_constructor}${move_constructor}${copy_assign}${getter}
    ~HugeObject() { FreeMemory(ptr_); }
  ${private_keyword}
    std::size_t length_{};
    std::byte *ptr_{};
  };${main}
  `

  const zoom_fn = (in_zoom: number) => new Vector2(in_zoom, in_zoom);

  // Initial struct -> class
  yield* codeRef().edit(duration, false)(...simplify(code(
    ``, ``, ``, ``, ``, `struct`, ``, ``)));
  yield* codeRef().edit(duration, false)(...simplify(code(
    ``, ``, ``, ``, ``,
    edit(`struct`, `class`),
    insert(`\n  public:`),
    insert(`\n\n  private:`))));
  yield* waitFor(duration);
  yield* codeRef().selection([...lines(8, 9)], duration);
  yield* codeRef().selection([...word(9, 37, 61 - 38)], duration);
  yield* waitFor(duration);
  yield* codeRef().selection([...lines(11)], duration);
  yield* codeRef().selection([...word(11, 20, 16)], duration);
  yield* codeRef().edit(duration, true)(...simplify(code(
    ``, ``, ``, ``,
    insert(getter_code))));

  // Add getter
  yield* waitFor(duration);
  yield* all(
    codeRef().position([0, -200], duration),
    codeRef().scale(zoom_fn(2.0), duration),
    codeRef().selection([...word(11, 20, 4), ...word(11, 42, 4)], duration)
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().position([1100, -200], duration),
    codeRef().selection([...word(11, 0, 21)], duration)
  );
  yield* waitFor(duration);

  // Add main function
  yield* all(
    codeRef().position([0, 0], 0),
    codeRef().scale(zoom_fn(0.8), 0),
    codeRef().selection(DEFAULT, 0),
    waitFor(duration)
  );
  yield* all(
    codeRef().scale(zoom_fn(1.3), duration),
    codeRef().position([400, -700], duration),
    codeRef().edit(duration, true)(...simplify(code(
      insert(to_string(simple_main())), ``, ``, ``)))
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().position([0, 200], duration),
    codeRef().scale(zoom_fn(2.0), duration),
    codeRef().selection([...word(11, 27, 5)], duration)
  );
  yield* waitFor(duration);

  // Destructor
  yield* all(
    codeRef().position([0, 0], 0),
    codeRef().scale(zoom_fn(0.8), 0),
    codeRef().selection(DEFAULT, 0),
    waitFor(duration)
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().position([400, 0], duration),
    codeRef().scale(zoom_fn(1.5), duration),
    codeRef().selection([...lines(13)], duration)
  );
  yield* waitFor(duration);

  // Comment
  yield* all(
    codeRef().position([0, 0], 0),
    codeRef().scale(zoom_fn(0.6), 0),
    codeRef().selection(DEFAULT, 0),
    waitFor(duration)
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().position([200, 800], duration),
    codeRef().scale(zoom_fn(1.2), duration),
    codeRef().selection([...lines(3)], duration)
  );
  yield* waitFor(duration);

  // Copy constructor
  yield* all(
    codeRef().scale(zoom_fn(1.3), 0),
    codeRef().position([400, -700], 0),
    codeRef().selection(lines(20, Infinity), 0),
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().scale(zoom_fn(1.3), duration),
    codeRef().position([400, -700], duration),
    codeRef().edit(duration, false)(...simplify(code(
      simple_main(insert(to_string(copy_constructor_main_code(copy_constructor)))), ``, ``, ``))),
    codeRef().selection([...lines(25)], duration)
  );
  yield* waitFor(duration);

  // Highlight constructors
  yield* all(
    codeRef().scale(zoom_fn(0.5), 0),
    codeRef().position([0, 0], 0),
    codeRef().selection(DEFAULT, 0),
  );
  yield* all(
    codeRef().scale(zoom_fn(1.3), duration),
    codeRef().position([200, 800], duration),
    codeRef().selection([...lines(6)], duration).to([...lines(8)], duration / 2)
  );
  yield* waitFor(duration);

  // Add wrong copy constructor
  yield* all(
    codeRef().scale(zoom_fn(0.5), 0),
    codeRef().position([0, 0], 0),
    codeRef().selection(DEFAULT, 0),
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().scale(zoom_fn(1.2), duration / 2),
    codeRef().position([100, 400], duration / 2),
    codeRef().edit(duration, true)(...simplify(code(
      simple_main(copy_constructor_main_code(copy_constructor)),
      insert(to_string(copy_constructor_code(`object.ptr_`, ``))), ``, ``))),
  );
  yield* codeRef().selection(word(11, 15, 24), duration);
  yield* codeRef().selection(word(12, 5, 47), duration);
  yield* codeRef().selection(
    [...word(12, 24, 8), ...word(12, 46, 5)], duration);
  yield* waitFor(duration);

  const allocate_memory_code = `AllocateMemory(length_)`;
  const copy_memory_code = `
      std::copy(object.ptr_, object.ptr_ + length_, ptr_);\n    `;

  // Add correct copy constructor
  yield* codeRef().selection(lines(11, 12), 0);
  yield* waitFor(duration);
  yield* all(
    codeRef().position([0, 400], duration),
    codeRef().scale(zoom_fn(1.0), duration),
    codeRef().edit(duration, true)(...simplify(code(
      simple_main(copy_constructor_main_code(copy_constructor)),
      copy_constructor_code(
        edit(`object.ptr_`, allocate_memory_code),
        edit(``, copy_memory_code)),
      ``, ``))),
  );
  yield* waitFor(duration);

  // Add copy to main
  yield* all(
    codeRef().scale(zoom_fn(0.5), 0),
    codeRef().position([0, 0], 0),
    codeRef().selection(DEFAULT, 0),
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().scale(zoom_fn(1.3), duration),
    codeRef().position([400, -900], duration),
    codeRef().selection(lines(30), duration),
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().edit(duration, true)(...simplify(code(
      simple_main(copy_constructor_main_code(edit(copy_constructor, copy_assignment))),
      copy_constructor_code(allocate_memory_code, copy_memory_code),
      ``, ``))),
  );
  yield* waitFor(duration);


  // Add copy assignment operator
  const copy_assignment_code = `
    HugeObject &operator=(const HugeObject &object) {
      if (this == &object) { return *this; }
      FreeMemory(ptr_);
      length_ = object.length_;
      ptr_ = AllocateMemory(length_);
      std::copy(object.ptr_, object.ptr_ + length_, ptr_);
      return *this;
    }
  `
  yield* all(
    codeRef().scale(zoom_fn(0.5), 0),
    codeRef().position([0, 0], 0),
    codeRef().selection(DEFAULT, 0),
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().scale(zoom_fn(1.15), duration),
    codeRef().position([100, 200], duration),
    codeRef().edit(duration, true)(...simplify(code(
      simple_main(copy_constructor_main_code(copy_assignment)),
      copy_constructor_code(allocate_memory_code, copy_memory_code),
      insert(copy_assignment_code), ``))),
  );
  yield* waitFor(duration);
  yield* codeRef().selection(word(16, 0, 16), duration);
  yield* codeRef().selection(lines(17), duration);
  yield* codeRef().selection(lines(18), duration);
  yield* codeRef().selection(lines(19, 21), duration);
  yield* waitFor(duration);

  // Add std::move
  yield* all(
    codeRef().scale(zoom_fn(1.15), 0),
    codeRef().position([200, -1000], 0),
    codeRef().selection(lines(34, Infinity), 0),
    codeRef().edit(0, false)(...simplify(code(
      simple_main(copy_constructor_main_code(copy_constructor)),
      copy_constructor_code(allocate_memory_code, copy_memory_code),
      copy_assignment_code, ``))),
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().edit(duration, true)(...simplify(code(
      simple_main(
        copy_constructor_main_code(edit(copy_constructor, move_constructor)),
        remove(`const `)),
      copy_constructor_code(allocate_memory_code, copy_memory_code),
      copy_assignment_code, ``))),
  );
  yield* waitFor(duration);


  // Add move constructor
  const move_constructor_code = `

    HugeObject(HugeObject &&object)
        : length_{object.length_}, ptr_{object.ptr_} {
      object.ptr_ = nullptr;
    }
  `
  yield* all(
    codeRef().scale(zoom_fn(0.3), 0),
    codeRef().position([0, 0], 0),
    codeRef().selection(DEFAULT, 0),
  );
  yield* waitFor(duration);
  yield* all(
    codeRef().scale(zoom_fn(1.15), duration),
    codeRef().position([200, 600], duration),
    codeRef().edit(duration, true)(...simplify(code(
      simple_main(
        copy_constructor_main_code(edit(copy_constructor, move_constructor)),
        remove(`const `)),
      copy_constructor_code(allocate_memory_code, copy_memory_code),
      copy_assignment_code,
      insert(move_constructor_code)))),
  );
  yield* waitFor(duration);
  yield* codeRef().selection(word(16, 15, 19), duration);
  yield* codeRef().selection(word(17, 35, 16), duration);
  yield* codeRef().selection(lines(18), duration);
  yield* waitFor(duration);


  // Remove comment
  const comment_text = `// Note that this class does not follow best style.`;
  const new_code = (comment:any) => store`
  ${comment}
  class HugeObject {
   public:
    HugeObject() = default;

    explicit HugeObject(std::size_t data_length)
        : length_{data_length}, ptr_{AllocateMemory(length_)} {}

    HugeObject(const HugeObject &object)
        : length_{object.length_}, ptr_{AllocateMemory(length_)} {
      std::copy(object.ptr_, object.ptr_ + length_, ptr_);
    }

    HugeObject(HugeObject &&object)
        : length_{object.length_}, ptr_{object.ptr_} {
      object.ptr_ = nullptr;
    }
  }
  `
  yield* all(
    codeRef().scale(zoom_fn(1.0), 0),
    codeRef().position([0, 100], 0),
    codeRef().selection(lines(0), 0),
    codeRef().edit(0, false)(...simplify(new_code(comment_text))),
  );
  yield* all(
    codeRef().scale(zoom_fn(1.2), 5 * duration),
    codeRef().position([200, 300], 5 * duration),
    codeRef().selection(lines(0), duration),
  );
  yield* all(
    codeRef().edit(duration, false)(...simplify(new_code(remove(comment_text)))),
  );
  yield* waitFor(duration);
});
