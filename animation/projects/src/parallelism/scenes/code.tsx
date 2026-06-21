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
import jthread1Code from '@lectures/parallelism.md?snippet=parallelism_jthread_1/main.cpp';
import jthread2Code from '@lectures/parallelism.md?snippet=parallelism_jthread_2/main.cpp';
import jthread2ClassCode from '@lectures/parallelism.md?snippet=parallelism_jthread_2_class/main.cpp';
import jthread2ClassSwapCode from '@lectures/parallelism.md?snippet=parallelism_jthread_2_class_swap/main.cpp';
import jthread3Code from '@lectures/parallelism.md?snippet=parallelism_jthread_3/main.cpp';
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

    yield* all(
        zoomOut(popup1Rect(), outline1(), duration),
        zoomOut(popup2Rect(), outline2(), duration),
        codeRef().selection(DEFAULT, duration),
    );
    yield* waitFor(duration);


    // 3. Worker threads and thread pools
    // #### Step 1: How to create a thread
    yield* all(
        codeRef().code(jthread1Code, duration),
        codeRef().fontSize(14, duration),
        centerOn(codeRef(), DEFAULT, duration, 15),
    );
    yield* waitFor(duration);

    // Highlight 1 (TinyImage struct)
    yield* all(
        centerOn(codeRef(), lines(7, 10), duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 2 (Pushing to queue)
    yield* all(
        centerOn(codeRef(), lines(32, 35), duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 3 (ProcessImage)
    yield* all(
        centerOn(codeRef(), lines(12, 15), duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 4 (jthread worker)
    yield* all(
        centerOn(codeRef(), lines(38, 38), duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 5 (pointer to images)
    yield* all(
        centerOn(codeRef(), [lines(17, 17), lines(38, 38)], duration, 30),
    );
    yield* waitFor(duration);

    // #### Step 2: Adding another thread and a Mutex
    yield* all(
        codeRef().code(jthread2Code, duration),
        centerOn(codeRef(), DEFAULT, duration, 15),
    );
    yield* waitFor(duration);

    // Highlight 1 (mutex created)
    yield* all(
        centerOn(codeRef(), lines(46, 46), duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 2 (2 jthreads)
    yield* all(
        centerOn(codeRef(), lines(49, 50), duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 3 (ProcessImages params & lock_guard)
    yield* all(
        centerOn(codeRef(), [lines(19, 19), lines(23, 30)], duration, 30),
    );
    yield* waitFor(duration);

    // #### Step 2: Class approach
    yield* all(
        codeRef().code(jthread2ClassCode, duration),
        centerOn(codeRef(), DEFAULT, duration, 15),
    );
    yield* waitFor(duration);

    // Highlight 1 (class)
    yield* all(
        centerOn(codeRef(), lines(19, 48), duration, 25),
    );
    yield* waitFor(duration);

    // Highlight 2 (constructor, private method, instantiation)
    yield* all(
        centerOn(codeRef(), [lines(21, 26), lines(29, 43), lines(60, 60)], duration, 25),
    );
    yield* waitFor(duration);

    // #### Step 2: Class swap approach
    yield* all(
        codeRef().code(jthread2ClassSwapCode, duration),
        centerOn(codeRef(), DEFAULT, duration, 15),
    );
    yield* waitFor(duration);

    // Highlight 1 (the swap part)
    yield* all(
        centerOn(codeRef(), lines(31, 36), duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 2 (processing local queue)
    yield* all(
        centerOn(codeRef(), lines(38, 44), duration, 30),
    );
    yield* waitFor(duration);

    // #### Step 3: Sleeping with Condition Variables
    yield* all(
        codeRef().code(jthread3Code, duration),
        centerOn(codeRef(), DEFAULT, duration, 15),
    );
    yield* waitFor(duration);

    // Highlight 1 (Submit method, notify_one)
    yield* all(
        centerOn(codeRef(), lines(31, 37), duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 2 (cv wait)
    yield* all(
        centerOn(codeRef(), lines(46, 48), duration, 30),
    );
    yield* waitFor(duration);

    // #### Step 4: Putting it all together into a Generic Thread Pool
    yield* all(
        codeRef().code(jthreadCode, duration),
        centerOn(codeRef(), DEFAULT, duration, 15),
    );
    yield* waitFor(duration);

    // Highlight 1 (template, ThreadPool)
    yield* all(
        centerOn(codeRef(), lines(21, 22), duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 2 (std::function)
    yield* all(
        centerOn(codeRef(), [lines(24, 26), lines(66, 66)], duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 3 (pool usage)
    yield* all(
        centerOn(codeRef(), lines(75, 75), duration, 30),
    );
    yield* waitFor(duration);

    // #### What if I don't have C++20?
    yield* all(
        codeRef().code(threadpool17Code, duration),
        centerOn(codeRef(), DEFAULT, duration, 15),
    );
    yield* waitFor(duration);

    // Highlight 1 (shutting_down flag)
    yield* all(
        centerOn(codeRef(), lines(75, 75), duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 2 (notify_all)
    yield* all(
        centerOn(codeRef(), lines(38, 38), duration, 30),
    );
    yield* waitFor(duration);

    // Highlight 3 (join)
    yield* all(
        centerOn(codeRef(), lines(40, 40), duration, 30),
    );
    yield* waitFor(duration);

    // Final clean up
    yield* all(
        centerOn(codeRef(), DEFAULT, duration, 15),
    );
    yield* waitFor(duration);

});
