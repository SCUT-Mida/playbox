// ============================================================================
// 灵墟·问剑录 · 人物角色美术预设（issue #97）
//
// 按设计稿「AI 绘图提示词清单」为全部 15 位角色预设形象设定：
//   appearance — 中文形象释义（服饰 / 发式 / 武器 / 神态）
//   palette    — 主色调
//   scene      — 背景场景（R 宣纸纹理 / SR 门派洞府 / SSR 史诗场景）
//   promptEn   — 完整英文绘图提示词（可直接粘贴 Midjourney / SD）
//
// 画风按稀有度分三档（ART_STYLES），统一参数后缀（ART_SUFFIX）；
// Stable Diffusion 用户用 SD_TRANSLATE 替换参数并配 SD_NEGATIVE 负面词。
//
// 导出：
//   artPreset(cardOrId)          → 单卡预设（无则 null）
//   fullPrompt(cardOrId)         → 英文提示词 + 统一参数（可直接投喂）
// ============================================================================

// ── 通用参数（所有提示词统一后缀）──────────────────────────────────────────────
export const ART_SUFFIX = '--ar 4:3 --v 6.0 --style raw --s 150';

// SD 用户替换规则与负面词
export const SD_TRANSLATE = {
  replace: ', masterpiece, best quality, 8k, (highres:1.2)',
  negative: '(worst quality, low quality:1.4), deformed, blurry, bad anatomy',
};

// ── 稀有度画风前缀（中英对照）──────────────────────────────────────────────────
export const ART_STYLES = {
  R: {
    name: '墨线白描·逸品青玉',
    prefixZh: '墨线白描工笔，淡彩晕染，宣纸底纹，大面积留白，线条为主，色彩为辅，宋画花鸟人物册页风格，半身肖像，微俯视15°，素雅古朴',
    prefixEn: 'ink line drawing Gongbi style with light color wash, rice paper texture, large negative space, Song dynasty album aesthetic, half-body portrait, looking down slightly 15 degrees',
  },
  SR: {
    name: '工笔重彩·绝品紫金',
    prefixZh: '工笔重彩，淡彩半动态，服饰精细华丽，有云纹/雷纹装饰，背景具象门派洞府，金紫辉映，衣袂飘动感，局部微动态，半身肖像，微俯视15°',
    prefixEn: 'Gongbi heavy color painting style, ornate costume with cloud/thunder patterns, concrete sect hall background, gold and purple accents, floating ribbons, subtle motion, half-body portrait, looking down slightly 15 degrees',
  },
  SSR: {
    name: '泼墨泼彩·至品彩凰',
    prefixZh: '张大千风格泼墨泼彩，全动态炸裂感，色彩绚丽撞色，破框张力，辉光+粒子环绕，史诗级场景，微俯视15°，角色占卡面75%，边缘溢出，气势磅礴',
    prefixEn: 'splashed ink and heavy color painting style (Zhang Daqian style), explosive dynamic composition, breaking out of the card frame, glow and particles, epic scene, character filling 75% of the frame, looking down slightly 15 degrees',
  },
};
export function artStyle(rarity) { return ART_STYLES[rarity] || ART_STYLES.R; }

// ── 15 位角色预设（按 R / SR / SSR 分组）────────────────────────────────────────
export const ART_PRESETS = {
  // ── R 卡 · 逸品青玉 ────────────────────────────────────────────────────────
  R001: {
    appearance: '绿白汉服竹叶刺绣，马尾高束，执青竹剑，清瘦挺拔的年轻剑修',
    palette: '淡绿 + 墨色', scene: '竹林 · 宣纸留白',
    promptEn: 'Half-body portrait of a young male sword cultivator, holding a green bamboo longsword, wearing elegant green and white Hanfu robes with bamboo leaf embroidery, slender and refined appearance, long black hair tied in a high ponytail, standing under a bamboo forest, light ink wash painting style, line drawing with light green and ink color, rice paper texture background, negative space composition, Song dynasty aesthetic, looking down slightly, 2.5D isometric view, clear layers',
  },
  R002: {
    appearance: '狐耳狐尾狐女，指夹燃烧黄符，红金短袍，狡黠笑容',
    palette: '火红 + 墨淡红雾', scene: '赤焰峡谷 · 淡红雾宣纸',
    promptEn: 'Half-body portrait of a seductive young woman with fox ears and a fluffy red tail, holding a burning yellow talisman between her fingers, wearing vibrant red and gold short robes, mischievous smile, playful pose, floating sparks around her, pale ink wash background with subtle red mist, light color palette, rice paper texture, line drawing emphasis, looking down slightly',
  },
  R003: {
    appearance: '魁梧壮汉，龟甲纹重铠，持圆盾 + 铁锤，灰短发，下颌坚毅',
    palette: '深蓝墨色', scene: '寒潭深渊 · 水纹宣纸',
    promptEn: 'Half-body portrait of a burly muscular male warrior, wearing heavy black tortoise-shell patterned armor with a large round shield, holding a giant iron hammer, steady and resolute expression, short grey hair, strong jawline, dark blue ink wash style, heavy lines, rice paper background with subtle water wave texture, light color, Song dynasty military style, looking down slightly',
  },
  R004: {
    appearance: '银白镶金轻甲，执金剑斜指，眼神锐利，短黑发整洁',
    palette: '金银色调', scene: '金戈关隘 · 金箔底纹',
    promptEn: 'Half-body portrait of a sharp-eyed male swordsman, wearing silver-white light armor with gold trim, holding a gleaming golden longsword pointing diagonally downward, serious and intense gaze, short neat black hair, metallic gold and silver light color palette, sharp line strokes, rice paper background with subtle geometric gold foil texture, looking down slightly',
  },
  R005: {
    appearance: '裸臂黄袍，石拳套，褐皮护胸，沉稳表情，棕短发',
    palette: '赭石 + 墨色', scene: '地煞迷宫 · 山岩底纹',
    promptEn: 'Half-body portrait of a sturdy bare-armed male warrior, wearing earthy yellow short robes and a brown leather chest guard, massive stone gauntlets on both fists, grounded and calm expression, short brown hair, heavy and stable composition, ochre and ink color palette, rice paper background with mountain rock texture, looking down slightly',
  },
  R006: {
    appearance: '温柔女医，青白道袍，捧青瓷药炉，长发披散，眉目温婉',
    palette: '淡绿墨色', scene: '万木回廊 · 柳叶暗纹',
    promptEn: 'Half-body portrait of a gentle female healer, wearing flowing light green and white Taoist robes, holding a small celadon medicine furnace in both hands, soft compassionate smile, long black hair loosely falling, delicate features, light green and ink wash style, rice paper background with faint willow leaf patterns, spacious composition, looking down slightly',
  },
  R007: {
    appearance: '不羁散修，破旧红衣（灼痕），铁剑扛肩，蓬松长发，狂放笑容',
    palette: '火红 + 墨色', scene: '游历荒野 · 火焰淡痕',
    promptEn: 'Half-body portrait of a carefree male rogue cultivator, wearing tattered red robes with burn marks, holding a simple iron longsword resting on his shoulder, unruly long hair tied loosely, confident and wild smile, fiery red and ink color palette, rice paper background with faint flame wisps, loose brushwork style, looking down slightly',
  },
  R008: {
    appearance: '高冷女修，纯白银雪绣袍，指夹冰蓝符，银白长发，神情疏离',
    palette: '淡蓝墨色', scene: '寒潭霜月 · 霜晶底纹',
    promptEn: 'Half-body portrait of a cold aloof female cultivator, wearing pure white robes with silver snowflake embroidery, holding an ice-blue talisman between her fingers, long silver-white hair, icy and distant expression, pale blue and white ink wash style, rice paper background with frost crystal patterns, empty and cold atmosphere, looking down slightly',
  },
  R009: {
    appearance: '敏捷阵修，金线羽纹道袍，持罗盘，短黑发 + 羽簪，机敏神色',
    palette: '金褐色调', scene: '布阵荒台 · 阵法暗纹',
    promptEn: 'Half-body portrait of a nimble male formation master, wearing golden-thread Taoist robes with feather patterns, holding a bronze compass in one hand, quick and clever expression, short dark hair with a feather hairpin, golden and light brown color palette, rice paper background with faint circular array patterns, dynamic line strokes, looking down slightly',
  },

  // ── SR 卡 · 绝品紫金 ───────────────────────────────────────────────────────
  SR001: {
    appearance: '白鹤羽衣金云纹，持玉净瓶，黑长发飘飞缀白羽簪，慈悲神态',
    palette: '淡青 + 金色', scene: '仙山云海 · 白鹤环绕',
    promptEn: 'Half-body portrait of a celestial female healer, wearing flowing white crane-feather robes with gold cloud patterns, holding a luminous jade purification bottle, long black hair flowing in the wind with a white feather hairpin, gentle and merciful expression, standing on a misty sacred mountain peak with cranes flying behind, Gongbi heavy color painting style, light cyan and gold color scheme, dynamic ribbons floating around her, detailed embroidery texture, ethereal atmosphere, looking down slightly, 2.5D isometric depth',
  },
  SR002: {
    appearance: '红黑战袍金火纹，持赤红巨剑（火焰缠绕），剑眉怒目，红绳束发髻',
    palette: '红金色调', scene: '熔炉宗门大殿 · 火星飞溅',
    promptEn: 'Half-body portrait of a dominant male sword master, wearing black and red battle robes with golden fire patterns, holding a massive crimson greatsword glowing with flames, sharp and overbearing gaze, long black hair tied in a warrior bun with red ribbon, standing in a burning forge sect hall, Gongbi heavy color, red and gold color scheme, sparks and embers floating around, dynamic cape blowing sideways, looking down slightly',
  },
  SR003: {
    appearance: '暗紫蛇鳞紧身袍缀银饰，持盘蛇法杖，竖瞳狡笑，黑发缠小蛇',
    palette: '紫金色调 · 幽绿辉光', scene: '地底石窟 · 幽绿磷光',
    promptEn: 'Half-body portrait of a seductive and dangerous female mage, wearing dark purple tight-fitting robes with snake-scale patterns and silver accessories, holding a coiled serpent staff, narrow slitted pupils and a sly smile, long black hair entwined with small live snakes, standing in a dim underground grotto, deep purple and gold color scheme, eerie green glow, winding lines, luxurious yet sinister atmosphere, looking down slightly',
  },
  SR004: {
    appearance: '青莲道袍宽袖，持拂尘，灰白长发木簪，出尘安和神态',
    palette: '淡绿 + 银色调', scene: '青莲莲池 · 薄雾花瓣',
    promptEn: 'Half-body portrait of a serene male formation master, wearing green lotus-patterned Taoist robes with flowing wide sleeves, holding a horsetail whisk, peaceful and otherworldly expression, long grey-white hair tied in a topknot with a wooden hairpin, standing on a vast lotus pond with mist, light green and silver color scheme, Gongbi style with soft lighting, floating lotus petals around him, looking down slightly',
  },

  // ── SSR 卡 · 至品彩凰 ──────────────────────────────────────────────────────
  SSR001: {
    appearance: '牛角盔碎暗金魔甲，持巨斧（赤雷缠绕），红眼狂发，面部上古部族图腾纹',
    palette: '红黑金撞色', scene: '火山战场 · 熔岩断柱',
    promptEn: 'Epic half-body portrait of a monstrous ancient war god, muscular gigantic physique, wearing ox-horn helmet and broken dark gold demon armor, holding a massive battle axe crackling with crimson lightning, wild unkempt hair and fierce blazing red eyes, face covered in ancient tribal totem tattoos, standing on a volcanic battlefield with flowing lava and shattered pillars, splashed ink and heavy color painting style (Zhang Daqian style), explosive red and black and gold color clash, particles of fire and smoke bursting outward, breaking out of the card frame, dynamic and overwhelming presence, looking down with extreme intensity',
  },
  SSR002: {
    appearance: '七色彩凰霓裳 + 金凤冠，持玉杯甘露，端坐瑶池金莲，慈和垂目',
    palette: '玫瑰金 + 孔雀蓝 + 玉白', scene: '瑶池天湖 · 虹云仙鹤',
    promptEn: 'Ethereal half-body portrait of a supreme celestial goddess, wearing a magnificent seven-colored celestial robe with phoenix patterns and golden crown, holding a luminous jade goblet filled with sweet dew, extremely serene and compassionate expression, long flowing hair surrounded by a heavenly halo, seated on a giant golden lotus above the Heavenly Lake (Yao Chi) with rainbow clouds and flying cranes, splashed color and ink wash style with gold leaf effect, gradient of rose gold, peacock blue and jade white, celestial particles and peach blossom petals swirling around her, divine light spilling beyond card edges, looking down with benevolence',
  },
};

const PRESET_MAP = ART_PRESETS;

export function artPreset(cardOrId) {
  const id = typeof cardOrId === 'string' ? cardOrId : (cardOrId && cardOrId.id);
  return PRESET_MAP[id] || null;
}

// 完整可投喂提示词 = 英文提示词 + 统一参数后缀
export function fullPrompt(cardOrId) {
  const p = artPreset(cardOrId);
  return p ? `${p.promptEn} ${ART_SUFFIX}` : '';
}
