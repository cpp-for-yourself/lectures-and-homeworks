/// <reference types="vite/client" />
import { createRef } from '@motion-canvas/core/lib/utils';
import { makeScene2D, Code, LezerHighlighter, lines, Camera, Rect, Node } from '@motion-canvas/2d';
import { all, waitFor } from '@motion-canvas/core/lib/flow';
import { DEFAULT } from '@motion-canvas/core/lib/signals';

import { parser as parser_cpp } from '@lezer/cpp';

import blockingCode from '@lectures/parallelism.md?snippet=parallelism_blocking/main.cpp';
import asyncCode from '@lectures/parallelism.md?snippet=parallelism_async/main.cpp';
import algorithmsSequentialCode from '@lectures/parallelism.md?snippet=parallelism_algorithms/main_sequential.cpp';
import algorithmsParallelCode from '@lectures/parallelism.md?snippet=parallelism_algorithms/main_parallel.cpp';
import tbbCode from '@lectures/parallelism.md?snippet=parallelism_algorithms/main_tbb.cpp';
import jthreadCode from '@lectures/parallelism.md?snippet=parallelism_jthread/main.cpp';
import threadpool17Code from '@lectures/parallelism.md?snippet=parallelism_threadpool_17/main.cpp';

import { MyStyle } from '../../styles';
import { centerOn, zoomInOn, zoomOut, getCodeBBox, getFutureCodeBBox } from '../../utils';
import { BBox } from '@motion-canvas/core';

const CppHighlighter = new LezerHighlighter(parser_cpp, MyStyle);

export default makeScene2D(function* (view) {
    const codeContainerRef = createRef<Node>();
    const codeRef = createRef<Code>();

    const popup1Rect = createRef<Rect>();
    const popup1Camera = createRef<Camera>();
    const outline1 = createRef<Rect>();

    const popup2Rect = createRef<Rect>();
    const popup2Camera = createRef<Camera>();
    const outline2 = createRef<Rect>();

    yield view.add(
        <Node ref={codeContainerRef}>
            <Code
                ref={codeRef}
                fontSize={14.5}
                fontFamily={'Fira Mono'}
                fontWeight={500}
                offsetX={-1}
                x={-850}
                y={0}
                highlighter={CppHighlighter}
            />
        </Node>
    );
    yield view.add(
        <>
            <Rect
                ref={outline1}
                stroke={'#FF6B6B'}
                lineWidth={3}
                radius={4}
                opacity={0}
            />
            <Rect
                ref={popup1Rect}
                clip={true}
                width={1000}
                height={480}
                x={200}
                y={-250}
                fill={'#1E1E1E'}
                stroke={'#FF6B6B'}
                lineWidth={4}
                radius={8}
                opacity={0}
                scale={0.8}
            >
                <Camera
                    ref={popup1Camera}
                    scene={codeContainerRef()}
                />
            </Rect>

            <Rect
                ref={outline2}
                stroke={'#4DABF7'}
                lineWidth={3}
                radius={4}
                opacity={0}
            />
            <Rect
                ref={popup2Rect}
                clip={true}
                width={1000}
                height={480}
                x={200}
                y={250}
                fill={'#1E1E1E'}
                stroke={'#4DABF7'}
                lineWidth={4}
                radius={8}
                opacity={0}
                scale={0.8}
            >
                <Camera
                    ref={popup2Camera}
                    scene={codeContainerRef()}
                />
            </Rect>
        </>
    );
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
    const final_box = getFutureCodeBBox(codeRef(), lines(44, 45), () => {
        codeRef().code(asyncCode);
        codeRef().fontSize(14);
    });
    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), getCodeBBox(codeRef(), lines(23, 23)), duration, { zoom: 2, position: 'center', screenPaddingY: 220 }),
        codeRef().selection(lines(23, 23), duration),
    )
    yield* waitFor(duration);
    yield* all(
        codeRef().code(asyncCode, duration),
        codeRef().fontSize(14, duration),
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), final_box, duration, { zoom: 2, position: 'center', screenPaddingY: 220 }),
        codeRef().selection(lines(44, 45), duration),
    );
    yield* waitFor(duration);
    yield* all(
        codeRef().selection(lines(21, 38), duration),
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), getCodeBBox(codeRef(), lines(21, 38)), duration, { zoom: 2, position: 'top-right', screenPaddingY: 250 }),
    )
    yield* waitFor(duration);

    // Focus on std::async AND future polling simultaneously!
    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), getCodeBBox(codeRef(), lines(21, 38)), duration, { zoom: 2, position: 'top-right', screenPaddingY: 100 }),
        zoomInOn(popup2Rect(), popup2Camera(), outline2(), getCodeBBox(codeRef(), lines(46, 54)), duration, { zoom: 2, position: 'bottom-right', screenPaddingX: 150, screenPaddingY: 150 }),
        codeRef().selection([lines(21, 38), lines(46, 54)], duration),
    );
    yield* waitFor(duration);

    yield* all(
        zoomOut(popup1Rect(), outline1(), duration),
        zoomOut(popup2Rect(), outline2(), duration),
        codeRef().selection(DEFAULT, duration),
    );

    yield* all(
        centerOn(codeRef(), lines(40, 58), duration, 30)
    );
    yield* waitFor(duration);

    yield* centerOn(codeRef(), lines(44, 44), duration, 33);
    yield* waitFor(duration);

    // 2. Parallel Algorithms
    yield* all(
        codeRef().code(algorithmsSequentialCode, 0),
        centerOn(codeRef(), DEFAULT, 0, 15),
    );
    yield* waitFor(duration);

    yield* centerOn(codeRef(), lines(16, 22), duration, 30);

    yield* all(
        centerOn(codeRef(), [lines(16, 22), lines(8, 10)], duration, 30),
    )

    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), [lines(16, 22), lines(8, 10), lines(10, 16)], duration, 30),
    )

    yield* waitFor(duration);

    yield* all(
        centerOn(codeRef(), [lines(24, 45)], duration, 30),
    )
    yield* waitFor(duration);

    yield* centerOn(codeRef(), DEFAULT, duration, 15);
    yield* waitFor(duration);

    const final_parllel_box = getFutureCodeBBox(codeRef(), lines(32, 37), () => {
        codeRef().code(algorithmsParallelCode);
        codeRef().fontSize(15);
    });

    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), getCodeBBox(codeRef(), lines(32, 36)), duration, { zoom: 1.5, position: 'bottom-right', screenPaddingY: 240 }),
    );
    yield* waitFor(duration);


    yield* all(
        codeRef().code(algorithmsParallelCode, duration),
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), final_parllel_box, duration, { zoom: 1.5, position: 'bottom-right', screenPaddingY: 220 }),
    );
    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), final_parllel_box, duration, { zoom: 1.5, position: 'bottom-right', screenPaddingY: 220 }),
        zoomInOn(popup2Rect(), popup2Camera(), outline2(), getCodeBBox(codeRef(), lines(2, 2)), duration, { zoom: 1.5, position: 'top-right', screenPaddingX: 730, screenPaddingY: 170 }),
    );
    yield* waitFor(duration);

    yield* all(
        zoomOut(popup1Rect(), outline1(), duration),
        zoomOut(popup2Rect(), outline2(), duration),
        codeRef().selection(DEFAULT, duration),
    );
    yield* waitFor(duration);

    // TBB code
    const final_tbb_box_1 = getFutureCodeBBox(codeRef(), lines(34, 42), () => {
        codeRef().code(tbbCode);
        codeRef().fontSize(15);
    });
    const final_tbb_box_2 = getFutureCodeBBox(codeRef(), lines(0, 6), () => {
        codeRef().code(tbbCode);
        codeRef().fontSize(15);
    });
    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), getCodeBBox(codeRef(), lines(32, 37)), duration, { zoom: 1.5, position: 'bottom-right', screenPaddingY: 220 }),
        zoomInOn(popup2Rect(), popup2Camera(), outline2(), getCodeBBox(codeRef(), lines(0, 5)), duration, { zoom: 1.5, position: 'top-right', screenPaddingX: 720, screenPaddingY: 100 }),
    );
    yield* waitFor(duration);
    yield* all(
        codeRef().code(tbbCode, duration),
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), final_tbb_box_1, duration, { zoom: 1.5, position: 'bottom-right', screenPaddingX: 60, screenPaddingY: 160 }),
        zoomInOn(popup2Rect(), popup2Camera(), outline2(), final_tbb_box_2, duration, { zoom: 1.5, position: 'top-right', screenPaddingX: 680, screenPaddingY: 70 }),
    );
    yield* waitFor(duration);

});

