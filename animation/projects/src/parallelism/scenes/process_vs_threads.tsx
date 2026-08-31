import { makeScene2D, Rect, Txt, Node, Layout, Line, Circle } from '@motion-canvas/2d';
import { all, waitFor, createRef, easeInOutCubic, easeOutCubic } from '@motion-canvas/core';

export default makeScene2D(function* (view) {
    const duration = 1.0;

    // Outer scene container
    const sceneContainer = createRef<Node>();

    // --- PHASE 1: Single Process Sandbox ---
    const singleProcessBox = createRef<Rect>();

    // --- PHASE 2: Multi-Processing ---
    const multiProcContainer = createRef<Node>();
    const proc1Box = createRef<Rect>();
    const proc2Box = createRef<Rect>();
    const ipcLine = createRef<Line>();
    const ipcPulse = createRef<Circle>();
    const ipcTag = createRef<Rect>();

    // --- PHASE 3: Multi-Threading ---
    const multiThreadContainer = createRef<Node>();
    const mtProcessBox = createRef<Rect>();
    const heapBox = createRef<Rect>();

    const thread1Box = createRef<Rect>();
    const thread2Box = createRef<Rect>();

    const ptrLine1 = createRef<Line>();
    const ptrLine2 = createRef<Line>();

    const forkTag = createRef<Rect>();
    const joinTag = createRef<Rect>();

    yield view.add(
        <Node ref={sceneContainer}>
            {/* --- PHASE 1: Single Process Sandbox --- */}
            <Rect
                ref={singleProcessBox}
                width={620}
                height={380}
                radius={24}
                fill={'#252836'}
                stroke={'#B197FC'}
                lineWidth={4}
                y={0}
                opacity={0}
                scale={0.8}
                shadowBlur={30}
                shadowColor={'rgba(177, 151, 252, 0.25)'}
                alignItems={'center'}
                padding={32}
            >
                <Txt text="Process" fill="#B197FC" fontSize={38} fontWeight={700} y={-145} />

                <Rect
                    width={530}
                    height={230}
                    radius={18}
                    fill={'#1E202D'}
                    y={20}
                    padding={[20, 32]}
                    layout={true}
                    direction={'column'}
                    gap={14}
                    alignItems={'center'}
                >
                    <Txt text="Memory Space" fill="#A6ADBB" fontSize={24} fontWeight={600} />
                    <Layout layout={true} direction={'row'} gap={24} width={'100%'} height={140}>
                        <Rect width={220} height={'100%'} radius={12} fill={'#2A2E3D'} alignItems={'center'} justifyContent={'center'}>
                            <Txt text="Stack" fill="#FFD43B" fontSize={28} fontWeight={700} />
                        </Rect>
                        <Rect width={220} height={'100%'} radius={12} fill={'#2A2E3D'} alignItems={'center'} justifyContent={'center'}>
                            <Txt text="Heap" fill="#FF8787" fontSize={28} fontWeight={700} />
                        </Rect>
                    </Layout>
                </Rect>
            </Rect>

            {/* --- PHASE 2: Multi-Processing --- */}
            <Node ref={multiProcContainer} opacity={0}>
                {/* Process 1 */}
                <Rect
                    ref={proc1Box}
                    width={520}
                    height={380}
                    radius={24}
                    fill={'#252836'}
                    stroke={'#B197FC'}
                    lineWidth={4}
                    x={-480}
                    y={0}
                    alignItems={'center'}
                    padding={30}
                    shadowBlur={30}
                    shadowColor={'rgba(177, 151, 252, 0.2)'}
                >
                    <Txt text="Process 1" fill="#B197FC" fontSize={36} fontWeight={700} y={-145} />
                    <Rect width={460} height={230} radius={18} fill={'#1E202D'} y={20} padding={[20, 28]} layout={true} direction={'column'} gap={14} alignItems={'center'}>
                        <Txt text="Memory Space 1" fill="#A6ADBB" fontSize={24} fontWeight={600} />
                        <Layout layout={true} direction={'row'} gap={18} width={'100%'} height={140}>
                            <Rect width={192} height={'100%'} radius={12} fill={'#2A2E3D'} alignItems={'center'} justifyContent={'center'}>
                                <Txt text="Stack 1" fill="#FFD43B" fontSize={26} fontWeight={700} />
                            </Rect>
                            <Rect width={192} height={'100%'} radius={12} fill={'#2A2E3D'} alignItems={'center'} justifyContent={'center'}>
                                <Txt text="Heap 1" fill="#FF8787" fontSize={26} fontWeight={700} />
                            </Rect>
                        </Layout>
                    </Rect>
                </Rect>

                {/* Process 2 */}
                <Rect
                    ref={proc2Box}
                    width={520}
                    height={380}
                    radius={24}
                    fill={'#252836'}
                    stroke={'#B197FC'}
                    lineWidth={4}
                    x={480}
                    y={0}
                    alignItems={'center'}
                    padding={30}
                    shadowBlur={30}
                    shadowColor={'rgba(177, 151, 252, 0.2)'}
                >
                    <Txt text="Process 2" fill="#B197FC" fontSize={36} fontWeight={700} y={-145} />
                    <Rect width={460} height={230} radius={18} fill={'#1E202D'} y={20} padding={[20, 28]} layout={true} direction={'column'} gap={14} alignItems={'center'}>
                        <Txt text="Memory Space 2" fill="#A6ADBB" fontSize={24} fontWeight={600} />
                        <Layout layout={true} direction={'row'} gap={18} width={'100%'} height={140}>
                            <Rect width={192} height={'100%'} radius={12} fill={'#2A2E3D'} alignItems={'center'} justifyContent={'center'}>
                                <Txt text="Stack 2" fill="#FFD43B" fontSize={26} fontWeight={700} />
                            </Rect>
                            <Rect width={192} height={'100%'} radius={12} fill={'#2A2E3D'} alignItems={'center'} justifyContent={'center'}>
                                <Txt text="Heap 2" fill="#FF8787" fontSize={26} fontWeight={700} />
                            </Rect>
                        </Layout>
                    </Rect>
                </Rect>

                {/* IPC Dashed Line (Extends from Process 1 to Process 2) */}
                <Line
                    ref={ipcLine}
                    points={[[-215, 20], [215, 20]]}
                    stroke={'#FFC078'}
                    lineWidth={4}
                    lineDash={[10, 10]}
                    end={0}
                />
                <Circle
                    ref={ipcPulse}
                    size={20}
                    fill={'#FFC078'}
                    x={-215}
                    y={20}
                    opacity={0}
                    shadowBlur={14}
                    shadowColor={'#FFC078'}
                />

                {/* IPC Tag (Moved lower to y: 260) */}
                <Rect
                    ref={ipcTag}
                    layout={true}
                    direction={'row'}
                    radius={18}
                    fill={'#362215'}
                    stroke={'#FFC078'}
                    lineWidth={3}
                    y={260}
                    padding={[16, 42]}
                    opacity={0}
                    alignItems={'center'}
                    justifyContent={'center'}
                >
                    <Txt text="IPC (Slow Inter-Process Communication)" fill="#FFC078" fontSize={24} fontWeight={600} />
                </Rect>
            </Node>

            {/* --- PHASE 3: Multi-Threading --- */}
            <Node ref={multiThreadContainer} opacity={0}>
                {/* Process Container */}
                <Rect
                    ref={mtProcessBox}
                    width={1120}
                    height={580}
                    radius={26}
                    fill={'#252836'}
                    stroke={'#38D9A9'}
                    lineWidth={4}
                    y={0}
                    shadowBlur={35}
                    shadowColor={'rgba(56, 217, 169, 0.2)'}
                />

                <Txt text="Process (Multi-Threading)" fill="#38D9A9" fontSize={38} fontWeight={700} y={-250} />

                {/* Shared Heap (Top Center) */}
                <Rect
                    ref={heapBox}
                    width={480}
                    height={130}
                    radius={20}
                    fill={'#3A2329'}
                    stroke={'#FF8787'}
                    lineWidth={3.5}
                    y={-140}
                    alignItems={'center'}
                    justifyContent={'center'}
                    layout={true}
                    direction={'column'}
                    gap={6}
                    shadowBlur={22}
                    shadowColor={'rgba(255, 135, 135, 0.25)'}
                >
                    <Txt text="Shared Heap Memory" fill="#FF8787" fontSize={28} fontWeight={700} />
                    <Txt text="Shared Object Space" fill="#A6ADBB" fontSize={20} />
                </Rect>

                {/* Pointer Line 1 (Thread 1 -> Shared Heap) */}
                <Line
                    ref={ptrLine1}
                    points={[[-220, 22], [-100, -75]]}
                    stroke={'#4DABF7'}
                    lineWidth={4.5}
                    endArrow
                    arrowSize={15}
                    end={0}
                />

                {/* Pointer Line 2 (Thread 2 -> Shared Heap) */}
                <Line
                    ref={ptrLine2}
                    points={[[220, 22], [100, -75]]}
                    stroke={'#38D9A9'}
                    lineWidth={4.5}
                    endArrow
                    arrowSize={15}
                    end={0}
                />

                {/* Thread 1 Box */}
                <Rect
                    ref={thread1Box}
                    width={280}
                    height={145}
                    radius={18}
                    fill={'#1E202D'}
                    stroke={'#4DABF7'}
                    lineWidth={3.5}
                    x={-220}
                    y={95}
                    alignItems={'center'}
                    justifyContent={'center'}
                    layout={true}
                    direction={'column'}
                    gap={8}
                    shadowBlur={18}
                    shadowColor={'rgba(77, 171, 247, 0.2)'}
                >
                    <Txt text="Thread 1" fill="#4DABF7" fontSize={26} fontWeight={700} />
                    <Txt text="Stack 1" fill="#FFD43B" fontSize={22} fontWeight={600} />
                </Rect>

                {/* Thread 2 Box */}
                <Rect
                    ref={thread2Box}
                    width={280}
                    height={145}
                    radius={18}
                    fill={'#1E202D'}
                    stroke={'#38D9A9'}
                    lineWidth={3.5}
                    x={-220}
                    y={95}
                    alignItems={'center'}
                    justifyContent={'center'}
                    layout={true}
                    direction={'column'}
                    gap={8}
                    opacity={0}
                    shadowBlur={18}
                    shadowColor={'rgba(56, 217, 169, 0.2)'}
                >
                    <Txt text="Thread 2" fill="#38D9A9" fontSize={26} fontWeight={700} />
                    <Txt text="Stack 2" fill="#FFD43B" fontSize={22} fontWeight={600} />
                </Rect>

                {/* Spawn Badge */}
                <Rect
                    ref={forkTag}
                    layout={true}
                    direction={'row'}
                    radius={14}
                    fill={'#1A332B'}
                    stroke={'#38D9A9'}
                    lineWidth={2}
                    x={0}
                    y={225}
                    padding={[14, 32]}
                    opacity={0}
                    alignItems={'center'}
                    justifyContent={'center'}
                >
                    <Txt text="spawn / fork Thread 2" fill="#38D9A9" fontFamily="Fira Mono" fontSize={20} fontWeight={700} />
                </Rect>

                {/* Join Badge */}
                <Rect
                    ref={joinTag}
                    layout={true}
                    direction={'row'}
                    radius={14}
                    fill={'#362E17'}
                    stroke={'#FFD43B'}
                    lineWidth={2}
                    x={0}
                    y={225}
                    padding={[14, 32]}
                    opacity={0}
                    alignItems={'center'}
                    justifyContent={'center'}
                >
                    <Txt text="thread.join()" fill="#FFD43B" fontFamily="Fira Mono" fontSize={20} fontWeight={700} />
                </Rect>
            </Node>
        </Node>
    );

    // ==========================================
    // ANIMATION TIMELINE
    // ==========================================

    // --- Phase 1: Single Process Sandbox (0s - 4s) ---
    yield* all(
        singleProcessBox().opacity(1, duration),
        singleProcessBox().scale(1, duration, easeOutCubic)
    );
    yield* waitFor(1.5);

    // --- Phase 2: Multi-Processing (4s - 12s) ---
    yield* singleProcessBox().opacity(0, 0.5);

    yield* multiProcContainer().opacity(1, 0.6);
    yield* waitFor(0.3);

    // 1. Orange line extends out from Process 1 to Process 2
    yield* ipcLine().end(1, 0.6, easeInOutCubic);

    // 2. Reveal IPC tag and start message pulse
    yield* all(
        ipcTag().opacity(1, 0.4),
        ipcPulse().opacity(1, 0.3)
    );

    // 3. Message pulse travels back and forth multiple times
    yield* ipcPulse().x(215, 0.7, easeInOutCubic);
    yield* ipcPulse().x(-215, 0.7, easeInOutCubic);
    yield* ipcPulse().x(215, 0.7, easeInOutCubic);
    yield* ipcPulse().x(-215, 0.7, easeInOutCubic);
    yield* waitFor(1.2);

    // --- Phase 3: Multi-Threading ---
    yield* all(
        multiProcContainer().opacity(0, 0.6),
        ipcPulse().opacity(0, 0.3)
    );

    yield* multiThreadContainer().opacity(1, 0.6);
    yield* waitFor(0.3);

    // 1. Thread 1 arrow extends OUT of Thread 1 box
    yield* ptrLine1().end(1, 0.4, easeInOutCubic);
    yield* waitFor(0.4);

    // 2. Thread 2 slides right into place at (220, 95)
    yield* all(
        forkTag().opacity(1, 0.3),
        thread2Box().opacity(1, 0.8, easeInOutCubic),
        thread2Box().x(220, 0.8, easeInOutCubic)
    );

    // 3. Immediately after Thread 2 arrives, Thread 2 arrow extends OUT
    yield* ptrLine2().end(1, 0.4, easeInOutCubic);
    yield* waitFor(1.5);

    // 4. Joining Thread 2 back into Thread 1:
    //    Step A: Thread 2 arrow retracts rapidly
    yield* forkTag().opacity(0, 0.2);
    yield* joinTag().opacity(1, 0.3);

    yield* ptrLine2().end(0, 0.4, easeInOutCubic);

    //    Step B: Immediately slide Thread 2 back left to (-220, 95) and fade out
    yield* all(
        thread2Box().x(-220, 0.8, easeInOutCubic),
        thread2Box().opacity(0, 0.8, easeInOutCubic)
    );
    yield* waitFor(1.8);

    // Fade out scene gracefully
    yield* sceneContainer().opacity(0, duration);
    yield* waitFor(0.5);
});
