// 78 张韦特塔罗牌数据（牌义与图片来自 Lurell/tarot-vibecoding，MIT License）
const DECK = [
  {
    "id": "m00",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 0,
    "nameZh": "愚者",
    "nameEn": "The Fool",
    "keywordsUpright": [
      "新的开始",
      "自由",
      "冒险",
      "天真",
      "无限可能"
    ],
    "keywordsReversed": [
      "鲁莽",
      "轻率",
      "犹豫不决",
      "错失机会"
    ],
    "descriptionZh": "愚者代表人生旅程的起点，象征纯真、勇气和无限可能。正位时鼓励你勇敢迈出第一步，相信自己的直觉；逆位则提醒你审视自己的选择是否太过轻率。",
    "imageFile": "m00.webp"
  },
  {
    "id": "m01",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 1,
    "nameZh": "魔术师",
    "nameEn": "The Magician",
    "keywordsUpright": [
      "创造力",
      "技能",
      "意志力",
      "自信",
      "资源丰富"
    ],
    "keywordsReversed": [
      "欺骗",
      "能力不足",
      "缺乏规划",
      "滥用才能"
    ],
    "descriptionZh": "魔术师象征将想法转化为现实的能力。他掌握四大元素，代表你拥有实现目标所需的一切资源。正位代表行动力和创造力的完美结合。",
    "imageFile": "m01.webp"
  },
  {
    "id": "m02",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 2,
    "nameZh": "女祭司",
    "nameEn": "The High Priestess",
    "keywordsUpright": [
      "直觉",
      "潜意识",
      "神秘",
      "内在智慧",
      "耐心"
    ],
    "keywordsReversed": [
      "忽视直觉",
      "情绪封闭",
      "肤浅",
      "秘密被揭露"
    ],
    "descriptionZh": "女祭司是内在智慧的守护者，她坐在意识与潜意识的门槛之间。正位邀请你倾听内心的声音，相信直觉的指引。",
    "imageFile": "m02.webp"
  },
  {
    "id": "m03",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 3,
    "nameZh": "皇后",
    "nameEn": "The Empress",
    "keywordsUpright": [
      "丰饶",
      "母性",
      "自然",
      "感官享受",
      "创造力"
    ],
    "keywordsReversed": [
      "依赖",
      "创造力受阻",
      "情感匮乏",
      "忽视自我"
    ],
    "descriptionZh": "皇后是丰饶与母爱的象征，代表生命的滋养与成长。正位预示着丰收、创造和美好的人际关系。",
    "imageFile": "m03.webp"
  },
  {
    "id": "m04",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 4,
    "nameZh": "皇帝",
    "nameEn": "The Emperor",
    "keywordsUpright": [
      "权威",
      "结构",
      "稳定",
      "领导力",
      "秩序"
    ],
    "keywordsReversed": [
      "专制",
      "失控",
      "缺乏纪律",
      "权力滥用"
    ],
    "descriptionZh": "皇帝代表秩序、权威和稳定的力量。正位建议你建立清晰的架构和规则，以坚定的意志掌控局面。",
    "imageFile": "m04.webp"
  },
  {
    "id": "m05",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 5,
    "nameZh": "教皇",
    "nameEn": "The Hierophant",
    "keywordsUpright": [
      "传统",
      "信仰",
      "教育",
      "精神指引",
      "遵循规则"
    ],
    "keywordsReversed": [
      "反传统",
      "叛逆",
      "教条主义",
      "盲目跟从"
    ],
    "descriptionZh": "教皇是精神导师和传统的守护者。正位鼓励你寻求智慧的指引，遵循经过验证的道路；逆位则提示你需要打破常规。",
    "imageFile": "m05.webp"
  },
  {
    "id": "m06",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 6,
    "nameZh": "恋人",
    "nameEn": "The Lovers",
    "keywordsUpright": [
      "爱情",
      "和谐",
      "选择",
      "价值观",
      "结合"
    ],
    "keywordsReversed": [
      "分离",
      "不和谐",
      "错误选择",
      "价值观冲突"
    ],
    "descriptionZh": "恋人牌不仅仅关于爱情，更关于价值观的抉择。正位代表美好关系和正确选择；逆位暗示你正面临艰难的决定。",
    "imageFile": "m06.webp"
  },
  {
    "id": "m07",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 7,
    "nameZh": "战车",
    "nameEn": "The Chariot",
    "keywordsUpright": [
      "胜利",
      "决心",
      "自我控制",
      "野心",
      "前进"
    ],
    "keywordsReversed": [
      "失控",
      "失败",
      "优柔寡断",
      "方向错误"
    ],
    "descriptionZh": "战车代表通过意志力克服障碍取得胜利。正位预示只要你保持专注和决心，就能战胜一切困难。",
    "imageFile": "m07.webp"
  },
  {
    "id": "m08",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 8,
    "nameZh": "力量",
    "nameEn": "Strength",
    "keywordsUpright": [
      "勇气",
      "内在力量",
      "耐心",
      "温柔",
      "驯服本能"
    ],
    "keywordsReversed": [
      "软弱",
      "自我怀疑",
      "冲动",
      "缺乏信心"
    ],
    "descriptionZh": "力量不是蛮力，而是以柔克刚的智慧。正位代表你拥有以温柔和耐心驯服内心野兽的能力。",
    "imageFile": "m08.webp"
  },
  {
    "id": "m09",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 9,
    "nameZh": "隐士",
    "nameEn": "The Hermit",
    "keywordsUpright": [
      "内省",
      "独处",
      "智慧",
      "寻求真理",
      "指引"
    ],
    "keywordsReversed": [
      "孤独",
      "孤立",
      "逃避现实",
      "拒绝建议"
    ],
    "descriptionZh": "隐士手持明灯在黑暗中寻找真理。正位建议你暂时退隐，通过内省找到答案；逆位提醒不要过度孤立自己。",
    "imageFile": "m09.webp"
  },
  {
    "id": "m10",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 10,
    "nameZh": "命运之轮",
    "nameEn": "Wheel of Fortune",
    "keywordsUpright": [
      "命运",
      "转折点",
      "机遇",
      "循环",
      "变迁"
    ],
    "keywordsReversed": [
      "厄运",
      "阻碍",
      "抗拒改变",
      "恶性循环"
    ],
    "descriptionZh": "命运之轮提醒我们世事无常、否极泰来。正位预示好运将至，抓住命运的转折点；逆位则提示你正处在低谷。",
    "imageFile": "m10.webp"
  },
  {
    "id": "m11",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 11,
    "nameZh": "正义",
    "nameEn": "Justice",
    "keywordsUpright": [
      "公平",
      "真相",
      "因果",
      "责任",
      "平衡"
    ],
    "keywordsReversed": [
      "不公",
      "偏见",
      "逃避责任",
      "失衡"
    ],
    "descriptionZh": "正义牌代表因果法则和公平的裁决。正位预示事情将得到公正的结果；逆位提示可能存在不公平的情况。",
    "imageFile": "m11.webp"
  },
  {
    "id": "m12",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 12,
    "nameZh": "倒吊人",
    "nameEn": "The Hanged Man",
    "keywordsUpright": [
      "牺牲",
      "换个角度",
      "等待",
      "放手",
      "顿悟"
    ],
    "keywordsReversed": [
      "固执",
      "无谓的牺牲",
      "停滞",
      "逃避"
    ],
    "descriptionZh": "倒吊人自愿倒挂，以全新的视角看待世界。正位建议你暂停行动，换个角度看问题；逆位表示你抗拒必要的改变。",
    "imageFile": "m12.webp"
  },
  {
    "id": "m13",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 13,
    "nameZh": "死神",
    "nameEn": "Death",
    "keywordsUpright": [
      "结束",
      "转变",
      "重生",
      "放下",
      "新的开始"
    ],
    "keywordsReversed": [
      "抗拒改变",
      "停滞",
      "恐惧结束",
      "腐朽"
    ],
    "descriptionZh": "死神并非肉体的死亡，而是旧我的终结与新生的开始。正位预示一场深刻的转变即将到来，勇敢放下才能迎来新生。",
    "imageFile": "m13.webp"
  },
  {
    "id": "m14",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 14,
    "nameZh": "节制",
    "nameEn": "Temperance",
    "keywordsUpright": [
      "平衡",
      "中庸",
      "耐心",
      "调和",
      "适应"
    ],
    "keywordsReversed": [
      "极端",
      "失衡",
      "急躁",
      "不协调"
    ],
    "descriptionZh": "节制天使将两杯水调和，象征平衡与中庸之道。正位建议你寻找中间地带，保持耐心和适度。",
    "imageFile": "m14.webp"
  },
  {
    "id": "m15",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 15,
    "nameZh": "恶魔",
    "nameEn": "The Devil",
    "keywordsUpright": [
      "束缚",
      "欲望",
      "物质主义",
      "沉迷",
      "阴影"
    ],
    "keywordsReversed": [
      "解脱",
      "觉醒",
      "打破束缚",
      "重获自由"
    ],
    "descriptionZh": "恶魔代表我们内心的欲望和束缚。正位提醒你审视自己是否被物质或执念所困；逆位预示你即将挣脱枷锁。",
    "imageFile": "m15.webp"
  },
  {
    "id": "m16",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 16,
    "nameZh": "高塔",
    "nameEn": "The Tower",
    "keywordsUpright": [
      "突变",
      "颠覆",
      "觉醒",
      "打破假象",
      "释放"
    ],
    "keywordsReversed": [
      "避免灾难",
      "抗拒改变",
      "缓慢崩溃",
      "压抑"
    ],
    "descriptionZh": "高塔象征突如其来的改变和旧结构的崩塌。虽然过程痛苦，但它是必要的清理，为更坚固的基础腾出空间。",
    "imageFile": "m16.webp"
  },
  {
    "id": "m17",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 17,
    "nameZh": "星星",
    "nameEn": "The Star",
    "keywordsUpright": [
      "希望",
      "信念",
      "治愈",
      "灵感",
      "宁静"
    ],
    "keywordsReversed": [
      "绝望",
      "失去信心",
      "消沉",
      "创意枯竭"
    ],
    "descriptionZh": "星星是暴风雨后的宁静，代表希望与治愈。正位预示美好的未来在等待你，保持信念和希望。",
    "imageFile": "m17.webp"
  },
  {
    "id": "m18",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 18,
    "nameZh": "月亮",
    "nameEn": "The Moon",
    "keywordsUpright": [
      "幻觉",
      "恐惧",
      "潜意识",
      "直觉",
      "不确定性"
    ],
    "keywordsReversed": [
      "恐惧消散",
      "真相显现",
      "混乱结束",
      "压抑"
    ],
    "descriptionZh": "月亮照亮潜意识深处的恐惧与幻象。正位提醒你小心错觉和不确定性；信任直觉，穿越迷雾。",
    "imageFile": "m18.webp"
  },
  {
    "id": "m19",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 19,
    "nameZh": "太阳",
    "nameEn": "The Sun",
    "keywordsUpright": [
      "快乐",
      "成功",
      "活力",
      "真相",
      "温暖"
    ],
    "keywordsReversed": [
      "暂时挫折",
      "忧郁",
      "缺乏活力",
      "信心不足"
    ],
    "descriptionZh": "太阳是塔罗中最积极的牌之一，代表纯粹的快乐和成功。正位预示一切明朗、充满活力和幸福。",
    "imageFile": "m19.webp"
  },
  {
    "id": "m20",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 20,
    "nameZh": "审判",
    "nameEn": "Judgement",
    "keywordsUpright": [
      "觉醒",
      "重生",
      "召唤",
      "反思",
      "赦免"
    ],
    "keywordsReversed": [
      "自我怀疑",
      "拒绝召唤",
      "内疚",
      "无法释怀"
    ],
    "descriptionZh": "审判牌召唤你回应更高的使命。正位代表内心的觉醒和自我评估，是做出重要人生决定的时刻。",
    "imageFile": "m20.webp"
  },
  {
    "id": "m21",
    "arcana": "major",
    "suit": null,
    "rank": null,
    "number": 21,
    "nameZh": "世界",
    "nameEn": "The World",
    "keywordsUpright": [
      "完成",
      "圆满",
      "成就",
      "旅行",
      "整合"
    ],
    "keywordsReversed": [
      "未完成",
      "拖延",
      "停滞",
      "不完整"
    ],
    "descriptionZh": "世界牌代表一个周期的圆满结束和成功的顶点。正位预示目标的达成、完整的满足感和新的篇章。",
    "imageFile": "m21.webp"
  },
  {
    "id": "w01",
    "arcana": "minor",
    "suit": "wands",
    "rank": "ace",
    "number": 1,
    "nameZh": "权杖王牌",
    "nameEn": "Ace of Wands",
    "keywordsUpright": [
      "创造力",
      "灵感",
      "新机遇",
      "热情",
      "行动力"
    ],
    "keywordsReversed": [
      "拖延",
      "缺乏方向",
      "创意受阻",
      "错失良机"
    ],
    "descriptionZh": "权杖王牌代表新的创意火花和行动的开端。一股强大的创造力即将迸发，勇敢抓住这个新机会。",
    "imageFile": "w01.webp"
  },
  {
    "id": "w02",
    "arcana": "minor",
    "suit": "wands",
    "rank": "two",
    "number": 2,
    "nameZh": "权杖二",
    "nameEn": "Two of Wands",
    "keywordsUpright": [
      "规划",
      "未来愿景",
      "决策",
      "探索",
      "远见"
    ],
    "keywordsReversed": [
      "犹豫不决",
      "缺乏规划",
      "恐惧未知",
      "错失方向"
    ],
    "descriptionZh": "权杖二代表站在高处眺望未来，手握地球仪规划前路。正位鼓励你大胆规划，展望更广阔的世界。",
    "imageFile": "w02.webp"
  },
  {
    "id": "w03",
    "arcana": "minor",
    "suit": "wands",
    "rank": "three",
    "number": 3,
    "nameZh": "权杖三",
    "nameEn": "Three of Wands",
    "keywordsUpright": [
      "远见",
      "扩展",
      "探索",
      "商业合作",
      "进步"
    ],
    "keywordsReversed": [
      "目光短浅",
      "计划受阻",
      "失望",
      "退回原点"
    ],
    "descriptionZh": "权杖三描绘一个人站在海边眺望远航的船只。正位代表初步的规划和行动已见成效，未来充满希望。",
    "imageFile": "w03.webp"
  },
  {
    "id": "w04",
    "arcana": "minor",
    "suit": "wands",
    "rank": "four",
    "number": 4,
    "nameZh": "权杖四",
    "nameEn": "Four of Wands",
    "keywordsUpright": [
      "庆祝",
      "和谐",
      "稳定",
      "安居",
      "团结"
    ],
    "keywordsReversed": [
      "不稳定",
      "家庭冲突",
      "缺乏归属感",
      "庆祝后的空虚"
    ],
    "descriptionZh": "权杖四描绘欢庆的场面，代表稳定与和谐的阶段。正位预示一段平静愉快的时期，适合庆祝和感恩。",
    "imageFile": "w04.webp"
  },
  {
    "id": "w05",
    "arcana": "minor",
    "suit": "wands",
    "rank": "five",
    "number": 5,
    "nameZh": "权杖五",
    "nameEn": "Five of Wands",
    "keywordsUpright": [
      "竞争",
      "冲突",
      "挑战",
      "激辩",
      "突破"
    ],
    "keywordsReversed": [
      "内耗",
      "逃避竞争",
      "妥协",
      "无意义的争斗"
    ],
    "descriptionZh": "权杖五描绘五个人持杖相争。正位代表竞争和挑战，但也激发成长；逆位提醒争斗是否有意义。",
    "imageFile": "w05.webp"
  },
  {
    "id": "w06",
    "arcana": "minor",
    "suit": "wands",
    "rank": "six",
    "number": 6,
    "nameZh": "权杖六",
    "nameEn": "Six of Wands",
    "keywordsUpright": [
      "胜利",
      "认可",
      "自信",
      "领导力",
      "凯旋"
    ],
    "keywordsReversed": [
      "骄傲自满",
      "失败",
      "不被认可",
      "声望受损"
    ],
    "descriptionZh": "权杖六是胜利者骑着白马凯旋。正位预示你的努力将获得认可和赞赏，享受成功的喜悦。",
    "imageFile": "w06.webp"
  },
  {
    "id": "w07",
    "arcana": "minor",
    "suit": "wands",
    "rank": "seven",
    "number": 7,
    "nameZh": "权杖七",
    "nameEn": "Seven of Wands",
    "keywordsUpright": [
      "坚持",
      "防守",
      "勇气",
      "信念",
      "孤军奋战"
    ],
    "keywordsReversed": [
      "放弃",
      "被压垮",
      "退缩",
      "失去信心"
    ],
    "descriptionZh": "权杖七描绘一个人在高处抵御下方的攻击。正位鼓励你坚守阵地，以勇气和信念面对挑战。",
    "imageFile": "w07.webp"
  },
  {
    "id": "w08",
    "arcana": "minor",
    "suit": "wands",
    "rank": "eight",
    "number": 8,
    "nameZh": "权杖八",
    "nameEn": "Eight of Wands",
    "keywordsUpright": [
      "快速行动",
      "进展",
      "旅行",
      "消息",
      "动力"
    ],
    "keywordsReversed": [
      "延迟",
      "停滞",
      "计划取消",
      "错失时机"
    ],
    "descriptionZh": "权杖八是八根权杖在空中快速飞过。正位预示事情将迅速推进，好消息即将到来。",
    "imageFile": "w08.webp"
  },
  {
    "id": "w09",
    "arcana": "minor",
    "suit": "wands",
    "rank": "nine",
    "number": 9,
    "nameZh": "权杖九",
    "nameEn": "Nine of Wands",
    "keywordsUpright": [
      "坚持",
      "韧性",
      "防备",
      "最后的挑战",
      "积蓄力量"
    ],
    "keywordsReversed": [
      "疲惫",
      "放弃",
      "过度防备",
      "偏执"
    ],
    "descriptionZh": "权杖九描绘一个受伤但仍在守卫的人。正位代表你已经历了许多，只剩最后一道关卡需要坚守。",
    "imageFile": "w09.webp"
  },
  {
    "id": "w10",
    "arcana": "minor",
    "suit": "wands",
    "rank": "ten",
    "number": 10,
    "nameZh": "权杖十",
    "nameEn": "Ten of Wands",
    "keywordsUpright": [
      "承担责任",
      "压力",
      "勤奋",
      "重担",
      "完成"
    ],
    "keywordsReversed": [
      "不堪重负",
      "推卸责任",
      "过度劳累",
      "崩溃"
    ],
    "descriptionZh": "权杖十是一个人背负十根权杖前行。正位提醒你审视自己的负担，学会委派和减负。",
    "imageFile": "w10.webp"
  },
  {
    "id": "w11",
    "arcana": "minor",
    "suit": "wands",
    "rank": "page",
    "number": 11,
    "nameZh": "权杖侍从",
    "nameEn": "Page of Wands",
    "keywordsUpright": [
      "热情",
      "探索",
      "好消息",
      "新想法",
      "学习"
    ],
    "keywordsReversed": [
      "缺乏热情",
      "坏消息",
      "幼稚",
      "浅尝辄止"
    ],
    "descriptionZh": "权杖侍从象征热情和探索精神。正位鼓励你以开放的心态迎接新事物，开启一段学习的旅程。",
    "imageFile": "w11.webp"
  },
  {
    "id": "w12",
    "arcana": "minor",
    "suit": "wands",
    "rank": "knight",
    "number": 12,
    "nameZh": "权杖骑士",
    "nameEn": "Knight of Wands",
    "keywordsUpright": [
      "冒险",
      "行动",
      "冲动",
      "热血",
      "追求"
    ],
    "keywordsReversed": [
      "鲁莽",
      "半途而废",
      "缺乏计划",
      "混乱"
    ],
    "descriptionZh": "权杖骑士骑着骏马冲向战场。正位代表行动力和冒险精神，但要留意不要过于冲动。",
    "imageFile": "w12.webp"
  },
  {
    "id": "w13",
    "arcana": "minor",
    "suit": "wands",
    "rank": "queen",
    "number": 13,
    "nameZh": "权杖王后",
    "nameEn": "Queen of Wands",
    "keywordsUpright": [
      "自信",
      "热情",
      "领导力",
      "魅力",
      "独立"
    ],
    "keywordsReversed": [
      "嫉妒",
      "控制欲",
      "缺乏自信",
      "霸道"
    ],
    "descriptionZh": "权杖王后坐在宝座上，手持向日葵。正位代表自信、热情和魅力，是一位充满活力的领导者。",
    "imageFile": "w13.webp"
  },
  {
    "id": "w14",
    "arcana": "minor",
    "suit": "wands",
    "rank": "king",
    "number": 14,
    "nameZh": "权杖国王",
    "nameEn": "King of Wands",
    "keywordsUpright": [
      "领导力",
      "远见",
      "创业精神",
      "荣誉",
      "成就"
    ],
    "keywordsReversed": [
      "暴君",
      "野心过度",
      "急躁",
      "缺乏同理心"
    ],
    "descriptionZh": "权杖国王是成熟而有远见的领导者。正位提醒你以诚信和远见引导自己和他人。",
    "imageFile": "w14.webp"
  },
  {
    "id": "c01",
    "arcana": "minor",
    "suit": "cups",
    "rank": "ace",
    "number": 1,
    "nameZh": "圣杯王牌",
    "nameEn": "Ace of Cups",
    "keywordsUpright": [
      "爱",
      "情感丰盈",
      "直觉",
      "新感情",
      "喜悦"
    ],
    "keywordsReversed": [
      "情感空虚",
      "压抑",
      "爱被拒绝",
      "创意枯竭"
    ],
    "descriptionZh": "圣杯王牌代表情感与爱的源泉。正位预示新感情的萌芽或情感上的丰盈与满足。",
    "imageFile": "c01.webp"
  },
  {
    "id": "c02",
    "arcana": "minor",
    "suit": "cups",
    "rank": "two",
    "number": 2,
    "nameZh": "圣杯二",
    "nameEn": "Two of Cups",
    "keywordsUpright": [
      "结合",
      "伙伴关系",
      "相互吸引",
      "和谐",
      "平等"
    ],
    "keywordsReversed": [
      "分离",
      "不平衡的关系",
      "背叛",
      "误解"
    ],
    "descriptionZh": "圣杯二描绘两人互换圣杯，象征平等和谐的连接。正位代表美好的感情或合作关系。",
    "imageFile": "c02.webp"
  },
  {
    "id": "c03",
    "arcana": "minor",
    "suit": "cups",
    "rank": "three",
    "number": 3,
    "nameZh": "圣杯三",
    "nameEn": "Three of Cups",
    "keywordsUpright": [
      "友谊",
      "庆祝",
      "团聚",
      "分享",
      "欢乐"
    ],
    "keywordsReversed": [
      "孤独",
      "过度放纵",
      "流言蜚语",
      "社交疲惫"
    ],
    "descriptionZh": "圣杯三是三位女子举杯庆祝。正位代表友谊、欢庆和社交的美好时光。",
    "imageFile": "c03.webp"
  },
  {
    "id": "c04",
    "arcana": "minor",
    "suit": "cups",
    "rank": "four",
    "number": 4,
    "nameZh": "圣杯四",
    "nameEn": "Four of Cups",
    "keywordsUpright": [
      "沉思",
      "不满",
      "倦怠",
      "重新评估",
      "内省"
    ],
    "keywordsReversed": [
      "觉醒",
      "新的动力",
      "接受新机会",
      "走出倦怠"
    ],
    "descriptionZh": "圣杯四描绘一个人坐在树下沉思，对递来的第四只杯子视而不见。正位提醒你审视自己的不满从何而来。",
    "imageFile": "c04.webp"
  },
  {
    "id": "c05",
    "arcana": "minor",
    "suit": "cups",
    "rank": "five",
    "number": 5,
    "nameZh": "圣杯五",
    "nameEn": "Five of Cups",
    "keywordsUpright": [
      "失落",
      "遗憾",
      "悲伤",
      "关注缺失",
      "悼念"
    ],
    "keywordsReversed": [
      "接受",
      "向前看",
      "恢复",
      "希望"
    ],
    "descriptionZh": "圣杯五是黑袍人影对着三只倒下的杯子悲伤。正位代表失落和遗憾，但也提醒你背后还有两只立着的杯子。",
    "imageFile": "c05.webp"
  },
  {
    "id": "c06",
    "arcana": "minor",
    "suit": "cups",
    "rank": "six",
    "number": 6,
    "nameZh": "圣杯六",
    "nameEn": "Six of Cups",
    "keywordsUpright": [
      "回忆",
      "怀旧",
      "纯真",
      "礼物",
      "重逢"
    ],
    "keywordsReversed": [
      "沉溺过去",
      "无法前行",
      "遗忘",
      "失望"
    ],
    "descriptionZh": "圣杯六描绘孩子送花给另一个孩子。正位代表怀旧、纯真的回忆和善意的礼物。",
    "imageFile": "c06.webp"
  },
  {
    "id": "c07",
    "arcana": "minor",
    "suit": "cups",
    "rank": "seven",
    "number": 7,
    "nameZh": "圣杯七",
    "nameEn": "Seven of Cups",
    "keywordsUpright": [
      "幻想",
      "选择",
      "白日梦",
      "想象力",
      "多重选项"
    ],
    "keywordsReversed": [
      "清晰",
      "做出决定",
      "面对现实",
      "脚踏实地"
    ],
    "descriptionZh": "圣杯七描绘七只杯子浮在空中，每只盛着不同的幻象。正位代表丰富的想象力和选择，但要警惕虚幻。",
    "imageFile": "c07.webp"
  },
  {
    "id": "c08",
    "arcana": "minor",
    "suit": "cups",
    "rank": "eight",
    "number": 8,
    "nameZh": "圣杯八",
    "nameEn": "Eight of Cups",
    "keywordsUpright": [
      "离开",
      "放下",
      "寻求更高意义",
      "旅行",
      "成长"
    ],
    "keywordsReversed": [
      "留恋",
      "恐惧改变",
      "无法放手",
      "退却"
    ],
    "descriptionZh": "圣杯八是一个人离开身后的八只杯子，走向远方。正位鼓励你勇敢放下已知，追寻更高的人生意义。",
    "imageFile": "c08.webp"
  },
  {
    "id": "c09",
    "arcana": "minor",
    "suit": "cups",
    "rank": "nine",
    "number": 9,
    "nameZh": "圣杯九",
    "nameEn": "Nine of Cups",
    "keywordsUpright": [
      "愿望实现",
      "满足",
      "舒适",
      "享受",
      "自足"
    ],
    "keywordsReversed": [
      "不满足",
      "贪婪",
      "物质主义",
      "表面快乐"
    ],
    "descriptionZh": "圣杯九描绘一个满足地坐在九只圣杯前的人。正位代表愿望成真和内心的满足感。",
    "imageFile": "c09.webp"
  },
  {
    "id": "c10",
    "arcana": "minor",
    "suit": "cups",
    "rank": "ten",
    "number": 10,
    "nameZh": "圣杯十",
    "nameEn": "Ten of Cups",
    "keywordsUpright": [
      "家庭幸福",
      "情感圆满",
      "和谐",
      "归属",
      "爱与欢乐"
    ],
    "keywordsReversed": [
      "家庭不和",
      "破碎",
      "疏离",
      "情感缺失"
    ],
    "descriptionZh": "圣杯十描绘彩虹下幸福的一家。正位是情感上的终极圆满，代表家庭幸福和爱与和谐。",
    "imageFile": "c10.webp"
  },
  {
    "id": "c11",
    "arcana": "minor",
    "suit": "cups",
    "rank": "page",
    "number": 11,
    "nameZh": "圣杯侍从",
    "nameEn": "Page of Cups",
    "keywordsUpright": [
      "敏感",
      "直觉",
      "创意灵感",
      "情感讯息",
      "浪漫"
    ],
    "keywordsReversed": [
      "情感不成熟",
      "逃避现实",
      "创意受阻",
      "过于敏感"
    ],
    "descriptionZh": "圣杯侍从手持圣杯，鱼从杯中探出头。正位代表直觉敏锐、富有创意和浪漫的消息。",
    "imageFile": "c11.webp"
  },
  {
    "id": "c12",
    "arcana": "minor",
    "suit": "cups",
    "rank": "knight",
    "number": 12,
    "nameZh": "圣杯骑士",
    "nameEn": "Knight of Cups",
    "keywordsUpright": [
      "浪漫",
      "追求理想",
      "魅力",
      "诗人",
      "邀约"
    ],
    "keywordsReversed": [
      "情绪化",
      "不切实际",
      "欺骗",
      "嫉妒"
    ],
    "descriptionZh": "圣杯骑士骑着白马，手持圣杯。正位代表浪漫的追求和理想的追寻者。",
    "imageFile": "c12.webp"
  },
  {
    "id": "c13",
    "arcana": "minor",
    "suit": "cups",
    "rank": "queen",
    "number": 13,
    "nameZh": "圣杯王后",
    "nameEn": "Queen of Cups",
    "keywordsUpright": [
      "同理心",
      "直觉",
      "关怀",
      "情感深度",
      "治愈"
    ],
    "keywordsReversed": [
      "情绪依赖",
      "过度敏感",
      "自我牺牲",
      "情感操控"
    ],
    "descriptionZh": "圣杯王后坐在海边宝座上，凝视精美的圣杯。正位代表深邃的直觉和温暖的关怀。",
    "imageFile": "c13.webp"
  },
  {
    "id": "c14",
    "arcana": "minor",
    "suit": "cups",
    "rank": "king",
    "number": 14,
    "nameZh": "圣杯国王",
    "nameEn": "King of Cups",
    "keywordsUpright": [
      "情感成熟",
      "宽容",
      "创造力",
      "外交",
      "平静"
    ],
    "keywordsReversed": [
      "情绪波动",
      "控制欲",
      "压抑情感",
      "冷漠"
    ],
    "descriptionZh": "圣杯国王是情感成熟和宽容的象征。正位提醒你以冷静和同理心面对人际关系的风浪。",
    "imageFile": "c14.webp"
  },
  {
    "id": "s01",
    "arcana": "minor",
    "suit": "swords",
    "rank": "ace",
    "number": 1,
    "nameZh": "宝剑王牌",
    "nameEn": "Ace of Swords",
    "keywordsUpright": [
      "清晰",
      "真理",
      "决断",
      "智慧",
      "胜利"
    ],
    "keywordsReversed": [
      "混乱",
      "错误判断",
      "模糊",
      "不公"
    ],
    "descriptionZh": "宝剑王牌高举真理之剑。正位代表清晰的思维、公正的决断和智慧的胜利。",
    "imageFile": "s01.webp"
  },
  {
    "id": "s02",
    "arcana": "minor",
    "suit": "swords",
    "rank": "two",
    "number": 2,
    "nameZh": "宝剑二",
    "nameEn": "Two of Swords",
    "keywordsUpright": [
      "僵局",
      "犹豫",
      "平衡选择",
      "蒙蔽",
      "回避"
    ],
    "keywordsReversed": [
      "做出决定",
      "突破僵局",
      "信息过载",
      "真相显现"
    ],
    "descriptionZh": "宝剑二是蒙眼女子双手持剑交叉于胸前。正位代表两难选择和暂时的僵局，需要更多信息才能决定。",
    "imageFile": "s02.webp"
  },
  {
    "id": "s03",
    "arcana": "minor",
    "suit": "swords",
    "rank": "three",
    "number": 3,
    "nameZh": "宝剑三",
    "nameEn": "Three of Swords",
    "keywordsUpright": [
      "心碎",
      "悲伤",
      "背叛",
      "分离",
      "创伤"
    ],
    "keywordsReversed": [
      "恢复",
      "释怀",
      "原谅",
      "走出伤痛"
    ],
    "descriptionZh": "宝剑三是三把剑穿过一颗心。正位代表心碎和悲伤，但这也是疗愈的起点。",
    "imageFile": "s03.webp"
  },
  {
    "id": "s04",
    "arcana": "minor",
    "suit": "swords",
    "rank": "four",
    "number": 4,
    "nameZh": "宝剑四",
    "nameEn": "Four of Swords",
    "keywordsUpright": [
      "休息",
      "沉思",
      "恢复",
      "退隐",
      "冥想"
    ],
    "keywordsReversed": [
      "不安",
      "焦躁",
      "无法休息",
      "重返战场"
    ],
    "descriptionZh": "宝剑四描绘一个人在教堂中静卧休息。正位建议你暂时退隐，给身心一个恢复的机会。",
    "imageFile": "s04.webp"
  },
  {
    "id": "s05",
    "arcana": "minor",
    "suit": "swords",
    "rank": "five",
    "number": 5,
    "nameZh": "宝剑五",
    "nameEn": "Five of Swords",
    "keywordsUpright": [
      "胜利",
      "冲突",
      "不光彩的胜利",
      "欺凌",
      "自大"
    ],
    "keywordsReversed": [
      "和解",
      "和平解决",
      "放下冲突",
      "后悔"
    ],
    "descriptionZh": "宝剑五描绘胜利者冷笑，失败者离去。正位提醒你思考这次胜利是否值得，是否有更好的解决方式。",
    "imageFile": "s05.webp"
  },
  {
    "id": "s06",
    "arcana": "minor",
    "suit": "swords",
    "rank": "six",
    "number": 6,
    "nameZh": "宝剑六",
    "nameEn": "Six of Swords",
    "keywordsUpright": [
      "过渡",
      "疗愈",
      "向前看",
      "旅程",
      "释怀"
    ],
    "keywordsReversed": [
      "无法前行",
      "停滞",
      "拒绝帮助",
      "重返困境"
    ],
    "descriptionZh": "宝剑六描绘一人乘船渡向彼岸。正位代表从困境中过渡到平静的状态，虽然过程缓慢但方向正确。",
    "imageFile": "s06.webp"
  },
  {
    "id": "s07",
    "arcana": "minor",
    "suit": "swords",
    "rank": "seven",
    "number": 7,
    "nameZh": "宝剑七",
    "nameEn": "Seven of Swords",
    "keywordsUpright": [
      "策略",
      "机智",
      "隐秘行动",
      "独自行动",
      "谨慎"
    ],
    "keywordsReversed": [
      "暴露",
      "失败的计划",
      "坦白",
      "愚蠢行为"
    ],
    "descriptionZh": "宝剑七是一个人偷偷带走五把剑。正位提醒你需要智慧和策略来应对当前的局面。",
    "imageFile": "s07.webp"
  },
  {
    "id": "s08",
    "arcana": "minor",
    "suit": "swords",
    "rank": "eight",
    "number": 8,
    "nameZh": "宝剑八",
    "nameEn": "Eight of Swords",
    "keywordsUpright": [
      "束缚",
      "无力感",
      "自我限制",
      "困境",
      "等待"
    ],
    "keywordsReversed": [
      "解脱",
      "自由",
      "找到出路",
      "突破"
    ],
    "descriptionZh": "宝剑八是女子被绑缚在剑阵之中。正位代表感到被困，但束缚更多来自内心而非外界。",
    "imageFile": "s08.webp"
  },
  {
    "id": "s09",
    "arcana": "minor",
    "suit": "swords",
    "rank": "nine",
    "number": 9,
    "nameZh": "宝剑九",
    "nameEn": "Nine of Swords",
    "keywordsUpright": [
      "焦虑",
      "噩梦",
      "恐惧",
      "失眠",
      "忧虑"
    ],
    "keywordsReversed": [
      "释然",
      "希望",
      "恐惧消散",
      "恢复平静"
    ],
    "descriptionZh": "宝剑九描绘一个人从噩梦中惊醒。正位代表深度的焦虑和担忧，但这些恐惧往往被放大。",
    "imageFile": "s09.webp"
  },
  {
    "id": "s10",
    "arcana": "minor",
    "suit": "swords",
    "rank": "ten",
    "number": 10,
    "nameZh": "宝剑十",
    "nameEn": "Ten of Swords",
    "keywordsUpright": [
      "结束",
      "背叛",
      "最低点",
      "牺牲",
      "解脱"
    ],
    "keywordsReversed": [
      "复苏",
      "重生",
      "恢复",
      "吸取教训"
    ],
    "descriptionZh": "宝剑十描绘一个人被十把剑钉在地上。正位虽然画面残酷，但它代表最坏的时刻已经过去，黎明即将到来。",
    "imageFile": "s10.webp"
  },
  {
    "id": "s11",
    "arcana": "minor",
    "suit": "swords",
    "rank": "page",
    "number": 11,
    "nameZh": "宝剑侍从",
    "nameEn": "Page of Swords",
    "keywordsUpright": [
      "好奇",
      "警惕",
      "沟通",
      "新想法",
      "学习"
    ],
    "keywordsReversed": [
      "轻率言论",
      "欺骗",
      "肤浅",
      "心不在焉"
    ],
    "descriptionZh": "宝剑侍从双手持剑，警觉地环顾四周。正位代表敏锐的观察力和对新知的渴望。",
    "imageFile": "s11.webp"
  },
  {
    "id": "s12",
    "arcana": "minor",
    "suit": "swords",
    "rank": "knight",
    "number": 12,
    "nameZh": "宝剑骑士",
    "nameEn": "Knight of Swords",
    "keywordsUpright": [
      "行动",
      "果断",
      "决断力",
      "勇气",
      "追逐目标"
    ],
    "keywordsReversed": [
      "鲁莽",
      "冲动",
      "不计后果",
      "咄咄逼人"
    ],
    "descriptionZh": "宝剑骑士是冲锋陷阵的战士。正位代表果断的行动力，但要避免过于冲动和好斗。",
    "imageFile": "s12.webp"
  },
  {
    "id": "s13",
    "arcana": "minor",
    "suit": "swords",
    "rank": "queen",
    "number": 13,
    "nameZh": "宝剑王后",
    "nameEn": "Queen of Swords",
    "keywordsUpright": [
      "敏锐",
      "独立",
      "智慧",
      "清晰的判断",
      "坦率"
    ],
    "keywordsReversed": [
      "冷酷",
      "刻薄",
      "偏见",
      "过于理性"
    ],
    "descriptionZh": "宝剑王后坐在宝座上，手持宝剑。正位代表清晰的思维和独立的判断力。",
    "imageFile": "s13.webp"
  },
  {
    "id": "s14",
    "arcana": "minor",
    "suit": "swords",
    "rank": "king",
    "number": 14,
    "nameZh": "宝剑国王",
    "nameEn": "King of Swords",
    "keywordsUpright": [
      "权威",
      "理智",
      "公正",
      "伦理",
      "专业"
    ],
    "keywordsReversed": [
      "独裁",
      "冷酷",
      "滥用权力",
      "不择手段"
    ],
    "descriptionZh": "宝剑国王是理性与权威的象征。正位提醒你以公正和智慧做出判断，不偏不倚。",
    "imageFile": "s14.webp"
  },
  {
    "id": "p01",
    "arcana": "minor",
    "suit": "pentacles",
    "rank": "ace",
    "number": 1,
    "nameZh": "星币王牌",
    "nameEn": "Ace of Pentacles",
    "keywordsUpright": [
      "财富",
      "机会",
      "实践",
      "物质化",
      "繁荣"
    ],
    "keywordsReversed": [
      "错失机会",
      "财务问题",
      "浪费",
      "短视"
    ],
    "descriptionZh": "星币王牌代表物质世界的新开始。正位预示一个实际的机遇：新工作、投资或物质上的收获。",
    "imageFile": "p01.webp"
  },
  {
    "id": "p02",
    "arcana": "minor",
    "suit": "pentacles",
    "rank": "two",
    "number": 2,
    "nameZh": "星币二",
    "nameEn": "Two of Pentacles",
    "keywordsUpright": [
      "平衡",
      "多任务",
      "适应",
      "灵活性",
      "时间管理"
    ],
    "keywordsReversed": [
      "失衡",
      "混乱",
      "不堪重负",
      "财务不稳"
    ],
    "descriptionZh": "星币二描绘一个人轻盈地玩弄两枚星币。正位代表灵活的平衡能力，在多重任务间游刃有余。",
    "imageFile": "p02.webp"
  },
  {
    "id": "p03",
    "arcana": "minor",
    "suit": "pentacles",
    "rank": "three",
    "number": 3,
    "nameZh": "星币三",
    "nameEn": "Three of Pentacles",
    "keywordsUpright": [
      "合作",
      "技能",
      "团队",
      "工艺",
      "蓝图"
    ],
    "keywordsReversed": [
      "缺乏合作",
      "技能不足",
      "质量问题",
      "团队矛盾"
    ],
    "descriptionZh": "星币三描绘三人协作建造教堂。正位代表团队合作、专业技能和切实可行的计划。",
    "imageFile": "p03.webp"
  },
  {
    "id": "p04",
    "arcana": "minor",
    "suit": "pentacles",
    "rank": "four",
    "number": 4,
    "nameZh": "星币四",
    "nameEn": "Four of Pentacles",
    "keywordsUpright": [
      "节俭",
      "掌控",
      "安全",
      "保守",
      "积累"
    ],
    "keywordsReversed": [
      "吝啬",
      "恐惧失去",
      "过度消费",
      "控制欲"
    ],
    "descriptionZh": "星币四是一个紧抱星币的人。正位代表财务安全和对资源的掌控，但也要警惕过度保守。",
    "imageFile": "p04.webp"
  },
  {
    "id": "p05",
    "arcana": "minor",
    "suit": "pentacles",
    "rank": "five",
    "number": 5,
    "nameZh": "星币五",
    "nameEn": "Five of Pentacles",
    "keywordsUpright": [
      "匮乏",
      "困境",
      "求助",
      "被忽视",
      "转机"
    ],
    "keywordsReversed": [
      "恢复",
      "找到帮助",
      "走出困境",
      "精神富足"
    ],
    "descriptionZh": "星币五描绘两个在雪夜中蹒跚的人路过明亮的教堂。正位代表物质或精神上的困境，但帮助就在附近。",
    "imageFile": "p05.webp"
  },
  {
    "id": "p06",
    "arcana": "minor",
    "suit": "pentacles",
    "rank": "six",
    "number": 6,
    "nameZh": "星币六",
    "nameEn": "Six of Pentacles",
    "keywordsUpright": [
      "慷慨",
      "给予",
      "接受帮助",
      "分享",
      "慈善"
    ],
    "keywordsReversed": [
      "吝啬",
      "债务",
      "不平等",
      "被利用"
    ],
    "descriptionZh": "星币六是一个富人在给予两个乞丐。正位代表慷慨给予或接受帮助，资源的公平分配。",
    "imageFile": "p06.webp"
  },
  {
    "id": "p07",
    "arcana": "minor",
    "suit": "pentacles",
    "rank": "seven",
    "number": 7,
    "nameZh": "星币七",
    "nameEn": "Seven of Pentacles",
    "keywordsUpright": [
      "耐心",
      "评估",
      "投资",
      "等待收获",
      "耕耘"
    ],
    "keywordsReversed": [
      "急躁",
      "回报延迟",
      "投资失误",
      "浪费精力"
    ],
    "descriptionZh": "星币七描绘一个人看着一株结满星币的植物。正位提醒耐心等待你的努力结出果实。",
    "imageFile": "p07.webp"
  },
  {
    "id": "p08",
    "arcana": "minor",
    "suit": "pentacles",
    "rank": "eight",
    "number": 8,
    "nameZh": "星币八",
    "nameEn": "Eight of Pentacles",
    "keywordsUpright": [
      "勤奋",
      "技能提升",
      "专注",
      "精益求精",
      "工匠精神"
    ],
    "keywordsReversed": [
      "倦怠",
      "枯燥",
      "缺乏进步",
      "质量下降"
    ],
    "descriptionZh": "星币八描绘一个工匠专注地打造星币。正位代表专注、勤奋和不断提升的专业技能。",
    "imageFile": "p08.webp"
  },
  {
    "id": "p09",
    "arcana": "minor",
    "suit": "pentacles",
    "rank": "nine",
    "number": 9,
    "nameZh": "星币九",
    "nameEn": "Nine of Pentacles",
    "keywordsUpright": [
      "独立",
      "丰裕",
      "自给自足",
      "享受成果",
      "优雅"
    ],
    "keywordsReversed": [
      "依赖",
      "财务问题",
      "失去独立",
      "挥霍"
    ],
    "descriptionZh": "星币九描绘一位优雅的女子在繁茂的花园中。正位代表通过自身努力获得的独立和丰裕。",
    "imageFile": "p09.webp"
  },
  {
    "id": "p10",
    "arcana": "minor",
    "suit": "pentacles",
    "rank": "ten",
    "number": 10,
    "nameZh": "星币十",
    "nameEn": "Ten of Pentacles",
    "keywordsUpright": [
      "家族财富",
      "传承",
      "稳定",
      "长久",
      "圆满"
    ],
    "keywordsReversed": [
      "家族冲突",
      "财务损失",
      "不稳定",
      "遗产问题"
    ],
    "descriptionZh": "星币十描绘三代同堂的富足场景。正位代表物质和精神上的持久富足和家族的传承。",
    "imageFile": "p10.webp"
  },
  {
    "id": "p11",
    "arcana": "minor",
    "suit": "pentacles",
    "rank": "page",
    "number": 11,
    "nameZh": "星币侍从",
    "nameEn": "Page of Pentacles",
    "keywordsUpright": [
      "学习",
      "实践",
      "新技能",
      "踏实",
      "潜力"
    ],
    "keywordsReversed": [
      "缺乏动力",
      "不切实际",
      "浪费机会",
      "懒惰"
    ],
    "descriptionZh": "星币侍从双手捧着一枚星币专注凝视。正位代表学习新技能的热情和踏实的实践精神。",
    "imageFile": "p11.webp"
  },
  {
    "id": "p12",
    "arcana": "minor",
    "suit": "pentacles",
    "rank": "knight",
    "number": 12,
    "nameZh": "星币骑士",
    "nameEn": "Knight of Pentacles",
    "keywordsUpright": [
      "勤奋",
      "责任",
      "可靠",
      "耐心",
      "务实"
    ],
    "keywordsReversed": [
      "懒散",
      "停滞",
      "不负责任",
      "缺乏进取"
    ],
    "descriptionZh": "星币骑士骑在稳重的黑马上，手持星币。正位代表可靠、勤奋和脚踏实地的行动。",
    "imageFile": "p12.webp"
  },
  {
    "id": "p13",
    "arcana": "minor",
    "suit": "pentacles",
    "rank": "queen",
    "number": 13,
    "nameZh": "星币王后",
    "nameEn": "Queen of Pentacles",
    "keywordsUpright": [
      "务实",
      "滋养",
      "稳定",
      "安全感",
      "慷慨"
    ],
    "keywordsReversed": [
      "物质主义",
      "忽视家庭",
      "不安全感",
      "吝啬"
    ],
    "descriptionZh": "星币王后怀抱星币，坐在丰饶的自然中。正位代表务实而温暖的照护，创造稳定和安全的生活。",
    "imageFile": "p13.webp"
  },
  {
    "id": "p14",
    "arcana": "minor",
    "suit": "pentacles",
    "rank": "king",
    "number": 14,
    "nameZh": "星币国王",
    "nameEn": "King of Pentacles",
    "keywordsUpright": [
      "财富",
      "成就",
      "稳重",
      "商业头脑",
      "慷慨"
    ],
    "keywordsReversed": [
      "贪婪",
      "物质主义",
      "腐败",
      "挥霍"
    ],
    "descriptionZh": "星币国王是物质世界的成功典范。正位代表通过勤奋和智慧获得的长久成就和财富。",
    "imageFile": "p14.webp"
  }
];

// 牌阵模板（参考 Lurell/tarot-vibecoding 的 5 种经典牌阵）
const SPREADS = [
  {
    id: 'single',
    icon: '☀',
    nameZh: '单张指引',
    descriptionZh: '抽一张牌，获得今日的指引和启示',
    layout: 'row',
    positions: [
      { name: '今日指引', meaning: '代表今天的核心主题和指引方向' },
    ],
  },
  {
    id: 'three-card',
    icon: '☽',
    nameZh: '三张牌 · 过去现在未来',
    descriptionZh: '经典的三张牌阵，了解过去的影响、现在的状态和未来的可能',
    layout: 'row',
    positions: [
      { name: '过去', meaning: '代表过去的影响因素和经验' },
      { name: '现在', meaning: '代表当前的状态和核心问题' },
      { name: '未来', meaning: '代表未来的发展趋势和可能结果' },
    ],
  },
  {
    id: 'relationship',
    icon: '♡',
    nameZh: '关系牌阵',
    descriptionZh: '解读感情或人际关系的五张牌阵',
    layout: 'row',
    positions: [
      { name: '你自己', meaning: '你在这段关系中的状态和感受' },
      { name: '对方', meaning: '对方在这段关系中的状态和感受' },
      { name: '关系现状', meaning: '当前关系所处的阶段和状态' },
      { name: '挑战', meaning: '关系中面临的挑战和需要解决的问题' },
      { name: '未来', meaning: '关系可能的发展方向和结果' },
    ],
  },
];
