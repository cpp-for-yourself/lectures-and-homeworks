/// <reference types="vite/client" />
import { createRef } from '@motion-canvas/core/lib/utils';
import { makeScene2D, Code, LezerHighlighter, lines, Camera, Rect, Node } from '@motion-canvas/2d';
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
import { centerOn, zoomInOn, zoomOut } from '../../utils';

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
    yield* all(
        codeRef().code(asyncCode, duration),
        centerOn(codeRef(), DEFAULT, duration, 14)
    );
    yield* waitFor(duration);

    // Focus on loading an image
    yield* zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(21, 38), duration);
    yield* waitFor(duration);

    // Focus on std::async AND future polling simultaneously!
    yield* all(
        zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(42, 45), duration),
        zoomInOn(popup2Rect(), popup2Camera(), outline2(), codeRef(), lines(46, 54), duration)
    );
    yield* waitFor(duration);

    // Focus on getting in popup 1, keep polling in popup 2
    yield* zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(55, 58), duration);
    yield* waitFor(duration);

    // Zoom in closer on launch policy args in popup 1
    yield* zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(44, 45), duration);
    yield* waitFor(duration);

    // Zoom out both popups
    yield* all(
        zoomOut(popup1Rect(), outline1(), duration),
        zoomOut(popup2Rect(), outline2(), duration)
    );
    yield* waitFor(duration);

    // 2. Parallel Algorithms
    yield* all(
        codeRef().code(algorithmsSequentialCode, duration),
        codeRef().y(0, duration),
        codeRef().selection(DEFAULT, duration)
    );
    yield* waitFor(duration);

    yield* zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(16, 22), duration);
    yield* waitFor(duration);

    yield* zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(8, 10), duration);
    yield* waitFor(duration);

    yield* zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(12, 14), duration);
    yield* waitFor(duration);

    yield* zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(26, 28), duration);
    yield* waitFor(duration);

    yield* zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(32, 35), duration);
    yield* waitFor(duration);

    yield* zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(29, 39), duration);
    yield* waitFor(duration);

    // 2. Parallel Algorithms (Parallel Version)
    yield* all(
        codeRef().code(algorithmsParallelCode, duration),
        codeRef().y(0, duration),
        codeRef().selection(DEFAULT, duration)
    );
    yield* waitFor(duration);

    yield* zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(32, 37), duration);
    yield* waitFor(duration);

    yield* zoomInOn(popup2Rect(), popup2Camera(), outline2(), codeRef(), lines(2, 2), duration);
    yield* waitFor(duration);

    yield* zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(29, 41), duration);
    yield* waitFor(duration);

    yield* all(
        zoomOut(popup1Rect(), outline1(), duration),
        zoomOut(popup2Rect(), outline2(), duration)
    );
    yield* waitFor(duration);

    // 3. Raw TBB
    yield* all(
        codeRef().code(tbbCode, duration),
        codeRef().y(0, duration),
        codeRef().selection(DEFAULT, duration)
    );
    yield* waitFor(duration);

    yield* zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(34, 41), duration);
    yield* waitFor(duration);

    yield* zoomOut(popup1Rect(), outline1(), duration);
    yield* waitFor(duration);

    // 4. Thread Pool jthread
    yield* all(
        codeRef().code(jthreadCode, duration),
        codeRef().y(0, duration),
        codeRef().selection(DEFAULT, duration)
    );
    yield* waitFor(duration);

    // Focus constructor and submit
    yield* zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(22, 42), duration);
    yield* waitFor(duration);

    // Focus on the locking and cv in ProcessImages
    yield* zoomInOn(popup2Rect(), popup2Camera(), outline2(), codeRef(), lines(55, 61), duration);
    yield* waitFor(duration);

    yield* all(
        zoomOut(popup1Rect(), outline1(), duration),
        zoomOut(popup2Rect(), outline2(), duration)
    );
    yield* waitFor(duration);

    // 5. Thread Pool C++17 Equivalent (Morphing from C++20)
    yield* all(
        codeRef().code(threadpool17Code, duration),
        codeRef().y(0, duration),
        codeRef().selection(DEFAULT, duration)
    );
    yield* waitFor(duration);

    // Focus on shutdown logic
    yield* zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(41, 61), duration);
    yield* waitFor(duration);

    // Focus CV condition
    yield* zoomInOn(popup2Rect(), popup2Camera(), outline2(), codeRef(), lines(71, 77), duration);
    yield* waitFor(duration);

    // Focus on the data members changing
    yield* zoomInOn(popup1Rect(), popup1Camera(), outline1(), codeRef(), lines(100, 105), duration);
    yield* waitFor(duration);

    yield* all(
        zoomOut(popup1Rect(), outline1(), duration),
        zoomOut(popup2Rect(), outline2(), duration)
    );
    yield* waitFor(duration);
});

