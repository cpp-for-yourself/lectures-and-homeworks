import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {Node, Txt, Rect, Grid, Line} from '@motion-canvas/2d/lib/components';
import {all, waitFor} from '@motion-canvas/core/lib/flow';
import {Vector2} from '@motion-canvas/core/lib/types';
import {createRef} from '@motion-canvas/core/lib/utils';
import {createSignal} from '@motion-canvas/core/lib/signals';
import {CodeBlock, edit, insert} from '@motion-canvas/2d/lib/components/CodeBlock';

const RED = '#ff6470';
const GREEN = '#99C47A';
const BLUE = '#68ABDF';
const WHITE = '#FFFFFF';

export default makeScene2D(function* (view) {
  const gray_line_ref = createRef<Line>();
  const gray_code_ref = createRef<CodeBlock>();
  const grid_ref = createRef<Grid>();
  const data_rect_ref = createRef<Rect>();
  const a_ref = createRef<CodeBlock>();
  const b_ref = createRef<CodeBlock>();
  const line_1 = createRef<Line>();
  const line_2 = createRef<Line>();

  const data = `
  10010011`

  const object_code = `Data* a;`
  const member_object_code = `Data* b;`

  view.add(
    <Node>
      <Grid
        ref = {grid_ref}
        y = {200}
        spacing={100}
        stroke={'#444'}
        lineWidth={2}
        lineCap="square"
        opacity={0}
        cache
      />
      <Rect
        x = {0}
        y = {250}
        ref = {data_rect_ref}
        fill = {BLUE}
        lineWidth={4}
        width = {800}
        height = {100}
        opacity = {0.0}
      />
      <CodeBlock
          ref={gray_code_ref}
          fontSize={40}
          code = {"0x42424242"}
          x = {-350}
          y = {430}
          opacity = {0.0}
      />
      <Line
          ref={gray_line_ref}
          stroke={'#777'}
          lineWidth={5}
          endArrow
          arrowSize={15}
          points={[[-350, 400], [-350, 310]]}
          opacity = {0.0}
      />

      <Node x = {-400} y = {-300}>
        <CodeBlock
          ref = {a_ref}
          fontSize={80}
        />
        <Line
          ref = {line_1}
          lineWidth={10}
          stroke={BLUE}
          arrowSize={20}
          endArrow
          points={[
            [30, 50],
            [30, 490],
          ]}
          end={0}
        />,
      </Node>
      <Node x = {500} y = {-300}>
        <CodeBlock
          ref = {b_ref}
          fontSize={80}
        />
        <Line
          ref = {line_2}
          lineWidth={10}
          stroke={BLUE}
          endArrow
          arrowSize={20}
          points={[
            [0, 50],
            [0, 200],
            [-830, 200],
            [-830, 490],
          ]}
          end={0}
        />,
      </Node>
    </Node>,
  );

  yield * waitFor(2.0);
  yield * a_ref().edit(1.0, false)`${insert(object_code)}`;
  yield * all(
    grid_ref().height(0, 0.0).to(250, 0.5),
    grid_ref().width(0, 0.0).to(1920, 0.5),
    grid_ref().opacity(1.0, 0.1),
  );
  yield * all(
    data_rect_ref().opacity(0.5, 1.0),
    line_1().end(1, 1.0),
    gray_line_ref().opacity(1.0, 0.5),
    gray_code_ref().opacity(1.0, 0.5),
  );
  yield * b_ref().edit(1.0, false)`${insert(member_object_code)}`;
  yield * waitFor(1.0);
  yield * data_rect_ref().scale(1.2, 1.0);
  yield * data_rect_ref().position.x(-20, 0.2).to(20, 0.2).to(-20, 0.2).to(20, 0.2).to(0, 0.2);
  yield * data_rect_ref().scale(1.0, 0.5);
  yield * waitFor(1.0);
  yield * line_2().end(1, 1.5);
  yield * waitFor(1.0);
  yield * all(
    data_rect_ref().opacity(0.5, 1.0),
    line_1().arrowSize(0, 0.5),
    line_1().end(0, 1.0),
    a_ref().edit(1.5, false)`Data* a${insert(' = nullptr')};`,
  );

  yield * waitFor(3.0);

});
