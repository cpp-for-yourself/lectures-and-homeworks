import {makeScene2D} from '@motion-canvas/2d/lib/scenes';
import {createRef, useDuration} from '@motion-canvas/core/lib/utils';
import {zoomInTransition} from '@motion-canvas/core/lib/transitions';
import {
  CodeBlock,
  edit,
  insert,
  lines,
  word,
  remove,
  CodeModification,
} from '@motion-canvas/2d/lib/components/CodeBlock';
import {all, waitFor, waitUntil} from '@motion-canvas/core/lib/flow';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { BBox, Vector2 } from '@motion-canvas/core/lib/types';

export default makeScene2D(function* (view) {
  const codeRef = createRef<CodeBlock>();

  yield view.add(<CodeBlock
    ref={codeRef}
    language="cpp"
    fontSize={50}
  />);


  const duration = 1.5

  const store = (...args: [TemplateStringsArray, ...any]) => args;

  const code = (operator: any, main:any = ``) => store`
  #include <cstddef>
  #include <algorithm>

  struct HugeObject {
    HugeObject() = default;

    explicit HugeObject(std::size_t data_length)
        : length{data_length}, ptr{AllocateMemory(length)} {}
    ${operator}
    ~HugeObject() { FreeMemory(ptr); }

    std::size_t length{};
    std::byte *ptr{};
  };

  ${main}
  `

  const operator_copy = `

  HugeObject &operator=(const HugeObject &object) {
    if (this == &object) { return *this; }
    FreeMemory(ptr);
    length = object.length;
    ptr = AllocateMemory(length);
    std::copy(object.ptr, object.ptr + length, ptr);
    return *this;
  }
  `

  const main_fn = `
  struct HugeObjectStorage {
    HugeObject member_object;
  };

  int main() {
    HugeObject object{100};
    HugeObjectStorage storage{};
    storage.member_object = object;
    return 0;
  }`

  const zoom_fn = (in_zoom: number) => new Vector2(in_zoom, in_zoom);

  yield * codeRef().edit(duration, false)(...code(``));
  yield * codeRef().selection([...word(7, 30, 28)], duration);
  yield * waitFor(duration);
  yield * codeRef().selection([...word(9, 20, 15)], duration);
  yield * waitFor(duration);
  yield * codeRef().edit(duration, true)(...code(edit(``, operator_copy)));
  yield * waitFor(duration);
  yield * codeRef().selection([...lines(9)], duration);
  yield * waitFor(duration);
  yield * all(
    codeRef().selection([...word(9, 26, 24)], duration),
    codeRef().scale(zoom_fn(1.5), duration),
    codeRef().position(new Vector2(-500, 200), duration),
  );
  yield * waitFor(duration);
  yield * all(
    codeRef().selection([...lines(14)], duration),
    codeRef().scale(zoom_fn(1.2), duration),
    codeRef().position(new Vector2(50, -200), duration),
  );
  yield * waitFor(duration);
  yield * all(
    codeRef().selection(DEFAULT, duration),
    codeRef().scale(zoom_fn(0.7), duration),
    codeRef().position(new Vector2(0, 0), duration),
  );
  // yield * codeRef().scale(scale_zoomed_in, 1);
  yield * waitFor(duration);
  yield * all(
    codeRef().position(new Vector2(0, -300), duration),
    codeRef().edit(duration, true)(...code(operator_copy, edit(``, main_fn))),
  );
  yield * all(
    codeRef().edit(duration, false)(...code(operator_copy, main_fn)),
    codeRef().scale(zoom_fn(1.2), duration),
    codeRef().position(new Vector2(800, -800), duration),
  );
  yield * waitFor(duration);
});
