/// <reference types="vite/client" />
import { createRef } from '@motion-canvas/core/lib/utils';
import { makeScene2D, Code, LezerHighlighter, lines } from '@motion-canvas/2d';
import { all, waitFor, waitUntil } from '@motion-canvas/core/lib/flow';
import { ThreadGenerator } from '@motion-canvas/core/lib/threading';
import { DEFAULT } from '@motion-canvas/core/lib/signals';
import { tags } from '@lezer/highlight';
import { HighlightStyle } from '@codemirror/language';

import { parser as parser_css } from '@lezer/css';
import { parser as parser_cpp } from '@lezer/cpp';

import blockingCode from '@lectures/parallelism.md?snippet=parallelism_blocking/main.cpp';
import asyncCode from '@lectures/parallelism.md?snippet=parallelism_async/main.cpp';
import algorithmsSequentialCode from '@lectures/parallelism.md?snippet=parallelism_algorithms/main_sequential.cpp';
import algorithmsParallelCode from '@lectures/parallelism.md?snippet=parallelism_algorithms/main_parallel.cpp';
import tbbCode from '@lectures/parallelism.md?snippet=parallelism_algorithms/main_tbb.cpp';
import jthreadCode from '@lectures/parallelism.md?snippet=parallelism_jthread/main.cpp';
import threadpool17Code from '@lectures/parallelism.md?snippet=parallelism_threadpool_17/main.cpp';

import { MyStyle } from '../../styles';
import { centerOn } from '../../utils';

const CppHighlighter = new LezerHighlighter(parser_cpp, MyStyle);

export default makeScene2D(function* (view) {
    const codeRef = createRef<Code>();

    yield view.add(<Code
        ref={codeRef}
        fontSize={20}
        fontFamily={'Fira Mono'}
        fontWeight={500}
        offsetX={-1}
        x={-800}
        y={0}
        highlighter={CppHighlighter}
    />);

    const duration = 1.0;

    // 0. Blocking
    yield* codeRef().code(blockingCode, 0);
    yield* centerOn(codeRef(), DEFAULT, 0, 20);
    yield* waitFor(duration);

    // Focus on loading an image
    yield* centerOn(codeRef(), [lines(8, 10)], duration, 30);
    yield* waitFor(duration);
    yield* centerOn(codeRef(), [lines(12, 16), lines(6, 11)], duration, 30);
    yield* waitFor(duration);
    yield* centerOn(codeRef(), lines(18, 28), duration, 30);
    yield* waitFor(duration);
    yield* centerOn(codeRef(), DEFAULT, duration, 20);
    yield* waitFor(duration);

    // 1. std::async Background Task
    yield* all(
        codeRef().code(asyncCode, duration),
        centerOn(codeRef(), DEFAULT, duration, 14)
    );
    yield* waitFor(duration);

    // Focus on loading an image
    yield* centerOn(codeRef(), lines(21, 38), duration, 30);
    yield* waitFor(duration);

    // Focus on std::async
    yield* centerOn(codeRef(), lines(42, 45), duration, 30);
    yield* waitFor(duration);

    // Focus on future polling
    yield* centerOn(codeRef(), lines(46, 54), duration, 30);
    yield* waitFor(duration);

    // Focus on getting
    yield* centerOn(codeRef(), lines(55, 58), duration, 30);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), lines(44, 45), duration, 40);
    yield* waitFor(duration);

    // 2. Parallel Algorithms
    yield* centerOn(codeRef(), DEFAULT, duration, 18);
    yield* codeRef().code(algorithmsSequentialCode, duration);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), lines(16, 22), duration, 30);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), lines(8, 10), duration, 30);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), lines(12, 14), duration, 30);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), lines(26, 28), duration, 30);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), lines(32, 35), duration, 30);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), lines(29, 39), duration, 30);
    yield* waitFor(duration);

    // 2. Parallel Algorithms
    yield* centerOn(codeRef(), DEFAULT, duration, 18);
    yield* codeRef().code(algorithmsParallelCode, duration);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), lines(32, 37), duration, 30);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), lines(2, 2), duration, 30);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), lines(29, 41), duration, 30);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), DEFAULT, duration, 17);
    yield* waitFor(duration);

    // 3. Raw TBB
    yield* codeRef().code(tbbCode, duration);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), lines(34, 41), duration, 30);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), DEFAULT, duration, 20);
    yield* waitFor(duration);

    // 4. Thread Pool jthread
    yield* codeRef().code(jthreadCode, duration);
    yield* waitFor(duration);

    // Focus constructor and submit
    yield* centerOn(codeRef(), lines(22, 42), duration, 22);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), DEFAULT, duration, 15);
    yield* waitFor(duration);

    // Focus on the locking and cv in ProcessImages
    yield* centerOn(codeRef(), lines(55, 61), duration, 22);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), DEFAULT, duration, 15);
    yield* waitFor(duration);

    // 5. Thread Pool C++17 Equivalent (Morphing from C++20)
    // Morph the C++20 thread pool cleanly into the C++17 one!
    yield* codeRef().code(threadpool17Code, duration);
    yield* waitFor(duration);

    // Focus on shutdown logic
    yield* centerOn(codeRef(), lines(41, 61), duration, 22);
    yield* waitFor(duration);

    yield* centerOn(codeRef(), DEFAULT, duration, 15);
    yield* waitFor(duration);

    // Focus CV condition
    yield* centerOn(codeRef(), lines(71, 77), duration, 25);
    yield* waitFor(duration);

    // Focus on the data members changing
    yield* centerOn(codeRef(), lines(100, 105), duration, 22);
    yield* waitFor(duration);

    // Finally wrap it out
    yield* centerOn(codeRef(), DEFAULT, duration, 20);
    yield* waitFor(duration);

});
