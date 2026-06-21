import { makeScene2D, Rect, Txt, Node, Layout } from '@motion-canvas/2d';
import { all, waitFor, createRef, Vector2, easeInOutCubic, createRefArray } from '@motion-canvas/core';

export default makeScene2D(function* (view) {
    const container = createRef<Node>();

    // --- Part 1: std::async overhead ---
    const asyncContainer = createRef<Node>();
    const incomingImage = createRef<Rect>();
    const timelineContainer = createRef<Node>();
    const timelineTrack = createRef<Rect>();
    const osOverhead = createRef<Rect>();
    const taskBox = createRef<Rect>();
    const osOverheadText = createRef<Txt>();
    const taskText = createRef<Txt>();
    const titleText = createRef<Txt>();

    yield view.add(
        <Node ref={container}>
            <Node ref={asyncContainer}>
                <Rect
                    ref={incomingImage}
                    width={100}
                    height={100}
                    radius={16}
                    fill={'#495057'} // Modern dark gray background
                    stroke={'#ADB5BD'}
                    lineWidth={4}
                    x={-800}
                    y={0}
                    shadowBlur={15}
                    shadowColor={'rgba(0,0,0,0.5)'}
                    alignItems={'center'}
                    justifyContent={'center'}
                >
                    <Txt text="🖼️" fontSize={120} />
                </Rect>

                <Node ref={timelineContainer} x={0} y={100} opacity={0}>
                    <Txt ref={titleText} text="" fill="#ffffff" fontSize={36} fontWeight={700} y={-80} textAlign={'center'} />

                    <Rect
                        ref={timelineTrack}
                        width={800}
                        height={60}
                        radius={30}
                        fill={'#2C2E33'}
                        x={0}
                        y={0}
                        clip={true}
                        layout={true}
                        direction={'row'}
                    >
                        <Rect
                            ref={osOverhead}
                            width={0}
                            height={'100%'}
                            fill={'#845EF7'} // Modern Purple
                            alignItems={'center'}
                            justifyContent={'center'}
                            clip={true}
                        >
                            <Txt ref={osOverheadText} text="OS Overhead (Create Thread)" fill="#FFF" fontSize={24} fontWeight={600} opacity={0} />
                        </Rect>
                        <Rect
                            ref={taskBox}
                            width={0}
                            height={'100%'}
                            fill={'#20C997'} // Modern Teal
                            alignItems={'center'}
                            justifyContent={'center'}
                            clip={true}
                        >
                            <Txt ref={taskText} text="Invert" fill="#1E1E1E" fontSize={24} fontWeight={600} opacity={0} />
                        </Rect>
                    </Rect>
                </Node>
            </Node>
        </Node>
    );

    const duration = 1.0;

    // Image arrives
    yield* incomingImage().x(0, duration, easeInOutCubic);
    yield* waitFor(0.5);

    // Show timeline & animate title
    yield* all(
        timelineContainer().opacity(1, duration),
        incomingImage().y(-150, duration),
        incomingImage().scale(0.8, duration),
        titleText().text("std::async Execution Timeline", duration) // Animate writing the text
    );
    yield* waitFor(0.5);

    // Animate OS overhead taking up 85% of time
    yield* all(
        osOverhead().width('85%', 2.5),
        osOverheadText().opacity(1, 0.5)
    );
    yield* waitFor(0.5);

    // Animate actual task taking up 15% of time
    yield* all(
        taskBox().width('15%', 0.5),
        taskText().opacity(1, 0.5)
    );
    yield* waitFor(1.5);

    // Fade out part 1
    yield* asyncContainer().opacity(0, duration);
    yield* waitFor(0.5);

    // --- Part 2: Standard Algorithms ---
    const algoContainer = createRef<Node>();
    const vectorBox = createRef<Rect>();
    const algoBox = createRef<Rect>();
    const waitingTxt = createRef<Txt>();
    const questionTxt = createRef<Txt>();

    yield view.add(
        <Node ref={algoContainer} opacity={0}>
            <Txt text="std::vector<Image>" fill="#FFF" fontSize={32} fontWeight={600} y={-300} />
            <Rect
                ref={vectorBox}
                width={800}
                height={140}
                radius={16}
                stroke={'#868E96'}
                lineWidth={4}
                y={-200}
                layout={true}
                direction={'row'}
                alignItems={'center'}
                padding={20}
                gap={20}
            >
                {/* We'll spawn images here */}
                <Txt ref={questionTxt} text="Size: ???" fill="#868E96" fontSize={32} fontWeight={600} position={[0, 0]} isPositionedAbsolute={true} />
            </Rect>

            <Rect
                ref={algoBox}
                width={800}
                height={300}
                radius={16}
                fill={'#343A40'}
                stroke={'#4DABF7'}
                lineWidth={4}
                y={150}
                alignItems={'center'}
                justifyContent={'center'}
                layout={true}
                direction={'column'}
                gap={20}
            >
                <Txt text="std::for_each ( std::execution::par )" fill="#4DABF7" fontSize={36} fontWeight={700} />
                <Txt text="or raw TBB" fill="#4DABF7" fontSize={28} fontWeight={600} opacity={0.8} />
                <Txt ref={waitingTxt} text="Waiting for all ??? images..." fill="#FFD43B" fontSize={28} fontWeight={600} marginTop={40} />
            </Rect>
        </Node>
    );

    yield* algoContainer().opacity(1, duration);
    yield* waitFor(0.5);

    // Stream images in
    for (let i = 0; i < 5; i++) {
        const newImg = createRef<Rect>();
        vectorBox().add(
            <Rect
                ref={newImg}
                width={100}
                height={100}
                radius={16}
                fill={'#495057'}
                stroke={'#ADB5BD'}
                lineWidth={4}
                alignItems={'center'}
                justifyContent={'center'}
                opacity={0}
                scale={0}
                zIndex={10}
            >
                <Txt text="🖼️" fill="#FFF" fontSize={64} />
            </Rect>
        );

        yield* all(
            newImg().opacity(1, 0.4),
            newImg().scale(1, 0.4),
            questionTxt().opacity(0, 0.4) // Hide the "Size: ???" once images start coming
        );
        yield* waitFor(0.3);
    }

    yield* waitFor(1.0);

    yield* all(
        waitingTxt().text("Still waiting... how many more?", 0.5),
        waitingTxt().fill("#FF6B6B", 0.5)
    );

    yield* waitFor(1.5);

    // One more image arrives randomly late
    const lateImg = createRef<Rect>();
    vectorBox().add(
        <Rect
            ref={lateImg}
            width={100}
            height={100}
            radius={16}
            fill={'#495057'}
            stroke={'#ADB5BD'}
            lineWidth={4}
            alignItems={'center'}
            justifyContent={'center'}
            opacity={0}
            scale={0}
            zIndex={10}
        >
            <Txt text="🖼️" fill="#FFF" fontSize={64} />
        </Rect>
    );

    yield* all(
        lateImg().opacity(1, 0.4),
        lateImg().scale(1, 0.4)
    );
    yield* waitFor(1.5);

    // Fade out
    yield* algoContainer().opacity(0, duration);
});
