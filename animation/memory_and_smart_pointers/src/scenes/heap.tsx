import { Node, lines, word, makeScene2D, Code, Txt, Rect, Grid, Line, Layout } from '@motion-canvas/2d';
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

  const grid_ref = createRef<Grid>();
  const address_ref = createRef<Txt>();
  const data_rect_ref_1 = createRef<Rect>();
  const data_rect_ref_2 = createRef<Rect>();

  const table_layout =
    <Layout
      direction={'column'}
      alignItems={'end'}
      x={-1300}
      layout />
  table_layout.add(
    <Txt
      text={"heap memory"}
      fontFamily={"Fira Mono"}
      alignSelf={'start'}
      fill={WHITE}
      padding={10}
    />)
  table_layout.add(
    <Rect
      width={550}
      height={80}
      clip={true}
    >
      <Grid
        ref={grid_ref}
        spacing={50}
        stroke={'#444'}
        lineWidth={4}
        start={0.3}
        end={0.3}
        width={550}
        height={130}
        cache
      />
    </Rect>)
  table_layout.add(
    <Txt
      ref={address_ref}
      text={""}
      fontFamily={"Fira Mono"}
      alignSelf={'start'}
      fill={'#666'}
      fontSize={32}
      marginBottom={20}
      paddingLeft={70}
      padding={10}
    />)
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

  for (let i = 4; i >= 0; i--) {
    const text_ref = createRef<Txt>();
    const line_ref = createRef<Line>();
    stack_refs.push(text_ref);
    line_refs.push(line_ref);
    table_layout.add(
      <Rect layout direction={'row'}>
        <Txt
          text={i == 4 ? '...' : String(i)}
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
  view.add(<Rect
    x={-700}
    y={-345}
    ref={data_rect_ref_1}
    stroke={BLUE}
    lineWidth={4}
    width={190}
    height={40}
    opacity={0.0}
  />)
  view.add(<Rect
    x={-500}
    y={-345}
    ref={data_rect_ref_2}
    stroke={BLUE}
    lineWidth={4}
    width={190}
    height={40}
    opacity={0.0}
  />)

  const code_heap = `\
#include <iostream>

int main() {
  int size = 2;
  int* ptr = nullptr;
  {
    // 😱 Don't use unprotected new and new[]!
    int* array = new int[size];
    array[0] = 42;
    array[1] = 23;
    ptr = array;
    std::cout << "Before stack cleanup.\\n";
    for (int i = 0; i < size; ++i) {
      std::cout << ptr[i] << std::endl;
    }
  }
  std::cout << "After stack cleanup.\\n";
  for (int i = 0; i < size; ++i) {
    std::cout << ptr[i] << std::endl;
  }
  delete[] ptr;  // 😱 What points to our data?
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
    code_ref().code(code_heap, duration),
    waitFor(duration)
  );

  yield* all(
    table_layout.x(-600, duration),
    grid_ref().end(1, 2 * duration),
    grid_ref().start(0, 2 * duration),
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
    command_txt_ref().text('', duration / 3).to('malloc(8)', duration / 3),
    code_ref().selection(word(7, 16, 15), duration),
    sequence(0.1,
      address_ref().text('0x8eceb0', duration / 2),
      data_rect_ref_1().opacity(0.8, duration),
      data_rect_ref_2().opacity(0.8, duration),
    ),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    stack_refs[2]().code(`array = 0x8eceb0`, duration),
    command_txt_ref().text('', duration / 3).to('push(int*)', duration / 3),
    code_ref().selection(lines(7), duration),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    command_txt_ref().text('', duration / 3),
    code_ref().selection(lines(8), duration),
    data_rect_ref_1().fill(BLUE, duration),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    code_ref().selection(lines(9), duration),
    data_rect_ref_2().fill(BLUE, duration),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    stack_refs[1]().code(`ptr = 0x8eceb0`, duration),
    code_ref().selection(lines(10), duration),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    code_ref().selection(lines(11, 14), duration),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    sequence(0.1,
      stack_refs[2]().code('⁉️', duration)),
    code_ref().selection(lines(15), duration),
    command_txt_ref().text('', duration / 3).to('pop()', duration / 3),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    code_ref().selection(lines(16, 19), duration),
    command_txt_ref().text('', duration / 3),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    sequence(0.1,
      data_rect_ref_1().opacity(0, duration),
      data_rect_ref_2().opacity(0, duration)),
    code_ref().selection(lines(20), duration),
    waitFor(3 * duration)
  );

  // Frame
  yield* all(
    sequence(0.1,
      stack_refs[1]().code('⁉️', duration),
      stack_refs[0]().code('⁉️', duration)),
    code_ref().selection(lines(22), duration),
    command_txt_ref().text('', duration / 3),
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
