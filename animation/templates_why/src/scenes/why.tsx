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
    fontSize={35}
  />);


  const duration = 1.5

  const store = (...args: [TemplateStringsArray, ...any]) => args;

  function to_string([strings, ...values]: [TemplateStringsArray, ...any]): string {
    return strings.reduce((acc, str, i) => {
      const value = values[i] ?? '';
      return acc + str + value;
    }, '');
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

  const comment_before = `// Not a great idea to repeat the code so many times! ❌\n// Imagine changing the implementation later!`
  const comment_after = `// And so on for any other type we care about\n`

  const template = (typename: any = `typename`) => store`// Works for any type as long as the implementation compiles ✅\ntemplate <${typename} NumberType>`
  const int_func = (func_name: any = `Maximum`, used_type: any = `int`
  ) => store`
${used_type} ${func_name}(${used_type} first, ${used_type} second) {
  if (first < second) { return second; }
  return first;
}`

  const other_funcs = (func_name: any = `Maximum`,
  ) => store`
float ${func_name}(float first, float second) {
  if (first < second) { return second; }
  return first;
}
double ${func_name}(double first, double second) {
  if (first < second) { return second; }
  return first;
}`


  const code = (func_name: any = `Maximum`,
    before: any = comment_before,
    after: any = comment_after,
    first_function: any = int_func(),
    rest_functions: any = other_funcs(),
  ) => store`
${before}${first_function}${rest_functions}
${after}
int main() {
  ${func_name}(42, 23);
  ${func_name}(3.14F, 42.42F);
  ${func_name}(3.14, 42.42);
}
`
  const zoom_fn = (in_zoom: number) => new Vector2(in_zoom, in_zoom);

  yield* codeRef().edit(duration, false)(...simplify(
    code("Max",
      comment_before,
      comment_after,
      int_func("Max"),
      other_funcs("Max"))));
  yield* waitFor(duration);

  yield* codeRef().edit(duration, true)(...simplify(code(
    edit("Max", "Maximum"),
    comment_before,
    comment_after,
    int_func(edit("Max", "Maximum")),
    other_funcs(edit("Max", "Maximum")))));
  yield* waitFor(duration);

  yield* all(
    codeRef().selection(DEFAULT, duration),
  );
  yield* waitFor(duration);


  yield* codeRef().edit(duration, false)(...simplify(
    code(`Maximum`,
      edit(comment_before, to_string(template())),
      remove(comment_after),
      int_func("Maximum", edit("int", "NumberType")),
      remove(to_string(other_funcs())))));
  yield* waitFor(duration);

  yield* all(
    codeRef().selection(DEFAULT, duration),
  );
  yield* waitFor(duration);

  yield* codeRef().selection(lines(1), duration);
  yield* waitFor(duration);

  yield* codeRef().selection(word(1, 9, 21), duration);
  yield* waitFor(duration);

  yield* codeRef().edit(duration, false)(...simplify(
    code(`Maximum`,
      template(edit("typename", "class")),
      "",
      int_func("Maximum", "NumberType"),
      "")));
  yield* waitFor(duration);

  yield* codeRef().edit(duration, false)(...simplify(
    code(`Maximum`,
      template(edit("class", "typename")),
      "",
      int_func("Maximum", "NumberType"),
      "")));
  yield* waitFor(duration);

  yield* all(
    codeRef().selection(lines(1, 2), duration),
  );
  yield* waitFor(duration);

  yield* all(
    codeRef().selection([...word(2, 19, 35)], duration),
    codeRef().scale(zoom_fn(2), duration),
    codeRef().position(new Vector2(-200, 400), duration),
  );
  yield* waitFor(duration);

  yield* all(
    codeRef().selection([...word(8, 10, 6), ...word(9, 10, 13), ...word(10, 10, 11)], duration),
    codeRef().scale(zoom_fn(2), duration),
    codeRef().position(new Vector2(700, -200), duration),
  );
  yield* waitFor(duration);

  yield* all(
    codeRef().selection([...lines(3, 4)], duration),
    codeRef().scale(zoom_fn(1), duration),
    codeRef().position(new Vector2(0, 0), duration),
  );
  yield* waitFor(duration);


  yield* codeRef().selection([...lines(8)], 0.5 * duration);
  yield* codeRef().selection([...lines(9)], 0.5 * duration);
  yield* codeRef().selection([...lines(10)], 0.5 * duration);
  yield* waitFor(duration);

  yield* all(
    codeRef().selection(DEFAULT, duration),
  );
  yield* waitFor(duration);

});
