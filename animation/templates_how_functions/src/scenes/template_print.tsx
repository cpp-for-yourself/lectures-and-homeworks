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


  const code_template_print = (template: any = '',
    template_type: any = 'int',
    comment_int: any = '',
    print_float: any = '',
  ) => store`
#include <iostream>

${template}void Print(${template_type} p) {
  std::cout << p << "\\n";
}

int main() {
  Print(42);${comment_int}${print_float}
  return 0;
}
`

  const code_template = (template: any = '',
    return_type: any = 'int',
    type_1: any = 'int',
    type_2: any = 'int',
    template_params: any = ''
  ) => store`
${template}${return_type} SomeFunction(${type_1} value_1, ${type_2} value_2) {
  ${return_type} result = DoSomething${template_params}(value_1, value_2);
  return result;
}
`

  const zoom_fn = (in_zoom: number) => new Vector2(in_zoom, in_zoom);

  const duration = 1.5

  // yield* codeRef().edit(0, false)(...code_template_print());
  // yield* waitFor(duration);
  // yield* codeRef().edit(duration, false)(...simplify(
  //   code_template_print(insert("template <typename T>\n"),
  //     edit("int", "T"),
  //     insert("     // T=int"),
  //     insert("\n  Print(42.42);  // T=double"))));
  // yield* waitFor(duration);

  yield* codeRef().fontSize(50, 0);
  yield* codeRef().edit(0, false)(...code_template());
  yield* waitFor(duration);
  yield* codeRef().edit(duration, false)(...simplify(
    code_template(insert("template <int kNumber, typename T1, typename T2>\n"),
      edit("int", "T1"),
      edit("int", "T1"),
      edit("int", "T2"),
      insert("<kNumber>"))));
  yield* waitFor(duration);
});
