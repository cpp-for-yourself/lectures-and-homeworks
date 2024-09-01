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


  const table_layout =
    <Layout
      direction={'column'}
      alignItems={'start'}
      alignSelf={'end'}
      offset={[-1, 1]}
      y={320}
      x={-210}
      layout />

  var rect_refs = []
  for (let i = 0; i < 8; i++) {
    const rect_ref = createRef<Txt>();
    rect_refs.push(rect_ref);
    const color = i == 4 ? RED : BLUE;
    table_layout.add(
      <Rect
        ref={rect_ref}
        width={400}
        height={60}
        fill={color}
        opacity={0}
        margin={10}
      />)
  }
  rect_refs.reverse();
  view.add(table_layout)

  const duration = 1.0


  const moved_rect = createRef<Txt>();
  const line_scope = createRef<Line>();
  const text_scope = createRef<Txt>();

  view.add(
    <Rect
      ref={moved_rect}
      width={400}
      height={60}
      x={rect_refs[0]().x() + 20}
      y={rect_refs[0]().y() + 20}
      fill={BLUE}
      opacity={0}
      margin={10}
    />
  )

  view.add(
    <Layout
      x={-300}
      y={-40}
    >
      <Txt
        ref={text_scope}
        fill={'#FFF'}
        rotation={-90}
        opacity={0}
        x={-30}
        y={210}
      />
      <Line
        ref={line_scope}
        stroke={'#aaa'}
        lineWidth={10}
        opacity={1}
        points={[[20, 280], [20, 280]]}
      />

    </Layout>

  )
  yield* waitFor(duration);

  yield* all(
    text_scope().opacity(1, duration),
    text_scope().text('scope', duration * 2),
    line_scope().points([[20, 280], [20, -270]], duration * 3),
    sequence(duration / 4,
      ...rect_refs.map(rect => rect().opacity(1, duration / 2)),
    ),
    waitFor(4 * duration)
  );

  yield* all(
    sequence(duration / 4,
      ...rect_refs.reverse().slice(0, 4).map(rect => rect().opacity(0, duration / 2), 2),
    ),
    waitFor(2 * duration)
  );

  yield* all(
    moved_rect().opacity(1, 0),
    moved_rect().fill(RED, 0),
    moved_rect().position(rect_refs[4]().position(), 0),
    rect_refs[4]().opacity(0, 0)
  );

  yield* all(
    moved_rect().x(rect_refs[1]().x() + 500, duration),
    waitFor(2 * duration)
  );

  yield* all(
    sequence(duration / 4,
      ...rect_refs.slice(4, 7).map(rect => rect().opacity(0, duration / 2), 2),
    ),
    waitFor(2 * duration)
  );

  yield* all(
    text_scope().opacity(0, duration),
    text_scope().text('', duration),
    line_scope().points([[20, 280], [20, 280]], duration),
    moved_rect().position(rect_refs[6]().position(), duration),
    waitFor(3 * duration)
  );


  yield* all(
    moved_rect().opacity(0, 0),
    text_scope().opacity(1, 0),
    text_scope().text('scope', 0),
    line_scope().points([[20, 280], [20, -270]], 0),
    all(
      ...rect_refs.map(rect => rect().opacity(1, 0)),
    ),
    waitFor(3 * duration)
  );

  yield* all(
    all(
      ...rect_refs.slice(0, 4).map(rect => rect().margin([10, 500], duration)),
    ),
    waitFor(2 * duration)
  );

  yield* all(
    rect_refs[4]().opacity(0, duration),
    waitFor(2 * duration)
  );

  yield* all(
    rect_refs[4]().height(0, duration),
    rect_refs[4]().margin(0, duration),
    all(
      ...rect_refs.slice(0, 4).map(rect => rect().margin(10, duration / 2)),
    ),
    line_scope().points([[20, 280], [20, -200]], duration),
    waitFor(5 * duration)
  );
});
