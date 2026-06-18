import { makeScene2D, Rect, Txt, Node, Layout } from '@motion-canvas/2d';
import { all, waitFor, createRef, createRefArray, useRandom, linear } from '@motion-canvas/core';

const colors = [
    '#FFD43B', // Yellow
    '#FF8787', // Red
    '#9775FA', // Purple
    '#74C0FC', // Blue
    '#69DB7C', // Green
    '#FFA94D', // Orange
    '#F06595', // Pink
    '#20C997', // Teal
];

export default makeScene2D(function* (view) {
    const duration = 1.0;
    const random = useRandom();

    const container = createRef<Node>();
    const queueBox = createRef<Rect>();

    // Threads
    const threads = createRefArray<Rect>();
    const threadTexts = createRefArray<Txt>();
    const threadStates = createRefArray<Txt>();
    const threadTaskContainers = createRefArray<Rect>();
    const threadProgressBars = createRefArray<Rect>();

    // To keep track of images
    const queueItems: Rect[] = [];

    yield view.add(
        <Node ref={container}>
            <Txt text="Thread Pool" fill="#FFF" fontSize={48} fontWeight={700} y={-380} />

            <Layout
                layout={true}
                direction={'row'}
                gap={40}
                y={-150}
                alignItems={'center'}
                justifyContent={'center'}
            >
                {[0, 1, 2, 3].map((i) => (
                    <Layout layout={true} direction={'column'} alignItems={'center'} gap={12}>
                        <Rect width={180} height={4} radius={2} fill="#343A40" layout={true} direction={'row'} alignItems={'center'} justifyContent={'flex-start'} clip>
                            <Rect ref={threadProgressBars} width={0} height={'100%'} radius={2} fill="#FFFFFF" shadowColor="#FFFFFF" shadowBlur={10} />
                        </Rect>

                        <Rect
                            ref={threads}
                            width={180}
                            height={180}
                            radius={16}
                            fill={'#343A40'} // Dark gray (always)
                            stroke={'#868E96'}
                            lineWidth={4}
                            shadowColor={'#51CF66'}
                            shadowBlur={0}
                            alignItems={'center'}
                            justifyContent={'flex-start'}
                            paddingTop={20}
                            layout={true}
                            direction={'column'}
                            gap={10}
                        >
                            <Txt ref={threadTexts} text={`Thread ${i}`} fill="#FFF" fontSize={24} fontWeight={600} />
                            <Txt ref={threadStates} text="Zzz..." fill="#ADB5BD" fontSize={28} fontWeight={700} />
                            <Rect ref={threadTaskContainers} layout={true} direction={'row'} gap={10} width={'100%'} height={40} alignItems={'center'} justifyContent={'center'} marginTop={10} />
                        </Rect>
                    </Layout>
                ))}
            </Layout>

            <Txt text="Concurrent Queue" fill="#4DABF7" fontSize={36} fontWeight={600} y={80} />

            <Rect
                ref={queueBox}
                width={800}
                height={120}
                radius={16}
                stroke={'#4DABF7'}
                lineWidth={4}
                y={200}
                layout={true}
                direction={'row'}
                alignItems={'center'}
                padding={20}
            >
                {/* Images will spawn here */}
            </Rect>
        </Node>
    );

    yield* waitFor(1.0);

    // A function to animate an image entering the queue
    function* pushToQueue(imgIndex: number) {
        while (isQueueAnimating) yield* waitFor(0.1);
        isQueueAnimating = true;

        const newImg = createRef<Rect>();
        const color = colors[imgIndex % colors.length];
        queueBox().add(
            <Rect
                ref={newImg}
                width={0}
                height={0}
                margin={[0, 0, 0, 0]}
                radius={8}
                fill={color}
                alignItems={'center'}
                justifyContent={'center'}
                opacity={0}
                scale={0}
            >
                <Txt text={`${imgIndex}`} fill="#1E1E1E" fontSize={24} fontWeight={700} />
            </Rect>
        );
        queueItems.push(newImg());

        yield* all(
            newImg().width(70, 0.3),
            newImg().height(70, 0.3),
            newImg().margin([0, 20, 0, 0], 0.3),
            newImg().opacity(1, 0.3),
            newImg().scale(1, 0.3)
        );

        isQueueAnimating = false;
    }

    // A function to process items organically
    let isSimulationRunning = true;
    let isQueueAnimating = false;

    function* threadWorker(threadIndex: number) {
        let isAwake = false;

        while (isSimulationRunning || queueItems.length > 0) {
            // Take all available items in the queue
            const batchSize = queueItems.length;

            if (batchSize > 0) {
                const items = queueItems.splice(0, batchSize);

                // Small pause so images sit in the queue visibly before being processed
                yield* waitFor(0.2);

                while (isQueueAnimating) yield* waitFor(0.1);
                isQueueAnimating = true;

                if (!isAwake) {
                    yield* all(
                        threads[threadIndex].stroke('#51CF66', 0.2), // Glowing Green outline
                        threads[threadIndex].shadowBlur(20, 0.2), // Add glow
                        threadStates[threadIndex].text("Working", 0.2),
                        threadStates[threadIndex].fill("#FFF", 0.2),
                    );
                    isAwake = true;
                }

                const consumeAnim = [];
                const taskRefs: Rect[] = [];
                const flyingRefs: Rect[] = [];
                const startPositions = [];

                // Pass 1: Prepare elements and establish final layout
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    const textNode = item.children()[0] as Txt;
                    const textValue = textNode.text();
                    const color = colors[parseInt(textValue) % colors.length];

                    // MUST capture startPos before any layout changes
                    startPositions.push(item.absolutePosition());

                    // Hide original instantly so the flying rect can take over
                    item.opacity(0);

                    // Collapse layout in queue
                    consumeAnim.push(item.width(0, 0.4));
                    consumeAnim.push(item.height(0, 0.4));
                    consumeAnim.push(item.margin(0, 0.4));

                    // Add target to thread
                    const task = createRef<Rect>();
                    threadTaskContainers[threadIndex].add(
                        <Rect
                            ref={task}
                            width={35}
                            height={35}
                            radius={6}
                            fill={color}
                            alignItems={'center'}
                            justifyContent={'center'}
                            opacity={0} // Hidden during flight
                        >
                            <Txt text={textValue} fill="#1E1E1E" fontSize={16} fontWeight={700} />
                        </Rect>
                    );
                    taskRefs.push(task());
                }

                // Pass 2: Calculate correct final positions and create flying rects
                for (let i = 0; i < items.length; i++) {
                    const textNode = items[i].children()[0] as Txt;
                    const textValue = textNode.text();
                    const color = colors[parseInt(textValue) % colors.length];

                    // Calculate target absolute position AFTER all items are added
                    const targetPos = taskRefs[i].absolutePosition();

                    // Create temporary flying rect
                    const flyingRect = createRef<Rect>();
                    container().add(
                        <Rect
                            ref={flyingRect}
                            width={70}
                            height={70}
                            radius={8}
                            fill={color}
                            alignItems={'center'}
                            justifyContent={'center'}
                            zIndex={100}
                        >
                            <Txt text={textValue} fill="#1E1E1E" fontSize={24} fontWeight={700} />
                        </Rect>
                    );
                    flyingRefs.push(flyingRect());

                    // Correctly set the absolute starting position
                    flyingRect().absolutePosition(startPositions[i]);

                    // Animate flying rect to target
                    consumeAnim.push(flyingRect().absolutePosition(targetPos, 0.4));
                    consumeAnim.push(flyingRect().width(35, 0.4));
                    consumeAnim.push(flyingRect().height(35, 0.4));
                    consumeAnim.push(flyingRect().radius(6, 0.4));
                    const textChild = flyingRect().children()[0] as Txt;
                    consumeAnim.push(textChild.fontSize(16, 0.4));
                }

                yield* all(...consumeAnim);

                // Cleanup
                items.forEach(item => item.remove());
                flyingRefs.forEach((fly, i) => {
                    taskRefs[i].opacity(1); // Show real task
                    fly.remove(); // Delete flying
                });

                isQueueAnimating = false;

                // Simulate processing time with progress bar
                const processTime = 4.0 * items.length;
                yield* threadProgressBars[threadIndex].width('100%', processTime, linear);

                // Reset progress bar instantly
                threadProgressBars[threadIndex].width(0);

                // Finish processing
                const finishAnim = [];
                for (const task of taskRefs) {
                    finishAnim.push(task.scale(0, 0.2));
                    finishAnim.push(task.opacity(0, 0.2));
                }
                yield* all(...finishAnim);
                taskRefs.forEach(task => task.remove());

                // Thread always goes back to sleep after finishing
                yield* all(
                    threads[threadIndex].stroke('#868E96', 0.2),
                    threads[threadIndex].shadowBlur(0, 0.2), // Remove glow
                    threadStates[threadIndex].text("Zzz...", 0.2),
                    threadStates[threadIndex].fill("#ADB5BD", 0.2),
                );
                isAwake = false;

            } else {
                if (isAwake) {
                    yield* all(
                        threads[threadIndex].stroke('#868E96', 0.2),
                        threads[threadIndex].shadowBlur(0, 0.2), // Remove glow
                        threadStates[threadIndex].text("Zzz...", 0.2),
                        threadStates[threadIndex].fill("#ADB5BD", 0.2),
                    );
                    isAwake = false;
                }
                yield* waitFor(0.1);
            }
        }

        // Cleanup at the end if it was awake
        if (isAwake) {
            yield* all(
                threads[threadIndex].stroke('#868E96', 0.2),
                threads[threadIndex].shadowBlur(0, 0.2), // Remove glow
                threadStates[threadIndex].text("Zzz...", 0.2),
                threadStates[threadIndex].fill("#ADB5BD", 0.2),
            );
        }
    }

    function* producer() {
        for (let i = 1; i <= 20; i++) {
            yield* pushToQueue(i);
            // Random interval between 0.5 and 2.0 seconds
            yield* waitFor(random.nextFloat(0.05, 1.0));
        }
        isSimulationRunning = false;
    }

    // Orchestration
    yield* all(
        producer(),
        threadWorker(0),
        threadWorker(1),
        threadWorker(2),
        threadWorker(3)
    );

    // Let everything finish gracefully
    yield* waitFor(1.5);

    // Fade out scene
    yield* container().opacity(0, duration);
});
