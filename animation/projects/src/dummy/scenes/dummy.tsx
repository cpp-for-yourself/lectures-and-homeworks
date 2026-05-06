/// <reference types="vite/client" />
import { makeScene2D, Code, LezerHighlighter } from '@motion-canvas/2d';
import { all, createRef, waitFor } from '@motion-canvas/core';
import { MyStyle } from '../../styles';
import { parser as parser_cpp } from '@lezer/cpp';

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
            code={''}
        />
    );

    yield* waitFor(0.5);
    yield* codeRef().code(dummyCode, 1);
    yield* waitFor(1);
});
