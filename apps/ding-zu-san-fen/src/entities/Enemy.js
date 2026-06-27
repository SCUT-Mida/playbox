// Enemy: 敌军单位 —— 沿路径移动、可被近战阻挡、护甲减伤、状态效果
import { TILE, COLORS, computeDamage } from '../config.js';
import { ENEMIES } from '../data/enemies.js';
import { drawChibi, optsForEnemy } from '../utils/Chibi.js';

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

    // 巫医治疗计时（def.heal 存在时启用）
    this.healTimer = this.def.heal ? this.def.heal.interval : 0;

    // 阻挡 / 攻击近战武将
    this.blockedBy = null;
    this.atkTimer = 0;

    this.alive = true;
    this.dying = false;
    this.leaked = false;
    this.id = Enemy._uid++;

    this._build();
  }

  static _uid = 0;

  // 场景重开时重置 UID 计数，避免无限增长
  static resetUid() {
    Enemy._uid = 0;
  }

  // 巫医范围治疗（纯逻辑，无场景依赖，便于单测）：
  // 治疗 healer 周围 radiusPx 内、血量未满的友军（不含自身），返回实际治疗单位数。
  // 单位对象需具备 { x, y, hp, maxHp, alive }；若提供 _refreshHpBar 则同步刷新血条。
  static applyHealAround(enemies, healer, radiusPx, amount) {
    if (!enemies || !healer || amount <= 0) return 0;
    const r2 = radiusPx * radiusPx;
    let count = 0;
    for (const e of enemies) {
      if (e === healer || !e.alive) continue;
      if (e.hp >= e.maxHp) continue;
      const dx = e.x - healer.x;
      const dy = e.y - healer.y;
      if (dx * dx + dy * dy <= r2) {
        e.hp = Math.min(e.maxHp, e.hp + amount);
        if (typeof e._refreshHpBar === 'function') e._refreshHpBar();
        count++;
      }
    }
    return count;
  }

  _build() {
    const s = this.scene;
    const scale = this.boss ? 1.5 : 1.0;
    const size = TILE * 0.72 * scale;
    this.size = size;
    const feetY = size * 0.42;
    this.feetY = feetY;
    this.container = s.add.container(0, 0);
    this.container.setDepth(30);

    // 阴影
    this.shadow = s.add.graphics();
    this.shadow.fillStyle(0x000000, 0.28);
    this.shadow.fillEllipse(0, feetY + 3, size * 0.6, size * 0.24);
    this.container.add(this.shadow);

    // Q版敌军小人（开罗风格）
    this.body = s.add.graphics();
    drawChibi(this.body, { ...optsForEnemy(this.def), size });
    this.container.add(this.body);

    // 血条
    this.hpBg = s.add.graphics();
    this.hpFill = s.add.graphics();
    const by = -size * 0.5 - 10;
    this.hpBgY = by;
    this.container.add(this.hpBg);
    this.container.add(this.hpFill);

    // 状态点
    this.statusFx = s.add.graphics();
    this.container.add(this.statusFx);

    if (this.boss) {
      const label = s.add.text(0, -size * 0.5 - 26, this.def.name, {
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

  applySlow(factor, dur) {
    this.slowFactor = Math.min(this.slowFactor, factor);
    this.slowT = Math.max(this.slowT, dur);
  }

  applyBurn(dps, dur) {
    this.burnDps = Math.max(this.burnDps, dps);
    this.burnT = Math.max(this.burnT, dur);
  }

  // flash: 是否触发受击闪白。持续伤害(燃烧 DoT)应传 false，避免每帧堆积闪白回调与高频闪烁
  takeDamage(baseAmount, dmgType, flash = true) {
    if (!this.alive) return 0;
    const amount = computeDamage(baseAmount, dmgType, this.armor);
    this.hp -= amount;
    // 受击闪白（仅瞬时命中触发；燃烧等持续伤害走 flash=false 绕开）
    if (flash) {
      this.body.setAlpha(0.45);
      this.scene.time.delayedCall(60, () => this.body && this.body.setAlpha(1));
    }
    if (this.hp <= 0 && !this.dying) {
      this.dying = true;
      this.alive = false;
    }
    this._refreshHpBar();
    return amount;
  }

  _refreshHpBar() {
    const ratio = Math.max(0, this.hp / this.maxHp);
    const w = this.size * 0.9;
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

    // 燃烧（持续伤害：flash=false 绕开受击闪白，避免每帧堆积回调与闪烁）
    if (this.burnT > 0) {
      this.takeDamage(this.burnDps * dt, 'MAGIC', false);
      this.burnT -= dt;
      if (!this.alive) return;
    }
    // 减速衰减
    if (this.slowT > 0) {
      this.slowT -= dt;
      if (this.slowT <= 0) this.slowFactor = 1;
    }

    // 巫医周期治疗（无论是否被阻挡都生效）：奶满周围残血友军
    if (this.def.heal) {
      this.healTimer -= dt;
      if (this.healTimer <= 0) {
        this.healTimer = this.def.heal.interval;
        const radiusPx = this.def.heal.radius * TILE;
        const healed = Enemy.applyHealAround(scene.enemies, this, radiusPx, this.def.heal.amount);
        if (healed > 0 && scene.fx) scene.fx.heal(this.x, this.y, radiusPx, 0x6fd08a);
      }
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

    // 状态特效（悬于头顶血条之上）
    this.statusFx.clear();
    const sy = this.hpBgY - 6;
    let ox = -10;
    if (this.slowT > 0) {
      this.statusFx.fillStyle(COLORS.morale, 1);
      this.statusFx.fillCircle(ox, sy, 3);
      ox += 8;
    }
    if (this.burnT > 0) {
      this.statusFx.fillStyle(0xff7a2a, 1);
      this.statusFx.fillCircle(ox, sy, 3);
    }
  }

  destroy() {
    this.container.destroy();
    // 置空受击闪白引用，避免延迟回调对已销毁对象调用 setAlpha 触发 Phaser 警告
    this.body = null;
  }
}
