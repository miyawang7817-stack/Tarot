# 🔮 塔罗占卜

> 探索你的命运，倾听内心声音

一个**零依赖、纯静态**的塔罗牌抽卡占卜网站。无需构建、无需服务器，直接双击 `index.html` 即可使用，也可以一键部署到 GitHub Pages。

参考项目：[Lurell/tarot-vibecoding](https://github.com/Lurell/tarot-vibecoding)（78 张像素风牌面图与中文牌义数据源自该项目，MIT License）。

## ✨ 功能

- **5 种经典牌阵** — 单张指引、三张牌（过去·现在·未来）、五张牌十字阵、凯尔特十字、关系牌阵
- **卡片堆抽牌交互** — 居中 3D 牌堆，顶层卡片跟手拖拽：点击 / 上滑抽牌，左右滑动跳过换下一张，未达阈值自动回弹
- **3D 翻牌动画** — CSS 3D Transform 实现翻牌，支持逐张翻开 / 一键全部翻开
- **正逆位解读** — 每张牌 50% 概率逆位，78 张牌完整覆盖中文关键词与牌义描述
- **问题记录** — 占卜前可写下你的问题，解读页会一直陪伴显示
- **星空主题** — 深紫夜空 + 鎏金配色，桌面 / 移动端自适应

## 🚀 使用

```bash
# 方式一：直接打开
双击 index.html

# 方式二：本地服务器
python3 -m http.server 8000
# 访问 http://localhost:8000
```

### 部署到 GitHub Pages

仓库 Settings → Pages → Source 选择分支根目录即可。

## 📁 项目结构

```
├── index.html          # 页面入口（首页 / 抽牌 / 解读 三个视图）
├── css/style.css       # 全部样式（星空背景、扇形牌堆、3D 翻牌）
├── js/data.js          # 78 张牌数据 + 5 种牌阵模板
├── js/app.js           # 交互逻辑（洗牌、抽牌、翻牌、解读）
└── assets/cards/       # 78 张像素风 WebP 牌面图
```

## 🃏 技术说明

- 原生 HTML / CSS / JavaScript，无任何框架和构建工具
- Fisher–Yates 洗牌算法保证公平随机
- 牌堆抽卡使用 Pointer Events 实现跟手拖拽（上滑抽牌 / 侧滑跳过 / 回弹），`translateZ` 分层营造 3D 纵深
- 翻牌使用 `preserve-3d` + `backface-visibility` 实现双面卡牌

## 📄 License

MIT — 牌面图片与牌义数据版权归 [tarot-vibecoding](https://github.com/Lurell/tarot-vibecoding) 原作者所有（MIT License）。

---

*塔罗牌指引方向，选择权始终在你手中 ✦*
