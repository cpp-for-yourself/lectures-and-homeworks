import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {createRef, useDuration} from '@motion-canvas/core/lib/utils';
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

export default makeScene2D(function* (view) {
  const codeRef = createRef<CodeBlock>();

  yield view.add(<CodeBlock
    ref={codeRef}
    language="cpp"
    fontSize={40}
  />);


  // const code_split = code.split(/\r?\n/);
  const duration = 1.5

  const store_one = (...args: [TemplateStringsArray, any]) => args;
  const store_two = (...args: [TemplateStringsArray, any, any, any]) => args;

  const default_code = (tag: any) => store_one`
  class Foo {
  public:
    ${tag}
  };`

  const default_constructor_stupid = `Foo() {}  // Default constructor`
  const default_constructor_better =
  `// Even better default constructor
  Foo() = default;`


  const code_cat = (def:any, explicit: any, main: any) => store_two`
  constexpr int kDefaultNumberOfLives = 9;

  class Cat {
  public:${def}
    ${explicit}Cat(int happiness)
      : happiness_{happiness} {}

    Cat(int number_of_lives, int happiness)
      : number_of_lives_{number_of_lives}, happiness_{happiness} {}

  private:
    int number_of_lives_{kDefaultNumberOfLives};
    int happiness_{};
  };

  ${main}
  `

  const code_cat_destructor = (destructor: any) => store_one`
  class Cat {
  public:
    explicit Cat(int happiness)
        : happiness_{happiness} {}
    ${destructor}
  private:
    int happiness_{};
  };

  int main() { const Cat cat{9}; }
  `

  const cat_destructor = `
  ~Cat() {
    // Nothing to do here, so not really needed...
  }
  `

  const cat_default = `
    Cat() = default;
  `

  const cat_main = `
  int main() {
    const Cat cat_1{42};
    const Cat cat_2{9, 100};
    return 0;
  }`

  const foo_main = `
  void Foo(const Cat &cat) {}

  int main() { Foo(42); }`

  const foo_main_compiles = `
  void Foo(const Cat &cat) {}

  int main() { Foo(42); }  // ???!!! Surprisingly compiles!`

  const foo_main_does_not_compile = `
  void Foo(const Cat &cat) {}

  int main() { Foo(42); }  // ✅ Does not compile anymore!`

  const cat_default_main = `
  int main()
    Cat cat{}; // ❌  Won't compile when custom constructors present
    return 0;
  }`

  const cat_default_main_works = `
  int main()
    Cat cat{}; // ✅ Compiles now
    return 0;
  }`

  // Default constructor
  yield * codeRef().fontSize(60)
  yield * codeRef().edit(duration, false)(...default_code(default_constructor_stupid));
  yield * codeRef().selection(lines(2), 0.5);
  yield * waitFor(duration);
  yield * codeRef().edit(duration)(...default_code(edit(default_constructor_stupid, default_constructor_better)));
  yield * waitFor(duration);

  // Uninitialized
  const uninitialized = (priv: any) => store_one`
  class Foo {
  public:
    Foo() = default;${priv}
  };
  `

  const priv = `

private:
  int uninitialized;
  int initialized{};`

  yield * codeRef().selection(DEFAULT);
  yield * codeRef().edit(duration, false)(...uninitialized(``));
  yield * waitFor(duration);
  yield * codeRef().edit(duration, true)(...uninitialized(insert(priv)));
  yield * waitFor(duration);

  // Cat class
  yield * codeRef().fontSize(35)
  yield * codeRef().selection(DEFAULT);
  yield * codeRef().edit(duration, false)(...code_cat(``, `explicit `, cat_main));
  yield * waitFor(duration);

  // Highlight member init lists
  yield * codeRef().selection([...lines(5), ...lines(8)], duration);
  yield * waitFor(duration);
  yield * codeRef().selection(DEFAULT);
  yield * waitFor(duration);


  // Show that we need default
  yield * codeRef().edit(duration, true)(...code_cat(``, `explicit `, edit(cat_main, cat_default_main)));
  yield * waitFor(duration);
  yield * codeRef().edit(duration, true)(...code_cat(insert(cat_default), `explicit `, edit(cat_default_main, cat_default_main_works)));
  yield * waitFor(duration);
  yield * codeRef().selection(DEFAULT);
  yield * waitFor(duration);

  // Removing explicit
  yield * codeRef().edit(duration, false)(...code_cat(cat_default, `explicit `, cat_main));
  yield * all (
  codeRef().selection(lines(6), 0.5),
  codeRef().edit(duration, false)(...code_cat(cat_default, remove(`explicit `), cat_main)),
  );
  yield * codeRef().selection(DEFAULT, 0.5);

  yield * all (
    codeRef().selection([...lines(6), ...lines(17, Infinity)], duration),
    codeRef().edit(duration, false)(...code_cat(cat_default, ``, edit(cat_main, foo_main))),
  );
  yield * waitFor(duration);
  yield * codeRef().selection(DEFAULT, 0.5);
  yield * waitFor(duration);
  yield * codeRef().edit(duration, false)(...code_cat(cat_default, ``, edit(foo_main, foo_main_compiles)));
  yield * waitFor(duration);
  yield * codeRef().edit(duration, true)(...code_cat(cat_default, insert(`explicit `), edit(foo_main_compiles, foo_main_does_not_compile)));
  yield * waitFor(duration);
  yield * codeRef().selection(DEFAULT, 0.5);
  yield * waitFor(duration);

  // Code cat destructor
  yield * codeRef().fontSize(45)
  yield * codeRef().edit(duration, false)(...code_cat_destructor(``));
  yield * waitFor(duration);
  yield * codeRef().edit(duration, false)(...code_cat_destructor(insert(cat_destructor)));
  yield * waitFor(duration);




  // Using object
  const use_object = (constructor: any, do_smth: any, destructor: any) => store_two`
  int main() {${constructor}${do_smth}
    return 0;
  } ${destructor}
  `
  const cat_constructor = `
  Cat cat{100};  // Cat(int happiness) is called`

  const cat_mischief = `
  cat.RunAround();
  cat.BeAwesome();
  cat.ThrowThingsFromAbove();`

  const cat_destroy = `// Destructor cat.~Cat(); is called.`

  yield * codeRef().fontSize(60)
  yield * codeRef().edit(duration, false)(...use_object(``, ``, ``));
  yield * waitFor(duration);
  yield * codeRef().edit(duration, false)(...use_object(insert(cat_constructor), ``, ``));
  yield * waitFor(duration);
  yield * codeRef().edit(duration, false)(...use_object(cat_constructor, insert(cat_mischief), ``));
  yield * waitFor(duration);
  yield * codeRef().edit(duration, false)(...use_object(cat_constructor, cat_mischief, insert(cat_destroy)));
  yield * waitFor(duration);

  yield * waitFor(duration);


  // yield * waitUntil('member_init_list');
  // yield * codeRef().selection(word(6, 8, 23), 1.2);
  // yield * codeRef().selection(word(9, 8, 58), 1.2);
  // yield * waitUntil('remove_all');
  // yield * all (
  //   codeRef().selection(lines(0, Infinity), 1.2),
  //   codeRef().edit(1.2, false)`${edit(code, code_lists)}`,
  // );
  // yield * waitUntil('add_all_back');
  // yield* codeRef().edit(1.2, false)`${edit(code_lists, code)}`;

  // yield * waitUntil('order');
  // yield * codeRef().selection(lines(12), 1.2);
  // yield * codeRef().selection(lines(13), 1.2);
  // yield * codeRef().selection(lines(0, Infinity), 1.2);

  // yield * waitFor(2);


  // yield* waitFor(0.6);
  // yield* all(
  //   codeRef().selection(lines(0, Infinity), 1.2),
  //   codeRef().edit(1.2, false)`var my${edit('Bool', 'Number')} = ${edit(
  //     'false',
  //     '42',
  //   )};`,
  // );
  // yield* waitFor(0.6);
  // yield* codeRef().edit(1.2, false)`var myNumber${remove(' = 42')};`;
  // yield* waitFor(0.6);
  // yield* codeRef().edit(1.2, false)`var my${edit('Number', 'Bool')};`;
  // yield* waitFor(0.6);
});
