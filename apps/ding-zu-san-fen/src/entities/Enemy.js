// Enemy: 敌军单位 —— 沿路径移动、可被近战阻挡、护甲减伤、状态效果
import { TILE, COLORS, computeDamage } from '../config.js';
import { ENEMIES } from '../data/enemies.js';

const HP_BAR_W = TILE * 0.72;
const HP_BAR_H = 5;

export default class Enemy {
  constructor(scene, key, progress = 0) {
    this.scene = scene;
    this.def = ENEMIES[key];
    this.key = key;
    this.progress = progress;

    this.maxHp = this.def.hp;
    this.hp = this.maxHp;
    this.baseSpeed = this.def.speed;
    this.armor = this.def.armor;
    this.boss = !!this.def.boss;

    // 状态效果
    this.slowT = 0;
    this.slowFactor = 1;
    this.burnT = 0;
    this.burnDps = 0;

    // 阻挡 / 攻击近战武将
    this.blockedBy = null;
    this.atkTimer = 0;

    this.alive = true;
    this.dying = false;
    this.id = Enemy._uid++;

    this._build();
  }

  static _uid = 0;

  _build() {
    const s = this.scene;
    const scale = this.boss ? 1.5 : 1.0;
    this.container = s.add.container(0, 0);
    this.container.setDepth(30);

    // 阴影
    this.shadow = s.add.graphics();
    this.shadow.fillStyle(0x000000, 0.28);
    this.shadow.fillEllipse(0, 6, TILE * 0.5 * scale, TILE * 0.22 * scale);
    this.container.add(this.shadow);

    // 本体
    const body = s.add.graphics();
    const r = (TILE * 0.32) * scale;
    this._drawShape(body, r);
    body.fillStyle(this.def.color, 1);
    body.lineStyle(2.5, COLORS.ink, 1);
    this._drawShape(body, r);
    body.fillPath();
    body.strokePath();
    this.container.add(body);
    this.body = body;

    // 血条
    this.hpBg = s.add.graphics();
    this.hpFill = s.add.graphics();
    const by = -r - 10;
    this.hpBgY = by;
    this.container.add(this.hpBg);
    this.container.add(this.hpFill);

    // 状态点
    this.statusFx = s.add.graphics();
    this.container.add(this.statusFx);

    if (this.boss) {
      const label = s.add.text(0, -r - 22, this.def.name, {
        fontFamily: '"PingFang SC","Microsoft YaHei",sans-serif',
        fontSize: '16px',
        color: '#ffe08a',
        stroke: '#2c2418',
        strokeThickness: 3,
      }).setOrigin(0.5);
      this.container.add(label);
      this.bossLabel = label;
    }

    this._refreshHpBar();
  }

  _drawShape(g, r) {
    const sh = this.def.shape;
    g.beginPath();
    if (sh === 'circle' || sh === 'hex') {
      const sides = sh === 'hex' ? 6 : 24;
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
    } else if (sh === 'diamond') {
      g.moveTo(0, -r);
      g.lineTo(r, 0);
      g.lineTo(0, r);
      g.lineTo(-r, 0);
      g.closePath();
    } else if (sh === 'rect') {
      const w = r * 1.5;
      g.moveTo(-w * 0.5, -r * 0.8);
      g.lineTo(w * 0.5, -r * 0.8);
      g.lineTo(w * 0.5, r * 0.8);
      g.lineTo(-w * 0.5, r * 0.8);
      g.closePath();
    } else {
      // tri
      g.moveTo(0, -r);
      g.lineTo(r * 0.9, r * 0.7);
      g.lineTo(-r * 0.9, r * 0.7);
      g.closePath();
    }
  }

  applySlow(factor, dur) {
    this.slowFactor = Math.min(this.slowFactor, factor);
    this.slowT = Math.max(this.slowT, dur);
  }

  applyBurn(dps, dur) {
    this.burnDps = Math.max(this.burnDps, dps);
    this.burnT = Math.max(this.burnT, dur);
  }

  takeDamage(baseAmount, dmgType) {
    if (!this.alive) return 0;
    const amount = computeDamage(baseAmount, dmgType, this.armor);
    this.hp -= amount;
    // 受击闪白
    this.body.setAlpha(0.45);
    this.scene.time.delayedCall(60, () => this.body && this.body.setAlpha(1));
    if (this.hp <= 0 && !this.dying) {
      this.dying = true;
      this.alive = false;
    }
    this._refreshHpBar();
    return amount;
  }

  _refreshHpBar() {
    const ratio = Math.max(0, this.hp / this.maxHp);
    const w = HP_BAR_W;
    const y = this.hpBgY;
    this.hpBg.clear();
    this.hpBg.fillStyle(0x000000, 0.5);
    this.hpBg.fillRect(-w / 2 - 1, y - 1, w + 2, HP_BAR_H + 2);
    this.hpFill.clear();
    const col = ratio > 0.5 ? 0x6fd06a : ratio > 0.25 ? 0xe8c14a : 0xe05a4a;
    this.hpFill.fillStyle(col, 1);
    this.hpFill.fillRect(-w / 2, y, w * ratio, HP_BAR_H);
  }

  get x() {
    return this.container.x;
  }
  get y() {
    return this.container.y;
  }
  get pos() {
    return { x: this.container.x, y: this.container.y };
  }

  effectiveSpeed() {
    return this.baseSpeed * (this.slowT > 0 ? this.slowFactor : 1);
  }

  update(dt, scene) {
    if (!this.alive) return;

    // 燃烧
    if (this.burnT > 0) {
      this.takeDamage(this.burnDps * dt, 'MAGIC');
      this.burnT -= dt;
      if (!this.alive) return;
    }
    // 减速衰减
    if (this.slowT > 0) {
      this.slowT -= dt;
      if (this.slowT <= 0) this.slowFactor = 1;
    }

    if (this.blockedBy && this.blockedBy.alive) {
      // 被阻挡：攻击近战武将
      this.atkTimer -= dt;
      if (this.atkTimer <= 0) {
        this.atkTimer = this.def.atkCD;
        this.blockedBy.takeDamageFromEnemy(this.def.dmg);
      }
    } else {
      this.blockedBy = null;
      // 前进
      this.progress += this.effectiveSpeed() * dt;
      if (this.progress >= scene.map.length) {
        // 抵达基地
        scene.onLeak(this);
        return;
      }
    }

    // 更新位置
    const p = scene.map.pointAt(this.progress);
    this.container.x = p.x;
    this.container.y = p.y;

    // 状态特效
    this.statusFx.clear();
    let ox = -10;
    if (this.slowT > 0) {
      this.statusFx.fillStyle(COLORS.morale, 1);
      this.statusFx.fillCircle(ox, -22, 3);
      ox += 8;
    }
    if (this.burnT > 0) {
      this.statusFx.fillStyle(0xff7a2a, 1);
      this.statusFx.fillCircle(ox, -22, 3);
    }
  }

  destroy() {
    this.container.destroy();
  }
}
