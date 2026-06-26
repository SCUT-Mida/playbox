# 鼎足三分 · Three Kingdoms: Tactical Defense

一款基于 Web 的移动端三国主题塔防游戏。玩家扮演主公，部署三国名将（武将塔）阻击敌军，利用**羁绊阵法**与**气势大招**改写战局。

技术栈：**Phaser 3 + Vite**，移动端优先，Canvas 自适应缩放（`Scale.FIT`），强制横屏。

## 本地运行

```bash
npm install
npm run dev      # 开发服务器 http://localhost:5173
npm run build    # 生产构建到 dist/
npm run preview  # 预览生产构建
```

## 核心玩法

- **武将职业**：近战（路面阻挡）/ 远程（高地射击）/ 策士（法术范围）。从底部卡牌**拖拽**到棋盘部署，点击已部署武将可**升级 / 撤退**。
- **护甲克制**：重甲惧法、魔抗惧物——合理搭配职业才能破阵。
- **羁绊阵法**：相邻部署特定武将自动激活（五虎上将、卧龙凤雏、群雄逐鹿……）。
- **气势大招**：击杀积累气势，满 100 可释放**火烧连营**清场。
- **点将抽卡**：开局赠送金币（可十连抽）；初始阵容来自抽卡，多国随机。抽到重复卡可**合并升星**，永久提升武将攻防。
- **存档续战**：战局在波间空档/布阵时自动存档，下次进入可从存档**继续**上次出征。
- **关卡**：黄巾之乱（教学）、虎牢关（三英战吕布）、官渡之战（焚粮）、赤壁之战（火烧连营），每关结尾均有 BOSS。

## 项目结构

```
src/
  config.js            常量、网格/像素互转、伤害公式
  data/                武将 / 敌军 / 羁绊 / 关卡 / 元进度(抽卡·星级) / 存档 数据字典
  managers/            MapManager / WaveManager / BondManager
  entities/            Enemy / General / Projectile
  scenes/              Boot / Preload / Menu / Game / UI / GameOver
  utils/Fx.js          泼墨风格打击特效
```

## 部署（GitHub Pages）

构建产物在 `dist/`，可直接作为静态站点部署。若需推送自动部署到 GitHub Pages，请由维护者新增一个 `.github/workflows/deploy.yml`（出于安全红线，AI 不自动创建 `.github/` 下的工作流文件）。
