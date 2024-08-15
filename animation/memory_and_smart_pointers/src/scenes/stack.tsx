import { Node, lines, makeScene2D, Code, Txt, Rect, Grid, Line, Layout } from '@motion-canvas/2d';
import { all, sequence, waitFor } from '@motion-canvas/core/lib/flow';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { createRef } from '@motion-canvas/core/lib/utils';
import { createSignal, DEFAULT } from '@motion-canvas/core/lib/signals';
import { CodeBlock, edit, insert, range } from '@motion-canvas/2d/lib/components/CodeBlock';

const RED = '#ff6470';
const GREEN = '#99C47A';
const BLUE = '#68ABDF';
const WHITE = '#FFFFFF';

export default makeScene2D(function* (view) {

  const table_layout =
    <Layout
      direction={'column'}
      alignItems={'end'}
      x={-1300}
      layout />
  table_layout.add(
    <Txt
      text={"stack"}
      fontFamily={"Fira Mono"}
      alignSelf={'start'}
      fill={WHITE}
      padding={10}
    />)

  var stack_refs = []
  var line_refs = []

  for (let i = 6; i >= 0; i--) {
    const text_ref = createRef<Txt>();
    const line_ref = createRef<Line>();
    stack_refs.push(text_ref);
    line_refs.push(line_ref);
    table_layout.add(
      <Rect layout direction={'row'}>
        <Txt
          text={i == 6 ? '...' : String(i)}
          fontFamily={"Fira Mono"}
          fontSize={35}
          fill={'gray'}
          paddingRight={30}
          margin={10}
        />
        <Rect layout direction={'column'}>
          <Code
            ref={text_ref}
            code={"⁉️"}
            fontFamily={"Fira Mono"}
            alignSelf={'center'}
            fontSize={35}
            fontWeight={500}
            margin={15}
          />
          <Line
            ref={line_ref}
            stroke={'#777'}
            lineWidth={5}
            points={[[0, 0], [400, 0]]}
          />
        </Rect>
      </Rect>

    );
  }
  stack_refs.reverse();

  const command_txt_ref = createRef<Txt>()

  table_layout.add(
    <Rect layout direction={'column'} alignSelf={'start'} minHeight={250}>
      <Txt
        text={"command:"}
        fontFamily={"Fira Mono"}
        fill={'#777'}
        marginTop={100}
      />
      <Txt
        ref={command_txt_ref}
        text={""}
        fontFamily={"Fira Mono"}
        marginTop={10}
        marginLeft={100}
        fill={WHITE}
      />
    </Rect>)

  view.add(table_layout)

  const code_stack = `\
#include <iostream>

int main() {
  int size = 2;
  int* ptr = nullptr;
  {
    int array[size];  // Use std::array instead.
    array[0] = 42;
    array[1] = 23;
    ptr = array;
    std::cout << "Before stack cleanup.\\n";
    for (int i = 0; i < size; ++i) {
      std::cout << ptr[i] << std::endl;
    }
  }
  // 😱 Code below leads to undefined behavior!
  std::cout << "After stack cleanup.\\n";
  for (int i = 0; i < size; ++i) {
    std::cout << ptr[i] << std::endl;
  }
  return 0;
}`
  const code_ref = createRef<Code>()

  yield view.add(
    <Code
      ref={code_ref}
      fontSize={35}
      fontFamily={'Fira Mono'}
      fontWeight={500}
      offsetX={-1}
      x={-200}
    />);

  const duration = 1.0

  // Frame
  yield* all(
    code_ref().code(code_stack, duration),
    waitFor(duration)
  );

  yield* all(
    table_layout.x(-600, duration),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    stack_refs[0]().code(`size = 2`, duration),
    code_ref().selection(lines(3), duration),
    command_txt_ref().text('push(int)', duration / 3),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    stack_refs[1]().code(`ptr = nullptr`, duration),
    code_ref().selection(lines(4), duration),
    command_txt_ref().text('', duration / 3).to('push(int*)', duration / 3),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    sequence(0.1,
      stack_refs[2]().code(`array[0] = ⁉️`, duration),
      stack_refs[3]().code(`array[1] = ⁉️`, duration)),
    command_txt_ref().text('', duration / 3).to('2 x push(int)', duration / 3),
    code_ref().selection(lines(6), duration),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    stack_refs[2]().code(`array[0] = 42`, duration),
    code_ref().selection(lines(7), duration),
    command_txt_ref().text('', duration / 3),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    stack_refs[3]().code(`array[1] = 23`, duration),
    code_ref().selection(lines(8), duration),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    stack_refs[1]().code(`ptr = &stack[2]`, duration),
    code_ref().selection(lines(9), duration),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    code_ref().selection(lines(10, 13), duration),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    sequence(0.1,
      stack_refs[3]().code('⁉️', duration),
      stack_refs[2]().code('⁉️', duration)),
    code_ref().selection(lines(14), duration),
    command_txt_ref().text('', duration / 3).to('2 x pop()', duration / 3),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    code_ref().selection(lines(15, 19), duration),
    command_txt_ref().text('', duration / 3),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    sequence(0.1,
      stack_refs[1]().code('⁉️', duration),
      stack_refs[0]().code('⁉️', duration)),
    code_ref().selection(lines(21), duration),
    command_txt_ref().text('', duration / 3).to('2 x pop()', duration / 3),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    code_ref().selection(DEFAULT, duration),
    command_txt_ref().text('', duration / 3),
    waitFor(3 * duration)
  );

  yield* waitFor(3.0);

});
