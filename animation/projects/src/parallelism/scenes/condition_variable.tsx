import { makeScene2D, Rect, Txt, Node, Circle, Line, Layout } from '@motion-canvas/2d';
import { all, waitFor, createRef, easeInOutCubic, easeOutCubic, easeInCubic, easeOutBack } from '@motion-canvas/core';

export default makeScene2D(function* (view) {
    // Outer scene container
    const sceneContainer = createRef<Node>();

    // --- LEFT: Thread 1 (Producer) ---
    const t1Box = createRef<Rect>();
    const t1Badge = createRef<Rect>();
    const t1BadgeText = createRef<Txt>();
    const t1Slot = createRef<Rect>();

    // --- CENTER TOP: Shared Data ---
    const dataBox = createRef<Rect>();
    const dataCondBadge = createRef<Rect>();
    const dataCondText = createRef<Txt>();
    const dataQueueSlot = createRef<Rect>();

    // --- CENTER BOTTOM: Condition Variable (cv) ---
    const cvBox = createRef<Rect>();
    const cvCore = createRef<Circle>();
    const cvCoreTxt = createRef<Txt>();
    const cvRing1 = createRef<Circle>();
    const cvRing2 = createRef<Circle>();
    const cvBadge = createRef<Rect>();
    const cvBadgeText = createRef<Txt>();

    // --- RIGHT: Worker Threads ---
    const t2Box = createRef<Rect>();
    const t2Badge = createRef<Rect>();
    const t2BadgeText = createRef<Txt>();
    const t2Slot = createRef<Rect>();

    const t3Box = createRef<Rect>();
    const t3Badge = createRef<Rect>();
    const t3BadgeText = createRef<Txt>();
    const t3Slot = createRef<Rect>();

    // --- Dotted Lines from Threads to CV Block ---
    const lineP1ToCV = createRef<Line>();
    const lineCVToT2 = createRef<Line>();
    const lineCVToT3 = createRef<Line>();

    // --- Pulses & Traveling Particles ---
    const pulseP1ToCV = createRef<Circle>();
    const pulseCVToT2 = createRef<Circle>();
    const pulseCVToT3 = createRef<Circle>();

    // --- Data Items ---
    const item1 = createRef<Rect>();
    const item1Txt = createRef<Txt>();
    const item2 = createRef<Rect>();
    const item2Txt = createRef<Txt>();
    const item3 = createRef<Rect>();
    const item3Txt = createRef<Txt>();

    // Card coordinate centers
    const p1Pos: [number, number] = [-580, 0];
    const dataPos: [number, number] = [0, -180];
    const cvPos: [number, number] = [0, 180];
    const t2Pos: [number, number] = [580, -145];
    const t3Pos: [number, number] = [580, 145];

    // Exact slot centers (in sceneContainer coordinate space)
    const t1SlotCenter: [number, number] = [-580, 55];
    const dataSlotCenter: [number, number] = [0, -155];
    const t2SlotCenter: [number, number] = [580, -120];
    const t3SlotCenter: [number, number] = [580, 170];

    // Dotted line height matching dead center of CV box and CV orb
    const cvLineY = 180;

    yield view.add(
        <Node ref={sceneContainer} opacity={1} scale={0.96}>
            {/* ========================================================= */}
            {/* 1. DOTTED CIRCUIT LINES (Threads to CV Block)              */}
            {/* ========================================================= */}

            {/* Thread 1 -> CV (Grows out from CV left [-270, 180] to Thread 1 [-390, 180]) */}
            <Line
                ref={lineP1ToCV}
                points={[
                    [-270, cvLineY],
                    [-390, cvLineY],
                ]}
                stroke={'#C084FC'}
                lineWidth={4.5}
                lineDash={[10, 10]}
                shadowBlur={10}
                shadowColor={'rgba(192, 132, 252, 0.6)'}
                opacity={0.95}
                end={0}
            />

            {/* CV -> Thread 2 (Grows out from CV right [270, 180] to Thread 2 [390, -145]) */}
            <Line
                ref={lineCVToT2}
                points={[
                    [270, cvLineY],
                    [330, cvLineY],
                    [330, -145],
                    [390, -145],
                ]}
                radius={18}
                stroke={'#C084FC'}
                lineWidth={4.5}
                lineDash={[10, 10]}
                shadowBlur={10}
                shadowColor={'rgba(192, 132, 252, 0.6)'}
                opacity={0.95}
                end={0}
            />

            {/* CV -> Thread 3 (Grows out from CV right [270, 180] to Thread 3 [390, 145]) */}
            <Line
                ref={lineCVToT3}
                points={[
                    [270, cvLineY],
                    [330, cvLineY],
                    [330, 145],
                    [390, 145],
                ]}
                radius={10}
                stroke={'#C084FC'}
                lineWidth={4.5}
                lineDash={[10, 10]}
                shadowBlur={10}
                shadowColor={'rgba(192, 132, 252, 0.6)'}
                opacity={0.95}
                end={0}
            />

            {/* ========================================================= */}
            {/* 2. MAIN CONTAINER CARDS                                   */}
            {/* ========================================================= */}

            {/* --- THREAD 1 (Producer) --- */}
            <Rect
                ref={t1Box}
                x={p1Pos[0]}
                y={p1Pos[1]}
                width={380}
                height={480}
                radius={24}
                fill={'#141D2D'}
                stroke={'#4DABF7'}
                lineWidth={3.5}
                shadowBlur={22}
                shadowColor={'rgba(77, 171, 247, 0.25)'}
                layout={true}
                direction={'column'}
                alignItems={'center'}
                padding={[28, 24]}
                gap={16}
                opacity={0}
                scale={0.8}
            >
                <Txt text="Thread 1" fill="#4DABF7" fontSize={38} fontWeight={700} />
                <Txt text="Producer" fill="#868E96" fontSize={24} fontWeight={600} marginTop={-8} />

                <Rect
                    ref={t1Badge}
                    width={260}
                    height={48}
                    radius={14}
                    fill={'#1B283D'}
                    stroke={'#4DABF7'}
                    lineWidth={1.5}
                    alignItems={'center'}
                    justifyContent={'center'}
                >
                    <Txt ref={t1BadgeText} text="Idle" fill="#4DABF7" fontSize={22} fontWeight={700} />
                </Rect>

                {/* Staging slot */}
                <Rect
                    ref={t1Slot}
                    width={310}
                    height={210}
                    radius={18}
                    fill={'#0E1420'}
                    stroke={'#20324E'}
                    lineWidth={1.5}
                    alignItems={'center'}
                    justifyContent={'center'}
                />
            </Rect>

            {/* --- SHARED DATA (Top Center) --- */}
            <Rect
                ref={dataBox}
                x={dataPos[0]}
                y={dataPos[1]}
                width={540}
                height={230}
                radius={24}
                fill={'#262316'}
                stroke={'#FFD43B'}
                lineWidth={3.5}
                shadowBlur={22}
                shadowColor={'rgba(255, 212, 59, 0.25)'}
                layout={true}
                direction={'column'}
                alignItems={'center'}
                padding={[22, 24]}
                gap={16}
                opacity={0}
                scale={0.8}
            >
                <Layout layout={true} direction={'row'} alignItems={'center'} justifyContent={'space-between'} width={'100%'} height={44}>
                    <Txt text="Shared Data" fill="#FFD43B" fontSize={34} fontWeight={700} />
                    <Rect
                        ref={dataCondBadge}
                        padding={[8, 20]}
                        radius={12}
                        fill={'#36301C'}
                        stroke={'#FFD43B'}
                        lineWidth={1.5}
                        alignItems={'center'}
                        justifyContent={'center'}
                    >
                        <Txt ref={dataCondText} text="Condition: Empty" fill="#FFD43B" fontSize={20} fontWeight={700} />
                    </Rect>
                </Layout>

                {/* Queue Slots Container */}
                <Rect
                    ref={dataQueueSlot}
                    width={480}
                    height={115}
                    radius={16}
                    fill={'#18160E'}
                    stroke={'#423B20'}
                    lineWidth={1.5}
                    alignItems={'center'}
                    justifyContent={'center'}
                />
            </Rect>

            {/* --- CONDITION VARIABLE (Bottom Center - Perfectly Centered Orb) --- */}
            <Rect
                ref={cvBox}
                x={cvPos[0]}
                y={cvPos[1]}
                width={540}
                height={230}
                radius={24}
                fill={'#221B33'}
                stroke={'#B197FC'}
                lineWidth={3.5}
                shadowBlur={22}
                shadowColor={'rgba(177, 151, 252, 0.25)'}
                alignItems={'center'}
                justifyContent={'center'}
                opacity={0}
                scale={0.8}
            >
                {/* Header at Top */}
                <Txt text="std::condition_variable" fill="#B197FC" fontSize={32} fontWeight={700} y={-74} />

                {/* Expanding Wave Rings (Positioned at 0, 0 -> World [0, 180]) */}
                <Circle
                    ref={cvRing1}
                    size={84}
                    stroke={'#C084FC'}
                    lineWidth={3.5}
                    opacity={0}
                    position={[0, 0]}
                />
                <Circle
                    ref={cvRing2}
                    size={84}
                    stroke={'#C084FC'}
                    lineWidth={3.5}
                    opacity={0}
                    position={[0, 0]}
                />

                {/* Central Orb (Positioned at 0, 0 -> World [0, 180]) */}
                <Circle
                    ref={cvCore}
                    size={84}
                    fill={'rgba(0,0,0,0)'}
                    stroke={'#495057'}
                    lineWidth={2.5}
                    shadowBlur={0}
                    shadowColor={'#B197FC'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    position={[0, 0]}
                >
                    <Txt ref={cvCoreTxt} text="cv" fill="#6C757D" fontSize={32} fontWeight={800} />
                </Circle>

                {/* Badge at Bottom */}
                <Rect
                    ref={cvBadge}
                    layout={true}
                    padding={[8, 22]}
                    radius={12}
                    fill={'#30234A'}
                    stroke={'#B197FC'}
                    lineWidth={1.5}
                    alignItems={'center'}
                    justifyContent={'center'}
                    y={74}
                >
                    <Txt ref={cvBadgeText} text="Shared cv" fill="#B197FC" fontSize={20} fontWeight={700} />
                </Rect>
            </Rect>

            {/* --- THREAD 2 (Worker Top) --- */}
            <Rect
                ref={t2Box}
                x={t2Pos[0]}
                y={t2Pos[1]}
                width={380}
                height={230}
                radius={24}
                fill={'#1A1D24'}
                stroke={'#495057'}
                lineWidth={3.5}
                opacity={0}
                scale={0.8}
                layout={true}
                direction={'column'}
                alignItems={'center'}
                padding={[22, 24]}
                gap={16}
            >
                <Layout layout={true} direction={'row'} alignItems={'center'} justifyContent={'space-between'} width={'100%'} height={44}>
                    <Txt text="Thread 2" fill="#E9ECEF" fontSize={34} fontWeight={700} />
                    <Rect
                        ref={t2Badge}
                        padding={[8, 20]}
                        radius={12}
                        fill={'#252932'}
                        stroke={'#6C757D'}
                        lineWidth={1.5}
                        alignItems={'center'}
                        justifyContent={'center'}
                    >
                        <Txt ref={t2BadgeText} text="💤 cv.wait()" fill="#ADB5BD" fontSize={20} fontWeight={700} />
                    </Rect>
                </Layout>

                <Rect
                    ref={t2Slot}
                    width={320}
                    height={115}
                    radius={16}
                    fill={'#101217'}
                    stroke={'#2D323E'}
                    lineWidth={1.5}
                    alignItems={'center'}
                    justifyContent={'center'}
                />
            </Rect>

            {/* --- THREAD 3 (Worker Bottom) --- */}
            <Rect
                ref={t3Box}
                x={t3Pos[0]}
                y={t3Pos[1]}
                width={380}
                height={230}
                radius={24}
                fill={'#1A1D24'}
                stroke={'#495057'}
                lineWidth={3.5}
                opacity={0}
                scale={0.8}
                layout={true}
                direction={'column'}
                alignItems={'center'}
                padding={[22, 24]}
                gap={16}
            >
                <Layout layout={true} direction={'row'} alignItems={'center'} justifyContent={'space-between'} width={'100%'} height={44}>
                    <Txt text="Thread 3" fill="#E9ECEF" fontSize={34} fontWeight={700} />
                    <Rect
                        ref={t3Badge}
                        padding={[8, 20]}
                        radius={12}
                        fill={'#252932'}
                        stroke={'#6C757D'}
                        lineWidth={1.5}
                        alignItems={'center'}
                        justifyContent={'center'}
                    >
                        <Txt ref={t3BadgeText} text="💤 cv.wait()" fill="#ADB5BD" fontSize={20} fontWeight={700} />
                    </Rect>
                </Layout>

                <Rect
                    ref={t3Slot}
                    width={320}
                    height={115}
                    radius={16}
                    fill={'#101217'}
                    stroke={'#2D323E'}
                    lineWidth={1.5}
                    alignItems={'center'}
                    justifyContent={'center'}
                />
            </Rect>

            {/* ========================================================= */}
            {/* 3. PULSES & FLYING DATA ITEMS                             */}
            {/* ========================================================= */}

            {/* Pulse: P1 -> CV (Travels strictly along dotted line: -390 to -270 at y = 180) */}
            <Circle
                ref={pulseP1ToCV}
                size={24}
                fill={'#C084FC'}
                shadowBlur={20}
                shadowColor={'#C084FC'}
                opacity={0}
                position={[-390, cvLineY]}
            />

            {/* Pulse: CV -> T2 (Travels strictly along dotted line: 270 to 390) */}
            <Circle
                ref={pulseCVToT2}
                size={24}
                fill={'#C084FC'}
                shadowBlur={20}
                shadowColor={'#C084FC'}
                opacity={0}
                position={[270, cvLineY]}
            />

            {/* Pulse: CV -> T3 (Travels strictly along dotted line: 270 to 390) */}
            <Circle
                ref={pulseCVToT3}
                size={24}
                fill={'#C084FC'}
                shadowBlur={20}
                shadowColor={'#C084FC'}
                opacity={0}
                position={[270, cvLineY]}
            />

            {/* Item 1 (Gold) */}
            <Rect
                ref={item1}
                width={80}
                height={80}
                radius={20}
                fill={'#FFD43B'}
                shadowBlur={24}
                shadowColor={'rgba(255, 212, 59, 0.45)'}
                alignItems={'center'}
                justifyContent={'center'}
                opacity={0}
                scale={0}
                position={t1SlotCenter}
                zIndex={100}
            >
                <Txt ref={item1Txt} text="1" fill="#1E202D" fontSize={38} fontWeight={800} />
            </Rect>

            {/* Item 2 (Cyan) */}
            <Rect
                ref={item2}
                width={80}
                height={80}
                radius={20}
                fill={'#4DABF7'}
                shadowBlur={24}
                shadowColor={'rgba(77, 171, 247, 0.45)'}
                alignItems={'center'}
                justifyContent={'center'}
                opacity={0}
                scale={0}
                position={[t1SlotCenter[0] - 50, t1SlotCenter[1]]}
                zIndex={100}
            >
                <Txt ref={item2Txt} text="2" fill="#1E202D" fontSize={38} fontWeight={800} />
            </Rect>

            {/* Item 3 (Green) */}
            <Rect
                ref={item3}
                width={80}
                height={80}
                radius={20}
                fill={'#51CF66'}
                shadowBlur={24}
                shadowColor={'rgba(81, 207, 102, 0.45)'}
                alignItems={'center'}
                justifyContent={'center'}
                opacity={0}
                scale={0}
                position={[t1SlotCenter[0] + 50, t1SlotCenter[1]]}
                zIndex={100}
            >
                <Txt ref={item3Txt} text="3" fill="#1E202D" fontSize={38} fontWeight={800} />
            </Rect>
        </Node>
    );

    // Helper: CV Lights Up & Emits Waves
    function* lightUpCV(intensity: number = 1) {
        cvRing1().size(84);
        cvRing1().opacity(0.9);
        cvRing1().scale(1);

        const ringAnims = [
            cvRing1().scale(3.2, 0.7, easeOutCubic),
            cvRing1().opacity(0, 0.7, easeOutCubic),
        ];

        if (intensity > 1) {
            cvRing2().size(84);
            cvRing2().opacity(0.9);
            cvRing2().scale(1);
            ringAnims.push(
                cvRing2().scale(4.0, 0.8, easeOutCubic),
                cvRing2().opacity(0, 0.8, easeOutCubic),
            );
        }

        yield* all(
            cvCore().fill('#845EF7', 0.25),
            cvCore().stroke('#B197FC', 0.25),
            cvCore().lineWidth(3.5, 0.25),
            cvCore().shadowBlur(35 * intensity, 0.25),
            cvCore().scale(1.18, 0.25, easeOutBack),
            cvCoreTxt().fill('#FFFFFF', 0.25),
            cvBox().stroke('#D0BFFF', 0.25),
            cvBox().shadowBlur(30 * intensity, 0.25),
            ...ringAnims
        );
    }

    // Helper: CV Returns to Dormant / Unlit state
    function* powerDownCV() {
        yield* all(
            cvCore().fill('rgba(0,0,0,0)', 0.4),
            cvCore().stroke('#495057', 0.4),
            cvCore().lineWidth(2.5, 0.4),
            cvCore().shadowBlur(0, 0.4),
            cvCore().scale(1.0, 0.4, easeInOutCubic),
            cvCoreTxt().fill('#6C757D', 0.4),
            cvBox().stroke('#B197FC', 0.4),
            cvBox().shadowBlur(20, 0.4),
        );
    }

    // Helper: Wake / Sleep Worker Thread
    function* setThreadActive(
        box: Rect,
        badge: Rect,
        badgeText: Txt,
        active: boolean,
    ) {
        if (active) {
            yield* all(
                box.opacity(1, 0.3),
                box.stroke('#51CF66', 0.3),
                box.fill('#14281E', 0.3),
                box.shadowColor('rgba(81, 207, 102, 0.35)', 0.3),
                box.shadowBlur(28, 0.3),
                box.scale(1.04, 0.25, easeOutBack),
                badge.stroke('#51CF66', 0.25),
                badge.fill('#183324', 0.25),
                badgeText.text('⚡ Active', 0.25),
                badgeText.fill('#51CF66', 0.25),
            );
            yield* box.scale(1.0, 0.2, easeInOutCubic);
        } else {
            yield* all(
                box.opacity(0.8, 0.4),
                box.stroke('#495057', 0.4),
                box.fill('#1A1D24', 0.4),
                box.shadowColor('rgba(0,0,0,0)', 0.4),
                box.shadowBlur(0, 0.4),
                badge.stroke('#6C757D', 0.35),
                badge.fill('#252932', 0.35),
                badgeText.text('💤 cv.wait()', 0.35),
                badgeText.fill('#ADB5BD', 0.35),
            );
        }
    }

    // =========================================================================
    // ANIMATION TIMELINE
    // =========================================================================

    // --- STEP-BY-STEP REVEAL ENTRANCE ---

    // 1. First, Condition Variable box appears
    yield* all(
        cvBox().opacity(1, 0.7),
        cvBox().scale(1.0, 0.7, easeOutBack),
    );
    yield* waitFor(0.4);

    // 2. Dotted lines grow out from CV box to the threads
    yield* all(
        lineP1ToCV().end(1, 0.8, easeInOutCubic),
        lineCVToT2().end(1, 0.8, easeInOutCubic),
        lineCVToT3().end(1, 0.8, easeInOutCubic),
    );

    // 3. Thread boxes pop in as the lines connect to them
    yield* all(
        t1Box().opacity(1, 0.6),
        t1Box().scale(1.0, 0.6, easeOutBack),
        t2Box().opacity(0.8, 0.6),
        t2Box().scale(1.0, 0.6, easeOutBack),
        t3Box().opacity(0.8, 0.6),
        t3Box().scale(1.0, 0.6, easeOutBack),
    );
    yield* waitFor(0.4);

    // 4. Finally, Shared Data box appears on top
    yield* all(
        dataBox().opacity(1, 0.7),
        dataBox().scale(1.0, 0.7, easeOutBack),
    );
    yield* waitFor(0.8);

    // =========================================================================
    // ACT 1: cv.notify_one()
    // =========================================================================

    // 1. Thread 1 produces Item 1
    item1().position(t1SlotCenter);

    yield* all(
        t1BadgeText().text('Push Data', 0.3),
        t1Badge().fill('#1B2F4A', 0.3),
        t1Box().shadowBlur(30, 0.3),
        item1().opacity(1, 0.4),
        item1().scale(1, 0.4, easeOutBack),
    );

    yield* waitFor(0.4);

    // Item 1 travels into Shared Data (perfect center)
    yield* all(
        item1().position(dataSlotCenter, 0.7, easeInOutCubic),
        t1BadgeText().text('Ready', 0.3),
        t1Badge().fill('#22293D', 0.3),
        t1Box().shadowBlur(20, 0.3),
    );

    // Data container acknowledges condition is now true
    yield* all(
        dataBox().stroke('#FFE066', 0.2),
        dataBox().shadowBlur(35, 0.2),
        dataCondBadge().fill('#3B331A', 0.2),
        dataCondText().text('Condition: Ready (1)', 0.2),
    );
    yield* dataBox().stroke('#FFD43B', 0.3);

    yield* waitFor(0.5);

    // 2. Thread 1 calls cv.notify_one()
    yield* all(
        t1BadgeText().text('cv.notify_one()', 0.3),
        t1Badge().fill('#321F4B', 0.3),
        t1Badge().stroke('#B197FC', 0.3),
        t1BadgeText().fill('#B197FC', 0.3),
    );

    // Pulse travels along dotted line: from Thread 1 edge (-390) to CV edge (-270) at y = 180
    pulseP1ToCV().position([-390, cvLineY]);
    yield* pulseP1ToCV().opacity(1, 0.15);
    yield* pulseP1ToCV().position([-270, cvLineY], 1.0, easeInOutCubic);
    yield* pulseP1ToCV().opacity(0, 0.1);

    // CV Orb lights up and emits wave directly from dead center (0, 180)!
    yield* all(
        lightUpCV(1.0),
        cvBadgeText().text('notify_one()', 0.2),
    );

    // Notification pulse emerges from CV right edge (270) and travels along dotted line to Thread 2 edge (390)
    pulseCVToT2().position([270, cvLineY]);
    yield* pulseCVToT2().opacity(1, 0.15);

    yield* pulseCVToT2().position([330, cvLineY], 0.35, easeInOutCubic);
    yield* pulseCVToT2().position([330, -145], 0.65, easeInOutCubic);
    yield* pulseCVToT2().position([390, -145], 0.35, easeInOutCubic);
    yield* pulseCVToT2().opacity(0, 0.1);

    // Thread 2 wakes up! CV orb powers down back to empty
    yield* all(
        setThreadActive(t2Box(), t2Badge(), t2BadgeText(), true),
        powerDownCV(),
    );

    yield* waitFor(0.4);

    // 3. Thread 2 takes Item 1 from Shared Data into its slot center
    yield* all(
        item1().position(t2SlotCenter, 0.6, easeInOutCubic),
        dataCondText().text('Condition: Empty', 0.3),
        dataCondBadge().fill('#2A2618', 0.3),
    );

    // Thread 2 works on Item 1
    yield* all(
        item1().scale(1.15, 0.4, easeInOutCubic),
        t2Box().shadowBlur(36, 0.4),
    );
    yield* item1().scale(1.0, 0.4, easeInOutCubic);

    // Item completes
    yield* item1Txt().text('✓', 0.2);
    yield* waitFor(0.3);
    yield* all(
        item1().opacity(0, 0.35),
        item1().scale(0, 0.35, easeInCubic),
    );

    // Thread 2 returns to sleep (wait on condition)
    yield* setThreadActive(t2Box(), t2Badge(), t2BadgeText(), false);
    yield* all(
        t1BadgeText().text('Idle', 0.3),
        t1Badge().fill('#22293D', 0.3),
        t1Badge().stroke('#4DABF7', 0.3),
        t1BadgeText().fill('#4DABF7', 0.3),
        cvBadgeText().text('Shared cv', 0.3),
    );

    yield* waitFor(0.9);

    // =========================================================================
    // ACT 2: cv.notify_all()
    // =========================================================================

    // 1. Thread 1 produces 2 items
    item2().position([t1SlotCenter[0] - 50, t1SlotCenter[1]]);
    item3().position([t1SlotCenter[0] + 50, t1SlotCenter[1]]);
    item2Txt().text('2');
    item3Txt().text('3');

    yield* all(
        t1BadgeText().text('Push Data (x2)', 0.3),
        t1Badge().fill('#1B2F4A', 0.3),
        t1Box().shadowBlur(30, 0.3),
        item2().opacity(1, 0.4),
        item2().scale(1, 0.4, easeOutBack),
        item3().opacity(1, 0.4),
        item3().scale(1, 0.4, easeOutBack),
    );

    yield* waitFor(0.4);

    // Both items travel into Shared Data Queue (centered symmetrically)
    yield* all(
        item2().position([dataSlotCenter[0] - 55, dataSlotCenter[1]], 0.7, easeInOutCubic),
        item3().position([dataSlotCenter[0] + 55, dataSlotCenter[1]], 0.7, easeInOutCubic),
        t1BadgeText().text('Ready', 0.3),
        t1Badge().fill('#22293D', 0.3),
        t1Box().shadowBlur(20, 0.3),
    );

    // Data container acknowledges condition is true for 2 items
    yield* all(
        dataBox().stroke('#FFE066', 0.2),
        dataBox().shadowBlur(35, 0.2),
        dataCondBadge().fill('#3B331A', 0.2),
        dataCondText().text('Condition: Ready (2)', 0.2),
    );
    yield* dataBox().stroke('#FFD43B', 0.3);

    yield* waitFor(0.5);

    // 2. Thread 1 calls cv.notify_all()
    yield* all(
        t1BadgeText().text('cv.notify_all()', 0.3),
        t1Badge().fill('#321F4B', 0.3),
        t1Badge().stroke('#B197FC', 0.3),
        t1BadgeText().fill('#B197FC', 0.3),
    );

    // Pulse travels along dotted line: from Thread 1 edge (-390) to CV edge (-270) at y = 180
    pulseP1ToCV().position([-390, cvLineY]);
    yield* pulseP1ToCV().opacity(1, 0.15);
    yield* pulseP1ToCV().position([-270, cvLineY], 1.0, easeInOutCubic);
    yield* pulseP1ToCV().opacity(0, 0.1);

    // CV flares up with double intensity
    yield* all(
        lightUpCV(1.4),
        cvBadgeText().text('notify_all()', 0.2),
    );

    // Dual notification pulses emerge from CV right edge (270) along dotted lines to Thread 2 & 3 edges (390)
    pulseCVToT2().position([270, cvLineY]);
    pulseCVToT3().position([270, cvLineY]);
    yield* all(
        pulseCVToT2().opacity(1, 0.15),
        pulseCVToT3().opacity(1, 0.15),
    );

    yield* all(
        pulseCVToT2().position([330, cvLineY], 0.35, easeInOutCubic),
        pulseCVToT3().position([330, cvLineY], 0.35, easeInOutCubic),
    );
    yield* all(
        pulseCVToT2().position([330, -145], 0.65, easeInOutCubic),
        pulseCVToT3().position([330, 145], 0.65, easeInOutCubic),
    );
    yield* all(
        pulseCVToT2().position([390, -145], 0.35, easeInOutCubic),
        pulseCVToT3().position([390, 145], 0.35, easeInOutCubic),
    );
    yield* all(
        pulseCVToT2().opacity(0, 0.1),
        pulseCVToT3().opacity(0, 0.1),
    );

    // BOTH threads wake up simultaneously! CV powers down
    yield* all(
        setThreadActive(t2Box(), t2Badge(), t2BadgeText(), true),
        setThreadActive(t3Box(), t3Badge(), t3BadgeText(), true),
        powerDownCV(),
    );

    yield* waitFor(0.4);

    // 3. Both threads consume data concurrently into their slot centers
    yield* all(
        item2().position(t2SlotCenter, 0.6, easeInOutCubic),
        item3().position(t3SlotCenter, 0.6, easeInOutCubic),
        dataCondText().text('Condition: Empty', 0.3),
        dataCondBadge().fill('#2A2618', 0.3),
    );

    // Parallel processing
    yield* all(
        item2().scale(1.15, 0.4, easeInOutCubic),
        item3().scale(1.15, 0.4, easeInOutCubic),
        t2Box().shadowBlur(36, 0.4),
        t3Box().shadowBlur(36, 0.4),
    );
    yield* all(
        item2().scale(1.0, 0.4, easeInOutCubic),
        item3().scale(1.0, 0.4, easeInOutCubic),
    );

    // Both complete tasks
    yield* all(
        item2Txt().text('✓', 0.2),
        item3Txt().text('✓', 0.2),
    );
    yield* waitFor(0.3);

    yield* all(
        item2().opacity(0, 0.35),
        item2().scale(0, 0.35, easeInCubic),
        item3().opacity(0, 0.35),
        item3().scale(0, 0.35, easeInCubic),
    );

    // Both threads return to sleep
    yield* all(
        setThreadActive(t2Box(), t2Badge(), t2BadgeText(), false),
        setThreadActive(t3Box(), t3Badge(), t3BadgeText(), false),
        t1BadgeText().text('Idle', 0.3),
        t1Badge().fill('#22293D', 0.3),
        t1Badge().stroke('#4DABF7', 0.3),
        t1BadgeText().fill('#4DABF7', 0.3),
        cvBadgeText().text('Shared cv', 0.3),
    );

    yield* waitFor(1.5);
});
