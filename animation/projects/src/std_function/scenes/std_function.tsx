import { makeScene2D, Code, LezerHighlighter, lines } from '@motion-canvas/2d';
import { all, createRef, waitFor } from '@motion-canvas/core';
import { MyStyle } from '../../styles';
import { parser as parser_cpp } from '@lezer/cpp';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { centerOn } from '../../utils';

import templateCode from '@lectures/std_function.md?snippet=std_function/template_button.cpp';
import stdFunctionCode from '@lectures/std_function.md?snippet=std_function/std_function_button.cpp';
import multiButtonCode from '@lectures/std_function.md?snippet=std_function/multi_button.cpp';
import typeErasureCode from '@lectures/std_function.md?snippet=std_function/type_erasure.cpp';

const CppHighlighter = new LezerHighlighter(parser_cpp, MyStyle);

export default makeScene2D(function* (view) {
    const codeRef = createRef<Code>();

    view.add(
        <Code
            ref={codeRef}
            fontSize={26}
            fontFamily={'Fira Mono'}
            highlighter={CppHighlighter}
            code={templateCode}
        />
    );

    // Initial delay
    yield* waitFor(1);

    // 1. Template Button
    yield* centerOn(codeRef(), lines(4, 5), 1, 40); // template <typename Callback>
    yield* waitFor(3);

    yield* centerOn(codeRef(), lines(17, 17), 1, 40); // Callback on_click_;
    yield* waitFor(3);

    yield* centerOn(codeRef(), DEFAULT, 1, 28);
    yield* waitFor(2);

    // 3. std::function Button
    yield* codeRef().code(templateCode, 0);
    yield* centerOn(codeRef(), DEFAULT, 0, 24);
    yield* waitFor(1);
    yield* codeRef().code(stdFunctionCode, 1);
    yield* waitFor(1);

    yield* centerOn(codeRef(), lines(8, 9), 1, 40); // explicit Button(std::string name, std::function<void()> callback)
    yield* waitFor(3);

    yield* centerOn(codeRef(), lines(18, 18), 1, 40); // std::function<void()> on_click_;
    yield* waitFor(3);

    yield* centerOn(codeRef(), lines(30, 30), 1, 40); // std::vector<Button> buttons{play_button, quit_button};
    yield* waitFor(3);

    yield* centerOn(codeRef(), DEFAULT, 1, 28);
    yield* waitFor(2);

    // 4. MultiButton
    yield* codeRef().code(multiButtonCode, 1);
    yield* waitFor(1);

    yield* centerOn(codeRef(), lines(23, 23), 1, 40); // std::vector<std::function<void()>> on_click_callbacks_;
    yield* waitFor(3);

    yield* centerOn(codeRef(), DEFAULT, 1, 28);
    yield* waitFor(2);

    // 5. Type Erasure
    yield* codeRef().code(typeErasureCode, 1);
    yield* waitFor(1);

    yield* centerOn(codeRef(), lines(21, 24), 1, 36); // CallableBase
    yield* waitFor(3);

    yield* centerOn(codeRef(), lines(29, 36), 1, 36); // CallableImpl
    yield* waitFor(3);

    yield* centerOn(codeRef(), lines(6, 11), 1, 36); // MyFunction constructor
    yield* waitFor(3);

    yield* centerOn(codeRef(), lines(41, 41), 1, 36); // std::unique_ptr<CallableBase> callable_;
    yield* waitFor(3);

    yield* centerOn(codeRef(), DEFAULT, 1, 28);
    yield* waitFor(3);
});
