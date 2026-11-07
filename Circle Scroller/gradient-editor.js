/* gradient-editor.js
 * Reusable horizontal gradient-stop editor.
 * Usage:
 *   const ed = new GradientEditor(containerEl, {
 *     stops: [{ pos: 0, color: '#000' }, { pos: 1, color: '#fff' }],
 *     minStops: 2, maxStops: 16, decimals: 3,
 *     onChange: (stops) => { ... }
 *   });
 *   ed.getStops();   // → [{pos, color}, ...] sorted
 *   ed.setStops(...); ed.destroy();
 */
(function (global) {
'use strict';

/* ---------- inject scoped CSS once ---------- */
const STYLE_ID = 'gradient-editor-style';
if (!document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .gradient-editor {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-family: monospace;
      font-size: 11px;
      user-select: none;
    }
    .ge-bar-wrap {
      position: relative;
      height: 24px;
      padding: 0 8px;
    }
    .ge-bar {
      position: absolute;
      left: 8px; right: 8px; top: 50%;
      height: 18px;
      transform: translateY(-50%);
      border: 1px solid #555;
      border-radius: 2px;
      cursor: copy;
      background: #000;
    }
    .ge-stop {
      position: absolute;
      top: 50%;
      width: 12px; height: 12px;
      transform: translate(-50%, -50%);
      border: 2px solid #fff;
      border-radius: 2px;
      box-shadow: 0 0 0 1px #000;
      cursor: grab;
      box-sizing: border-box;
    }
    .ge-stop.ge-selected {
      border-color: #ffcc00;
      box-shadow: 0 0 0 1px #000, 0 0 6px #ffcc00;
      z-index: 2;
    }
    .ge-stop:active { cursor: grabbing; }
    .ge-controls {
      display: grid;
      grid-template-columns: auto auto 1fr auto;
      gap: 6px;
      align-items: center;
      padding: 0 8px;
    }
    .ge-controls label { color: #888; }
    .ge-controls input[type=number] {
      background: #1a1a2e; color: #ddd; border: 1px solid #555;
      font-family: monospace; font-size: 10px; padding: 1px 3px;
      width: 60px; text-align: right; box-sizing: border-box;
    }
    .ge-controls input[type=color] {
      width: 40px; height: 20px; padding: 0; border: 1px solid #555;
      background: #1a1a2e; cursor: pointer; box-sizing: border-box;
    }
    .ge-controls button {
      background: #333; color: #ddd; border: 1px solid #555;
      font-family: monospace; font-size: 10px; padding: 1px 6px;
      border-radius: 2px; cursor: pointer;
    }
    .ge-controls button:hover:not(:disabled) { background: #444; color: #fff; }
    .ge-controls button:disabled { opacity: 0.4; cursor: not-allowed; }
  `;
  document.head.appendChild(style);
}

/* ---------- colour helpers ---------- */
function normaliseColor(c) {
  if (typeof c !== 'string') return '#000000';
  c = c.trim();
  if (c[0] === '#') {
    if (c.length === 4) return ('#' + c[1]+c[1] + c[2]+c[2] + c[3]+c[3]).toLowerCase();
    if (c.length === 7) return c.toLowerCase();
  }
  const m = c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) {
    const h = n => (+n).toString(16).padStart(2, '0');
    return '#' + h(m[1]) + h(m[2]) + h(m[3]);
  }
  return '#000000';
}
function hexToRgb(c) {
  const n = normaliseColor(c);
  return {
    r: parseInt(n.slice(1, 3), 16),
    g: parseInt(n.slice(3, 5), 16),
    b: parseInt(n.slice(5, 7), 16),
  };
}
function rgbToHex(r, g, b) {
  const h = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return '#' + h(r) + h(g) + h(b);
}
function mixColors(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(
    A.r + (B.r - A.r) * t,
    A.g + (B.g - A.g) * t,
    A.b + (B.b - A.b) * t
  );
}
function sampleColor(stops, pos) {
  if (!stops.length) return '#000000';
  const sorted = stops.slice().sort((a, b) => a.pos - b.pos);
  if (pos <= sorted[0].pos) return sorted[0].color;
  if (pos >= sorted[sorted.length - 1].pos) return sorted[sorted.length - 1].color;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i], b = sorted[i + 1];
    if (pos >= a.pos && pos <= b.pos) {
      const f = (pos - a.pos) / Math.max(1e-9, b.pos - a.pos);
      return mixColors(a.color, b.color, f);
    }
  }
  return sorted[sorted.length - 1].color;
}

/* ---------- editor ---------- */
class GradientEditor {
  constructor(container, options) {
    options = options || {};
    this.container = typeof container === 'string'
      ? document.querySelector(container) : container;
    if (!this.container) throw new Error('GradientEditor: container not found');

    this.minStops = options.minStops != null ? options.minStops : 2;
    this.maxStops = options.maxStops != null ? options.maxStops : 16;
    this.onChange = options.onChange || function () {};
    this.decimals = options.decimals != null ? options.decimals : 3;

    this._stops = [];
    this._selectedId = null;
    this._nextId = 1;
    this._dragging = null;
    this._suppressClick = false;

    this._buildDOM();
    if (options.stops) this.setStops(options.stops);
  }

  setStops(stops) {
    this._stops = (stops || []).map(s => ({
      id: this._nextId++,
      pos: Math.max(0, Math.min(1, Number(s.pos) || 0)),
      color: normaliseColor(s.color),
    }));
    this._stops.sort((a, b) => a.pos - b.pos);
    this._selectedId = this._stops.length ? this._stops[0].id : null;
    this._render();
  }

  getStops() {
    return this._stops
      .slice()
      .sort((a, b) => a.pos - b.pos)
      .map(s => ({ pos: +s.pos.toFixed(this.decimals), color: s.color }));
  }

  destroy() {
    this._unbindDrag();
    this.container.innerHTML = '';
  }

  /* ---- private ---- */

  _buildDOM() {
    this.container.innerHTML = '';
    this.container.classList.add('gradient-editor');

    const wrap = document.createElement('div');
    wrap.className = 'ge-bar-wrap';
    this._bar = document.createElement('div');
    this._bar.className = 'ge-bar';
    wrap.appendChild(this._bar);
    this.container.appendChild(wrap);
    this._bar.addEventListener('click', e => this._onBarClick(e));

    const controls = document.createElement('div');
    controls.className = 'ge-controls';

    const posLabel = document.createElement('label');
    posLabel.textContent = 'Pos';
    controls.appendChild(posLabel);

    this._posInput = document.createElement('input');
    this._posInput.type = 'number';
    this._posInput.min = 0;
    this._posInput.max = 1;
    this._posInput.step = 0.001;
    this._posInput.addEventListener('change', () => this._onPosInput());
    controls.appendChild(this._posInput);

    this._colorInput = document.createElement('input');
    this._colorInput.type = 'color';
    this._colorInput.addEventListener('input', () => this._onColorInput());
    controls.appendChild(this._colorInput);

    this._removeBtn = document.createElement('button');
    this._removeBtn.type = 'button';
    this._removeBtn.textContent = '✕';
    this._removeBtn.title = 'Remove selected stop (or double-click a stop)';
    this._removeBtn.addEventListener('click', () => {
      if (this._selectedId != null) this._removeStop(this._selectedId);
    });
    controls.appendChild(this._removeBtn);

    this.container.appendChild(controls);
  }

  _render() {
    const sorted = this._stops.slice().sort((a, b) => a.pos - b.pos);
    const stopsCSS = sorted.map(s =>
      `${s.color} ${(s.pos * 100).toFixed(3)}%`
    ).join(', ');
    this._bar.style.background = sorted.length
      ? `linear-gradient(to right, ${stopsCSS})`
      : '#000';

    this._bar.querySelectorAll('.ge-stop').forEach(el => el.remove());

    for (const s of sorted) {
      const el = document.createElement('div');
      el.className = 'ge-stop' + (s.id === this._selectedId ? ' ge-selected' : '');
      el.style.left = (s.pos * 100) + '%';
      el.style.background = s.color;
      el.title = `${s.color} @ ${(s.pos * 100).toFixed(1)}%`;
      el.dataset.id = String(s.id);

      el.addEventListener('click', e => {
        e.stopPropagation();
        this._select(s.id);
      });
      el.addEventListener('dblclick', e => {
        e.stopPropagation();
        e.preventDefault();
        this._removeStop(s.id);
      });
      el.addEventListener('mousedown', e => {
        e.stopPropagation();
        this._beginDrag(e, s.id);
      });

      this._bar.appendChild(el);
    }

    const sel = this._stops.find(s => s.id === this._selectedId);
    if (sel) {
      this._posInput.value = sel.pos.toFixed(this.decimals);
      this._colorInput.value = sel.color;
      this._posInput.disabled = false;
      this._colorInput.disabled = false;
      this._removeBtn.disabled = this._stops.length <= this.minStops;
    } else {
      this._posInput.value = '';
      this._colorInput.value = '#000000';
      this._posInput.disabled = true;
      this._colorInput.disabled = true;
      this._removeBtn.disabled = true;
    }
  }

  _select(id) {
    if (this._selectedId === id) return;
    this._selectedId = id;
    this._render();
  }

  _onBarClick(e) {
    if (this._suppressClick) { this._suppressClick = false; return; }
    if (e.target.classList.contains('ge-stop')) return;
    if (this._stops.length >= this.maxStops) return;
    const rect = this._bar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const color = sampleColor(this._stops, pos);
    const stop = { id: this._nextId++, pos, color };
    this._stops.push(stop);
    this._stops.sort((a, b) => a.pos - b.pos);
    this._selectedId = stop.id;
    this._render();
    this._emit();
  }

  _removeStop(id) {
    if (this._stops.length <= this.minStops) return;
    const idx = this._stops.findIndex(s => s.id === id);
    if (idx < 0) return;
    this._stops.splice(idx, 1);
    if (this._selectedId === id) {
      const next = this._stops[Math.min(idx, this._stops.length - 1)];
      this._selectedId = next ? next.id : null;
    }
    this._render();
    this._emit();
  }

  _beginDrag(e, id) {
    if (e.button !== 0) return;
    const rect = this._bar.getBoundingClientRect();
    this._dragging = { id, rect, moved: false };
    this._select(id);
    document.addEventListener('mousemove', this._onDragMove);
    document.addEventListener('mouseup', this._onDragUp);
  }

  _onDragMove = (e) => {
    if (!this._dragging) return;
    this._dragging.moved = true;
    const { id, rect } = this._dragging;
    const stop = this._stops.find(s => s.id === id);
    if (!stop) return;
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (stop.pos === pos) return;
    stop.pos = pos;
    this._stops.sort((a, b) => a.pos - b.pos);
    this._render();
    this._emit();
  };

  _onDragUp = () => {
    if (this._dragging && this._dragging.moved) {
      this._suppressClick = true;
      setTimeout(() => { this._suppressClick = false; }, 0);
    }
    this._dragging = null;
    document.removeEventListener('mousemove', this._onDragMove);
    document.removeEventListener('mouseup', this._onDragUp);
  };

  _unbindDrag() {
    document.removeEventListener('mousemove', this._onDragMove);
    document.removeEventListener('mouseup', this._onDragUp);
    this._dragging = null;
  }

  _onPosInput() {
    const sel = this._stops.find(s => s.id === this._selectedId);
    if (!sel) return;
    let pos = parseFloat(this._posInput.value);
    if (isNaN(pos)) return;
    pos = Math.max(0, Math.min(1, pos));
    if (sel.pos === pos) return;
    sel.pos = pos;
    this._stops.sort((a, b) => a.pos - b.pos);
    this._render();
    this._emit();
  }

  _onColorInput() {
    const sel = this._stops.find(s => s.id === this._selectedId);
    if (!sel) return;
    const c = normaliseColor(this._colorInput.value);
    if (sel.color === c) return;
    sel.color = c;
    this._render();
    this._emit();
  }

  _emit() {
    try { this.onChange(this.getStops()); }
    catch (err) { console.error('GradientEditor onChange threw:', err); }
  }
}

global.GradientEditor = GradientEditor;
global.normaliseGradientStops = function (stops) {
  if (!Array.isArray(stops) || !stops.length) return stops;
  return stops
    .map(s => ({
      pos: Math.max(0, Math.min(1, Number(s.pos) || 0)),
      color: normaliseColor(s.color),
    }))
    .sort((a, b) => a.pos - b.pos);
};

})(typeof window !== 'undefined' ? window : this);