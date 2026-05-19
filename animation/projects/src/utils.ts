import { Code } from '@motion-canvas/2d';
import { BBox, all, DEFAULT, ThreadGenerator } from '@motion-canvas/core';

export function* centerOn(
    codeRef: Code,
    selectionInput: any,
    duration: number,
    targetFontSize?: number,
): ThreadGenerator {
    // We only care about the bounding box of the new selection
    let bboxes: BBox[] = [];
    if (selectionInput !== DEFAULT) {
        // getSelectionBBox computes the bounds for the given selection using the CURRENT layout state.
        // We do NOT need to set the selection signal to measure it!
        bboxes = codeRef.getSelectionBBox(selectionInput);
    }

    if (bboxes.length === 0) {
        const fallbackAnimations: ThreadGenerator[] = [
            codeRef.selection(selectionInput, duration),
            codeRef.y(0, duration)
        ];
        if (targetFontSize !== undefined) {
            fallbackAnimations.push(codeRef.fontSize(targetFontSize, duration));
        }
        yield* all(...fallbackAnimations);
        return;
    }

    let minY = Infinity;
    let maxY = -Infinity;

    for (const bbox of bboxes) {
        if (bbox.top !== undefined && !isNaN(bbox.top)) minY = Math.min(minY, bbox.top);
        if (bbox.bottom !== undefined && !isNaN(bbox.bottom)) maxY = Math.max(maxY, bbox.bottom);
    }

    let centerY = (minY + maxY) / 2;
    if (!isFinite(centerY) || isNaN(centerY)) {
        centerY = 0;
    }

    // Scale the calculated target offset based on how the font size will change.
    // This perfectly centers it without needing to pollute the animation timeline
    // with synchronous layout mutations.
    if (targetFontSize !== undefined) {
        const currentFontSize = codeRef.fontSize();
        if (currentFontSize > 0) {
            centerY = centerY * (targetFontSize / currentFontSize);
        }
    }

    const animations: ThreadGenerator[] = [
        codeRef.selection(selectionInput, duration),
        codeRef.y(-centerY, duration)
    ];

    if (targetFontSize !== undefined) {
        animations.push(codeRef.fontSize(targetFontSize, duration));
    }

    yield* all(...animations);
}
