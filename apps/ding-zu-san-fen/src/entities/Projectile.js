// Projectile: 投射物（箭矢 / 法球 / 火焰）—— 追踪目标命中后造成伤害
import { COLORS } from '../config.js';

export default class Projectile {
  constructor(scene, x, y, target, opts) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = opts.damage;
    this.dmgType = opts.dmgType;
    this.kind = opts.kind || 'arrow';
    this.color = opts.color || 0xfff0c0;
    this.speed = this.kind === 'magic' ? 620 : 820;
    this.dead = false;

    this.gfx = scene.add.graphics();
    this.gfx.setDepth(45);
  }

  update(dt, scene) {
    if (this.dead) return;
    const t = this.target;
    if (!t || !t.alive) {
      this.kill();
      return;
    }
    const dx = t.x - this.x;
    const dy = t.y - this.y;
    const d = Math.hypot(dx, dy);
    const step = this.speed * dt;

    this.gfx.clear();
    if (d <= step + 6) {
      // 命中
      t.takeDamage(this.damage, this.dmgType);
      scene.fx.spark(t.x, t.y, this.color);
      this.kill();
      return;
    }
    const nx = dx / d;
    const ny = dy / d;
    this.x += nx * step;
    this.y += ny * step;

    if (this.kind === 'arrow') {
      const ang = Math.atan2(ny, nx);
      this.gfx.lineStyle(3, this.color, 1);
      this.gfx.lineBetween(
        this.x - Math.cos(ang) * 9,
        this.y - Math.sin(ang) * 9,
        this.x + Math.cos(ang) * 5,
        this.y + Math.sin(ang) * 5,
      );
    } else {
      this.gfx.fillStyle(this.color, 0.95);
      this.gfx.fillCircle(this.x, this.y, 6);
      this.gfx.fillStyle(0xffffff, 0.7);
      this.gfx.fillCircle(this.x, this.y, 2.5);
    }
  }

  kill() {
    this.dead = true;
    this.gfx.destroy();
  }
}
