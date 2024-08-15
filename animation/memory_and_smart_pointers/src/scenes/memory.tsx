import {makeScene2D, Code, Circle, Rect, Node, Line } from '@motion-canvas/2d';
import {all, waitFor} from '@motion-canvas/core/lib/flow';
import {Vector2} from '@motion-canvas/core/lib/types';
import {createRef} from '@motion-canvas/core/lib/utils';
import {createSignal} from '@motion-canvas/core/lib/signals';
import {CodeBlock} from '@motion-canvas/2d/lib/components/CodeBlock';

const RED = '#ff6470';
const GREEN = '#99C47A';
const BLUE = '#68ABDF';

export default makeScene2D(function* (view) {
  const data_ref = createRef<CodeBlock>();
  const line_1 = createRef<Line>();
  const line_2 = createRef<Line>();

  const data = `
  1011011010110
  1011000100100
  0010011100000
  1101000010001
  0010100111111`

  const object_code = `object`
  const member_object_code = `storage.member_object`

  view.add(
    <Node>
      {/* <Grid
        y = {200}
        width={1920}
        height={300}
        spacing={100}
        stroke={'#444'}
        lineWidth={2}
        lineCap="square"
        cache
      /> */}
      {/* <Rect
        x = {0}
        y = {250}
        fill = {BLUE}
        lineWidth={4}
        width = {800}
        height = {100}
        opacity = {0.5}
      /> */}
      <CodeBlock
        fontSize={60}
        x = {0}
        y = {200}
        code={data}
      />
      <Node x = {-500} y = {-300}>
        <CodeBlock
          fontSize={60}
          code={object_code}
        />
        <Line
          ref={line_1}
          stroke={RED}
          lineWidth={10}
          endArrow
          arrowSize={20}
          opacity = {0.0}
          points={[[0, 50], [250, 300]]}
        />
      </Node>
      <Node x = {500} y = {-300}>
        <CodeBlock
          fontSize={60}
          code={member_object_code}
        />
        <Line
          ref={line_2}
          stroke={RED}
          lineWidth={10}
          endArrow
          arrowSize={20}
          opacity = {0.0}
          points={[[0, 50], [-250, 300]]}
        />
      </Node>
    </Node>,
  );

  yield* line_1().opacity(1.0, 1.0)
  yield* line_1().points([[1000, 50], [750, 300]], 2.0)

  yield * waitFor(2.0);
  yield* line_1().points([[0, 50], [250, 300]], 0.0)
  yield * waitFor(1.0);
  yield* line_2().opacity(1.0, 1.0)
  yield * waitFor(2.0);
});
