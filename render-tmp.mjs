import puppeteer from 'puppeteer-core';

const URL = 'http://localhost:4173/';
const OUT = '/tmp/shots';
import { mkdirSync } from 'fs';
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium',
  headless: 'new',
  args: ['--no-sandbox', '--disable-web-security', '--use-gl=swiftshader', '--enable-webgl'],
});

const page = await browser.newPage();
await page.setViewport({ width: 440, height: 900, deviceScaleFactor: 2, isMobile: true });

await page.goto(URL, { waitUntil: 'networkidle2' });
await new Promise((r) => setTimeout(r, 400));

// 点击「开始游戏」打开游戏 overlay
await page.waitForSelector('#play-dzf');
await page.click('#play-dzf');
await page.waitForSelector('canvas', { timeout: 10000 });
await new Promise((r) => setTimeout(r, 1500)); // 等 Boot→Preload→Menu

// canvas 实际边界（FIT 缩放后的屏幕坐标）
const box = await page.$eval('canvas', (c) => {
  const r = c.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});
// canvas 内 720×1280 逻辑坐标 -> 屏幕坐标
const px = (cx, cy) => [box.x + (cx / 720) * box.w, box.y + (cy / 1280) * box.h];

await page.screenshot({ path: `${OUT}/1-menu.png` });

// 点击第一个关卡卡（MenuScene 卡片中心约 (360,430)）
await page.mouse.click(...px(360, 430));
await new Promise((r) => setTimeout(r, 1400)); // 进入 GameScene
await page.screenshot({ path: `${OUT}/2-game-idle.png` });

// 部署一名近战武将（关羽）：从底部第一张卡拖到路径上的路面槽
const cardA = px(84, 1126);     // 第一张武将卡中心
const slotA = px(232, 272);     // road 槽 (2,1)
await page.mouse.move(cardA[0], cardA[1]);
await page.mouse.down();
for (let i = 1; i <= 8; i++) {
  const t = i / 8;
  await page.mouse.move(cardA[0] + (slotA[0] - cardA[0]) * t, cardA[1] + (slotA[1] - cardA[1]) * t);
  await new Promise((r) => setTimeout(r, 30));
}
await page.mouse.up();
await new Promise((r) => setTimeout(r, 600));

// 再部署一名远程武将（黄忠，第5张卡）到相邻高地
const cardB = px(360, 1126);    // 第5张卡（黄忠 远程）
const slotB = px(296, 208);     // (3,0) 附近高地（路径(2,0)邻居）
await page.mouse.move(cardB[0], cardB[1]);
await page.mouse.down();
for (let i = 1; i <= 8; i++) {
  const t = i / 8;
  await page.mouse.move(cardB[0] + (slotB[0] - cardB[0]) * t, cardB[1] + (slotB[1] - cardB[1]) * t);
  await new Promise((r) => setTimeout(r, 30));
}
await page.mouse.up();
await new Promise((r) => setTimeout(r, 500));
await page.screenshot({ path: `${OUT}/3-game-deployed.png` });

// 召唤第一波，让敌军（Q版）出现
await page.mouse.click(...px(600, 100)); // 「开始第一波」按钮
await new Promise((r) => setTimeout(r, 3500));
await page.screenshot({ path: `${OUT}/4-game-wave.png` });

console.log('box:', JSON.stringify(box));
await browser.close();
console.log('done');
