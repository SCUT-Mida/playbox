// MapManager: 解析关卡数据，管理可行走路径与可部署槽位
import { TILE, MAP_COLS, MAP_ROWS, gridToPixel, cellKey, inBounds, SLOT } from '../config.js';

export default class MapManager {
  constructor(level) {
    this.level = level;
    this.segments = [];
    this.length = 0;
    this.pathCells = new Set();
    this.slots = new Map(); // cellKey -> 'road' | 'high'
    this._build();
  }

  _build() {
    // 1) 像素航点
    const pts = this.level.path.map(([c, r]) => gridToPixel(c, r));
    this.waypoints = pts;

    // 2) 分段累计长度
    let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      this.segments.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, len, start: acc });
      acc += len;
    }
    this.length = Math.max(1, acc);

    // 3) 光栅化路径格子
    for (let i = 0; i < pts.length; i++) {
      const { x, y } = pts[i];
      const col = Math.floor((x - gridToPixel(0, 0).x + TILE / 2) / TILE);
      const row = Math.floor((y - gridToPixel(0, 0).y + TILE / 2) / TILE);
      this._markPath(col, row);
    }
    for (const seg of this.segments) {
      const steps = Math.ceil(seg.len / (TILE * 0.25));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = seg.ax + (seg.bx - seg.ax) * t;
        const y = seg.ay + (seg.by - seg.ay) * t;
        const origin = gridToPixel(0, 0);
        const col = Math.floor((x - origin.x + TILE / 2) / TILE);
        const row = Math.floor((y - origin.y + TILE / 2) / TILE);
        this._markPath(col, row);
      }
    }

    // 4) 路面槽位（近战）—— 来自关卡配置
    const rs = this.level.roadSlots || [];
    for (let i = 0; i < rs.length; i += 2) {
      const col = rs[i];
      const row = rs[i + 1];
      if (inBounds(col, row)) this.slots.set(cellKey(col, row), SLOT.ROAD);
    }

    // 5) 高地槽位（远程/策士）—— 邻近路径的非路径格
    for (let col = 0; col < MAP_COLS; col++) {
      for (let row = 0; row < MAP_ROWS; row++) {
        const key = cellKey(col, row);
        if (this.pathCells.has(key)) continue;
        if (this.slots.has(key)) continue;
        if (this._adjacentToPath(col, row)) this.slots.set(key, SLOT.HIGH);
      }
    }
  }

  _markPath(col, row) {
    if (!inBounds(col, row)) return;
    this.pathCells.add(cellKey(col, row));
  }

  _adjacentToPath(col, row) {
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (dc === 0 && dr === 0) continue;
        if (this.pathCells.has(cellKey(col + dc, row + dr))) return true;
      }
    }
    return false;
  }

  // 沿路径按累计进度取坐标（用于敌军位置）
  pointAt(progress) {
    if (progress <= 0) {
      const s = this.segments[0];
      return { x: s.ax, y: s.ay, angle: Math.atan2(s.by - s.ay, s.bx - s.ax) };
    }
    if (progress >= this.length) {
      const s = this.segments[this.segments.length - 1];
      return { x: s.bx, y: s.by, angle: Math.atan2(s.by - s.ay, s.bx - s.ax) };
    }
    for (const s of this.segments) {
      if (progress <= s.start + s.len) {
        const t = (progress - s.start) / s.len;
        return {
          x: s.ax + (s.bx - s.ax) * t,
          y: s.ay + (s.by - s.ay) * t,
          angle: Math.atan2(s.by - s.ay, s.bx - s.ax),
        };
      }
    }
    const s = this.segments[this.segments.length - 1];
    return { x: s.bx, y: s.by, angle: 0 };
  }

  getSlot(col, row) {
    return this.slots.get(cellKey(col, row)) || null;
  }

  hasPath(col, row) {
    return this.pathCells.has(cellKey(col, row));
  }

  // 路径终点（基地）像素
  getBase() {
    return this.waypoints[this.waypoints.length - 1];
  }

  // 路径起点像素
  getStart() {
    return this.waypoints[0];
  }
}
