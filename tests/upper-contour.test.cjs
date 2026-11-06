// Run with: node --test tests/upper-contour.test.cjs
// Exercise the actual controller and its SVG output without browser dependencies.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');

const repo = join(__dirname, '..');
const source = readFileSync(join(repo, 'assets/js/upper-contour.js'), 'utf8');
const template = readFileSync(join(repo, 'layouts/_default/upper-contour.html'), 'utf8');
const numbers = (path) => (path.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi) || []).map(Number);
const close = (a, b, message) => assert.ok(Math.abs(a - b) < 1e-9, `${message}: ${a} vs ${b}`);
const unproject = (x, y) => [(x - 54) / 60 - 3.2, 3.6 - (y - 20) / 60];

function fixture() {
    const nodes = new Map();
    const frames = [];
    class Element {
        constructor(id = '') {
            this.id = id;
            this.attrs = new Map();
            this.listeners = new Map();
            this.style = { setProperty() {} };
            this.classList = { add() {}, remove() {} };
            this.textContent = '';
            this.children = [];
        }
        setAttribute(key, value) { this.attrs.set(key, String(value)); }
        getAttribute(key) { return this.attrs.get(key); }
        toggleAttribute(key, enabled) { if (enabled) this.attrs.set(key, ''); else this.attrs.delete(key); }
        addEventListener(type, callback) { this.listeners.set(type, callback); }
        appendChild(child) { this.children.push(child); }
        getBoundingClientRect() { return { width: 672, height: this.id === 'header' ? 60 : 467 }; }
        getScreenCTM() { return { inverse: () => ({ scale: 2 }) }; }
        setPointerCapture(id) { this.captured = id; }
        hasPointerCapture(id) { return this.captured === id; }
        releasePointerCapture() { this.captured = null; }
        focus() {}
    }
    for (const [, id] of template.matchAll(/id="([^"]+)"/g)) nodes.set(id, new Element(id));
    nodes.get('upper-contour').parentElement = new Element('main');
    nodes.set('header', new Element('header'));
    runInNewContext(source, {
        document: {
            getElementById: (id) => nodes.get(id),
            querySelector: () => nodes.get('header'),
            createElementNS: () => new Element(),
        },
        ResizeObserver: class { observe() {} },
        DOMPoint: class {
            constructor(x, y) { this.x = x; this.y = y; }
            matrixTransform(matrix) { return { x: this.x * matrix.scale, y: this.y * matrix.scale }; }
        },
        requestAnimationFrame(callback) { frames.push(callback); return frames.length; },
    });
    const node = (id) => nodes.get(`uc-${id}`);
    function event(id, type, values = {}) {
        node(id).listeners.get(type)({ preventDefault() {}, ...values });
        while (frames.length) frames.shift()();
    }
    function select(fn) { node('function').value = fn; event('function', 'change'); }
    function layers() { for (const id of ['point', 'vector', 'plane']) event(`${id}-toggle`, 'click'); }
    function point() { return unproject(...numbers(node('point').getAttribute('transform'))); }
    function move(x, y, pointerType = 'mouse') {
        const [sx, sy] = numbers(node('point').getAttribute('transform'));
        const base = { pointerId: 7, pointerType, button: 0 };
        event('point', 'pointerdown', { ...base, clientX: sx / 2, clientY: sy / 2 });
        event('point', 'pointermove', { ...base, clientX: (54 + (x + 3.2) * 60) / 2, clientY: (20 + (3.6 - y) * 60) / 2 });
        event('point', 'pointerup', base);
    }
    return { node, event, select, layers, point, move, hidden: (id) => node(id).attrs.has('hidden') };
}

test('initial state shows only the zero contour; switching function and reset restore it', () => {
    const ui = fixture();
    assert.match(ui.node('contour').getAttribute('d'), /Q/);
    for (const id of ['point-layer', 'upper-set', 'vector-layer', 'plane-layer', 'halfspace', 'values']) assert.ok(ui.hidden(id));
    assert.ok(ui.node('vector-toggle').disabled);
    assert.ok(ui.node('plane-toggle').disabled);
    ui.layers();
    ui.select('kinky');
    assert.doesNotMatch(ui.node('contour').getAttribute('d'), /Q/);
    assert.ok(ui.hidden('point-layer'));
    ui.layers();
    ui.event('reset', 'click');
    assert.ok(ui.hidden('upper-set'));
    assert.ok(ui.hidden('plane-layer'));
    assert.doesNotMatch(ui.node('contour').getAttribute('d'), /Q/);
});

test('progressive toggles remove dependent layers and halfspace can be toggled independently', () => {
    const ui = fixture();
    ui.layers();
    for (const id of ['point-layer', 'upper-set', 'vector-layer', 'plane-layer', 'halfspace']) assert.ok(!ui.hidden(id));
    ui.node('halfspace-toggle').checked = false;
    ui.event('halfspace-toggle', 'change');
    assert.ok(ui.hidden('halfspace'));
    assert.ok(!ui.hidden('plane-layer'));
    ui.event('plane-toggle', 'click');
    assert.ok(ui.hidden('plane-layer'));
    assert.ok(!ui.hidden('vector-layer'));
    ui.event('plane-toggle', 'click');
    ui.event('vector-toggle', 'click');
    assert.ok(ui.hidden('plane-layer'));
    assert.ok(ui.hidden('vector-layer'));
    assert.ok(ui.node('plane-toggle').disabled);
    ui.event('point-toggle', 'click');
    assert.ok(ui.hidden('upper-set'));
    assert.ok(ui.node('vector-toggle').disabled);
});

test('mouse and touch drags, keyboard steps, and viewport clamping update the point and level', () => {
    const ui = fixture();
    ui.layers();
    ui.move(2, -1.25);
    close(ui.point()[0], 2, 'mouse x');
    close(ui.point()[1], -1.25, 'mouse y');
    assert.equal(ui.node('level').textContent, '0.44');
    assert.equal(ui.node('p-value').textContent, '(1, 2.50)');
    ui.move(-0.5, 2, 'touch');
    close(ui.point()[0], -0.5, 'touch x');
    close(ui.point()[1], 2, 'touch y');
    assert.equal(ui.node('level').textContent, '−4.50');
    ui.event('point', 'keydown', { key: 'ArrowRight', shiftKey: true });
    close(ui.point()[0], 0, 'large keyboard step');
    ui.event('point', 'keydown', { key: 'ArrowDown' });
    close(ui.point()[1], 1.9, 'small keyboard step');
    ui.move(100, -100);
    close(ui.point()[0], 5.95, 'x stays on screen');
    close(ui.point()[1], -3.15, 'y stays on screen');
    assert.equal(ui.node('point').captured, null);
});

test('kinky branches use their correct supergradients; snapping exposes the full kink interval', () => {
    const ui = fixture();
    ui.select('kinky');
    ui.layers();
    assert.equal(ui.node('p-value').textContent, '(1, −1.00)');
    assert.ok(ui.hidden('slider-control'));
    ui.move(1.25, -1);
    assert.equal(ui.node('p-value').textContent, '(1, 1.00)');
    ui.event('snap', 'click');
    close(ui.point()[1], 0, 'snap y');
    assert.ok(!ui.hidden('slider-control'));
    for (const t of [-1, -0.75, 0, 0.5, 1]) {
        ui.node('t').value = String(t);
        ui.event('t', 'input');
        const line = numbers(ui.node('plane').getAttribute('d'));
        const [x1, y1] = unproject(line[0], line[1]);
        const [x2, y2] = unproject(line[2], line[3]);
        close(-(x2 - x1) / (y2 - y1), t, 'slider rotates supporting line');
    }
    ui.move(1.25, 0.03, 'touch');
    close(ui.point()[1], 0, 'touch snap zone reaches exact kink');
    ui.event('point', 'keydown', { key: 'ArrowDown' });
    assert.ok(ui.hidden('slider-control'));
    assert.equal(ui.node('p-value').textContent, '(1, 1.00)');
});

function insideConvexPolygon(point, polygon) {
    let positive = false, negative = false;
    for (let i = 0; i < polygon.length; i++) {
        const a = polygon[i], b = polygon[(i + 1) % polygon.length];
        const cross = (b[0] - a[0]) * (point[1] - a[1]) - (b[1] - a[1]) * (point[0] - a[0]);
        if (cross > 1e-8) positive = true;
        if (cross < -1e-8) negative = true;
    }
    return !(positive && negative);
}

test('exact rendered contours and halfspace polygons satisfy containment across both functions', () => {
    const ui = fixture();
    let samples = 0;
    for (const fn of ['quadratic', 'kinky']) {
        ui.select(fn);
        ui.layers();
        for (const x of [-2.5, 0, 2, 5.5]) for (const y of [-3, -1, 0, 0.1, 1.5, 3]) {
            ui.move(x, y);
            for (const t of fn === 'kinky' && y === 0 ? [-1, -0.5, 0, 0.5, 1] : [0]) {
                ui.node('t').value = String(t);
                ui.event('t', 'input');
                const cost = (v) => fn === 'quadratic' ? v * v : Math.abs(v);
                const level = x - cost(y);
                const p2 = fn === 'quadratic' ? -2 * y : y > 0 ? -1 : y < 0 ? 1 : t;
                const line = numbers(ui.node('plane').getAttribute('d'));
                for (let i = 0; i < 4; i += 2) {
                    const q = unproject(line[i], line[i + 1]);
                    close(q[0] - x + p2 * (q[1] - y), 0, 'supporting line through x*');
                }
                const contour = numbers(ui.node('contour').getAttribute('d'));
                for (let i = 0; i <= 40; i++) {
                    const u = i / 40;
                    let sx, sy;
                    if (fn === 'quadratic') {
                        sx = (1 - u) ** 2 * contour[0] + 2 * u * (1 - u) * contour[2] + u ** 2 * contour[4];
                        sy = (1 - u) ** 2 * contour[1] + 2 * u * (1 - u) * contour[3] + u ** 2 * contour[5];
                    } else {
                        const j = u <= 0.5 ? 0 : 2, v = u <= 0.5 ? u * 2 : (u - 0.5) * 2;
                        sx = contour[j] + v * (contour[j + 2] - contour[j]);
                        sy = contour[j + 1] + v * (contour[j + 3] - contour[j + 1]);
                    }
                    const q = unproject(sx, sy);
                    close(q[0] - cost(q[1]), level, 'SVG is exact level contour');
                }
                assert.ok(ui.node('upper-set').getAttribute('d').startsWith(ui.node('contour').getAttribute('d')));
                const coords = numbers(ui.node('halfspace').getAttribute('d'));
                const polygon = [];
                for (let i = 0; i < coords.length; i += 2) polygon.push(unproject(coords[i], coords[i + 1]));
                for (let qy = -3.5; qy <= 3.5; qy += 0.25) for (let qx = -3; qx <= 7; qx += 0.25) {
                    const dot = qx - x + p2 * (qy - y);
                    // Compare the actual hatched polygon with the intended halfspace.
                    if (Math.abs(dot) > 1e-8) assert.equal(insideConvexPolygon([qx, qy], polygon), dot > 0);
                    if (qx - cost(qy) >= level - 1e-9) {
                        assert.ok(dot >= -1e-9, 'every sampled UPC point is in H+');
                        assert.ok(insideConvexPolygon([qx, qy], polygon));
                    }
                    samples++;
                }
                const arrow = numbers(ui.node('vector').getAttribute('d'));
                const tip = unproject(arrow[2], arrow[3]);
                assert.ok(tip[0] - cost(tip[1]) >= level, 'arrow tip points into UPC');
                close((tip[1] - y) / (tip[0] - x), p2, 'arrow has correct direction');
            }
        }
    }
    assert.ok(samples > 70000);
});
