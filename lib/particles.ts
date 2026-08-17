/**
 * Lightweight canvas-2D particle engine for the hero story (v2 brief):
 * Act 1 — the official logo mark dissolves into drifting particles
 *         (teal strand drifts left, rose strand drifts right, circuit
 *         lines become faint light traces);
 * Act 2 — scroll converges the particles into the EPINOVA wordmark.
 *
 * No dependencies. DPR capped at 1.5. Colours are read from the CSS
 * design tokens at runtime — no hexes live here.
 */

interface Particle {
  /** home position, normalised to the logo box */
  hx: number;
  hy: number;
  /** scatter position, normalised to the canvas */
  sx: number;
  sy: number;
  /** word target, normalised to the wordmark box */
  wx: number;
  wy: number;
  sprite: number;
  size: number;
  phase: number;
  speed: number;
  ampX: number;
  ampY: number;
  /** per-particle stagger for the dissolve / convergence */
  dDelay: number;
  wDelay: number;
  /** word-boost particles exist only in the converged wordmark */
  wordOnly?: boolean;
}

interface Trace {
  /** circuit-like polyline, normalised to the canvas */
  points: Array<[number, number]>;
  alpha: number;
}

export interface ParticleFieldOptions {
  canvas: HTMLCanvasElement;
  logoSrc: string;
  word: string;
  fontFamily?: string;
}

const SPRITE_TOKENS = [
  "--teal-400", // electric cyan
  "--teal-300",
  "--teal-600", // biotech teal (also used for dark circuit pixels)
  "--copper-300",
  "--copper-400", // rose — human health
] as const;

const smooth = (v: number) => {
  const t = Math.min(1, Math.max(0, v));
  return t * t * (3 - 2 * t);
};

export class ParticleField {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private opts: Required<ParticleFieldOptions>;

  private particles: Particle[] = [];
  private traces: Trace[] = [];
  private sprites: HTMLCanvasElement[] = [];
  private traceColor = "rgba(22,184,212,1)";

  /** wordmark aspect ratio (w/h) measured at sampling time */
  private wordAspect = 4;
  private logoAspect = 389 / 583;

  /** 0 = assembled logo · 1 = dispersed field */
  disperse = 0;
  /** 0 = field · 1 = formed wordmark (scroll-scrubbed) */
  converge = 0;

  private cw = 0;
  private ch = 0;
  private raf = 0;
  private running = false;
  private destroyed = false;
  private ro: ResizeObserver | null = null;
  private t0 = 0;
  /** phones/tablets: reduced DPR, fewer particles, 24fps cap */
  private lowPower = false;
  private lastFrame = 0;
  /** self-managed visibility — see the note in start() */
  private onScreen = true;
  private lastVisCheck = 0;
  /** how many particles are actually drawn — trimmed if frames run long */
  private activeCount = 0;
  /** exponential moving average of render cost, ms */
  private costEma = 0;
  private costSamples = 0;

  constructor(options: ParticleFieldOptions) {
    this.canvas = options.canvas;
    this.ctx = options.canvas.getContext("2d");
    this.opts = {
      fontFamily: '"Cabinet Grotesk", "Switzer", system-ui, sans-serif',
      ...options,
    };
  }

  async init(): Promise<void> {
    if (!this.ctx) return;
    this.buildSprites();
    this.resize();

    // The mark drives the particle home positions, but the hero must never
    // render an empty canvas if that request fails (exhibition-hall wifi) —
    // fall back to a procedural helix instead.
    let img: HTMLImageElement | null = null;
    try {
      img = await this.loadImage(this.opts.logoSrc);
    } catch {
      img = null;
    }
    if (this.destroyed) return;

    // wait for the display font so the wordmark samples correctly — but
    // never hang on it (Safari has been flaky about resolving fonts.load)
    try {
      await Promise.race([
        document.fonts.load(`700 190px ${this.opts.fontFamily}`),
        new Promise((res) => setTimeout(res, 1500)),
      ]);
    } catch {
      /* fallback font is fine */
    }
    if (this.destroyed) return;

    const homePts = img
      ? this.sampleLogo(img, this.maxCount())
      : this.helixPoints(this.maxCount());
    const wordPts = this.sampleWord(this.opts.word);

    // shuffle word targets so convergence looks organic
    for (let i = wordPts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wordPts[i], wordPts[j]] = [wordPts[j], wordPts[i]];
    }

    this.particles = homePts.map((p, i) => {
      const w = wordPts[i % Math.max(1, wordPts.length)] ?? { x: 0.5, y: 0.5 };
      // teal strand drifts left, rose strand drifts right
      const dir = p.warm ? 1 : -1;
      const sx = Math.min(
        0.97,
        Math.max(0.03, 0.5 + dir * (0.06 + Math.random() * 0.42)),
      );
      const sy = 0.06 + Math.random() * 0.88;
      return {
        hx: p.x,
        hy: p.y,
        sx,
        sy,
        wx: w.x,
        wy: w.y,
        sprite: p.sprite,
        size: 1.4 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2,
        // the field must read as alive while idle — below roughly this
        // speed/amplitude the drift is too slow to perceive as motion
        speed: 0.5 + Math.random() * 0.7,
        ampX: 16 + Math.random() * 30,
        ampY: 13 + Math.random() * 24,
        dDelay: Math.random() * 0.35,
        wDelay: Math.random() * 0.3,
      };
    });

    // shuffle so that drawing only a prefix (adaptive trimming below) still
    // samples the whole mark evenly instead of lopping off its lower rows
    for (let i = this.particles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.particles[i], this.particles[j]] = [
        this.particles[j],
        this.particles[i],
      ];
    }

    // word-boost pool: extra particles that appear ONLY as the wordmark
    // forms, so the brand name reads dense and clearly visual without
    // raising the cost of the logo or idle-field phases. Appended after
    // the shuffle so adaptive trimming sheds these first on weak devices.
    const boost = this.lowPower ? 1200 : 2600;
    for (let i = 0; i < boost; i++) {
      const w = wordPts[Math.floor(Math.random() * wordPts.length)] ?? {
        x: 0.5,
        y: 0.5,
      };
      const roll = Math.random();
      this.particles.push({
        hx: 0.5,
        hy: 0.5,
        sx: 0.04 + Math.random() * 0.92,
        sy: 0.06 + Math.random() * 0.88,
        wx: w.x,
        wy: w.y,
        sprite: roll < 0.5 ? 0 : roll < 0.72 ? 1 : roll < 0.85 ? 2 : roll < 0.93 ? 3 : 4,
        size: 1.3 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.7,
        ampX: 10 + Math.random() * 16,
        ampY: 8 + Math.random() * 14,
        dDelay: 0,
        wDelay: Math.random() * 0.3,
        wordOnly: true,
      });
    }

    this.activeCount = this.particles.length;

    this.buildTraces();

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.canvas);
  }

  /** Render exactly one frame (used for static poses). */
  renderOnce(): void {
    this.render(performance.now() / 1000);
  }

  start(): void {
    if (this.running || this.destroyed) return;
    this.running = true;
    this.t0 = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;

      // Visibility is checked here with a rect test, NOT with
      // IntersectionObserver: WebKit misreports IO entries for content
      // inside position:sticky during compositor scrolls, which froze the
      // field on iPhones. A getBoundingClientRect every 250ms is cheap and
      // correct on every engine. (Tab-hidden needs no handling — the
      // browser suspends requestAnimationFrame itself.)
      if (now - this.lastVisCheck > 250) {
        this.lastVisCheck = now;
        const r = this.canvas.getBoundingClientRect();
        this.onScreen =
          r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
      }

      // 24fps on low-power devices — the drift is slow enough that the
      // reduced frame rate is invisible, but it cuts canvas work by 60%
      const minGap = this.lowPower ? 41 : 0;
      if (this.onScreen && now - this.lastFrame >= minGap) {
        this.lastFrame = now;
        this.render(now / 1000);
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  destroy(): void {
    this.destroyed = true;
    this.stop();
    this.ro?.disconnect();
    this.ctx?.clearRect(0, 0, this.cw, this.ch);
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.lowPower =
      window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 900;
    // glow sprites survive a sub-native buffer; on phones the smaller
    // texture meaningfully cuts per-frame upload/composite cost
    const dpr = this.lowPower
      ? 0.8
      : Math.min(window.devicePixelRatio || 1, 1.5);
    this.cw = rect.width;
    this.ch = rect.height;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!this.running && this.particles.length) this.renderOnce();
  }

  /* ------------------------------------------------------------------ */

  private maxCount(): number {
    const w = window.innerWidth;
    // Cost is dominated by draw-call count, not resolution: every particle
    // is one drawImage. 2600 measured ~8ms/frame — half the 60fps budget —
    // so the field is kept dense enough to read the mark, and no denser.
    // Below ~700 the mark stops reading as the logo.
    if (this.lowPower) return w < 480 ? 750 : 1000;
    if (w < 1024) return 1100;
    return 1500;
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });
  }

  private cssColor(token: string): string {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue(token)
      .trim();
    return v || "#16b8d4";
  }

  private buildSprites(): void {
    this.traceColor = this.cssColor("--teal-400");
    // Particles draw at ~3-7px, so a 16px sprite is already oversampled.
    // A larger source would make every drawImage pay for a steep downscale.
    const S = 16;
    const r = S / 2;
    this.sprites = SPRITE_TOKENS.map((token) => {
      const c = document.createElement("canvas");
      c.width = c.height = S;
      const g = c.getContext("2d")!;
      const color = this.cssColor(token);
      const grad = g.createRadialGradient(r, r, 0, r, r, r);
      grad.addColorStop(0, color);
      grad.addColorStop(0.3, color);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, S, S);
      return c;
    });
  }

  /**
   * Fallback home points: a two-strand helix with rungs, drawn from the same
   * palette as the mark. Used only when the logo raster can't be fetched.
   */
  private helixPoints(
    count: number,
  ): Array<{ x: number; y: number; warm: boolean; sprite: number }> {
    this.logoAspect = 389 / 583;
    const pts: Array<{ x: number; y: number; warm: boolean; sprite: number }> =
      [];
    const turns = 3;
    const strandTotal = Math.floor(count * 0.8);

    for (let i = 0; i < strandTotal; i++) {
      const t = i / strandTotal;
      const warm = i % 2 === 1;
      const a = t * Math.PI * 2 * turns + (warm ? Math.PI : 0);
      pts.push({
        x: 0.5 + 0.4 * Math.sin(a),
        y: 0.04 + t * 0.92,
        warm,
        sprite: warm
          ? Math.random() < 0.5
            ? 3
            : 4
          : Math.random() < 0.7
            ? 0
            : 1,
      });
    }

    const rungCount = 16;
    const perRung = Math.max(2, Math.floor((count - strandTotal) / rungCount));
    for (let r = 0; r < rungCount; r++) {
      const t = (r + 0.5) / rungCount;
      const a = t * Math.PI * 2 * turns;
      const x1 = 0.5 + 0.4 * Math.sin(a);
      const x2 = 0.5 + 0.4 * Math.sin(a + Math.PI);
      for (let k = 0; k < perRung; k++) {
        const f = k / Math.max(1, perRung - 1);
        pts.push({
          x: x1 + (x2 - x1) * f,
          y: 0.04 + t * 0.92,
          warm: f > 0.5,
          sprite: 2,
        });
      }
    }
    return pts;
  }

  /** Sample the logo raster into normalised particle home points. */
  private sampleLogo(
    img: HTMLImageElement,
    maxCount: number,
  ): Array<{ x: number; y: number; warm: boolean; sprite: number }> {
    this.logoAspect = img.width / img.height;
    const SW = 150;
    const SH = Math.round(SW / this.logoAspect);
    const off = document.createElement("canvas");
    off.width = SW;
    off.height = SH;
    const g = off.getContext("2d", { willReadFrequently: true })!;
    g.drawImage(img, 0, 0, SW, SH);
    const data = g.getImageData(0, 0, SW, SH).data;

    const raw: Array<{ x: number; y: number; warm: boolean; sprite: number }> =
      [];
    const step = 2;
    for (let y = 0; y < SH; y += step) {
      for (let x = 0; x < SW; x += step) {
        const i = (y * SW + x) * 4;
        const a = data[i + 3];
        if (a < 140) continue;
        const r = data[i];
        const gg = data[i + 1];
        const b = data[i + 2];
        const bright = (r + gg + b) / 3;
        const warm = r > b + 8;
        let sprite: number;
        if (bright < 55) {
          sprite = 2; // dark circuit pixels → dim biotech teal
        } else if (warm) {
          sprite = Math.random() < 0.5 ? 3 : 4;
        } else {
          const roll = Math.random();
          sprite = roll < 0.55 ? 0 : roll < 0.8 ? 1 : 2;
        }
        raw.push({ x: x / SW, y: y / SH, warm, sprite });
      }
    }

    if (raw.length <= maxCount) return raw;
    const keep = maxCount / raw.length;
    return raw.filter(() => Math.random() < keep);
  }

  /** Rasterise the wordmark and sample normalised target points. */
  private sampleWord(word: string): Array<{ x: number; y: number }> {
    const W = 1000;
    const H = 240;
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const g = off.getContext("2d", { willReadFrequently: true })!;
    let fs = 185;
    g.font = `700 ${fs}px ${this.opts.fontFamily}`;
    const measured = g.measureText(word).width;
    if (measured > W - 60) fs = Math.floor((fs * (W - 60)) / measured);
    g.font = `700 ${fs}px ${this.opts.fontFamily}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = "#fff";
    g.fillText(word, W / 2, H / 2);

    const data = g.getImageData(0, 0, W, H).data;
    const pts: Array<{ x: number; y: number }> = [];
    const step = 2; // dense sampling — the brand name must read clearly
    let minX = W;
    let maxX = 0;
    let minY = H;
    let maxY = 0;
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        const a = data[(y * W + x) * 4 + 3];
        if (a < 140) continue;
        pts.push({ x, y });
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    const bw = Math.max(1, maxX - minX);
    const bh = Math.max(1, maxY - minY);
    this.wordAspect = bw / bh;
    return pts.map((p) => ({ x: (p.x - minX) / bw, y: (p.y - minY) / bh }));
  }

  /** Faint circuit-like L-traces that appear as the logo dissolves. */
  private buildTraces(): void {
    this.traces = [];
    for (let i = 0; i < 12; i++) {
      const x = Math.random();
      const y = Math.random();
      const len1 = 0.05 + Math.random() * 0.14;
      const len2 = 0.04 + Math.random() * 0.1;
      const horizFirst = Math.random() < 0.5;
      const s1 = Math.random() < 0.5 ? -1 : 1;
      const s2 = Math.random() < 0.5 ? -1 : 1;
      const mid: [number, number] = horizFirst
        ? [x + s1 * len1, y]
        : [x, y + s1 * len1];
      const end: [number, number] = horizFirst
        ? [mid[0], mid[1] + s2 * len2]
        : [mid[0] + s2 * len2, mid[1]];
      this.traces.push({
        points: [[x, y], mid, end],
        alpha: 0.03 + Math.random() * 0.05,
      });
    }
  }

  /* ------------------------------------------------------------------ */

  private render(t: number): void {
    const ctx = this.ctx;
    if (!ctx || this.cw === 0) return;
    const started = performance.now();
    const { cw, ch } = this;
    ctx.clearRect(0, 0, cw, ch);

    const d = this.disperse;
    const w = this.converge;

    // logo box — centred, slightly above middle. The sway is gated by the
    // dissolve so the assembled pose stays perfectly registered under the
    // crisp DOM logo shown at page load; it comes alive as it breaks apart.
    const sd = smooth(d);
    const logoH = Math.min(ch * 0.42, 400);
    const logoW = logoH * this.logoAspect;
    const logoX = (cw - logoW) / 2 + Math.sin(t * 0.6) * 5 * sd;
    const logoY = ch * 0.46 - logoH / 2 + Math.sin(t * 0.9 + 1.3) * 7 * sd;

    // wordmark box — centred
    const wordW = Math.min(cw * 0.86, 920);
    const wordH = wordW / this.wordAspect;
    const wordX = (cw - wordW) / 2;
    const wordY = ch * 0.5 - wordH / 2;

    // circuit traces fade in with the dissolve, out with convergence
    const traceAlpha = smooth(d) * (1 - smooth(w));
    if (traceAlpha > 0.01) {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = this.traceColor;
      ctx.lineWidth = 1;
      for (const tr of this.traces) {
        ctx.globalAlpha = tr.alpha * traceAlpha;
        ctx.beginPath();
        ctx.moveTo(tr.points[0][0] * cw, tr.points[0][1] * ch);
        for (let i = 1; i < tr.points.length; i++) {
          ctx.lineTo(tr.points[i][0] * cw, tr.points[i][1] * ch);
        }
        ctx.stroke();
      }
    }

    ctx.globalCompositeOperation = "lighter";
    // canvas state changes are not free at this call volume — only reassign
    // globalAlpha when it actually moves a perceptible amount
    let lastAlpha = -1;
    for (let i = 0; i < this.activeCount; i++) {
      const p = this.particles[i];
      const ed = smooth((d - p.dDelay) / (1 - p.dDelay));
      const ew = smooth((w - p.wDelay) / (1 - p.wDelay));

      // word-boost particles: skipped entirely until the wordmark forms
      if (p.wordOnly) {
        if (ew < 0.03) continue;
        const bDriftX = Math.sin(t * p.speed + p.phase) * p.ampX;
        const bDriftY = Math.cos(t * p.speed * 0.8 + p.phase) * p.ampY;
        const bfx = p.sx * cw + bDriftX;
        const bfy = p.sy * ch + bDriftY;
        const bx = bfx + (wordX + p.wx * wordW - bfx) * ew;
        const by = bfy + (wordY + p.wy * wordH - bfy) * ew;
        const bTwinkle =
          0.65 + 0.35 * Math.sin(t * p.speed * 0.9 + p.phase * 2);
        const ba = (0.7 + 0.3 * bTwinkle) * ew;
        if (ba - lastAlpha > 0.03 || lastAlpha - ba > 0.03) {
          ctx.globalAlpha = ba;
          lastAlpha = ba;
        }
        const bs = p.size;
        ctx.drawImage(this.sprites[p.sprite], bx - bs, by - bs, bs * 2, bs * 2);
        continue;
      }

      const driftX = Math.sin(t * p.speed + p.phase) * p.ampX;
      const driftY = Math.cos(t * p.speed * 0.8 + p.phase) * p.ampY;

      const homeX = logoX + p.hx * logoW;
      const homeY = logoY + p.hy * logoH;
      const fieldX = p.sx * cw + driftX;
      const fieldY = p.sy * ch + driftY;
      const wordPX = wordX + p.wx * wordW;
      const wordPY = wordY + p.wy * wordH;

      const baseX = homeX + (fieldX - homeX) * ed;
      const baseY = homeY + (fieldY - homeY) * ed;
      // the formed wordmark keeps a faint shimmer so it never dies flat
      const settle = Math.sin(t * p.speed * 0.7 + p.phase) * 1.8 * ew;
      const x = baseX + (wordPX - baseX) * ew + settle;
      const y = baseY + (wordPY - baseY) * ew - settle * 0.6;

      const s = p.size * (1 + 0.25 * ed - 0.05 * ew);
      // drifted off-screen — skip the draw entirely
      if (x < -s || x > cw + s || y < -s || y > ch + s) continue;

      const twinkle = 0.65 + 0.35 * Math.sin(t * p.speed * 0.9 + p.phase * 2);
      // near-solid while assembled (a clear logo), twinkling once dispersed,
      // then near-solid again in the wordmark so the name reads clearly
      const idle = Math.min(1, twinkle * (0.55 + 0.45 * ed));
      const dispersed = idle + (0.97 - idle) * (1 - sd);
      const alpha = dispersed + (0.7 + 0.3 * twinkle - dispersed) * ew;
      if (alpha - lastAlpha > 0.03 || lastAlpha - alpha > 0.03) {
        ctx.globalAlpha = alpha;
        lastAlpha = alpha;
      }

      ctx.drawImage(this.sprites[p.sprite], x - s, y - s, s * 2, s * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    this.tune(performance.now() - started);
  }

  /**
   * Self-tuning density. Hardware here ranges from a mid-range Android on
   * hall wifi to a workstation, so rather than guess a count, watch what
   * frames actually cost and thin the field until they fit the budget.
   * Trims only — never grows back — so it settles instead of oscillating.
   */
  private tune(cost: number): void {
    // never tune while the wordmark holds: that scene is a still frame
    // with nothing else running, and its density IS the brand moment
    if (this.converge > 0.4) {
      this.costEma = 0;
      this.costSamples = 0;
      return;
    }
    this.costEma = this.costEma === 0 ? cost : this.costEma * 0.9 + cost * 0.1;
    if (++this.costSamples < 90) return;
    this.costSamples = 0;

    const budget = this.lowPower ? 7 : 4.5;
    const floor = this.lowPower ? 420 : 700;
    if (this.costEma > budget && this.activeCount > floor) {
      this.activeCount = Math.max(floor, Math.round(this.activeCount * 0.85));
      this.costEma = 0;
    }
  }
}
