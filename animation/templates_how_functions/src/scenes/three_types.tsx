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

import { store, simplify } from '../functions/functions'

export default makeScene2D(function* (view) {
  const codeRef = createRef<CodeBlock>();

  yield view.add(<CodeBlock
    ref={codeRef}
    language="cpp"
    fontSize={35}
  />);

  const code_three_types = (template: any = '',
    template_type: any = 'int',
  ) => store`
${template}void SomeFunction(${template_type} one, ${template_type} two, ${template_type} three) {
  // Do something important
}
`

  const zoom_fn = (in_zoom: number) => new Vector2(in_zoom, in_zoom);

  const duration = 1.5

  yield* codeRef().edit(0, false)(...code_three_types());
  yield* waitFor(duration);
  yield* codeRef().edit(duration, false)(...simplify(
    code_three_types(insert("template <typename T>\n"),
      edit("int", "T"))));
  yield* waitFor(duration);
});
