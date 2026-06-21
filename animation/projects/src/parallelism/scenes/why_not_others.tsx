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
                            <Txt ref={osOverheadText} text="OS overhead (create thread)" fill="#FFF" fontSize={24} fontWeight={600} opacity={0} />
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
                            <Txt ref={taskText} text="Invert" fill="#1E1E1E" fontFamily={"Fira Mono"} fontSize={24} fontWeight={600} opacity={0} />
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
        titleText().text("std::async execution timeline", duration) // Animate writing the text
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

    // Components
    const vectorBuffer = createRef<Rect>();
    const algoBlock = createRef<Rect>();

    // Texts
    const algoStatusText = createRef<Txt>();
    const explanationTextLine1 = createRef<Txt>();
    const explanationTextLine2 = createRef<Txt>();
    const streamingText = createRef<Txt>();

    yield view.add(
        <Node ref={algoContainer} opacity={0}>
            <Txt text="std::execution::par / raw TBB" fill="#4DABF7" fontSize={48} fontWeight={700} y={-350} textAlign={'center'} />
            <Txt text="When do we begin?" fill="#ADB5BD" fontSize={28} fontWeight={600} y={-290} textAlign={'center'} />

            <Layout
                layout={true}
                direction={'row'}
                alignItems={'center'}
                justifyContent={'center'}
                gap={80}
                y={50}
            >
                {/* Vector Buffer */}
                <Layout layout={true} direction={'column'} alignItems={'center'} gap={20}>
                    <Txt text="std::vector<Image>" fill="#FFF" fontSize={28} fontWeight={400} fontFamily={"Fira Mono"} />
                    <Rect
                        ref={vectorBuffer}
                        width={300}
                        height={400}
                        radius={16}
                        fill={'#2C2E33'}
                        stroke={'#868E96'}
                        lineWidth={4}
                        clip={true}
                        layout={true}
                        direction={'column'}
                        alignItems={'center'}
                        justifyContent={'flex-start'}
                        padding={20}
                        gap={0} // Gap is 0 to fluidly animate insertion margins instead
                    >
                        <Txt ref={streamingText} text="Streaming in..." fill="#868E96" fontSize={24} fontWeight={600} margin={['auto', 0, 20, 0]} />
                    </Rect>
                </Layout>

                {/* Arrow */}
                <Txt text="➔" fill="#868E96" fontSize={64} fontWeight={700} />

                {/* Algo Block */}
                <Layout layout={true} direction={'column'} alignItems={'center'} gap={20}>
                    <Txt text="Algorithm execution" fill="#FFF" fontSize={28} fontWeight={600} />
                    <Rect
                        ref={algoBlock}
                        width={300}
                        height={400}
                        radius={16}
                        fill={'#343A40'}
                        stroke={'#495057'}
                        lineWidth={4}
                        layout={true}
                        direction={'column'}
                        alignItems={'center'}
                        justifyContent={'center'}
                        padding={20}
                        gap={20}
                    >
                        <Txt text="⚙️" fontSize={80} opacity={0.5} />
                        <Txt ref={algoStatusText} text="Blocked" fill="#FF6B6B" fontSize={36} fontWeight={700} />
                        <Layout layout={true} direction={'column'} alignItems={'center'} gap={5}>
                            <Txt ref={explanationTextLine1} text="Waiting for buffer" fill="#ADB5BD" fontSize={24} fontWeight={600} textAlign={'center'} />
                            <Txt ref={explanationTextLine2} text="to be complete..." fill="#ADB5BD" fontSize={24} fontWeight={600} textAlign={'center'} />
                        </Layout>
                    </Rect>
                </Layout>
            </Layout>
        </Node>
    );

    yield* algoContainer().opacity(1, duration);
    yield* waitFor(0.5);

    // Stream images in
    for (let i = 0; i < 3; i++) {
        const newImg = createRef<Rect>();
        vectorBuffer().insert(
            <Rect
                ref={newImg}
                width={200}
                height={0} // Start at 0 height to animate insertion
                margin={[0, 0, 0, 0]} // Start at 0 margin
                radius={12}
                fill={'#495057'}
                stroke={'#ADB5BD'}
                lineWidth={2}
                alignItems={'center'}
                justifyContent={'center'}
                opacity={0}
                scale={0.8}
                clip={true} // Keep text inside while height is growing
            >
                <Txt text={`🖼️ Image ${i + 1}`} fill="#FFF" fontSize={32} />
            </Rect>,
            0
        );

        yield* all(
            newImg().height(80, 0.4),
            newImg().margin([0, 0, 10, 0], 0.4), // Fluidly add the gap
            newImg().opacity(1, 0.4),
            newImg().scale(1, 0.4)
        );
        yield* waitFor(0.4);
    }

    yield* waitFor(0.5);

    // Highlight the problem
    explanationTextLine1().text("Images are streaming!");
    explanationTextLine2().text("When to start processing?");
    yield* all(
        algoBlock().stroke('#FF6B6B', 0.5),
        algoBlock().shadowBlur(20, 0.5),
        algoBlock().shadowColor('rgba(255, 107, 107, 0.3)', 0.5),
        algoStatusText().scale(1.2, 0.5),
        explanationTextLine1().fill("#FFF", 0.5),
        explanationTextLine2().fill("#FFF", 0.5)
    );

    yield* waitFor(1.0);

    // Animate another image arriving while it's blocked
    const newImg = createRef<Rect>();
    vectorBuffer().insert(
        <Rect
            ref={newImg}
            width={200}
            height={0} // Start at 0 height
            margin={[0, 0, 0, 0]} // Start at 0 margin
            radius={12}
            fill={'#495057'}
            stroke={'#ADB5BD'}
            lineWidth={2}
            alignItems={'center'}
            justifyContent={'center'}
            opacity={0}
            scale={0.8}
            clip={true}
        >
            <Txt text="🖼️ Image 4" fill="#FFF" fontSize={32} />
        </Rect>,
        0
    );

    yield* all(
        newImg().height(80, 0.4),
        newImg().margin([0, 0, 10, 0], 0.4),
        newImg().opacity(1, 0.4),
        newImg().scale(1, 0.4)
    );

    yield* waitFor(1.5);

    // Fade out
    yield* algoContainer().opacity(0, duration);
});
