/* Geometry is in mathematical coordinates; SVG uses the same scale on both axes. */
(() => {
    'use strict';
    const EPS = 1e-9;
    const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
    function circleModel(a, b, c) {
        const A = 1 / (a * a), B = 1 / (b * b);
        const equal = Math.abs(A - B) < EPS;
        const maximum = Math.max(A, B), minimum = Math.min(A, B);
        const optimizers = equal ? null : A > B ? [[-1, 0], [1, 0]] : [[0, -1], [0, 1]];
        let intersections = [];
        const all = equal && Math.abs(c - A) < EPS;
        if (!equal && c >= minimum - EPS && c <= maximum + EPS) {
            const x = Math.sqrt(clamp((c - B) / (A - B), 0, 1));
            const y = Math.sqrt(Math.max(0, 1 - x * x));
            const xs = x < EPS ? [0] : [-x, x];
            const ys = y < EPS ? [0] : [-y, y];
            intersections = xs.flatMap(u => ys.map(v => [u, v]));
        }
        return { maximum, minimum, equal, optimizers, intersections, all, rx: Math.abs(a) * Math.sqrt(c), ry: Math.abs(b) * Math.sqrt(c) };
    }
    function costModel(p, c) {
        const x = p <= 1 ? 1 : Math.sqrt(p), y = p <= 1 ? 1 : 1 / Math.sqrt(p);
        const value = p <= 1 ? 1 + p : 2 * Math.sqrt(p);
        let segment = [];
        if (c >= value - EPS) {
            const disc = Math.max(0, c * c - 4 * p), root = Math.sqrt(disc);
            const high = (c + root) / 2, low = Math.max(2 * p / (c + root), c / (1 + p));
            if (low <= high + EPS) segment = [[low, (c - low) / p], [high, (c - high) / p]];
        }
        return { x, y, value, derivative: y, segment };
    }
    function productBranch(c, from, to, sign = 1) {
        if (Math.abs(to - from) < EPS) return [[sign * from, sign * c / from]];
        return Array.from({ length: 201 }, (_, i) => {
            const x = from * (to / from) ** (i / 200);
            return [sign * x, sign * c / x];
        });
    }
    function productModel(c) {
        let segments = [];
        const k = Math.abs(c);
        if (c === 0) {
            const r = Math.sqrt(1.5);
            segments = [[[-r, 0], [r, 0]], [[0, -r], [0, r]]];
        } else if (k <= 1) {
            // Substitute x₂=c/x₁ into both constraints. Their admissible
            // intervals for x₁² overlap exactly when |c|≤1.
            const root = Math.sqrt(9 - 8 * k * k);
            const low = 2 * k / Math.sqrt(3 + root), high = Math.sqrt((3 + root) / 4);
            segments = [productBranch(c, low, high), productBranch(c, low, high, -1)];
        }
        const intersections = segments.flatMap(points => points.length === 1 ? points : [points[0], points[points.length - 1]]);
        return { maximum: 1, minimum: -1, optimizers: [[-1, -1], [1, 1]], segments, intersections };
    }
    // Export the actual geometry for numerical checks without a browser dependency.
    if (typeof module !== 'undefined' && module.exports) { module.exports = { circleModel, costModel, productModel }; return; }

    const root = document.getElementById('ta9');
    if (!root) return;
    const el = id => document.getElementById(`ta-${id}`);
    const ns = 'http://www.w3.org/2000/svg';
    const state = {
        exercise: '94',
        '94': { a: 1, b: 2, c: 0.5, optimal: false },
        '95': { c: 0.5, optimal: false },
        '96': { p: 4, c: 6, optimal: false },
    };
    const exerciseIds = ['94', '95', '96'];
    let box, px, py, unit;
    const fmt = v => (Math.abs(v) < 0.0005 ? 0 : v).toFixed(2).replace('-', '−');
    const text = (id, value) => { el(id).textContent = value; };
    const show = (id, visible) => { el(id).toggleAttribute('hidden', !visible); };
    const attr = (id, values) => Object.entries(values).forEach(([key, value]) => el(id).setAttribute(key, value));
    const path = (points, close = false) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${px(x)},${py(y)}`).join(' ') + (close ? ' Z' : '');
    function append(id, tag, attributes, value) {
        const node = document.createElementNS(ns, tag);
        Object.entries(attributes).forEach(([key, v]) => node.setAttribute(key, v));
        if (value !== undefined) node.textContent = value;
        el(id).appendChild(node);
    }
    function ellipse(id, rx, ry) { attr(id, { cx: px(0), cy: py(0), rx: rx * unit, ry: ry * unit }); }
    function dots(id, points) {
        el(id).replaceChildren();
        points.forEach(([x, y]) => append(id, 'circle', { cx: px(x), cy: py(y), r: id === 'optimizers' ? 6 : 4.5 }));
    }
    function axes() {
        box = state.exercise === '96' ? { lo: 0, hi: 4.8 } : { lo: -2.4, hi: 2.4 };
        unit = 530 / (box.hi - box.lo);
        px = x => 56 + (x - box.lo) * unit;
        py = y => 22 + (box.hi - y) * unit;
        ['grid', 'axes', 'ticks'].forEach(id => el(id).replaceChildren());
        const ticks = state.exercise === '96' ? [0, 1, 2, 3, 4] : [-2, -1, 0, 1, 2];
        ticks.forEach(t => {
            append('grid', 'path', { d: path([[t, box.lo], [t, box.hi], [t, box.lo]]) + path([[box.lo, t], [box.hi, t]]) });
            append('ticks', 'text', { x: px(t), y: 574, 'text-anchor': 'middle' }, t);
            append('ticks', 'text', { x: 40, y: py(t) + 4, 'text-anchor': 'end' }, t);
        });
        append('axes', 'path', { d: path([[box.lo, 0], [box.hi, 0]]) + path([[0, box.lo], [0, box.hi]]) });
        text('x-label', state.exercise === '94' ? 'x' : 'x₁');
        text('y-label', state.exercise === '94' ? 'y' : 'x₂');
    }
    const costLine = (p, c) => path([[0, c / p], [c, 0]]);
    function hyperbola(from, to) {
        // A dense log-spaced polyline keeps curvature accurate near both ends.
        return Array.from({ length: 401 }, (_, i) => {
            const x = from * (to / from) ** (i / 400);
            return [x, 1 / x];
        });
    }
    function renderCircle(s) {
        const m = circleModel(s.a, s.b, s.c);
        ellipse('circle', 1, 1);
        ellipse('ellipse', m.rx, m.ry);
        el('ghosts').replaceChildren();
        [0.25, 0.5, 0.75].forEach(t => append('ghosts', 'ellipse', {
            cx: px(0), cy: py(0), rx: s.a * Math.sqrt(t * m.maximum) * unit, ry: s.b * Math.sqrt(t * m.maximum) * unit,
        }));
        attr('feasible', { d: '' });
        dots('intersections', m.intersections);
        dots('optimizers', m.optimizers || []);
        if (m.equal) append('optimizers', 'ellipse', { cx: px(0), cy: py(0), rx: unit, ry: unit });
        text('regime', m.equal ? 'a² = b²' : s.a < s.b ? 'a² < b²' : 'a² > b²');
        text('insight-title', m.equal ? 'Every point on the circle wins.' : s.a < s.b ? 'The horizontal endpoints win.' : 'The vertical endpoints win.');
        text('insight-text', m.equal ? 'The level curve and feasible circle coincide at the maximum. All feasible points give the same value.' : `Raise c until the ellipse last touches the circle, at ${s.a < s.b ? '(±1, 0)' : '(0, ±1)'}. The smaller denominator gives the larger payoff.`);
        text('value-label', 'Maximum c*');
        text('value', fmt(m.maximum));
        text('solution', m.equal ? 'Entire unit circle' : s.a < s.b ? '(±1, 0)' : '(0, ±1)');
        text('status', m.all ? 'This level coincides with the whole feasible circle.' : m.intersections.length ? `${m.intersections.length} feasible points at this level${Math.abs(s.c - m.maximum) < EPS ? ' · maximum reached.' : '.'}` : s.c > m.maximum ? 'Above the maximum: no feasible point.' : 'Below the feasible values: no intersection.');
        text('plot-description', `Unit circle x squared plus y squared equals 1. Orange ellipse f equals ${fmt(s.c)}, with a magnitude ${fmt(s.a)} and b magnitude ${fmt(s.b)}. ${el('status').textContent}`);
    }
    function productLevel(c) {
        if (c === 0) return path([[box.lo, 0], [box.hi, 0]]) + path([[0, box.lo], [0, box.hi]]);
        return [1, -1].map(sign => path(productBranch(c, Math.abs(c) / box.hi, box.hi, sign))).join(' ');
    }
    function renderProduct(s) {
        const m = productModel(s.c);
        ellipse('product-boundary-1', Math.sqrt(3), Math.sqrt(1.5));
        ellipse('product-boundary-2', Math.sqrt(1.5), Math.sqrt(3));
        ellipse('constraint-fill', Math.sqrt(3), Math.sqrt(1.5));
        ellipse('constraint-ellipse', Math.sqrt(1.5), Math.sqrt(3));
        attr('feasible', { d: '' });
        attr('line', { d: productLevel(s.c) });
        attr('feasible-level', { d: m.segments.map(points => path(points)).join(' ') });
        el('ghosts').replaceChildren();
        [0.25, 0.5, 0.75].forEach(c => append('ghosts', 'path', { d: productLevel(s.c < 0 ? -c : c) }));
        dots('intersections', m.intersections);
        dots('optimizers', m.optimizers);
        text('regime', 'Both constraints bind at the maximum');
        text('insight-title', 'Two corners give the maximum.');
        text('insight-text', 'Raise c until the hyperbola meets the feasible region only at (1, 1) and (−1, −1), where the two ellipses intersect.');
        text('value-label', 'Maximum c*');
        text('value', fmt(m.maximum));
        text('solution', '(1, 1), (−1, −1)');
        text('status', s.c > 1 ? 'Above the maximum: no feasible point.'
            : s.c < -1 ? 'Below the minimum: no feasible point.'
            : s.c === 1 ? 'Highest feasible level · two points of contact.'
            : s.c === -1 ? 'Lowest feasible level · two points with opposite signs.'
            : s.c === 0 ? 'The zero level is both coordinate axes; the highlighted segments are feasible.'
            : s.c < 0 ? 'Negative levels lie in quadrants II and IV. Raise c to seek the maximum.'
            : 'This level crosses the feasible set in two arcs. Try raising c.');
        text('plot-description', `Shaded intersection of the ellipses x one squared plus two x two squared at most three and two x one squared plus x two squared at most three. Orange level x one times x two equals ${fmt(s.c)}. ${el('status').textContent}`);
    }
    function renderValue(p, m) {
        const vx = q => 26 + q / 8 * 238, vy = v => 88 - v / 6 * 70;
        const d = points => points.map(([x, y], i) => `${i ? 'L' : 'M'}${vx(x)},${vy(y)}`).join(' ');
        attr('value-axes', { d: d([[0, 6], [0, 0], [8, 0]]) });
        attr('value-threshold', { d: d([[1, 0], [1, 6]]) });
        const points = Array.from({ length: 161 }, (_, i) => { const q = i / 20; return [q, q <= 1 ? 1 + q : 2 * Math.sqrt(q)]; });
        attr('value-curve', { d: d(points) });
        const a = Math.max(0, p - 0.85), b = Math.min(8, p + 0.85);
        attr('value-tangent', { d: d([[a, m.value + m.derivative * (a - p)], [b, m.value + m.derivative * (b - p)]]) });
        attr('value-dot', { cx: vx(p), cy: vy(m.value) });
        text('value-title', `Value function at p=${fmt(p)}: v(p)=${fmt(m.value)}, slope v prime=${fmt(m.derivative)}. The dashed orange line is its tangent.`);
    }
    function renderCost(s) {
        const m = costModel(s.p, s.c);
        attr('boundary-1', { d: path(hyperbola(1 / box.hi, box.hi)) });
        attr('boundary-2', { d: path([[0, 0], [box.hi, box.hi]]) });
        attr('feasible', { d: path([...hyperbola(1, box.hi), [box.hi, box.hi]], true) });
        attr('line', { d: costLine(s.p, s.c) });
        attr('feasible-level', { d: path(m.segment) });
        el('ghosts').replaceChildren();
        [1, 1.25, 1.5].forEach(t => append('ghosts', 'path', { d: costLine(s.p, t * m.value) }));
        const pointContact = Math.abs(s.c - m.value) < EPS;
        dots('intersections', pointContact ? [[m.x, m.y]] : m.segment);
        dots('optimizers', [[m.x, m.y]]);
        text('regime', s.p < 1 ? '0 < p < 1 · both constraints bind' : s.p === 1 ? 'p = 1 · the transition' : 'p > 1 · only x₁x₂ = 1 binds');
        text('insight-title', s.p <= 1 ? 'The corner is cheapest.' : 'The cheapest line is tangent.');
        text('insight-text', s.p < 1 ? 'Lower c until the line reaches (1, 1). The diagonal blocks a move toward the unconstrained tangency.' : s.p === 1 ? 'The line is tangent at (1, 1). Both constraints bind, but the diagonal has zero multiplier.' : 'Lower c until the line touches the hyperbola. As p rises, use less x₂ and more x₁.');
        text('value-label', 'Minimum v(p)');
        text('value', fmt(m.value));
        text('solution', `(${fmt(m.x)}, ${fmt(m.y)})`);
        text('derivative', fmt(m.derivative));
        text('status', pointContact ? 'Lowest feasible level · one point of contact.' : m.segment.length ? 'This level crosses the feasible set. Try lowering c.' : 'Below the minimum: no feasible point.');
        text('plot-description', `Positive quadrant. Shaded region satisfies x one times x two at least one and x one at least x two. Orange line x one plus ${fmt(s.p)} x two equals ${fmt(s.c)}. ${el('status').textContent}`);
        renderValue(s.p, m);
    }
    function render() {
        const circle = state.exercise === '94', product = state.exercise === '95', cost = state.exercise === '96', s = state[state.exercise];
        const optimum = circle ? circleModel(s.a, s.b, 0).maximum : product ? 1 : costModel(s.p, 0).value;
        const maxLevel = cost ? Math.max(4, optimum * 1.65) : optimum * 1.3;
        const minLevel = product ? -maxLevel : 0;
        if (s.optimal) s.c = optimum;
        s.c = clamp(s.c, minLevel, maxLevel);
        el('c').min = String(minLevel);
        el('c').max = String(maxLevel);
        el('c').value = String(s.c);
        // Range controls quantize input; retain the exact analytic level in state.
        text('c-value', fmt(s.c));
        el('optimal').setAttribute('aria-pressed', String(s.optimal));
        text('level-tag', `f = ${fmt(s.c)}`);
        ['a', 'b', 'p'].forEach(key => {
            const value = key === 'p' ? state['96'].p : state['94'][key];
            el(key).value = String(value);
            text(`${key}-value`, fmt(value));
        });
        exerciseIds.forEach(id => show(`problem-${id}`, id === state.exercise));
        ['ab-controls', 'circle', 'ellipse'].forEach(id => show(id, circle));
        ['product-controls', 'product-region', 'product-boundary-1', 'product-boundary-2'].forEach(id => show(id, product));
        ['p-controls', 'boundary-1', 'boundary-2', 'derivative-row', 'value-function'].forEach(id => show(id, cost));
        ['line', 'feasible-level'].forEach(id => show(id, !circle));
        show('ghosts', el('context').checked);
        show('optimizers', el('show-solution').checked);
        show('zero-level', !product && s.c === 0);
        attr('zero-level', { cx: px(0), cy: py(0) });
        const solutionKey = root.querySelector('.ta-key-point').parentElement;
        solutionKey.hidden = !el('show-solution').checked;
        exerciseIds.forEach(id => {
            if (id === state.exercise) el(`tab-${id}`).setAttribute('aria-current', 'page');
            else el(`tab-${id}`).removeAttribute('aria-current');
        });
        text('controls-title', product ? 'Explore the level' : 'Parameters');
        text('plot-heading', circle ? 'Level curves on the unit circle' : product ? 'Product levels inside two ellipses' : 'Cost lines over the feasible region');
        text('plot-title', circle ? 'Exercise 9.4: ellipses and the unit circle' : product ? 'Exercise 9.5: product levels and two ellipse constraints' : 'Exercise 9.6: linear cost and two constraints');
        text('feasible-key', circle ? 'Feasible circle' : 'Feasible region');
        text('view-note', circle ? 'Equal scale on both axes' : product ? 'Solid: x₁² + 2x₂² = 3 · dashed: 2x₁² + x₂² = 3' : 'Solid: x₁x₂ = 1 · dashed: x₁ = x₂');
        if (circle) renderCircle(s); else if (product) renderProduct(s); else renderCost(s);
    }
    function selectExercise() {
        state.exercise = exerciseIds.find(id => window.location.hash === `#exercise-${id[0]}-${id[1]}`) || '94';
        axes(); render(); resize();
    }
    ['a', 'b', 'p'].forEach(key => el(key).addEventListener('input', () => {
        state[key === 'p' ? '96' : '94'][key] = Number(el(key).value);
        render();
    }));
    el('c').addEventListener('input', () => {
        Object.assign(state[state.exercise], { c: Number(el('c').value), optimal: false });
        render();
    });
    el('optimal').addEventListener('click', () => {
        state[state.exercise].optimal = true;
        el('show-solution').checked = true;
        render();
    });
    el('reset').addEventListener('click', () => {
        const defaults = { '94': { a: 1, b: 2, c: 0.5, optimal: false }, '95': { c: 0.5, optimal: false }, '96': { p: 4, c: 6, optimal: false } };
        Object.assign(state[state.exercise], defaults[state.exercise]);
        el('context').checked = true;
        el('show-solution').checked = true;
        render();
    });
    root.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
        const presets = {
            x: { a: 1, b: 2, c: 0.5 }, equal: { a: 1, b: 1, c: 1 }, y: { a: 2, b: 1, c: 0.5 },
            small: { p: 0.5, c: 2 }, threshold: { p: 1, c: 2.5 }, large: { p: 4, c: 6 },
            productZero: { c: 0 }, productHalf: { c: 0.5 }, productAbove: { c: 1.15 },
        };
        Object.assign(state[state.exercise], presets[button.dataset.preset], { optimal: false });
        render();
    }));
    ['context', 'show-solution'].forEach(id => el(id).addEventListener('change', render));
    // PaperMod intercepts fragment links for scrolling. These links switch
    // exercises, so handle them before the theme's scroll listener runs.
    exerciseIds.forEach(id => el(`tab-${id}`).addEventListener('click', event => {
        event.stopImmediatePropagation();
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        history.pushState(null, '', el(`tab-${id}`).getAttribute('href'));
        selectExercise();
    }, true));
    window.addEventListener('hashchange', selectExercise);
    window.addEventListener('popstate', selectExercise);
    const main = root.parentElement, header = document.querySelector('.header');
    main.classList.add('ta9-main');
    function resize() {
        main.style.setProperty('--ta-header-height', `${header ? header.getBoundingClientRect().height : 120}px`);
        const scale = 620 / Math.max(1, el('plot').getBoundingClientRect().width);
        root.style.setProperty('--ta-label-scale', String(clamp(scale, 1, 1.65)));
    }
    const observer = new ResizeObserver(resize);
    if (header) observer.observe(header);
    observer.observe(el('plot'));
    selectExercise();
})();
