import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { Node, Txt, Rect, Grid, Line } from '@motion-canvas/2d/lib/components';
import { all, waitFor } from '@motion-canvas/core/lib/flow';
import { createRef } from '@motion-canvas/core/lib/utils';
import { createSignal } from '@motion-canvas/core/lib/signals';
import {
  CodeBlock,
  edit,
  insert,
  lines,
  word,
  remove,
  CodeModification,
} from '@motion-canvas/2d/lib/components/CodeBlock';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';

const RED = '#ff6470';
const GREEN = '#99A44A';
const BLUE = '#68AADD';
const WHITE = '#FFFFFF';

export default makeScene2D(function* (view: { add: (arg0: Node) => void; }) {
  const left_half = createRef<Node>();
  const all_text_node = createRef<Node>();

  const program_lifetime = createRef<Line>();
  const program_text = createRef<Txt>();

  const main_lifetime = createRef<Line>();
  const main_text = createRef<Txt>();

  const foo_lifetime = createRef<Line>();
  const foo_text = createRef<Txt>();

  const foo_lifetime_2 = createRef<Line>();
  const foo_text_2 = createRef<Txt>();

  const value_name = createRef<Txt>();
  const value_lifetime = createRef<Rect>();

  const const_name = createRef<Txt>();
  const const_lifetime = createRef<Rect>();

  const right_half = createRef<Node>();
  const code_ref = createRef<CodeBlock>();

  const text_offset = 12
  const line_offset = 100
  const x_offset = 80

  view.add(
    <>
      <Node ref={left_half} position={[-900, 200]}>
        <Line
          ref={program_lifetime}
          lineWidth={7}
          stroke={GREEN}
          points={[[0, 0], [700, 0]]}
          opacity={0.0} />
        <Txt
          ref={program_text}
          y={text_offset}
          fontSize={50}
          offset={[-1, -1]}
          fill={GREEN}
          opacity={0.0}
          fontFamily={"Fira Code"}>program</Txt>

        <Node ref={all_text_node}>
          <Line
            ref={main_lifetime}
            lineWidth={7}
            stroke={RED}
            points={[[0, 0], [700 - 2 * x_offset, 0]]}
            y={-line_offset}
            x={x_offset}
            opacity={0.0}
          />
          <Txt
            ref={main_text}
            fontSize={50}
            offset={[-1, -1]}
            y={-line_offset + text_offset}
            x={main_lifetime().x}
            fill={RED}
            opacity={0.0}
            fontFamily={"Fira Code"}>main()</Txt>

          <Line
            ref={foo_lifetime}
            lineWidth={7}
            y={-2 * line_offset}
            x={2 * x_offset}
            stroke={BLUE}
            points={[[0, 0], [700 - 4 * x_offset, 0]]}
            opacity={0.0} />
          <Txt
            ref={foo_text}
            fontSize={50}
            y={-2 * line_offset + text_offset}
            x={foo_lifetime().x}
            offset={[-1, -1]}
            fill={BLUE}
            opacity={0.0}
            fontFamily={"Fira Code"}>Foo()</Txt>

          <Line
            ref={foo_lifetime_2}
            lineWidth={7}
            y={-2 * line_offset}
            x={5 * x_offset}
            stroke={BLUE}
            points={[[0, 0], [700 - 5 * x_offset, 0]]}
            end={0}
            opacity={0.0} />
          <Txt
            ref={foo_text_2}
            fontSize={50}
            y={-2 * line_offset + text_offset}
            x={foo_lifetime_2().x}
            offset={[-1, -1]}
            fill={BLUE}
            opacity={0.0}
            fontFamily={"Fira Code"}>Foo()</Txt>

          <Rect
            ref={value_lifetime}
            lineWidth={3}
            y={-2 * line_offset - 70}
            x={2 * x_offset}
            offset={[-1, 0]}
            fill={BLUE}
            width={700 - 4 * x_offset}
            height={100}
            opacity={0.0} >
            <Txt
              ref={value_name}
              fontSize={50}
              fill={WHITE}
              fontFamily={"Fira Code"}>local_value</Txt>
          </Rect>
        </Node>

        <Rect
          ref={const_lifetime}
          lineWidth={3}
          y={-70}
          offset={[-1, 0]}
          fill={GREEN}
          width={700}
          height={100}
          opacity={0.0} >
          <Txt
            ref={const_name}
            fontSize={50}
            fill={WHITE}
            fontFamily={"Fira Code"}>kValue</Txt>
        </Rect>

      </Node >
      <Node ref={right_half} position={[400, 0]}>
        <CodeBlock
          ref={code_ref}
          language="cpp"
          fontSize={50}
        />
      </Node>
    </>,
  );

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

  const const_value_code = `
  namespace {
  constexpr int kValue{42};
  }  // namespace
  `

  const foo_func = (init_value: any = ``, static_keyword: any = ``) => store`
  void Foo() {
    ${static_keyword}int local_value{${init_value}};
  }
  `

  const foo_call = `\n    Foo();`
  const foo_call_double = `\n    Foo();\n    Foo();`

  const code = (func_code: any = ``, func_call: any = ``, constant_def: any = ``) => store`
${constant_def}${func_code}
  int main() {${func_call}
    return 0;
  }
  `

  yield* code_ref().edit(duration, false)(...simplify(code(foo_func(), foo_call)));
  yield* waitFor(duration / 2);
  yield* all(
    program_lifetime().opacity(1.0, 0),
    program_lifetime().end(0.0, 0).to(1.0, duration / 2),
    program_text().opacity(0.0, 0).to(1.0, duration / 2),
  );
  yield* all(
    main_lifetime().opacity(1.0, 0),
    main_lifetime().end(0.0, 0).to(1.0, duration / 2),
    main_text().opacity(0.0, 0).to(1.0, duration / 2),
  );
  yield* all(
    foo_lifetime().opacity(1.0, 0),
    foo_lifetime().end(0.0, 0).to(1.0, duration / 2),
    foo_text().opacity(0.0, 0).to(1.0, duration / 2),
  );
  yield* waitFor(duration);

  yield* all(
    code_ref().selection(lines(2), duration / 2),
    value_lifetime().opacity(0.0, 0).to(1.0, duration / 2),
    value_lifetime().scale.x(0.0, 0).to(1.0, duration / 2),
  );
  yield* waitFor(duration);

  yield* code_ref().selection(DEFAULT, duration / 2);
  yield* code_ref().edit(duration, false)(...simplify(code(foo_func(edit('', 'kValue')), foo_call, edit('', const_value_code))));
  yield* all(
    all_text_node().y(0.0, 0).to(-120, duration / 2),
  );
  yield* all(
    const_lifetime().opacity(0.0, 0).to(1.0, duration / 2),
    const_lifetime().scale.x(0.0, 0).to(1.0, duration / 2),
  );
  yield* waitFor(duration);
  yield* all(
    code_ref().edit(duration, true)(...simplify(code(foo_func('kValue', edit('', 'static ')), foo_call, const_value_code))),
    value_lifetime().width(380, duration / 2).to(550, duration / 2),
    value_lifetime().fill(GREEN, duration),
  );

  yield* waitFor(duration);
  yield* code_ref().selection(DEFAULT, 0);
  yield* waitFor(duration);

  yield* all(
    code_ref().edit(duration, false)(...simplify(code(foo_func('kValue', 'static '), edit(foo_call, foo_call_double), const_value_code))),
    foo_lifetime().end(1.0, 0).to(0.5, duration),
    foo_lifetime_2().end(0.0, 0).to(0.0, duration/2).to(0.6, duration / 2),
    foo_lifetime_2().opacity(1.0),
    foo_text_2().opacity(0.0, 0).to(1.0, duration / 2),
  );
  yield* waitFor(duration / 2);

  yield* all(
    code_ref().selection([...lines(6), ...lines(10, 11)], duration / 2),
  );
  yield* waitFor(duration);

  // yield* waitFor(2.0);
  // yield* a_ref().edit(1.0, false)`${insert(object_code)}`;
  // yield* all(
  //   grid_ref().height(0, 0.0).to(250, 0.5),
  //   grid_ref().width(0, 0.0).to(1920, 0.5),
  //   grid_ref().opacity(1.0, 0.1),
  // );
  // yield* all(
  //   data_rect_ref().opacity(0.5, 1.0),
  //   line_1().end(1, 1.0),
  //   gray_line_ref().opacity(1.0, 0.5),
  //   gray_code_ref().opacity(1.0, 0.5),
  // );
  // yield* b_ref().edit(1.0, false)`${insert(member_object_code)}`;
  // yield* waitFor(1.0);
  // yield* data_rect_ref().scale(1.2, 1.0);
  // yield* data_rect_ref().position.x(-20, 0.2).to(20, 0.2).to(-20, 0.2).to(20, 0.2).to(0, 0.2);
  // yield* data_rect_ref().scale(1.0, 0.5);
  // yield* waitFor(1.0);
  // yield* line_2().end(1, 1.5);
  // yield* waitFor(1.0);
  // yield* all(
  //   data_rect_ref().opacity(0.5, 1.0),
  //   line_1().arrowSize(0, 0.5),
  //   line_1().end(0, 1.0),
  //   a_ref().edit(1.5, false)`Data* a${insert(' = nullptr')};`,
  // );

  yield* waitFor(3.0);

});
