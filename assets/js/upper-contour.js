(() => {
    'use strict';

    const root = document.getElementById('upper-contour');
    if (!root) return;
    const el = (name) => document.getElementById(`uc-${name}`);
    const svg = el('plot');
    // Equal units on both axes. All geometry is computed in (x₁, x₂) space.
    const box = { xmin: -3.2, xmax: 7.4, ymin: -3.6, ymax: 3.6 };
    const px = (x) => 54 + (x - box.xmin) * 60;
    const py = (y) => 20 + (box.ymax - y) * 60;
    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const format = (value) => (Math.abs(value) < 0.005 ? 0 : value).toFixed(2).replace('-', '−');
    const state = { fn: 'quadratic', point: false, vector: false, plane: false, halfspace: true, x: 1.5, y: 1, t: 0 };
    let activePointer = null;
    let pointerOffset = { x: 0, y: 0 };
    let frame = null;

    const isKink = () => state.fn === 'kinky' && state.y === 0;
    const cost = (y) => state.fn === 'quadratic' ? y * y : Math.abs(y);
    const slope = () => state.fn === 'quadratic' ? -2 * state.y : (state.y > 0 ? -1 : state.y < 0 ? 1 : state.t);
    const visible = (name, show) => { el(name).toggleAttribute('hidden', !show); };
    const text = (name, value) => { el(name).textContent = value; };
    const position = (name, x, y) => {
        el(name).setAttribute('x', x);
        el(name).setAttribute('y', y);
    };
    const path = (points, close = false) => points.length ? points.map(([x, y], i) => `${i ? 'L' : 'M'}${px(x)},${py(y)}`).join(' ') + (close ? ' Z' : '') : '';

    // Clip the actual halfspace to the viewport, including vertical supporting lines.
    function halfspacePolygon(p2, rhs) {
        const corners = [[box.xmin, box.ymin], [box.xmax, box.ymin], [box.xmax, box.ymax], [box.xmin, box.ymax]];
        const result = [];
        for (let i = 0; i < corners.length; i++) {
            const a = corners[i], b = corners[(i + 1) % corners.length];
            const da = a[0] + p2 * a[1] - rhs, db = b[0] + p2 * b[1] - rhs;
            if (da >= 0) result.push(a);
            if ((da >= 0) !== (db >= 0)) {
                const t = da / (da - db);
                result.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
            }
        }
        return result;
    }

    function setupAxes() {
        const ns = 'http://www.w3.org/2000/svg';
        function append(parent, tag, attributes, value) {
            const node = document.createElementNS(ns, tag);
            Object.entries(attributes).forEach(([key, val]) => node.setAttribute(key, val));
            if (value !== undefined) node.textContent = value;
            el(parent).appendChild(node);
        }
        for (let x = -3; x <= 7; x++) {
            append('grid', 'path', { d: path([[x, box.ymin], [x, box.ymax]]) });
            append('ticks', 'text', { x: px(x), y: 474, 'text-anchor': 'middle' }, x);
        }
        for (let y = -3; y <= 3; y++) {
            append('grid', 'path', { d: path([[box.xmin, y], [box.xmax, y]]) });
            append('ticks', 'text', { x: 40, y: py(y) + 4, 'text-anchor': 'end' }, y);
        }
        append('axes', 'path', { d: path([[box.xmin, 0], [box.xmax, 0]]) });
        append('axes', 'path', { d: path([[0, box.ymin], [0, box.ymax]]) });
    }

    function render() {
        const level = state.point ? state.x - cost(state.y) : 0;
        const p2 = slope();
        const rhs = state.x + p2 * state.y;
        // An exact SVG quadratic Bézier; the kink uses two exact line segments.
        const low = box.ymin, high = box.ymax;
        const curveStart = `M${px(cost(low) + level)},${py(low)}`;
        const curve = state.fn === 'quadratic'
            ? `${curveStart} Q${px(low * high + level)},${py(0)} ${px(cost(high) + level)},${py(high)}`
            : `${curveStart} L${px(level)},${py(0)} L${px(cost(high) + level)},${py(high)}`;
        el('contour').setAttribute('d', curve);
        // Extend beyond the right edge even when a curve endpoint is offscreen.
        const farRight = Math.max(box.xmax, cost(low) + level, cost(high) + level) + 1;
        el('upper-set').setAttribute('d', `${curve} L${px(farRight)},${py(high)} L${px(farRight)},${py(low)} Z`);
        el('plane').setAttribute('d', path([[rhs - p2 * low, low], [rhs - p2 * high, high]]));
        el('halfspace').setAttribute('d', path(halfspacePolygon(p2, rhs), true));

        const x = px(state.x), y = py(state.y);
        el('point').setAttribute('transform', `translate(${x},${y})`);
        el('point').setAttribute('aria-label', `Move x star, currently (${format(state.x)}, ${format(state.y)}). Use arrow keys.`);
        position('point-label', x - 29, y - 14);
        // Show direction at a fixed length; the panel reports the unscaled vector.
        const scale = 1.2 / Math.hypot(1, p2);
        const tipX = px(state.x + scale), tipY = py(state.y + scale * p2);
        el('vector').setAttribute('d', `M${x},${y} L${tipX},${tipY}`);
        position('vector-label', tipX + 10, tipY + (p2 > 0 ? -9 : 19));
        // Place H near the lower viewport edge, or the nearest visible side edge.
        const sideYs = p2 === 0 ? [low, high] : [(rhs - box.xmin) / p2, (rhs - box.xmax) / p2];
        const visibleLow = Math.max(low, Math.min(...sideYs));
        const visibleHigh = Math.min(high, Math.max(...sideYs));
        const safeY = visibleLow + Math.min(0.35, (visibleHigh - visibleLow) / 2);
        position('plane-label', clamp(px(rhs - p2 * safeY) + 10, 70, 665), py(safeY) - 10);

        visible('point-layer', state.point);
        visible('upper-set', state.point);
        visible('vector-layer', state.vector);
        visible('plane-layer', state.plane);
        visible('halfspace', state.plane && state.halfspace);
        visible('halfspace-control', state.plane);
        visible('kink-controls', state.point && state.fn === 'kinky');
        visible('slider-control', state.point && isKink());
        visible('values', state.point);
        visible('p-value-row', state.vector);
        visible('plane-equations', state.plane);
        visible('upc-key', state.point);
        visible('vector-key', state.vector);
        visible('plane-key', state.plane);
        visible('halfspace-key', state.plane && state.halfspace);
        el('vector-toggle').disabled = !state.point;
        el('plane-toggle').disabled = !state.vector;
        el('vector-toggle').title = state.point ? 'Toggle supergradient' : 'Add x* + UPC first';
        el('plane-toggle').title = state.vector ? 'Toggle supporting hyperplane' : 'Add p first';
        for (const [name, enabled, label] of [['point', state.point, 'x* + UPC'], ['vector', state.vector, 'p'], ['plane', state.plane, 'Hyperplane']]) {
            text(`${name}-toggle`, `${enabled ? 'Remove' : 'Add'} ${label}`);
            el(`${name}-toggle`).setAttribute('aria-pressed', String(enabled));
        }
        text('status', state.point ? (state.plane ? 'Upper contour set ⊆ supporting halfspace' : state.vector ? 'Supergradient points into the upper contour set' : 'Upper contour set · f(x) ≥ f(x*)') : 'Zero-level contour · f(x) = 0');
        text('contour-key', state.point ? 'f(x) = f(x*)' : 'f(x) = 0');
        text('coordinates', `(${format(state.x)}, ${format(state.y)})`);
        text('level', format(level));
        text('p-value', `(1, ${format(p2)})`);
        const lhs = `x₁ ${p2 < 0 ? '−' : '+'} ${format(Math.abs(p2))}x₂`;
        text('plane-equation', `${lhs} = ${format(rhs)}`);
        text('halfspace-equation', `${lhs} ≥ ${format(rhs)}`);
        text('upc-equation', `${state.fn === 'quadratic' ? 'x₁ − x₂²' : 'x₁ − |x₂|'} ≥ ${format(level)}`);
        text('drag-help', `${state.point ? 'Drag x*' : 'Add x* + UPC to begin. Then drag x*'} with a mouse or touch, or focus it and use the arrow keys (Shift for larger steps).`);
        text('precision-note', `Values rounded to 2 decimals.${state.vector ? ' Arrow has a fixed display length; p above gives its components.' : ''}`);
        text('t-value', format(state.t));
        text('supergradient-rule', state.fn === 'quadratic' ? 'Quadratic: p = (1, −2x₂*).' : 'Kinky: p = (1, −1) for x₂* > 0; p = (1, 1) for x₂* < 0. At x₂* = 0, every p = (1, t), −1 ≤ t ≤ 1, is a supergradient.');
        text('plot-description', state.point ? `Upper contour set for the ${state.fn} function at x star (${format(state.x)}, ${format(state.y)}), level ${format(level)}.${state.vector ? ` Supergradient (1, ${format(p2)}).` : ''}${state.plane ? ' The dashed line supports this set in the x one, x two plane.' : ''}` : `Zero-level contour of the ${state.fn} function, without shading, a point, or a supporting line.`);
    }

    function scheduleRender() {
        if (frame === null) frame = requestAnimationFrame(() => { frame = null; render(); });
    }

    function endDrag() {
        if (activePointer !== null && el('point').hasPointerCapture(activePointer)) el('point').releasePointerCapture(activePointer);
        activePointer = null;
        el('point').classList.remove('uc-dragging');
    }

    function reset() {
        endDrag();
        Object.assign(state, { point: false, vector: false, plane: false, halfspace: true, x: 1.5, y: 1, t: 0 });
        el('t').value = '0';
        el('halfspace-toggle').checked = true;
        render();
    }

    function movePoint(x, y) {
        state.x = clamp(x, box.xmin + 0.45, box.xmax - 1.45);
        const boundedY = clamp(y, box.ymin + 0.45, box.ymax - 0.45);
        // A small snap zone makes the exact kink reachable with touch/keyboard.
        state.y = state.fn === 'kinky' && Math.abs(boundedY) < 0.06 ? 0 : boundedY;
        scheduleRender();
    }

    function pointerCoordinates(event) {
        const transform = svg.getScreenCTM();
        if (!transform) return null;
        const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(transform.inverse());
        return { x: (point.x - 54) / 60 + box.xmin, y: box.ymax - (point.y - 20) / 60 };
    }

    el('function').addEventListener('change', () => { state.fn = el('function').value; reset(); });
    el('reset').addEventListener('click', reset);
    el('point-toggle').addEventListener('click', () => {
        endDrag();
        state.point = !state.point;
        if (!state.point) { state.vector = false; state.plane = false; }
        render();
    });
    el('vector-toggle').addEventListener('click', () => {
        if (!state.point) return;
        state.vector = !state.vector;
        if (!state.vector) state.plane = false;
        render();
    });
    el('plane-toggle').addEventListener('click', () => { if (state.vector) { state.plane = !state.plane; render(); } });
    el('halfspace-toggle').addEventListener('change', () => { state.halfspace = el('halfspace-toggle').checked; render(); });
    el('snap').addEventListener('click', () => { state.y = 0; render(); });
    el('t').addEventListener('input', () => { state.t = Number(el('t').value); render(); });
    el('point').addEventListener('pointerdown', (event) => {
        if (!state.point || activePointer !== null || (event.pointerType === 'mouse' && event.button !== 0)) return;
        const coords = pointerCoordinates(event);
        if (!coords) return;
        event.preventDefault();
        activePointer = event.pointerId;
        pointerOffset = { x: state.x - coords.x, y: state.y - coords.y };
        el('point').setPointerCapture(activePointer);
        el('point').classList.add('uc-dragging');
        el('point').focus({ preventScroll: true });
    });
    el('point').addEventListener('pointermove', (event) => {
        if (event.pointerId !== activePointer) return;
        const coords = pointerCoordinates(event);
        if (coords) movePoint(coords.x + pointerOffset.x, coords.y + pointerOffset.y);
    });
    el('point').addEventListener('pointerup', (event) => { if (event.pointerId === activePointer) endDrag(); });
    el('point').addEventListener('pointercancel', (event) => { if (event.pointerId === activePointer) endDrag(); });
    el('point').addEventListener('lostpointercapture', endDrag);
    el('point').addEventListener('keydown', (event) => {
        const offsets = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
        if (!state.point || !offsets[event.key]) return;
        event.preventDefault();
        const step = event.shiftKey ? 0.5 : 0.1;
        movePoint(state.x + offsets[event.key][0] * step, state.y + offsets[event.key][1] * step);
    });

    // Keep the fixed site header clear and preserve readable labels/touch targets
    // when the SVG scales down in the narrow Codex preview or on a phone.
    const main = root.parentElement;
    main.classList.add('uc-main');
    const header = document.querySelector('.header');
    function resize() {
        main.style.setProperty('--uc-header-height', `${header.getBoundingClientRect().height}px`);
        const scale = 720 / Math.max(1, svg.getBoundingClientRect().width);
        root.style.setProperty('--uc-label-scale', String(Math.max(1, Math.min(2, scale))));
        root.style.setProperty('--uc-hit-radius', `${24 * scale}px`);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(header);
    observer.observe(svg);
    resize();
    setupAxes();
    render();
})();
