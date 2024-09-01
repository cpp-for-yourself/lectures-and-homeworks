import { makeScene2D } from '@motion-canvas/2d/lib/scenes';
import { Node, Txt, Rect, Grid, Line, Camera } from '@motion-canvas/2d/lib/components';
import { all, sequence, waitFor } from '@motion-canvas/core/lib/flow';
import { Vector2 } from '@motion-canvas/core/lib/types';
import { createRef } from '@motion-canvas/core/lib/utils';
import { createSignal } from '@motion-canvas/core/lib/signals';
import { CodeBlock, edit, insert } from '@motion-canvas/2d/lib/components/CodeBlock';

const RED = '#ff6470';
const GREEN = '#99C47A';
const BLUE = '#68ABDF';
const WHITE = '#FFFFFF';

export default makeScene2D(function* (view) {
  const memory_grid_ref = createRef<Grid>();
  const grid_txt_ref = createRef<Txt>();
  const camera = createRef<Camera>();

  const spacing = 100;
  const wiggle_room = 20;
  const grid_width = 1800;
  const grid_height = 2 * spacing;
  view.add(
    <Grid
      ref={memory_grid_ref}
      y={0}
      width={grid_width}
      height={grid_height}
      spacing={spacing}
      stroke={'#444'}
      lineWidth={5}
      end={0.5}
      start={0.5}
      cache
    />
  );

  view.add(
    <Txt
      ref={grid_txt_ref}
      x={810}
      y={memory_grid_ref().y() + grid_height / 2 + 30}
      text={""}
      fill={'#666'}
    />
  )

  let rect_refs = []
  for (let i = 0; i < 12; ++i) {
    const rect_ref = createRef<Rect>();
    rect_refs.push(rect_ref);
    view.add(
      <Rect
        ref={rect_ref}
        fill={BLUE}
        y={-1000}
        opacity={0}
        width={2 * spacing - wiggle_room}
        height={spacing - wiggle_room}
        stroke={WHITE}
        lineWidth={5}
      />
    )
  }

  rect_refs[1]().width(4 * spacing - wiggle_room);
  rect_refs[3]().width(6 * spacing - wiggle_room);
  rect_refs[6]().width(4 * spacing - wiggle_room);
  rect_refs[7]().width(1 * spacing - wiggle_room);
  rect_refs[8]().width(4 * spacing - wiggle_room);
  rect_refs[11]().width(4 * spacing - wiggle_room);
  console.log(rect_refs[1]().width());

  rect_refs[11]().shadowBlur(20);
  rect_refs[11]().shadowColor('#222');
  rect_refs[11]().shadowOffset(5);



  const duration = 1.0;
  const half_wiggle = wiggle_room / 2;
  const half_wiggle_vector = new Vector2(half_wiggle, half_wiggle);

  yield* waitFor(duration);

  yield* all(
    memory_grid_ref().start(0, duration / 2),
    memory_grid_ref().end(1, duration / 2),
    grid_txt_ref().text("memory", duration / 2),
  );

  yield*
    all(
      sequence(0.1,
        ...rect_refs.slice(0, 10).map(rect => rect().opacity(1, duration)),
      ),
      sequence(0.1,
        rect_refs[0]().topLeft(
          memory_grid_ref().topLeft().add(half_wiggle_vector), duration),
        rect_refs[1]().topLeft(
          memory_grid_ref().topLeft()
            .add(half_wiggle_vector)
            .addX(rect_refs[0]().width())
            .addX(wiggle_room), duration),
        rect_refs[2]().topLeft(
          memory_grid_ref().topLeft()
            .add(half_wiggle_vector)
            .addX(rect_refs[0]().width())
            .addX(rect_refs[1]().width())
            .addX(2 * wiggle_room), duration),
        rect_refs[3]().topLeft(
          memory_grid_ref().topLeft()
            .add(half_wiggle_vector)
            .addX(rect_refs[0]().width())
            .addX(rect_refs[1]().width())
            .addX(rect_refs[2]().width())
            .addX(3 * wiggle_room), duration),
        rect_refs[4]().topLeft(
          memory_grid_ref().topLeft()
            .add(half_wiggle_vector)
            .addX(rect_refs[0]().width())
            .addX(rect_refs[1]().width())
            .addX(rect_refs[2]().width())
            .addX(rect_refs[3]().width())
            .addX(4 * wiggle_room), duration),
        rect_refs[5]().topLeft(
          memory_grid_ref().topLeft()
            .add(half_wiggle_vector)
            .addX(rect_refs[0]().width())
            .addX(rect_refs[1]().width())
            .addX(rect_refs[2]().width())
            .addX(rect_refs[3]().width())
            .addX(rect_refs[4]().width())
            .addX(5 * wiggle_room), duration),

        rect_refs[6]().topLeft(
          memory_grid_ref().topLeft()
            .add(half_wiggle_vector)
            .addY(spacing), duration),
        rect_refs[7]().topLeft(
          memory_grid_ref().topLeft()
            .add(half_wiggle_vector)
            .addX(rect_refs[6]().width())
            .addX(wiggle_room)
            .addY(spacing), duration),
        rect_refs[8]().topLeft(
          memory_grid_ref().topLeft()
            .add(half_wiggle_vector)
            .addX(rect_refs[6]().width())
            .addX(rect_refs[7]().width())
            .addX(2 * wiggle_room)
            .addY(spacing), duration),
        rect_refs[9]().topLeft(
          memory_grid_ref().topLeft()
            .add(half_wiggle_vector)
            .addX(rect_refs[6]().width())
            .addX(rect_refs[7]().width())
            .addX(rect_refs[8]().width())
            .addX(3 * wiggle_room)
            .addY(spacing), duration),
        rect_refs[10]().topLeft(
          memory_grid_ref().topLeft()
            .add(half_wiggle_vector)
            .addX(rect_refs[6]().width())
            .addX(rect_refs[7]().width())
            .addX(rect_refs[8]().width())
            .addX(rect_refs[9]().width())
            .addX(4 * wiggle_room)
            .addY(spacing), duration),
      ),
      waitFor(3 * duration)
    );

  yield* all(
    rect_refs[3]().fill(RED, duration / 2).wait(duration).to(BLUE, duration / 2),
    rect_refs[7]().fill(GREEN, duration / 2).wait(duration).to(BLUE, duration / 2),
    waitFor(3 * duration)
  );

  yield* all(
    rect_refs[6]().fill(RED, duration / 2),
    rect_refs[6]().topLeft(rect_refs[6]().topLeft().addX(spacing), duration),

    rect_refs[7]().fill(RED, duration / 2),
    rect_refs[7]().topLeft(rect_refs[7]().topLeft().addX(2 * spacing), duration),

    rect_refs[8]().fill(RED, duration / 2),
    rect_refs[8]().topLeft(rect_refs[8]().topLeft().addX(3 * spacing), duration),

    rect_refs[9]().fill(RED, duration / 2),
    rect_refs[9]().topLeft(rect_refs[9]().topLeft().addX(5 * spacing), duration),

    waitFor(3 * duration)
  );

  rect_refs[11]().x(-1500);
  rect_refs[11]().y(-100);
  rect_refs[11]().fill(GREEN);

  yield* all(
    rect_refs[11]().x(-750, duration),
    rect_refs[11]().y(-100, duration),
    rect_refs[11]().opacity(1, duration / 2),
  );
  yield* all(
    rect_refs[11]().y(rect_refs[11]().y(), duration * 2)
      .to(rect_refs[11]().y() + spacing, duration / 2)
      .to(rect_refs[11]().y() + spacing, duration * 2)
      .to(rect_refs[11]().y() + 4 * spacing, duration * 2),
    rect_refs[11]().x(rect_refs[11]().x() + 15 * spacing, duration * 2)
      .to(rect_refs[11]().x(), duration / 2)
      .to(rect_refs[11]().x() + 15 * spacing, duration * 2)
      .to(rect_refs[11]().x() + 7.5 * spacing, duration * 2),
  );
  yield* waitFor(duration);


  yield* all(
    rect_refs[6]().fill(BLUE, duration / 2),
    rect_refs[6]().topLeft(rect_refs[6]().topLeft().addX(-spacing), duration),

    rect_refs[7]().fill(BLUE, duration / 2),
    rect_refs[7]().topLeft(rect_refs[7]().topLeft().addX(-2 * spacing), duration),

    rect_refs[8]().fill(BLUE, duration / 2),
    rect_refs[8]().topLeft(rect_refs[8]().topLeft().addX(-3 * spacing), duration),

    rect_refs[9]().fill(BLUE, duration / 2),
    rect_refs[9]().topLeft(rect_refs[9]().topLeft().addX(-5 * spacing), duration),

    rect_refs[11]().topLeft(
      memory_grid_ref().topLeft()
        .add(half_wiggle_vector)
        .addX(rect_refs[6]().width())
        .addX(rect_refs[7]().width())
        .addX(rect_refs[8]().width())
        .addX(rect_refs[9]().width())
        .addX(4 * wiggle_room)
        .addY(spacing), duration),
  );
  yield* waitFor(3 * duration);

  rect_refs[11]().opacity(0);
  rect_refs[1]().opacity(0);
  rect_refs[11]().topLeft(rect_refs[1]().topLeft().addY(-1.2 * spacing));
  yield* waitFor(duration);

  yield* all(
    rect_refs[11]().y(rect_refs[11]().y() + 1.2 * spacing, duration),
    rect_refs[11]().opacity(1, duration),
  );
  yield* waitFor(duration);

  yield* all(
    rect_refs[11]().y(rect_refs[11]().y() - 1.2 * spacing, duration),
    rect_refs[11]().opacity(0, duration),
  );
  yield* waitFor(duration);



});
