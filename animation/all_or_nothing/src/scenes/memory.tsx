import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { Node, Circle, Rect, Grid, Line } from '@motion-canvas/2d/lib/components';
import { all, waitFor } from '@motion-canvas/core/lib/flow';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { createRef } from '@motion-canvas/core/lib/utils';
import { createSignal } from '@motion-canvas/core/lib/signals';
import { CodeBlock } from '@motion-canvas/2d/lib/components/CodeBlock';
import {Video} from '@motion-canvas/2d/lib/components';
import travolta from '../../videos/travolta.mp4';

const RED = '#ff6470';
const GREEN = '#99C47A';
const BLUE = '#68ABDF';

export default makeScene2D(function* (view) {
  const data_ref = createRef<CodeBlock>();
  const object_ref = createRef<CodeBlock>();
  const other_object_ref = createRef<CodeBlock>();
  const line_1 = createRef<Line>();
  const line_2 = createRef<Line>();
  const node_ref = createRef<Node>();
  const travolta_ref = createRef<Video>();

  const data = `
  1011011010110
  1011000100100
  0010011100000
  1101000010001
  0010100111111`

  const error = `
  binary(78797,0x1e21a6500) malloc: Double free of object 0x155e06ac0
  binary(78797,0x1e21a6500) malloc: *** set a breakpoint in malloc_error_break to debug`

  const object_code = `object`
  const member_object_code = `other_object`

  view.add(
    <Node>
      <CodeBlock
        ref={data_ref}
        fontSize={60}
        x={0}
        y={200}
        code={data}
        opacity={0.0}
      />
      <Node x={0} y={-300} ref={node_ref}>
        <CodeBlock
          ref={object_ref}
          fontSize={60}
          code={object_code}
          opacity={0.0}
        />
        <Line
          ref={line_1}
          stroke={RED}
          lineWidth={10}
          endArrow
          arrowSize={20}
          opacity={0.0}
          points={[[0, 50], [0, 300]]}
        />
        <Video
          ref={travolta_ref}
          opacity={0.0}
          src={travolta}
          scale={0.3}
          position={[200, 300]}
        />
        <CodeBlock
          ref={other_object_ref}
          fontSize={60}
          opacity={0.0}
          code={member_object_code}
        />
        <Line
          ref={line_2}
          stroke={RED}
          lineWidth={10}
          endArrow
          arrowSize={20}
          opacity={0.0}
          points={[[0, 50], [0, 300]]}
        />
      </Node>
    </Node>,
  );

  // Destructor
  yield* all(
    object_ref().opacity(1.0, 1.0),
    line_1().opacity(1.0, 1.5),
    data_ref().opacity(1.0, 2.0),
  );
  yield* waitFor(2.0);
  yield* all(
    object_ref().opacity(0.0, 2.0),
    line_1().opacity(0.0, 1.5),
    data_ref().opacity(0.0, 1.0),
  );
  yield* waitFor(2.0);
  yield* all(
    object_ref().opacity(1.0, 1.0),
    line_1().opacity(1.0, 1.5),
    data_ref().opacity(1.0, 2.0),
  );
  yield* waitFor(2.0);
  yield* all(
    object_ref().opacity(0.0, 1.5),
    line_1().opacity(0.0, 1.0),
  );
  yield* data_ref().scale(1.2, 0.7).to(1.0, 0.7);

  yield* waitFor(2.0);
  yield* data_ref().opacity(0.0, 0.1);
  yield* all(
    object_ref().opacity(1.0, 0.1),
    line_1().opacity(1.0, 0.1),
    data_ref().opacity(1.0, 0.1),
  );
  yield* waitFor(2.0);
  yield* all(
    object_ref().position([-400, 0], 1.0),
    other_object_ref().position([-400, 0], 1.0),
    line_1().points([[-400, 50], [-100, 300]], 1.0),
    line_2().points([[-400, 50], [-100, 300]], 1.0),
  );
  yield* all(
    object_ref().position([-400, 0], 1.0),
    other_object_ref().opacity(1.0, 1.0),
    other_object_ref().position([400, 0], 1.0),
    line_1().points([[-400, 50], [-100, 300]], 1.0),
    line_2().points([[400, 50], [100, 300]], 1.0),
    line_2().opacity(1.0, 1.0),
  );
  yield* waitFor(2.0);
  yield* all(
    data_ref().opacity(0.0, 0.7),
    other_object_ref().opacity(0.0, 1.5),
    line_2().opacity(0.0, 1.0),
  );
  travolta_ref().play();
  yield* all(
    // object_ref().scale(1.5, 2.0),
    node_ref().scale(1.5, 1.0),
    travolta_ref().opacity(1.0, 1.0),
    // line_1().lineWidth(20, 2.0),
    // line_1().arrowSize(40, 2.0),
  );

  yield* waitFor(3.5);

  // yield* line_1().points([[1000, 50], [750, 300]], 2.0)

  // yield* waitFor(2.0);
  // yield* line_1().points([[0, 50], [250, 300]], 0.0)
  // yield* waitFor(1.0);
  // yield* line_2().opacity(1.0, 1.0)
  // yield* waitFor(2.0);
});
