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
    yield* centerOn(codeRef(), lines(3, 4), 1, 40); // template <typename Callback>
    yield* waitFor(3);

    yield* centerOn(codeRef(), [lines(16, 16), lines(6, 7)], 1, 40); // Callback on_click_;
    yield* waitFor(3);

    yield* centerOn(codeRef(), [lines(16, 16), lines(6, 7), lines(9, 12)], 1, 40); // Callback on_click_;
    yield* waitFor(3);

    yield* centerOn(codeRef(), [lines(24, 25)], 1, 40); // std::vector<Button> buttons;
    yield* waitFor(3);

    yield* centerOn(codeRef(), [lines(24, 24), lines(22, 22)], 1, 40); // std::vector<Button> buttons;
    yield* waitFor(3);

    yield* centerOn(codeRef(), [lines(25, 25), lines(19, 19)], 1, 40); // std::vector<Button> buttons;
    yield* waitFor(3);

    yield* centerOn(codeRef(), [lines(27, 28)], 1, 40); // std::vector<Button> buttons;
    yield* waitFor(3);

    // 3. std::function Button
    yield* codeRef().code(templateCode, 0);
    yield* centerOn(codeRef(), DEFAULT, 0, 24);
    yield* waitFor(1);
    yield* codeRef().code(stdFunctionCode, 1);
    yield* waitFor(1);

    yield* centerOn(codeRef(), lines(7, 7), 1, 40); // explicit Button(std::string name, std::function<void()> callback)
    yield* waitFor(1);

    yield* centerOn(codeRef(), [lines(7, 8), lines(17, 17)], 1, 40); // explicit Button(std::string name, std::function<void()> callback)
    yield* waitFor(3);

    yield* centerOn(codeRef(), lines(22, 48), 1, 40); // std::function<void()> on_click_;
    yield* waitFor(3);

    yield* centerOn(codeRef(), lines(28, 30), 1, 40); // std::vector<Button> buttons{play_button, quit_button};
    yield* waitFor(3);

    // 4. MultiButton
    yield* codeRef().code(stdFunctionCode, 0);
    yield* centerOn(codeRef(), DEFAULT, 0, 22);
    yield* waitFor(1);
    yield* codeRef().code(multiButtonCode, 1);
    yield* waitFor(1);

    yield* centerOn(codeRef(), [lines(7, 8)], 1, 30);
    yield* waitFor(0.5);
    yield* centerOn(codeRef(), [lines(7, 8), lines(19, 19)], 1, 30);
    yield* waitFor(3);

    yield* centerOn(codeRef(), [lines(25, 28), lines(30, 30)], 1, 30);
    yield* waitFor(1);

    yield* centerOn(codeRef(), [lines(12, 14)], 1, 30);
    yield* waitFor(3);


    yield* centerOn(codeRef(), DEFAULT, 1, 22);
    yield* waitFor(3);

    yield* centerOn(codeRef(), [lines(13, 13)], 1, 35);
    yield* waitFor(3);

    // 5. Type Erasure
    yield* centerOn(codeRef(), DEFAULT, 0, 20);
    yield* codeRef().code(typeErasureCode, 0);
    yield* waitFor(1);

    yield* centerOn(codeRef(), lines(3, 3), 1, 32);
    yield* waitFor(1);
    yield* centerOn(codeRef(), [lines(13, 18), lines(28, 28)], 1, 32);
    yield* waitFor(1);

    yield* centerOn(codeRef(), lines(19, 27), 1, 36);
    yield* waitFor(1);
    yield* centerOn(codeRef(), [lines(19, 27), lines(5, 8)], 1, 35);
    yield* waitFor(3);

    yield* centerOn(codeRef(), lines(30, 42), 1, 36);
    yield* waitFor(3);
    yield* centerOn(codeRef(), lines(10, 10), 1, 36);
    yield* waitFor(1);
    yield* centerOn(codeRef(), [lines(16, 16)], 1, 35);
    yield* waitFor(1);
    yield* centerOn(codeRef(), [lines(23, 23)], 1, 35);
    yield* waitFor(3);

    yield* centerOn(codeRef(), DEFAULT, 1, 20);
    yield* waitFor(3);
});
