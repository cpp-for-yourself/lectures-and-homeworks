import { Code, Camera, Rect } from '@motion-canvas/2d';
import { BBox, all, DEFAULT, ThreadGenerator, Vector2 } from '@motion-canvas/core';

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

export function* zoomInOn(
    popupRect: Rect,
    camera: Camera,
    outlineRect: Rect,
    codeRef: Code,
    selectionInput: any,
    duration: number,
    options?: {
        padding?: number;
        outlinePadding?: number;
        maxZoom?: number;
        zoom?: number;
        maxPopupWidth?: number;
        maxPopupHeight?: number;
    }
): ThreadGenerator {
    let bboxes: BBox[] = [];
    if (selectionInput !== DEFAULT) {
        bboxes = codeRef.getSelectionBBox(selectionInput);
    }

    if (bboxes.length === 0) {
        return;
    }

    // Combine all selection bounding boxes
    const bboxInCode = BBox.fromBBoxes(...bboxes);

    // Transform local coordinates to the parent container's coordinate space.
    // This correctly accounts for the Code node's offsetX/offsetY and scale.
    const codeToContainerMatrix = codeRef.localToParent();
    const bboxInContainer = bboxInCode.transform(codeToContainerMatrix);
    
    const expandedBBox = bboxInContainer.expand(options?.outlinePadding ?? 8);
    const outlineCenter = expandedBBox.center;
    const outlineSize = expandedBBox.size;
    
    const targetPos = outlineCenter;

    const maxPopupWidth = options?.maxPopupWidth ?? 1000;
    const maxPopupHeight = options?.maxPopupHeight ?? 480;

    // Calculate target zoom
    let targetZoom = options?.zoom;
    if (targetZoom === undefined) {
        const zoomX = maxPopupWidth / outlineSize.width;
        const zoomY = maxPopupHeight / outlineSize.height;
        targetZoom = Math.min(zoomX, zoomY);
        if (options?.maxZoom !== undefined) {
            targetZoom = Math.min(targetZoom, options.maxZoom);
        }
    }

    const targetPopupSize = outlineSize.scale(targetZoom);

    const isOpening = popupRect.opacity() === 0 || popupRect.scale.x() === 0;

    if (isOpening) {
        // Save the final target position defined in the JSX/layout
        const finalPopupPos = popupRect.position();
        const finalPopupSize = targetPopupSize;

        // Snap popup to start exactly at the outline's position and size
        popupRect.position(outlineCenter);
        popupRect.size(outlineSize);
        popupRect.scale(1);
        popupRect.opacity(0);

        // Snap camera to center and zoom 1 to align with small code
        camera.position(targetPos);
        camera.zoom(1);

        // Snap outline immediately
        outlineRect.position(outlineCenter);
        outlineRect.size(outlineSize);
        outlineRect.opacity(0);

        // Animate opening (sliding, expanding and zooming)
        yield* all(
            popupRect.position(finalPopupPos, duration),
            popupRect.size(finalPopupSize, duration),
            popupRect.opacity(1, duration),
            camera.position(targetPos, duration),
            camera.zoom(targetZoom, duration),
            outlineRect.opacity(1, duration),
        );
    } else {
        // Smooth transition to a different code block
        yield* all(
            camera.position(targetPos, duration),
            camera.zoom(targetZoom, duration),
            outlineRect.position(outlineCenter, duration),
            outlineRect.size(outlineSize, duration),
            popupRect.size(targetPopupSize, duration)
        );
    }
}

export function* zoomOut(
    popupRect: Rect,
    outlineRect: Rect,
    duration: number,
): ThreadGenerator {
    yield* all(
        popupRect.opacity(0, duration),
        popupRect.scale(0.8, duration),
        outlineRect.opacity(0, duration),
    );
}

