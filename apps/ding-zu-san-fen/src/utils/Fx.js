// Fx: 泼墨风格打击特效 —— 短暂图形 + 淡出回收
import { COLORS } from '../config.js';

export default class Fx {
  constructor(scene) {
    this.scene = scene;
  }

  // 近战劈砍：十字墨痕
  slash(x, y, color = 0xffe9a8) {
    const s = this.scene;
    const g = s.add.graphics();
    g.setDepth(60);
    const ang = Math.random() * Math.PI;
    const len = 18;
    g.lineStyle(4, color, 1);
    g.lineBetween(
      x - Math.cos(ang) * len,
      y - Math.sin(ang) * len,
      x + Math.cos(ang) * len,
      y + Math.sin(ang) * len,
    );
    g.lineStyle(2, COLORS.ink, 0.6);
    g.lineBetween(
      x - Math.cos(ang + 1.2) * len * 0.8,
      y - Math.sin(ang + 1.2) * len * 0.8,
      x + Math.cos(ang + 1.2) * len * 0.8,
      y + Math.sin(ang + 1.2) * len * 0.8,
    );
    s.tweens.add({
      targets: g,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 180,
      onComplete: () => g.destroy(),
    });
  }

  // 范围冲击：扩散墨环
  impact(x, y, radius, color = COLORS.gold) {
    const s = this.scene;
    const g = s.add.graphics();
    g.setDepth(58);
    g.fillStyle(color, 0.18);
    g.fillCircle(x, y, radius * 0.4);
    g.lineStyle(4, color, 0.9);
    g.strokeCircle(x, y, radius * 0.4);
    s.tweens.add({
      targets: g,
      alpha: 0,
      duration: 360,
      ease: 'Quad.Out',
      onUpdate: (tween) => {
        const p = tween.progress;
        g.clear();
        g.fillStyle(color, 0.18 * (1 - p));
        g.fillCircle(x, y, radius * (0.4 + p * 0.6));
        g.lineStyle(4, color, 0.9 * (1 - p));
        g.strokeCircle(x, y, radius * (0.4 + p * 0.6));
      },
      onComplete: () => g.destroy(),
    });
  }

  // 单体射线（狙击）
  beam(x1, y1, x2, y2, color = 0xfff2b0) {
    const s = this.scene;
    const g = s.add.graphics();
    g.setDepth(59);
    g.lineStyle(5, color, 1);
    g.lineBetween(x1, y1, x2, y2);
    g.lineStyle(2, 0xffffff, 0.9);
    g.lineBetween(x1, y1, x2, y2);
    s.tweens.add({
      targets: g,
      alpha: 0,
      duration: 200,
      onComplete: () => g.destroy(),
    });
  }

  // 命中火星
  spark(x, y, color = 0xffe9a8) {
    const s = this.scene;
    const g = s.add.graphics();
    g.setDepth(60);
    const n = 4;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      g.fillStyle(color, 1);
      g.fillCircle(x + Math.cos(a) * 4, y + Math.sin(a) * 4, 2);
    }
    s.tweens.add({
      targets: g,
      alpha: 0,
      duration: 180,
      onComplete: () => g.destroy(),
    });
  }

  // 巫医治疗：柔和绿环扩散 + 上浮的「+」
  heal(x, y, radius, color = 0x6fd08a) {
    const s = this.scene;
    const g = s.add.graphics();
    g.setDepth(58);
    g.lineStyle(3, color, 0.9);
    g.strokeCircle(x, y, radius * 0.4);
    s.tweens.add({
      targets: g,
      alpha: 0,
      duration: 420,
      ease: 'Quad.Out',
      onUpdate: (tween) => {
        const p = tween.progress;
        g.clear();
        g.lineStyle(3, color, 0.9 * (1 - p));
        g.strokeCircle(x, y, radius * (0.4 + p * 0.6));
      },
      onComplete: () => g.destroy(),
    });
    // 上浮的「+」标记
    const plus = s.add.text(x, y - 10, '+', {
      fontFamily: 'serif', fontSize: '22px', color: '#9affb8', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(59);
    s.tweens.add({
      targets: plus,
      y: y - 36,
      alpha: 0,
      duration: 520,
      ease: 'Quad.Out',
      onComplete: () => plus.destroy(),
    });
  }

  // 终极技：火烧连营 —— 沿路径燃起连环火，全屏暖光
  fireAssault(path) {
    const s = this.scene;
    // 全屏暖色闪烁
    const flash = s.add.rectangle(
      s.scale.width / 2,
      s.scale.height / 2,
      s.scale.width,
      s.scale.height,
      0xff7a2a,
      0.0,
    );
    flash.setDepth(80);
    flash.setScrollFactor(0);
    s.tweens.add({
      targets: flash,
      fillAlpha: 0.32,
      duration: 120,
      yoyo: true,
      hold: 120,
      onComplete: () => flash.destroy(),
    });
    // 沿路径每隔一段点燃
    const waypoints = path || [];
    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i];
      s.time.delayedCall(i * 70, () => {
        this.impact(wp.x, wp.y, 70, 0xff7a2a);
        this._firePillar(wp.x, wp.y);
      });
    }
  }

  _firePillar(x, y) {
    const s = this.scene;
    const g = s.add.graphics();
    g.setDepth(57);
    const draw = (alpha, scale) => {
      g.clear();
      g.fillStyle(0xff6a1a, 0.5 * alpha);
      g.fillEllipse(x, y, 26 * scale, 50 * scale);
      g.fillStyle(0xffd24a, 0.7 * alpha);
      g.fillEllipse(x, y - 6 * scale, 16 * scale, 32 * scale);
    };
    let t = 0;
    s.time.addEvent({
      delay: 40,
      repeat: 12,
      callback: () => {
        t += 1;
        const a = t < 6 ? t / 6 : 1 - (t - 6) / 7;
        draw(Math.max(0, a), 0.6 + t * 0.12);
      },
      onComplete: () => g.destroy(),
    });
  }
}
