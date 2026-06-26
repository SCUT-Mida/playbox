// WaveManager: 控制敌军生成序列
// 将每波拆解为按时间轴触发的 spawn 事件，逐帧推进时间并回调生成。
export default class WaveManager {
  constructor(waves, spawnFn) {
    this.waves = waves; // [[group,...], ...]
    this.spawnFn = spawnFn; // (enemyKey) => void
    this.waveIndex = -1; // 当前已开始的波（-1 表示尚未开始）
    this.state = 'idle'; // idle | running | between | cleared
    this.queue = []; // 当前波待生成事件 {time, key, spawned}
    this.timer = 0;
    this.spawnedCount = 0;
    this.betweenDelay = 0;
  }

  get totalWaves() {
    return this.waves.length;
  }

  get currentWaveNumber() {
    return this.waveIndex + 1; // 1-based；idle 时为 0
  }

  // 开始下一波（返回 true 表示成功开始）
  startNextWave() {
    if (this.state === 'running') return false;
    const next = this.waveIndex + 1;
    if (next >= this.waves.length) return false;
    this.waveIndex = next;
    this._loadWave(next);
    this.state = 'running';
    this.timer = 0;
    return true;
  }

  _loadWave(idx) {
    const groups = this.waves[idx];
    this.queue = [];
    for (const g of groups) {
      for (let i = 0; i < g.count; i++) {
        this.queue.push({
          time: g.start + i * g.interval,
          key: g.enemy,
          spawned: false,
        });
      }
    }
    this.queue.sort((a, b) => a.time - b.time);
    this.spawnedCount = 0;
  }

  // 是否还有未生成 / 未清剿的内容
  get isWaveActive() {
    return this.state === 'running';
  }

  // 该波是否已全部生成完毕
  get waveSpawnDone() {
    return this.state === 'running' && this.queue.every((e) => e.spawned);
  }

  update(dt, aliveEnemyCount) {
    if (this.state !== 'running') return;

    this.timer += dt;
    for (const ev of this.queue) {
      if (!ev.spawned && this.timer >= ev.time) {
        ev.spawned = true;
        this.spawnedCount++;
        this.spawnFn(ev.key);
      }
    }

    // 当全部生成且场上无敌人 → 进入波间空档
    if (this.waveSpawnDone && aliveEnemyCount === 0) {
      if (this.waveIndex + 1 >= this.waves.length) {
        this.state = 'cleared'; // 全部通关
      } else {
        this.state = 'between';
        this.betweenDelay = 4.0; // 自动进入下一波的倒计时
      }
    }
  }

  // 处理波间倒计时；返回是否刚自动开启了下一波
  tickBetween(dt) {
    if (this.state !== 'between') return false;
    this.betweenDelay -= dt;
    if (this.betweenDelay <= 0) {
      this.startNextWave();
      return true;
    }
    return false;
  }

  get betweenRemaining() {
    return Math.max(0, Math.ceil(this.betweenDelay));
  }
}
