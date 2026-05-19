/// <reference types="vite/client" />
import { makeScene2D, Code, LezerHighlighter } from '@motion-canvas/2d';
import { all, createRef, waitFor } from '@motion-canvas/core';
import { MyStyle } from '../../styles';
import { parser as parser_cpp } from '@lezer/cpp';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { centerOn } from '../../utils';
import { lines } from '@motion-canvas/2d';

import dummyCode from '@lectures/dummy.md?snippet=dummy_snippet/main.cpp';

const CppHighlighter = new LezerHighlighter(parser_cpp, MyStyle);

export default makeScene2D(function* (view) {
    const codeRef = createRef<Code>();

    view.add(
        <Code
            ref={codeRef}
            fontSize={28}
            fontFamily={'Fira Mono'}
            highlighter={CppHighlighter}
            code={dummyCode}
        />
    );

    yield* centerOn(codeRef(), DEFAULT, 1, 36);
    yield* waitFor(1);

    yield* centerOn(codeRef(), lines(3, 3), 1, 40);
    yield* waitFor(3);
});
