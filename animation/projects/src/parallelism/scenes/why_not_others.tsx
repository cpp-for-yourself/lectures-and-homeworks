import { makeScene2D, Rect, Txt, Node, Layout } from '@motion-canvas/2d';
import { all, waitFor, createRef, Vector2, easeInOutCubic, createRefArray } from '@motion-canvas/core';

export default makeScene2D(function* (view) {
    const container = createRef<Node>();
    
    // --- Part 1: std::async overhead ---
    const asyncContainer = createRef<Node>();
    const incomingImage = createRef<Rect>();
    const threadBox = createRef<Rect>();
    const osOverhead = createRef<Rect>();
    const taskBox = createRef<Rect>();
    
    yield view.add(
        <Node ref={container}>
            <Node ref={asyncContainer}>
                <Rect
                    ref={incomingImage}
                    width={60}
                    height={60}
                    radius={8}
                    fill={'#FFD43B'}
                    x={-800}
                    y={0}
                    shadowBlur={10}
                    shadowColor={'rgba(0,0,0,0.5)'}
                >
                    <Txt text="Img" fill="#1E1E1E" fontSize={24} fontWeight={600} />
                </Rect>

                <Rect
                    ref={threadBox}
                    width={0}
                    height={0}
                    radius={16}
                    fill={'#2C2E33'}
                    stroke={'#4DABF7'}
                    lineWidth={4}
                    x={0}
                    y={0}
                    clip={true}
                    opacity={0}
                    layout={true}
                    direction={'column'}
                    padding={20}
                    gap={20}
                >
                    <Txt text="std::async Thread" fill="#4DABF7" fontSize={32} fontWeight={700} alignSelf={'center'} />
                    
                    <Rect
                        ref={osOverhead}
                        width={'100%'}
                        grow={1}
                        fill={'#FF6B6B'}
                        radius={8}
                        alignItems={'center'}
                        justifyContent={'center'}
                    >
                        <Txt text="OS Thread Overhead\n(Stack, TCB, Context Switch)" fill="#FFF" fontSize={28} fontWeight={600} textAlign={'center'} />
                    </Rect>

                    <Rect
                        ref={taskBox}
                        width={'100%'}
                        height={100}
                        fill={'#51CF66'}
                        radius={8}
                        alignItems={'center'}
                        justifyContent={'center'}
                    >
                        <Txt text="Invert Img" fill="#1E1E1E" fontSize={28} fontWeight={600} />
                    </Rect>
                </Rect>
            </Node>
        </Node>
    );

    const duration = 1.0;

    // Image arrives
    yield* incomingImage().x(0, duration, easeInOutCubic);
    yield* waitFor(0.5);

    // Spawn thread box
    yield* all(
        threadBox().width(500, duration),
        threadBox().height(700, duration),
        threadBox().opacity(1, duration),
        incomingImage().opacity(0, duration/2) // Hide standalone image as it "enters" the thread
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
    const images = createRefArray<Rect>();

    yield view.add(
        <Node ref={algoContainer} opacity={0}>
            <Txt text="std::vector<Image>" fill="#FFF" fontSize={32} fontWeight={600} y={-300} />
            <Rect
                ref={vectorBox}
                width={800}
                height={120}
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
                <Txt ref={waitingTxt} text="Waiting for full batch..." fill="#FFD43B" fontSize={28} fontWeight={600} marginTop={40} />
            </Rect>
        </Node>
    );

    yield* algoContainer().opacity(1, duration);
    yield* waitFor(0.5);

    // Stream images in
    for (let i = 0; i < 6; i++) {
        const newImg = createRef<Rect>();
        vectorBox().add(
            <Rect
                ref={newImg}
                width={100}
                height={80}
                radius={8}
                fill={'#FFD43B'}
                alignItems={'center'}
                justifyContent={'center'}
                opacity={0}
                scale={0}
            >
                <Txt text={`Img ${i+1}`} fill="#1E1E1E" fontSize={20} fontWeight={600} />
            </Rect>
        );
        
        yield* all(
            newImg().opacity(1, 0.4),
            newImg().scale(1, 0.4)
        );
        yield* waitFor(0.2);
    }

    yield* waitFor(0.5);

    // Vector is full, algorithm can finally start
    yield* all(
        waitingTxt().text("Processing Batch!", 0.3),
        waitingTxt().fill("#51CF66", 0.3),
        algoBox().fill("#2B8A3E", 0.5), // turn green
        algoBox().stroke("#51CF66", 0.5)
    );

    yield* waitFor(1.5);

    // Fade out
    yield* algoContainer().opacity(0, duration);
});
