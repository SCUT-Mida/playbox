// General: 武将塔 —— 近战(阻挡)/远程(射击)/策士(法术)，含技能与羁绊 buff
import { TILE, COLORS, gridToPixel } from '../config.js';
import { LEVEL_MULT, MAX_LEVEL } from '../data/generals.js';

export default class General {
  constructor(scene, def, col, row) {
    this.scene = scene;
    this.def = def;
    this.col = col;
    this.row = row;
    const p = gridToPixel(col, row);
    this.x = p.x;
    this.y = p.y;

    this.level = 1;
    this.alive = true;

    // 羁绊倍率（由 BondManager 写入）
    this.buffAtk = 1;
    this.buffCd = 1;
    this.buffHp = 1;

    this.atkTimer = 0.4; // 部署后短暂延迟再攻击
    this.skillTimer = def.skill.cd;
    this.atkAnim = 0;
    this.skillAnim = 0;

    this.blockedEnemies = [];

    this.maxHp = this._computeMaxHp();
    this.hp = this.maxHp;

    this.showRange = false;
    this._build();
  }

  get cls() {
    return this.def.cls;
  }

  _computeMaxHp() {
    return Math.round(this.def.hp * LEVEL_MULT.hp[this.level - 1] * this.buffHp);
  }
  get atk() {
    return this.def.atk * LEVEL_MULT.atk[this.level - 1] * this.buffAtk;
  }
  get rangePx() {
    return this.def.range * TILE;
  }
  get atkInterval() {
    return this.def.atkCD / LEVEL_MULT.speed[this.level - 1] * this.buffCd;
  }
  get skillInterval() {
    return this.def.skill.cd / LEVEL_MULT.speed[this.level - 1] * this.buffCd;
  }

  _build() {
    const s = this.scene;
    this.container = s.add.container(this.x, this.y);
    this.container.setDepth(50);

    const fac = COLORS.faction[this.def.faction] || COLORS.ink;
    const r = TILE * 0.34;

    // 阵营底盘
    const base = s.add.graphics();
    base.fillStyle(0x000000, 0.25);
    base.fillCircle(2, 4, r + 3);
    base.fillStyle(fac, 0.95);
    base.fillCircle(0, 0, r + 3);
    base.lineStyle(2.5, COLORS.ink, 1);
    base.strokeCircle(0, 0, r + 3);
    this.container.add(base);
    this.baseGfx = base;

    // 内圈
    const inner = s.add.graphics();
    inner.fillStyle(0xf5ecd6, 0.96);
    inner.fillCircle(0, 0, r - 1);
    this.container.add(inner);

    // 武将名（单字）
    this.nameText = s.add.text(0, -1, this.def.char, {
      fontFamily: '"PingFang SC","Microsoft YaHei",sans-serif',
      fontSize: '22px',
      color: '#2c2418',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.container.add(this.nameText);

    // 职业色环（细圈）区分近战/远程/策士
    const ringCol = this.def.cls === 'MELEE' ? 0xd24d3a : this.def.cls === 'RANGE' ? 0x3f8f6a : 0x7a57c4;
    const ring = s.add.graphics();
    ring.lineStyle(3, ringCol, 1);
    ring.strokeCircle(0, 0, r + 6.5);
    this.container.add(ring);
    this.ring = ring;

    // 等级标记
    this.levelFx = s.add.graphics();
    this.container.add(this.levelFx);
    this._drawLevel();

    // 技能就绪光点
    this.skillFx = s.add.graphics();
    this.container.add(this.skillFx);

    // 血条（仅受伤时显示）
    this.hpFx = s.add.graphics();
    this.container.add(this.hpFx);

    // 射程指示
    this.rangeFx = s.add.graphics();
    this.container.add(this.rangeFx);
  }

  _drawLevel() {
    this.levelFx.clear();
    if (this.level <= 1) return;
    for (let i = 0; i < this.level - 1; i++) {
      this.levelFx.fillStyle(COLORS.gold, 1);
      this.levelFx.fillCircle(-10 + i * 9, 20, 3);
    }
  }

  setShowRange(show) {
    this.showRange = show;
    this.rangeFx.clear();
    if (!show) return;
    this.rangeFx.lineStyle(2, 0xffffff, 0.35);
    this.rangeFx.fillStyle(0xffffff, 0.06);
    this.rangeFx.fillCircle(0, 0, this.rangePx);
    this.rangeFx.strokeCircle(0, 0, this.rangePx);
  }

  pulse(amount = 1.12) {
    this.container.scale = amount;
    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      duration: 140,
      ease: 'Quad.Out',
    });
  }

  refreshBonds() {
    // 羁绊变化后重算上限，保留当前血量比例
    const newMax = this._computeMaxHp();
    if (newMax !== this.maxHp) {
      const ratio = this.hp / this.maxHp;
      this.maxHp = newMax;
      this.hp = Math.min(newMax, Math.max(1, Math.round(newMax * ratio)));
    }
  }

  upgrade() {
    if (this.level >= MAX_LEVEL) return false;
    this.level++;
    this.maxHp = this._computeMaxHp();
    this.hp = this.maxHp; // 升级回满
    this._drawLevel();
    this.pulse(1.18);
    return true;
  }

  takeDamageFromEnemy(dmg) {
    if (!this.alive) return;
    this.hp -= dmg;
    this.nameText.setAlpha(0.5);
    this.scene.time.delayedCall(70, () => this.nameText && this.nameText.setAlpha(1));
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
    this._drawHp();
  }

  _drawHp() {
    this.hpFx.clear();
    if (this.hp >= this.maxHp) return;
    const w = TILE * 0.7;
    const y = 28;
    const ratio = Math.max(0, this.hp / this.maxHp);
    this.hpFx.fillStyle(0x000000, 0.5);
    this.hpFx.fillRect(-w / 2 - 1, y - 1, w + 2, 6);
    const col = ratio > 0.5 ? 0x6fd06a : ratio > 0.25 ? 0xe8c14a : 0xe05a4a;
    this.hpFx.fillStyle(col, 1);
    this.hpFx.fillRect(-w / 2, y, w * ratio, 4);
  }

  // 选取目标（最前方 = progress 最大）；近战优先命中被阻挡者
  acquireTarget(enemies) {
    const range = this.rangePx;
    let best = null;
    let bestProg = -1;
    if (this.def.cls === 'MELEE' && this.blockedEnemies.length) {
      for (const e of this.blockedEnemies) {
        if (!e.alive) continue;
        if (e.progress > bestProg) {
          bestProg = e.progress;
          best = e;
        }
      }
      if (best) return best;
    }
    for (const e of enemies) {
      if (!e.alive) continue;
      const dx = e.x - this.x;
      const dy = e.y - this.y;
      if (dx * dx + dy * dy <= range * range) {
        if (e.progress > bestProg) {
          bestProg = e.progress;
          best = e;
        }
      }
    }
    return best;
  }

  update(dt, scene) {
    if (!this.alive) return;

    // 技能就绪指示
    this.skillFx.clear();
    if (this.skillTimer <= 0) {
      this.skillFx.fillStyle(COLORS.gold, 0.9);
      this.skillFx.fillCircle(15, -15, 4 + Math.sin(scene.time.now / 180) * 1.2);
      this.skillFx.lineStyle(1.5, 0xffffff, 0.6);
      this.skillFx.strokeCircle(15, -15, 6);
    }

    // 技能冷却
    this.skillTimer -= dt;
    if (this.skillTimer <= 0) {
      const target = this.acquireTarget(scene.enemies);
      if (target) {
        this.triggerSkill(target, scene);
        this.skillTimer = this.skillInterval;
      }
    }

    // 普通攻击
    this.atkTimer -= dt;
    if (this.atkTimer <= 0) {
      const target = this.acquireTarget(scene.enemies);
      if (target) {
        this.attack(target, scene);
        this.atkTimer = this.atkInterval;
      } else {
        this.atkTimer = 0.15; // 无目标时短轮询
      }
    }
  }

  attack(target, scene) {
    const dmg = this.atk;
    if (this.def.cls === 'MELEE') {
      target.takeDamage(dmg, this.def.dmgType);
      scene.fx.slash(target.x, target.y, 0xffe9a8);
      this.pulse(1.12);
      return;
    }
    const kind = this.def.cls === 'MAGE' ? 'magic' : 'arrow';
    scene.spawnProjectile(this.x, this.y - 6, target, {
      damage: dmg,
      dmgType: this.def.dmgType,
      kind,
      color: this.def.cls === 'MAGE' ? 0xb08bd6 : 0xfff0c0,
    });
    this.pulse(1.1);
  }

  triggerSkill(target, scene) {
    const skill = this.def.skill;
    this.pulse(1.25);

    if (skill.type === 'AOE') {
      // 围绕自身的范围物理/法术伤害
      const radius = skill.radius * TILE;
      scene.fx.impact(this.x, this.y, radius, COLORS.gold);
      for (const e of scene.enemies) {
        if (!e.alive) continue;
        const dx = e.x - this.x;
        const dy = e.y - this.y;
        if (dx * dx + dy * dy <= radius * radius) {
          e.takeDamage(this.atk * skill.mult, this.def.dmgType);
        }
      }
    } else if (skill.type === 'SNIPE') {
      scene.fx.beam(this.x, this.y - 6, target.x, target.y, 0xfff2b0);
      target.takeDamage(this.atk * skill.mult, this.def.dmgType);
    } else if (skill.type === 'SPELL') {
      const radius = skill.radius * TILE;
      scene.fx.impact(target.x, target.y, radius, 0xb08bd6);
      for (const e of scene.enemies) {
        if (!e.alive) continue;
        const dx = e.x - target.x;
        const dy = e.y - target.y;
        if (dx * dx + dy * dy <= radius * radius) {
          e.takeDamage(this.atk * skill.mult, 'MAGIC');
          if (skill.slow) e.applySlow(skill.slow.factor, skill.slow.dur);
          if (skill.burn) e.applyBurn(skill.burn.dps, skill.burn.dur);
        }
      }
    }
  }

  destroy() {
    this.alive = false;
    this.container.destroy();
  }
}
