import type { WeatherState } from "./palettes";

/**
 * Canvas weather: falling flower petals, rain and glowing motes / fireflies.
 * Particles are pooled; the weather intensity decides how many are drawn.
 * `worldVel` (px/s) pushes them sideways while the hero walks, so the air
 * moves past the camera too.
 */

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
  va: number;
  ph: number;
  z: number;
}

const MAX = { petals: 70, rain: 240, motes: 60 };

export class Weather {
  private ctx: CanvasRenderingContext2D | null;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private petals: P[] = [];
  private rain: P[] = [];
  private motes: P[] = [];
  private t = 0;

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d");
  }

  resize(w: number, h: number) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.w = w;
    this.h = h;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    const area = Math.min(1.4, (w * h) / (1440 * 900));
    const mk = (n: number, f: (p: P) => void) =>
      Array.from({ length: Math.max(8, Math.round(n * (0.5 + area * 0.5))) }, () => {
        const p: P = { x: 0, y: 0, vx: 0, vy: 0, r: 0, a: 0, va: 0, ph: 0, z: 0 };
        f(p);
        p.y = Math.random() * h;
        return p;
      });
    this.petals = mk(MAX.petals, (p) => this.spawnPetal(p));
    this.rain = mk(MAX.rain, (p) => this.spawnRain(p));
    this.motes = mk(MAX.motes, (p) => this.spawnMote(p, true));
  }

  private spawnPetal(p: P) {
    p.z = 0.5 + Math.random() * 0.9;
    p.x = Math.random() * this.w * 1.3;
    p.y = -20 - Math.random() * 60;
    p.vx = -20 - Math.random() * 40;
    p.vy = (30 + Math.random() * 40) * p.z;
    p.r = (4 + Math.random() * 4) * p.z;
    p.a = Math.random() * Math.PI;
    p.va = (Math.random() - 0.5) * 4;
    p.ph = Math.random() * Math.PI * 2;
  }

  private spawnRain(p: P) {
    p.z = 0.5 + Math.random() * 0.8;
    p.x = Math.random() * this.w * 1.2;
    p.y = -30 - Math.random() * this.h * 0.3;
    p.vy = (900 + Math.random() * 500) * p.z;
    p.vx = -p.vy * 0.18;
    p.r = (14 + Math.random() * 14) * p.z;
  }

  private spawnMote(p: P, anywhere = false) {
    p.z = 0.4 + Math.random() * 0.9;
    p.x = Math.random() * this.w;
    p.y = anywhere ? Math.random() * this.h : this.h + 10;
    p.vx = (Math.random() - 0.5) * 10;
    p.vy = -(6 + Math.random() * 16) * p.z;
    p.r = (1.2 + Math.random() * 2.2) * p.z;
    p.ph = Math.random() * Math.PI * 2;
  }

  step(dt: number, wx: WeatherState, worldVel: number) {
    const ctx = this.ctx;
    if (!ctx) return;
    this.t += dt;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    const push = -worldVel;

    // motes / fireflies
    const nm = Math.round(this.motes.length * wx.motes);
    if (nm > 0) {
      ctx.fillStyle = wx.moteColor;
      ctx.shadowColor = wx.moteColor;
      ctx.shadowBlur = 8;
      for (let i = 0; i < nm; i++) {
        const p = this.motes[i];
        p.x += (p.vx + Math.sin(this.t * 0.8 + p.ph) * 8 + push * 0.6 * p.z) * dt;
        p.y += p.vy * dt;
        if (p.y < -10) this.spawnMote(p);
        if (p.x < -20) p.x += this.w + 40;
        if (p.x > this.w + 20) p.x -= this.w + 40;
        ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(this.t * 1.6 + p.ph));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // petals
    const np = Math.round(this.petals.length * wx.petals);
    if (np > 0) {
      ctx.fillStyle = wx.petalColor;
      for (let i = 0; i < np; i++) {
        const p = this.petals[i];
        p.x += (p.vx + Math.sin(this.t * 2 + p.ph) * 30 + push * p.z) * dt;
        p.y += p.vy * dt;
        p.a += p.va * dt;
        if (p.y > this.h + 20 || p.x < -40 || p.x > this.w * 1.4) this.spawnPetal(p);
        ctx.globalAlpha = 0.55 + 0.45 * p.z * 0.7;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.scale(1, 0.35 + 0.65 * Math.abs(Math.sin(this.t * 3 + p.ph)));
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // rain
    const nr = Math.round(this.rain.length * wx.rain);
    if (nr > 0) {
      ctx.strokeStyle = "rgba(190, 205, 255, 0.55)";
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i < nr; i++) {
        const p = this.rain[i];
        p.x += (p.vx + push * p.z) * dt;
        p.y += p.vy * dt;
        if (p.y > this.h) {
          this.spawnRain(p);
          continue;
        }
        if (p.x < -40) p.x += this.w + 80;
        if (p.x > this.w + 40) p.x -= this.w + 80;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.r * 0.18, p.y + p.r);
      }
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // splashes on the ground line
      ctx.globalAlpha = 0.35 * wx.rain;
      ctx.strokeStyle = "rgba(200, 215, 255, 0.8)";
      ctx.beginPath();
      const gy = this.h * (780 / 900);
      for (let i = 0; i < 16; i++) {
        const x = ((i * 137.5 + this.t * 220) % (this.w + 40)) - 20;
        const k = (this.t * 3 + i * 0.37) % 1;
        ctx.moveTo(x - 6 * k, gy + 2);
        ctx.quadraticCurveTo(x, gy - 8 * (1 - k), x + 6 * k, gy + 2);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
