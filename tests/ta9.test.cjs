// Run with node --test tests/ta9.test.cjs.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { circleModel, costModel, productModel } = require('../assets/js/ta9.js');
const close = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) < tolerance, `${a} ≠ ${b}`);

test('9.4: level intersections satisfy both equations, including tangency and equal axes', () => {
    for (const a of [0.5, 0.85, 1, 2, 3]) for (const b of [0.5, 1, 1.75, 2, 3]) {
        const { maximum, minimum } = circleModel(a, b, 0);
        for (const c of [0, minimum, (minimum + maximum) / 2, maximum, maximum * 1.1]) {
            const m = circleModel(a, b, c);
            for (const [x, y] of m.intersections) {
                close(x * x + y * y, 1);
                close(x * x / a ** 2 + y * y / b ** 2, c);
            }
            if (a !== b) {
                assert.equal(m.intersections.length, c < minimum || c > maximum ? 0 : c === minimum || c === maximum ? 2 : 4);
                for (const [x, y] of m.optimizers) close(x * x / a ** 2 + y * y / b ** 2, maximum);
            } else {
                assert.equal(m.optimizers, null, 'the entire circle maximizes');
                assert.equal(m.all, c === maximum);
            }
            // Every point of the drawn ellipse has exactly the selected value.
            for (let t = 0; t < 2 * Math.PI; t += 0.12) {
                close((m.rx * Math.cos(t)) ** 2 / a ** 2 + (m.ry * Math.sin(t)) ** 2 / b ** 2, c);
            }
        }
        assert.deepEqual(circleModel(-a, -b, maximum), circleModel(a, b, maximum));
    }
});

test('9.6: optimizer is feasible and globally cheapest across the slider range', () => {
    for (let i = 2; i <= 160; i++) {
        const p = i / 20, m = costModel(p, 0);
        close(m.x * m.y, 1);
        assert.ok(m.x >= m.y - 1e-9);
        close(m.x + p * m.y, m.value);
        for (let x = 1; x <= 12; x += 0.07) {
            // For positive p the cheapest feasible y at fixed x is 1/x.
            assert.ok(x + p / x >= m.value - 1e-9);
        }
        const h = 1e-5;
        close((costModel(p + h, 0).value - costModel(p - h, 0).value) / (2 * h), m.derivative, p === 1 ? 2e-6 : 1e-8);
    }
});

test('9.6: the highlighted segment is exactly the feasible part of each cost line', () => {
    for (const p of [0.1, 0.5, 0.95, 1, 1.05, 2, 4, 8]) {
        const v = costModel(p, 0).value;
        assert.equal(costModel(p, v - 0.01).segment.length, 0);
        const optimum = costModel(p, v);
        for (const [x, y] of optimum.segment) { close(x, optimum.x, 1e-7); close(y, optimum.y, 1e-7); }
        for (const c of [v + 0.01, v * 1.2, v * 1.65]) {
            const { segment } = costModel(p, c);
            assert.equal(segment.length, 2);
            for (const [x, y] of segment) {
                close(x + p * y, c);
                assert.ok(x * y >= 1 - 1e-8 && x >= y - 1e-8);
                assert.ok(Math.abs(x * y - 1) < 1e-8 || Math.abs(x - y) < 1e-8, 'endpoint lies on a binding constraint');
            }
            const [[lo], [hi]] = segment;
            for (let i = 0; i <= 250; i++) {
                const x = c * i / 250, y = (c - x) / p;
                const feasible = x > 0 && y > 0 && x * y >= 1 && x >= y;
                assert.equal(x >= lo && x <= hi, feasible);
            }
        }
    }
});

test('9.6: the regime switch at p=1 is smooth in value and first derivative', () => {
    const left = costModel(1 - 1e-7, 0), at = costModel(1, 0), right = costModel(1 + 1e-7, 0);
    close(at.value, 2);
    close(at.derivative, 1);
    close(left.value, right.value, 3e-7);
    close(left.derivative, right.derivative, 1e-7);
    assert.equal(left.x, 1);
    assert.ok(right.x > 1 && right.y < 1);
});

test('9.5: highlighted arcs satisfy the level and both constraints, with endpoints on the boundary', () => {
    for (let i = -130; i <= 130; i++) {
        const c = i / 100, m = productModel(c);
        assert.equal(m.segments.length, Math.abs(c) > 1 ? 0 : 2);
        assert.equal(m.intersections.length, Math.abs(c) > 1 ? 0 : Math.abs(c) === 1 ? 2 : 4);
        for (const points of m.segments) for (const [x, y] of points) {
            close(x * y, c);
            assert.ok(x * x + 2 * y * y <= 3 + 1e-8);
            assert.ok(2 * x * x + y * y <= 3 + 1e-8);
        }
        for (const [x, y] of m.intersections) {
            assert.ok(Math.min(Math.abs(x * x + 2 * y * y - 3), Math.abs(2 * x * x + y * y - 3)) < 1e-8);
        }
        for (const [x, y] of m.optimizers) {
            close(x * y, m.maximum);
            close(x * x + 2 * y * y, 3);
            close(2 * x * x + y * y, 3);
        }
    }
});

test('9.5: highlighted arcs include exactly the feasible part of a nonzero hyperbola', () => {
    for (const c of [-1.3, -1, -0.999, -0.75, -0.01, -0.001, 0.001, 0.01, 0.5, 0.999, 1, 1.3]) {
        const { segments } = productModel(c);
        for (let i = -240; i <= 240; i++) {
            if (i === 0) continue;
            const x = i / 100, y = c / x;
            const feasible = x * x + 2 * y * y <= 3 + 1e-9 && 2 * x * x + y * y <= 3 + 1e-9;
            const highlighted = segments.some(points => {
                const ends = [points[0][0], points[points.length - 1][0]];
                return x >= Math.min(...ends) - 1e-9 && x <= Math.max(...ends) + 1e-9;
            });
            assert.equal(highlighted, feasible, `c=${c}, x₁=${x}`);
        }
    }
});

test('9.5: the zero level is two axis segments and the extrema have the correct signs', () => {
    const zero = productModel(0), r = Math.sqrt(1.5);
    assert.deepEqual(zero.segments, [[[-r, 0], [r, 0]], [[0, -r], [0, r]]]);
    assert.deepEqual(productModel(1).intersections, [[1, 1], [-1, -1]]);
    assert.deepEqual(productModel(-1).intersections, [[1, -1], [-1, 1]]);
    for (let i = -180; i <= 180; i += 3) for (let j = -180; j <= 180; j += 3) {
        const x = i / 100, y = j / 100;
        if (x * x + 2 * y * y <= 3 && 2 * x * x + y * y <= 3) {
            assert.ok(x * y <= zero.maximum && x * y >= zero.minimum);
        }
    }
});
