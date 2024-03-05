import { makeScene2D, Ray } from '@motion-canvas/2d';
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
import { all, sequence, waitFor, waitUntil } from '@motion-canvas/core/lib/flow';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';

import { store, simplify } from '../functions/functions'

export default makeScene2D(function* (view) {
  const code_ref = createRef<CodeBlock>();
  const type_1_ref = createRef<CodeBlock>();
  const type_2_ref = createRef<CodeBlock>();
  const type_3_ref = createRef<CodeBlock>();
  const type_4_ref = createRef<CodeBlock>();
  const type_5_ref = createRef<CodeBlock>();
  const type_3_3_ref = createRef<CodeBlock>();
  const line_explicit_arguments = createRef<Ray>();
  const line_explicit_parameters = createRef<Ray>();
  const line_implicit_arguments = createRef<Ray>();
  const line_implicit_parameters = createRef<Ray>();

  view.add(<Ray
    ref={line_explicit_arguments}
    from={[-400, 130]}
    to={[-200, 130]}
    stroke={'white'}
    lineWidth={8}
    endArrow
    end={0}
  />);

  view.add(<Ray
    ref={line_explicit_parameters}
    from={[-530, -220]}
    to={[-100, -220]}
    stroke={'white'}
    lineWidth={8}
    endArrow
    end={0}
  />);

  view.add(<Ray
    ref={line_implicit_arguments}
    from={[-180, 130]}
    to={[350, 130]}
    stroke={'white'}
    lineWidth={8}
    endArrow
    end={0}
  />);

  view.add(<Ray
    ref={line_implicit_parameters}
    from={[-100, -220]}
    to={[700, -220]}
    stroke={'white'}
    lineWidth={8}
    endArrow
    end={0}
  />);

  yield view.add(<CodeBlock
    ref={code_ref}
    language="cpp"
    fontSize={35}
  />);

  yield view.add(<CodeBlock
    ref={type_1_ref}
    language="cpp"
    fontSize={35}
    shadowBlur={10}
    shadowColor={0x00aaee}
  />);

  yield view.add(<CodeBlock
    ref={type_2_ref}
    language="cpp"
    fontSize={35}
    shadowBlur={10}
    shadowColor={0x00aaee}
  />);

  yield view.add(<CodeBlock
    ref={type_3_ref}
    language="cpp"
    fontSize={35}
    shadowBlur={10}
    shadowColor={0x00aaee}
  />);

  yield view.add(<CodeBlock
    ref={type_4_ref}
    language="cpp"
    fontSize={35}
    shadowBlur={10}
    shadowColor={0x00aaee}
  />);

  yield view.add(<CodeBlock
    ref={type_5_ref}
    language="cpp"
    fontSize={35}
    shadowBlur={10}
    shadowColor={0x00aaee}
  />);

  yield view.add(<CodeBlock
    ref={type_3_3_ref}
    language="cpp"
    fontSize={35}
    shadowBlur={10}
    shadowColor={0x00aaee}
  />);

  const code_three_types = () => store`
  template<class One, int kTwo, class Three, class Four, class Five>
  void SomeFunction(Three three, Four four, Five five, Three one_more) {
    // Some implementation;
  }

  int main() {
    SomeFunction<float, 42>(42.42, 23, 23.23F, 23.42);
  }
`

  const type_code = (some_type: any = ``) => store`${some_type}`

  const zoom_fn = (in_zoom: number) => new Vector2(in_zoom, in_zoom);

  const duration = 1.5

  yield* code_ref().edit(0, false)(...code_three_types());
  yield* waitFor(duration);

  yield* type_1_ref().position([-350, 83], 0);
  yield* type_2_ref().position([-230, 83], 0);
  yield* type_3_ref().position([-120, 83], 0);
  yield* type_4_ref().position([0, 83], 0);
  yield* type_5_ref().position([130, 83], 0);
  yield* type_3_3_ref().position([300, 83], 0);
  yield* sequence(
    duration / 2,
    all(
      line_explicit_arguments().end(1, duration),
      line_explicit_parameters().end(1, duration),
    ),
    all(
      type_1_ref().edit(duration / 2, false)(...type_code(insert("float"))),
      type_1_ref().position([-350, 40], duration / 2).to([-370, -280], duration / 2),
      type_1_ref().scale(1.5, duration / 2),
    ),
    all(
      type_2_ref().edit(duration / 2, false)(...type_code(insert("42"))),
      type_2_ref().position([-230, 40], duration / 2).to([-170, -280], duration / 2),
      type_2_ref().scale(1.5, duration / 2),
    ),
    all(
      line_explicit_arguments().start(1, duration),
      line_explicit_parameters().start(1, duration),
    )
  );
  yield* waitFor(duration);

  yield* sequence(
    duration / 2,
    all(
      line_implicit_arguments().end(1, duration),
      line_implicit_parameters().end(1, duration),
    ),
    all(
      type_3_ref().edit(duration / 2, false)(...type_code(insert("double"))),
      type_3_ref().position([-120, 40], duration / 2).to([90, -280], duration / 2),
      type_3_ref().scale(1.5, duration / 2),
    ),
    all(
      type_4_ref().edit(duration / 2, false)(...type_code(insert("int"))),
      type_4_ref().position([0, 40], duration / 2).to([340, -280], duration / 2),
      type_4_ref().scale(1.5, duration / 2),
    ),
    all(
      type_5_ref().edit(duration / 2, false)(...type_code(insert("float"))),
      type_5_ref().position([130, 40], duration / 2).to([600, -280], duration / 2),
      type_5_ref().scale(1.5, duration / 2),
    ),
    all(
      type_3_3_ref().edit(duration / 2, false)(...type_code(insert("double"))),
      type_3_3_ref().position([300, 40], duration / 2).to([90, -350], duration / 2),
      type_3_3_ref().scale(1.5, duration / 2),
    ),
    all(
      type_3_3_ref().position([90, -350], duration / 2).to([90, -280], duration / 2),

    ),
    type_3_3_ref().shadowBlur(10000, duration),
    all(
      line_implicit_arguments().start(1, duration),
      line_implicit_parameters().start(1, duration),
    )
  );
  yield* waitFor(duration);

});
