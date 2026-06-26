// BondManager: 每次部署/移除武将时重新扫描，激活羁绊 Buff
import { BONDS } from '../data/bonds.js';
import { cellKey } from '../config.js';

export default class BondManager {
  constructor() {
    this.active = []; // 当前激活的羁绊列表
  }

  // 重新计算所有武将的 buff 字段，并返回激活的羁绊
  // generals: General 实例数组（已部署）
  recompute(generals) {
    // 重置每位武将的临时倍率
    for (const g of generals) {
      g.buffAtk = 1;
      g.buffCd = 1;
      g.buffHp = 1;
    }

    const byId = {};
    for (const g of generals) {
      byId[g.def.id] = g;
    }

    const ctx = {
      generals,
      byId,
      countTag: (t) => generals.filter((g) => g.def.tags && g.def.tags.includes(t)).length,
      countFaction: (f) => generals.filter((g) => g.def.faction === f).length,
      areAdjacent: (ids) => this._areAdjacent(ids, byId),
    };

    const active = [];
    for (const bond of BONDS) {
      try {
        if (bond.test(ctx)) {
          active.push(bond);
          bond.effect(generals);
        }
      } catch (e) {
        // 单条羁绊异常不应影响其它
        console.warn('Bond eval failed', bond.id, e);
      }
    }

    this.active = active;
    return active;
  }

  _areAdjacent(ids, byId) {
    const members = [];
    for (const id of ids) {
      if (!byId[id]) return false;
      members.push(byId[id]);
    }
    // 任一成员在 8 邻域内有另一成员即视为成阵
    for (let i = 0; i < members.length; i++) {
      let near = false;
      for (let j = 0; j < members.length; j++) {
        if (i === j) continue;
        const dc = Math.abs(members[i].col - members[j].col);
        const dr = Math.abs(members[i].row - members[j].row);
        if (dc <= 1 && dr <= 1) {
          near = true;
          break;
        }
      }
      if (!near) return false;
    }
    return true;
  }
}
