import { makeScene2D, Code, LezerHighlighter, lines, Node, Rect, Txt, Line } from '@motion-canvas/2d';
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

    const myFuncRect = createRef<Rect>();
    const baseRect = createRef<Rect>();
    const implRect = createRef<Rect>();
    const tRect = createRef<Rect>();

    const line1 = createRef<Line>();
    const line2 = createRef<Line>();
    const line3 = createRef<Line>();

    view.add(
        <Node y={0} scale={1.4}>
            <Rect ref={myFuncRect} width={240} height={60} x={-505} fill="#2d2d2d" radius={10} opacity={0}>
                <Txt text="~MyFunction()" fill="#eeeeee" fontFamily="Fira Mono" fontSize={24} />
            </Rect>
            <Line ref={line1} points={[[-375, 0], [-295, 0]]} stroke="#569CD6" lineWidth={4} endArrow end={0} />
            <Rect ref={baseRect} width={260} height={60} x={-155} fill="#2d2d2d" radius={10} opacity={0}>
                <Txt text="~CallableBase()" fill="#eeeeee" fontFamily="Fira Mono" fontSize={24} />
            </Rect>
            <Line ref={line2} points={[[-15, 0], [65, 0]]} stroke="#569CD6" lineWidth={4} endArrow end={0} />
            <Rect ref={implRect} width={300} height={60} x={225} fill="#2d2d2d" radius={10} opacity={0}>
                <Txt text="~CallableImpl<T>()" fill="#eeeeee" fontFamily="Fira Mono" fontSize={24} />
            </Rect>
            <Line ref={line3} points={[[385, 0], [465, 0]]} stroke="#569CD6" lineWidth={4} endArrow end={0} />
            <Rect ref={tRect} width={150} height={60} x={550} fill="#2d2d2d" radius={10} opacity={0}>
                <Txt text="~T()" fill="#eeeeee" fontFamily="Fira Mono" fontSize={24} />
            </Rect>
        </Node>
    );

    // 6. Destructors flow
    yield* codeRef().opacity(0, 1);

    yield* myFuncRect().opacity(1, 0.5);
    yield* waitFor(0.5);
    yield* line1().end(1, 0.5);
    yield* baseRect().opacity(1, 0.5);
    yield* waitFor(0.5);
    yield* line2().end(1, 0.5);
    yield* implRect().opacity(1, 0.5);
    yield* waitFor(0.5);
    yield* line3().end(1, 0.5);
    yield* tRect().opacity(1, 0.5);
    yield* waitFor(3);

    yield* all(
        tRect().opacity(0, 0.5),
        line3().opacity(0, 0.5),
        implRect().opacity(0, 0.5),
        line2().opacity(0, 0.5),
        baseRect().opacity(0, 0.5),
        line1().opacity(0, 0.5),
        myFuncRect().opacity(0, 0.5),
    );

    yield* centerOn(codeRef(), DEFAULT, 0, 20);
    yield* codeRef().opacity(1, 1);

    yield* centerOn(codeRef(), DEFAULT, 1, 20);
    yield* waitFor(3);
});
