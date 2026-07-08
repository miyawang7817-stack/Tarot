/* 塔罗抽卡 —— 页面流程：选择牌阵 → 洗牌抽牌 → 翻牌解读 */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const views = {
    home: $('#view-home'),
    draw: $('#view-draw'),
    reading: $('#view-reading'),
  };

  const state = {
    spread: null,      // 当前牌阵模板
    deck: [],          // 洗好的牌（含正逆位）
    picked: [],        // 已抽出的牌，按牌阵位置顺序
    flippedCount: 0,
  };

  /* ---------- 工具 ---------- */

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // 单文件版本会注入 window.CARD_IMG（图片 dataURI 映射），否则读本地文件
  function cardSrc(file) {
    return (window.CARD_IMG && window.CARD_IMG[file]) || 'assets/cards/' + file;
  }

  function freshShuffledDeck() {
    return shuffle(DECK).map((card) => ({
      card,
      reversed: Math.random() < 0.5,
    }));
  }

  function showView(name) {
    Object.entries(views).forEach(([key, el]) =>
      el.classList.toggle('hidden', key !== name)
    );
    document.body.classList.toggle('on-home', name === 'home');
    if (window.__heroVideoCtl) {
      if (name === 'home') window.__heroVideoCtl.enter();
      else window.__heroVideoCtl.leave();
    }
    window.scrollTo({ top: 0 });
  }

  /* ---------- 首页：牌阵选择 ---------- */

  const HOME_ICONS = {
    sun: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
    cards: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="7.5" y="3.5" width="9" height="14" rx="1.5" transform="rotate(-8 12 10.5)"/><rect x="9" y="6.5" width="9" height="14" rx="1.5" transform="rotate(8 13.5 13.5)"/></svg>',
    heart: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.6-9.2-8.6C1.2 8.6 3 5.5 6.2 5.5c2 0 3.3 1 4 2.2.3.5.9.5 1.2 0 .7-1.2 2-2.2 4-2.2 3.2 0 5 3.1 3.4 5.9C19 15.4 12 20 12 20z"/></svg>',
  };
  // 设计稿文案：三张倒扣的牌入口（顺序对应 SPREADS）
  const HOME_ENTRIES = [
    { icon: 'sun',   title: '单张指引', desc: '一张牌，点一盏小灯',   meta: '\u2726\uFE0E 1 张牌 · 今日指引' },
    { icon: 'cards', title: '三张牌阵', desc: '来路 · 当下 · 前方',   meta: '\u2726\uFE0E 3 张牌 · 过去 / 现在 / 未来' },
    { icon: 'heart', title: '关系牌阵', desc: '你与 TA，牌想说的话', meta: '\u2726\uFE0E 5 张牌 · 感情与关系' },
  ];

  function renderSpreadGrid() {
    const grid = $('#spread-grid');
    grid.innerHTML = '';
    HOME_ENTRIES.forEach((entry, i) => {
      const spread = SPREADS[i];
      const btn = document.createElement('button');
      btn.className = 'entry-card';
      btn.innerHTML = `
        <span class="entry-frame"></span>
        <span class="entry-corner tl">\u2726\uFE0E</span>
        <span class="entry-corner tr">\u2726\uFE0E</span>
        <span class="entry-corner bl">\u2726\uFE0E</span>
        <span class="entry-corner br">\u2726\uFE0E</span>
        <span class="entry-icon">${HOME_ICONS[entry.icon]}</span>
        <span class="entry-body">
          <span class="entry-title">${entry.title}</span>
          <span class="entry-desc" style="display:block">${entry.desc}</span>
          <span class="entry-meta" style="display:block">${entry.meta}</span>
        </span>
      `;
      btn.addEventListener('click', () => startDraw(spread));
      grid.appendChild(btn);
    });
  }

  /* 首页星尘 */
  function renderHomeSky() {
    const sky = $('#home-sky');
    if (!sky || sky.querySelector('.tw')) return;
    const rand = (a, b) => a + Math.random() * (b - a);
    for (let i = 0; i < 46; i++) {
      const s = document.createElement('span');
      s.className = 'tw';
      const size = rand(1.2, 2.8).toFixed(1);
      s.style.left = rand(2, 98).toFixed(1) + '%';
      s.style.top = rand(2, 94).toFixed(1) + '%';
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.setProperty('--d', rand(2.5, 6).toFixed(1) + 's');
      s.style.setProperty('--dl', rand(0, 5).toFixed(1) + 's');
      sky.appendChild(s);
    }
  }

  /* 首页背景视频：原生 loop 循环，加载成功即淡入；失败退回 CSS 泡泡 */
  function setupHeroVideo() {
    const video = $('#hero-video');
    if (!video) return;
    const onHome = () => !views.home.classList.contains('hidden');
    video.muted = true;
    video.addEventListener('loadeddata', () => {
      views.home.classList.add('video-on');
      if (onHome()) video.play().catch(() => {});
    });
    video.addEventListener('error', () => {
      views.home.classList.remove('video-on');   // 退回 CSS 泡泡
    });
    setInterval(() => {
      if (document.hidden || !onHome()) return;
      if (video.readyState >= 2 && video.paused) video.play().catch(() => {});
    }, 3000);
    window.__heroVideoCtl = {
      enter() { if (video.readyState >= 2) video.play().catch(() => {}); },
      leave() { video.pause(); },
    };
  }

  /* ---------- 抽牌页：命运轮盘（连续插值引擎） ----------
     rot 为连续旋转量（单位：张）。每张牌按相对位置 rel = i - rot 在
     「中间大 → 两侧虚化 → 纵深隐没」的轨道上连续插值；
     拖动跟手、惯性滑行渐停、空闲匀速漂移，逐帧只写 transform/opacity */

  const VISIBLE_REL = 3;                 // 相对位置超出 ±3 即隐藏
  const AUTO_STEP_MS = 950;              // 自动轮换：滑到下一张的时长（缓入缓出）
  const AUTO_DWELL = 2400;               // 自动轮换：每张卡在中间的停留时间
  const IDLE_DELAY = 2000;               // 交互后多久恢复漂移
  const FRICTION = 300;                  // 惯性摩擦时间常数（毫秒）
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const car = {
    rot: 0,            // 连续旋转量
    vel: 0,            // 惯性速度（张/毫秒）
    inertia: false,    // 惯性滑行中
    dragging: false,
    snapping: false,   // 吸附动画中
    locked: false,     // 抽牌动画期间锁定
    lastTouch: 0,
    dirty: false,
    loop: null,
    anim: null,
    cards: [],         // { entry, el, hidden }
    ghost: null,       // { idx, w, delay } 抽牌后的收拢槽位
    geom: null,
  };

  function startDraw(spread) {
    state.spread = spread;
    state.picked = [];
    state.deck = freshShuffledDeck();
    car.rot = 0;
    car.vel = 0;
    car.inertia = false;
    car.locked = false;
    car.snapping = false;
    car.lastTouch = performance.now() - IDLE_DELAY + 1100;
    $('#draw-title').textContent = spread.nameZh;
    showView('draw');          // 先显示视图，保证测量到真实尺寸
    buildCarousel(true);
    renderTray();
    updateDrawProgress();
    startCarLoop();
  }

  function measureGeom() {
    const area = $('#ring-area');
    const W = area.clientWidth;
    const H = area.clientHeight;
    const mobile = window.innerWidth < 720;
    car.geom = {
      // 五卡构图（参考视频）：|rel|=1 远处小卡，|rel|=2 近处门板侧立卡
      x1: W * (mobile ? 0.31 : 0.21),
      x2: W * (mobile ? 0.44 : 0.315),
      x3: W * (mobile ? 0.48 : 0.355),
      s1: 0.48,                               // 侧卡（稍小于主牌）
      s2: 0.62,                               // 门板卡（近乎侧立）
      pxPerStep: W * (mobile ? 0.31 : 0.21),  // 拖动一张牌对应的像素
    };
  }

  function buildCarousel(deal) {
    const stage = $('#ring-stage');
    stage.innerHTML = '';
    measureGeom();
    car.cards = state.deck.map((entry, i) => {
      const el = document.createElement('button');
      el.className = 'car-card' + (deal ? ' dealing' : '');
      el.dataset.idx = i;
      el.setAttribute('aria-label', '轮盘中的牌');
      el.innerHTML =
        '<span class="card-back"></span>' +
        '<span class="card-back card-blur"></span>' +
        '<span class="card-dim"></span>' +
        '<span class="card-glow"></span>' +
        '<span class="card-shine"></span>';
      if (deal) el.style.animationDelay = (i % 5) * 90 + 'ms';
      stage.appendChild(el);
      return { entry, el, hidden: undefined };
    });
    if (deal) setTimeout(() => car.cards.forEach((c) => c.el.classList.remove('dealing')), 1300);
    layoutCarousel();
    car.ambH = null;
    updateAmbient();
  }

  /* 关键帧插值：a = [中间, 侧位, 纵深, 隐没] 四个锚点，r = |rel| */
  function kp(a, r) {
    const i = Math.min(2, Math.floor(r));
    const t = Math.min(1, r - i);
    return a[i] + (a[i + 1] - a[i]) * t;
  }

  function layoutCarousel() {
    const n = car.cards.length;
    if (!n) return;
    const g = car.geom;
    const ghost = car.ghost;
    car.cards.forEach((c, i) => {
      if (ghost && i === ghost.idx) return;   // 升起中的牌不参与排布
      let eff = i;
      if (ghost) {
        // 幽灵槽位：被抽走的位置宽度从 1 收缩到 0，后面的牌被连续挤入
        const di = (((i - ghost.idx) % n) + n) % n;
        if (di > 0 && di < n / 2) eff = i - (1 - ghost.w);
      }
      let rel = (((eff - car.rot) % n) + n) % n;
      if (rel > n / 2) rel -= n;
      const el = c.el;
      const r = Math.abs(rel);
      if (r > VISIBLE_REL) {
        if (c.hidden !== true) {
          c.hidden = true;
          el.style.visibility = 'hidden';
          el.style.pointerEvents = 'none';
        }
        return;
      }
      if (c.hidden !== false) {
        c.hidden = false;
        el.style.visibility = 'visible';
        el.style.pointerEvents = 'auto';
      }
      const sign = rel < 0 ? -1 : 1;
      const x = sign * kp([0, g.x1, g.x2, g.x3], r);
      const s = kp([1, g.s1, g.s2, g.s2], r);
      const ry = sign * kp([0, 16, 80, 86], r);   // 远处小卡微侧，门板卡近乎 90° 侧立
      const fade = Math.max(0, Math.min(1, (3.0 - r) / 0.5));
      el.style.transform =
        `translate(calc(-50% + ${x.toFixed(1)}px), -50%) rotateY(${ry.toFixed(2)}deg) scale(${s.toFixed(4)})`;
      el.style.opacity = (kp([1, 0.95, 0.95, 0.95], r) * fade).toFixed(3);
      el.style.zIndex = String(100 - Math.round(r * 10));
      el.style.setProperty('--blur-o', kp([0, 0.18, 0.32, 0.6], r).toFixed(3));
      el.style.setProperty('--dim', kp([0, 0.24, 0.4, 0.58], r).toFixed(3));
      el.style.setProperty('--glow', Math.max(0, 1 - r * 1.8).toFixed(3));
      el.style.setProperty('--shine-o', Math.max(0, 1 - r * 1.3).toFixed(3));
      el.style.setProperty('--shine-t', (40 - rel * 180).toFixed(1) + '%');
    });
  }

  /* 氛围光晕：颜色随中心牌的花色走（大阿卡纳金、权杖橙红、圣杯蓝、宝剑紫、星币青绿） */
  const SUIT_HUE = { major: 46, wands: 18, cups: 215, swords: 265, pentacles: 155 };
  function updateAmbient() {
    const n = car.cards.length;
    if (!n) return;
    const ci = ((Math.round(car.rot) % n) + n) % n;
    const entry = car.cards[ci] && car.cards[ci].entry;
    if (!entry) return;
    const h = SUIT_HUE[entry.card.suit || 'major'];
    if (car.ambH === h) return;
    car.ambH = h;
    const blobs = document.querySelectorAll('#ring-area .amb i');
    if (!blobs.length) return;
    const cfg = [
      [h, 0.46], [(h + 22) % 360, 0.38], [(h + 338) % 360, 0.36],
      [(h + 34) % 360, 0.32], [h, 0.34],
    ];
    blobs.forEach((b, i) => {
      const [hh, al] = cfg[i % cfg.length];
      b.style.backgroundColor = `hsl(${hh} 58% 51% / ${al})`;
    });
  }

  /* 平滑吸附 / 转到目标位置
     opts.auto: 自动轮换的步进（不刷新交互时间戳，缓入缓出更从容） */
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function animateRotTo(target, duration = 480, done, opts = {}) {
    cancelAnimationFrame(car.anim);
    car.inertia = false;
    const from = car.rot;
    const delta = target - from;
    if (Math.abs(delta) < 0.001) { car.rot = target; car.snapping = false; car.dirty = true; done && done(); return; }
    car.snapping = true;
    const t0 = performance.now();
    const ease = opts.auto ? easeInOutCubic : easeOutCubic;
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      car.rot = from + delta * ease(t);
      car.dirty = true;
      if (t < 1) car.anim = requestAnimationFrame(tick);
      else {
        car.snapping = false;
        if (!opts.auto) car.lastTouch = performance.now();
        done && done();
      }
    };
    car.anim = requestAnimationFrame(tick);
  }

  /* 主循环：惯性滑行 → 吸附；空闲时「走一步、停一拍」自动轮换 */
  function startCarLoop() {
    if (car.loop) return;
    let last = 0;
    const frame = (now) => {
      if (views.draw.classList.contains('hidden')) { car.loop = null; return; }
      const dt = last ? Math.min(50, now - last) : 0;
      last = now;

      if (car.inertia && dt) {           // 惯性滑行，摩擦渐停
        car.rot += car.vel * dt;
        car.vel *= Math.exp(-dt / FRICTION);
        car.dirty = true;
        if (Math.abs(car.vel) < 0.0004) {
          car.inertia = false;
          animateRotTo(Math.round(car.rot), 360);
        }
      } else {
        // 每张卡在中间停留 AUTO_DWELL，然后用缓入缓出滑到下一张
        const idle = !car.dragging && !car.snapping && !car.locked && !car.inertia
          && now - car.lastTouch > IDLE_DELAY
          && now - (car.lastAuto || 0) > AUTO_DWELL
          && !REDUCED_MOTION;
        if (idle) {
          car.lastAuto = now;
          animateRotTo(Math.round(car.rot) + 1, AUTO_STEP_MS, null, { auto: true });
        }
      }
      if (car.ghost && dt) {              // 幽灵槽位收拢
        const gh = car.ghost;
        if (gh.delay > 0) gh.delay -= dt;
        else if (gh.w > 0) {
          gh.w = Math.max(0, gh.w - dt / 380);
          car.dirty = true;
          if (gh.w === 0) finalizeGhost();
        }
      }
      if (car.dirty) {
        car.dirty = false;
        layoutCarousel();
        updateAmbient();
      }
      car.loop = requestAnimationFrame(frame);
    };
    car.loop = requestAnimationFrame(frame);
  }

  /* 拖动跟手 + 惯性 + 轻点选卡 */
  function setupCarouselInput() {
    const area = $('#ring-area');
    let sx = 0, lastX = 0, lastT = 0, startRot = 0, moved = 0;

    area.addEventListener('pointerdown', (e) => {
      if (car.locked) return;
      car.dragging = true;
      car.inertia = false;
      cancelAnimationFrame(car.anim);
      car.snapping = false;
      moved = 0;
      sx = lastX = e.clientX;
      lastT = performance.now();
      startRot = car.rot;
      car.vel = 0;
      car.lastTouch = lastT;
      area.classList.add('grabbing');
      area.setPointerCapture(e.pointerId);
    });

    area.addEventListener('pointermove', (e) => {
      if (!car.dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      car.vel = -(dx / car.geom.pxPerStep) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
      moved = Math.max(moved, Math.abs(e.clientX - sx));
      car.rot = startRot - (e.clientX - sx) / car.geom.pxPerStep;
      car.lastTouch = now;
      car.dirty = true;
    });

    const finish = (e) => {
      if (!car.dragging) return;
      car.dragging = false;
      car.lastTouch = performance.now();
      area.classList.remove('grabbing');

      if (moved < 8) {                   // 轻点：中间抽牌，两侧转过去
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const t = hit && hit.closest('.car-card');
        if (!t) { animateRotTo(Math.round(car.rot), 360); return; }
        const i = Number(t.dataset.idx);
        const n = car.cards.length;
        let rel = (((i - car.rot) % n) + n) % n;
        if (rel > n / 2) rel -= n;
        if (Math.abs(rel) < 0.5) drawCarCard(t);
        else animateRotTo(car.rot + rel, 520);
        return;
      }
      // 惯性滑行；速度太小就直接吸附
      if (Math.abs(car.vel) > 0.0006) {
        car.vel = Math.max(-0.02, Math.min(0.02, car.vel));
        car.inertia = true;
      } else {
        animateRotTo(Math.round(car.rot), 360);
      }
    };
    area.addEventListener('pointerup', finish);
    area.addEventListener('pointercancel', () => {
      car.dragging = false;
      area.classList.remove('grabbing');
      animateRotTo(Math.round(car.rot), 360);
    });

    // 键盘可达性
    area.tabIndex = 0;
    area.addEventListener('keydown', (e) => {
      if (car.locked) return;
      car.lastTouch = performance.now();
      if (e.key === 'ArrowLeft') { e.preventDefault(); animateRotTo(Math.round(car.rot) - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); animateRotTo(Math.round(car.rot) + 1); }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const n = car.cards.length;
        const c = car.cards[((Math.round(car.rot) % n) + n) % n];
        if (c) drawCarCard(c.el);
      }
    });

    window.addEventListener('resize', () => {
      if (!views.draw.classList.contains('hidden')) {
        measureGeom();
        car.dirty = true;
      }
    });
  }

  function drawCarCard(el) {
    if (car.locked || state.picked.length >= state.spread.positions.length) return;
    car.locked = true;
    cancelAnimationFrame(car.anim);
    car.snapping = false;
    car.inertia = false;
    const idx = Number(el.dataset.idx);
    const cardObj = car.cards[idx];

    el.classList.add('rise');            // 主牌升起，带金尘尾迹
    spawnBurst(el, 'drift', 12);
    state.picked.push(cardObj.entry);
    state.deck.splice(idx, 1);
    renderTray();
    updateDrawProgress();

    const finished = state.picked.length === state.spread.positions.length;

    if (!finished) {
      animateRotTo(idx, 160);            // 先对正（漂移中可能有小数偏移）
      car.ghost = { idx, w: 1, delay: 240 };
    }

    setTimeout(() => {
      el.remove();
      if (finished) { startReading(); return; }
      car.locked = false;
      car.lastTouch = performance.now() - IDLE_DELAY + 1200;
    }, 780);
  }

  /* 幽灵槽位收拢完毕：真正移除该牌并归一化 rot */
  function finalizeGhost() {
    const gh = car.ghost;
    if (!gh) return;
    car.ghost = null;
    car.cards.splice(gh.idx, 1);
    car.cards.forEach((c, i) => { c.el.dataset.idx = i; });
    const n = car.cards.length;
    car.rot = n ? ((gh.idx % n) + n) % n : 0;
    car.dirty = true;
  }

  function renderTray() {
    const tray = $('#drawn-tray');
    tray.innerHTML = '';
    state.spread.positions.forEach((pos, i) => {
      const filled = i < state.picked.length;
      const slot = document.createElement('div');
      slot.className = 'tray-slot' + (filled ? ' filled' : '');
      slot.innerHTML = `
        <div class="tray-card">${filled ? '<span class="card-back"></span>' : ''}</div>
        <div class="tray-label">${pos.name}</div>
      `;
      tray.appendChild(slot);
    });
  }

  function updateDrawProgress() {
    const total = state.spread.positions.length;
    const n = state.picked.length;
    const next = state.spread.positions[n];
    $('#draw-progress').innerHTML = next
      ? `已抽 <b>${n}</b> / ${total} ✦ 滑动换牌 · 点击中间的牌抽取`
      : `已抽 <b>${n}</b> / ${total}，命运之牌已就位……`;
    const pos = $('#draw-pos');
    const txt = next ? next.name : '静候启示';
    if (pos.textContent !== txt) {
      pos.textContent = txt;
      pos.style.animation = 'none';
      void pos.offsetWidth;               // 重新触发入场动画
      pos.style.animation = '';
    }
  }

  /* ---------- 解读页 ---------- */

  function startReading() {
    state.flippedCount = 0;
    $('#reading-title').textContent = state.spread.nameZh;
    $('#btn-flip-all').disabled = false;
    $('#interpretations').innerHTML = '';
    renderBoard();
    showView('reading');
  }

  function renderBoard() {
    const board = $('#board');
    board.className = 'board';
    board.innerHTML = '';

    state.spread.positions.forEach((pos, i) => {
      const entry = state.picked[i];
      const slot = document.createElement('div');
      slot.className = `slot slot-${i + 1} materialize`;
      slot.style.setProperty('--mat-delay', (i * 320) + 'ms');
      slot.innerHTML = `
        <div class="slot-label"><span class="slot-order">${i + 1}</span><b>${pos.name}</b></div>
        <button class="flip-card" aria-label="翻开「${pos.name}」位置的牌">
          <span class="mat-halo" aria-hidden="true"></span>
          <span class="flip-flash"></span>
          <span class="flip-ring" aria-hidden="true"></span>
          <span class="mat-veil" aria-hidden="true"></span>
          <span class="mat-smoke" aria-hidden="true"><b class="s1"></b><b class="s2"></b><b class="s3"></b><b class="s4"></b><b class="s5"></b></span>
          <span class="idle-sparks" aria-hidden="true"><i>✦</i><i>✦</i><i>✦</i></span>
          <div class="flip-inner">
            <div class="flip-face flip-back"><span class="card-back"></span></div>
            <div class="flip-face flip-front ${entry.reversed ? 'reversed' : ''}">
              <img src="${cardSrc(entry.card.imageFile)}" alt="${entry.card.nameZh}" loading="lazy" />
            </div>
          </div>
        </button>
        <div class="slot-name"></div>
      `;
      const flipBtn = slot.querySelector('.flip-card');
      flipBtn.addEventListener('click', () => flipCard(i, slot, flipBtn));
      board.appendChild(slot);
      // 凝聚过程中伴随金尘向右上飘散
      setTimeout(() => spawnBurst(flipBtn, 'drift', 26), i * 320 + 150);
    });
  }

  /* 金色光尘粒子。radial：翻牌时向四周迸散；drift：凝聚/升起时向右上飘散。
     圆点火星与 ✦ 星形火花混合，分 2-3 波错峰出场（等光罩衰减后登场，不与闪光抢戏），
     一半粒子带忽明忽暗的闪烁飞行 */
  function spawnBurst(host, mode = 'radial', count = 18) {
    if (REDUCED_MOTION) return;
    const burst = document.createElement('span');
    burst.className = 'flip-burst';
    for (let i = 0; i < count; i++) {
      const isStar = Math.random() < 0.38;
      const p = document.createElement('i');
      if (isStar) { p.className = 'star'; p.textContent = '✦'; }
      let px, py, delay;
      const wave = i % 3;
      if (mode === 'drift') {
        const ang = Math.PI * (0.08 + Math.random() * 0.42);   // 右上扇区
        const dist = 50 + Math.random() * 115;
        px = Math.cos(ang) * dist;
        py = -Math.sin(ang) * dist;
        delay = 350 + wave * 220 + Math.random() * 260;
      } else {
        const ang = Math.random() * Math.PI * 2;
        const dist = 70 + Math.random() * 180;
        px = Math.cos(ang) * dist;
        py = Math.sin(ang) * dist;
        delay = 200 + wave * 190 + Math.random() * 200;
      }
      p.style.setProperty('--px', px.toFixed(0) + 'px');
      p.style.setProperty('--py', py.toFixed(0) + 'px');
      p.style.setProperty('--ps', (3 + Math.random() * 5.5).toFixed(1) + 'px');
      p.style.setProperty('--pfs', (10 + Math.random() * 9).toFixed(0) + 'px');
      p.style.setProperty('--pd', (750 + Math.random() * 750).toFixed(0) + 'ms');
      p.style.setProperty('--pdelay', delay.toFixed(0) + 'ms');
      if (Math.random() < 0.5) p.style.animationName = 'particle-fly-tw';
      burst.appendChild(p);
    }
    host.appendChild(burst);
    setTimeout(() => burst.remove(), 2600);
  }

  function flipCard(index, slot, flipBtn) {
    if (flipBtn.classList.contains('flipped')) return;
    flipBtn.classList.add('flipped');
    slot.classList.add('revealed');
    spawnBurst(flipBtn, 'radial', 30);

    const entry = state.picked[index];
    const orientCls = entry.reversed ? 'reversed' : 'upright';
    const orientTxt = entry.reversed ? '逆位' : '正位';
    slot.querySelector('.slot-name').innerHTML =
      `${entry.card.nameZh}<span class="orient-tag ${orientCls}">${orientTxt}</span>`;

    appendInterpretation(index);

    state.flippedCount++;
    if (state.flippedCount === state.spread.positions.length) {
      $('#btn-flip-all').disabled = true;
      setTimeout(renderSummary, 500);
    }
  }

  /* ---------- 解读文案生成 ----------
     四层结构：位置叙事引子 → 牌义正文（正逆位分别深挖）→ 行动低语 → （全部翻开后）整体启示。
     模板按牌号做确定性轮换，同一次占卜里语气不重复。 */

  const pick = (arr, seed) => arr[((seed % arr.length) + arr.length) % arr.length];

  const LEADS = {
    '今日指引': [
      (c, o) => `今天为你翻开的是「${c}」${o}。它不预言一整天，只照亮你今天最需要看见的那个角落——`,
      (c, o) => `「${c}」${o}来做你今天的引路牌。别急着问吉凶，先看它把光打在了哪里——`,
    ],
    '过去': [
      (c, o) => `落在「过去」的「${c}」${o}，说的是你一路走来的底色——那段经历留下的不只是记忆，还有一股至今仍在起作用的惯性。`,
      (c, o) => `「过去」的位置翻出「${c}」${o}。有些事你以为翻篇了，牌说：它还在参与你今天的决定。`,
    ],
    '现在': [
      (c, o) => `「现在」的位置上是「${c}」${o}——这是你此刻正身处其中、却未必自知的能量场。`,
      (c, o) => `此刻的你，被「${c}」${o}描述着。留意今天让你情绪波动最大的那件事，它多半就是这张牌在说的话。`,
    ],
    '未来': [
      (c, o) => `指向「未来」的「${c}」${o}并非注定——它显示的是：如果一切照现在的样子走下去，大概率会抵达的风景。`,
      (c, o) => `「未来」翻出「${c}」${o}。把它当成路标而不是判决书：方向盘还在你手里。`,
    ],
    '你自己': [
      (c, o) => `代表你的是「${c}」${o}——它映出的是你在这段关系里真实的姿态，可能和你自我感觉的不太一样。`,
      (c, o) => `你的位置上是「${c}」${o}。先诚实地对照一下：这像不像那个在关系里的你？`,
    ],
    '对方': [
      (c, o) => `TA 的位置翻出「${c}」${o}——注意，这是牌眼中的 TA，而不是你以为的 TA。`,
      (c, o) => `「${c}」${o}站在对方的位置上。试着用这张牌重新看 TA 最近的一次沉默或爆发。`,
    ],
    '关系现状': [
      (c, o) => `你们之间此刻的场域，由「${c}」${o}描述——关系是两个人共同酿出来的气候，谁都不是旁观者。`,
    ],
    '挑战': [
      (c, o) => `横在你们中间的功课是「${c}」${o}。挑战牌不是指责谁，它指出的是这段关系此刻最疼的那根筋。`,
    ],
  };

  function buildLead(posName, entry, seed) {
    const o = entry.reversed ? '（逆位）' : '（正位）';
    const templates = LEADS[posName] || [
      (c, oo) => `这个位置上翻出了「${c}」${oo}——`,
    ];
    return pick(templates, seed)(entry.card.nameZh, o);
  }

  /* ---------- 牌义正文：手写「人话」库 ----------
     大阿卡纳 22 张逐张手写正逆位；小阿卡纳按「数字本义 × 花色语境」织出，
     宫廷牌按「角色 × 花色人格」手写。目标：像一个懂牌的朋友在跟你说话。 */

  const MAJOR_TALK = {
    0:  { up: '愚者不看计划书，他背着小包就出发了。这张牌出现时，你多半正站在一个「想跳又怕摔」的边缘——牌的意思很直接：这一次，值得跳。你不需要准备到一百分才配开始，先迈步，路会在脚下长出来。',
          rv: '逆位的愚者说的不是「别冒险」，而是「看清你在逃什么」。最近那个看似洒脱的决定，可能只是想逃开眼前的麻烦；也可能相反——你把「再想想」当成了不出发的借口。分清这两者，答案就出来了。' },
    1:  { up: '桌上工具齐全，缺的只是你伸手。魔术师出现的意思是：这件事你其实已经会了——资源、人脉、能力都在手边，差的只是把想法说出口、写下来、发出去的那个动作。这周就是动手的窗口。',
          rv: '逆位魔术师有两副面孔：一是「我还没准备好」的自我怀疑，二是话说得太满的空头支票。看看你最近更像哪一个——前者需要你先做再说，后者需要你先兑现一件小的。' },
    2:  { up: '你其实已经知道答案了。女祭司不给新信息，她只是指着你心里那个早就存在、却一直被「再分析分析」压住的直觉。今天少问别人，多问自己一句：如果不怕任何人失望，我想选哪个？',
          rv: '逆位的女祭司是「失联的直觉」——太多噪音、太多别人的意见，把你自己的声音盖住了。这几天试着少刷一点、少问一个人，安静下来那一刻冒出来的念头，往往才是你的。' },
    3:  { up: '皇后是「先把自己喂饱」的牌。她带来的丰盛不靠拼命，靠滋养：好好吃饭、好好睡觉、允许事情慢慢长。你在酝酿的那件事（或那段关系）不需要催熟——它已经在长了。',
          rv: '逆位皇后常见的失衡是：把所有人都照顾到了，唯独漏掉自己；或者用「为你好」不知不觉绑住了别人。你最近的疲惫和委屈多半来自前者——先回来照顾自己，这不是自私，是止损。' },
    4:  { up: '皇帝的话很简单：这件事需要的不是灵感，是规矩。定框架、立边界、说清楚「行就是行，不行就是不行」。你越把规则立清楚，事情（和人）越服帖。',
          rv: '逆位皇帝要么是失控——生活散成一地抓不起来；要么是控制过度——把身边的人管到窒息。它提醒你：真正的秩序不是把所有变量捏死，而是抓大放小。这周挑一件事收紧就好，别全面开战。' },
    5:  { up: '教皇代表「被验证过的路」。这个阶段不适合野路子：找前辈请教、按行规来、把基础打牢。承认「有人比我懂」不丢人，它能让你少走三年弯路。',
          rv: '逆位教皇是「标准答案失效」的信号。别人的成功路径、家里给的模板、行业的老规矩——套在你身上就是不合身。它不是让你叛逆，是让你承认：这一题，你得自己写解法。' },
    6:  { up: '恋人牌说的不只是爱情，是「选择」——而且是那种选了就定义你是谁的选择。眼前的两条路没有对错，只有哪条更像你。用心选，而不是用利弊表选。',
          rv: '逆位恋人指着一处不一致：嘴上说的和心里要的，不是同一个东西。可能是关系里的貌合神离，也可能是你在两个选项之间拖着不选——但「不选」本身，也在替你选。' },
    7:  { up: '战车是「咬住不放」的牌。前面那件事不会自己让路，但你现在的冲劲足够碾过去——条件只有一个：方向盘上只能有一个方向。砍掉并行的杂念，这段时间就押一件事。',
          rv: '逆位战车不是没劲，是劲全消耗在互相打架的方向上——想赢又怕输、想走又舍不得。车轮空转的解法不是更用力，是先停下来把方向定死，再踩油门。' },
    8:  { up: '这张牌里驯服狮子的不是鞭子，是耐心。你此刻面对的那头「猛兽」——难缠的人、上头的情绪、戒不掉的习惯——硬碰硬只会两败俱伤。温柔而不退让，才是真正的强。',
          rv: '逆位力量说明你最近是硬撑的：外面看着稳，里面已经在冒烟。承认「我快撑不住了」不是认输，是给自己松绑的第一步。找个人说说，或者干脆休一天。' },
    9:  { up: '隐士举着灯上山，不是逃避人群，是去看清楚。你现在需要的不是更多建议，而是一段谁也不用应付的独处。答案不在热闹里，在你一个人待着时冒出来的那句话里。',
          rv: '逆位隐士有两个极端：躲得太深，用「我想静静」把所有人推开；或者根本静不下来，怕独处怕得要命。它提醒你：独处是充电，不是筑墙——门可以关，但别焊死。' },
    10: { up: '轮子转起来了。最近那些「怎么这么巧」的事不是错觉——一个周期正在结束，新的正在开始。你控制不了轮子，但你控制得了在哪个瞬间伸手：机会露头时，别客气。',
          rv: '逆位的轮子是「卡在坏循环里」：同样的剧情，换一批人马，重演一遍。打破它的方式不是等运气变好，而是找到你每次都会做的那个相同选择——改掉它，循环就断了。' },
    11: { up: '正义牌翻出来，账就要算清了——不是报应的意思，而是：你之前种的因，现在开始结果；你现在做的选择，也会一笔笔记下。做决定前问一句「这么做我心里干净吗」，就不会错。',
          rv: '逆位正义指向一处不公平——可能是你被亏待了还在替对方找理由，也可能是你自己在某件事上没那么坦荡。哪一边刺痛了你，答案就在哪一边。面对它，比装看不见轻松得多。' },
    12: { up: '倒吊人自愿倒挂，为的是换一个角度看世界。你卡住的那件事可能不需要「解决」，需要「换个看法」——退一步、缓一缓、故意什么都不做。暂停不是浪费时间，是这张牌开出的药方。',
          rv: '逆位倒吊人是「该松手了还吊着」：一段没有回音的等待、一份明知不值的付出。牺牲过了保质期，就成了自我感动。问自己一句狠的：我还在等的，到底是那个结果，还是「我等过」这个姿态？' },
    13: { up: '别怕，死神牌几乎从不说死亡——它说的是「该结束的就让它结束」。一段关系、一份工作、一个旧身份，落幕不是失败，是腾地方。你越体面地告别，新的东西来得越快。',
          rv: '逆位死神是「抓着不放」：明知道已经结束了，还在做心肺复苏。它不催你立刻放手，只问一句：维持这个「还没结束」的假象，每天要花你多少力气？把这些力气收回来，就是转机。' },
    14: { up: '节制是调酒师的牌：两杯性质相反的东西，被她调成了刚刚好。你眼下的功课就是「配比」——工作与休息、进与退、给与要。不用选边站，把火调小一点、水加多一点，就顺了。',
          rv: '逆位节制说明配比失衡了：某样东西过量（加班、情绪、消费、迁就），另一样严重不足。身体通常最先知道——最近的失眠或烦躁不是偶然。先把过量的那一项砍掉三成。' },
    15: { up: '恶魔牌指着一条链子——某个「明知道不好但停不下来」的东西：一段消耗你的关系、一个花钱买安慰的习惯、一份只剩下钱的工作。牌面的真相是：链子是虚扣的，头一低就能出来。难的不是挣脱，是承认自己被拴着。',
          rv: '逆位恶魔是好消息：链子已经松了。你最近对那个「老毛病」生出的厌倦感，就是解绑开始的证据。趁这股劲把离开的动作做完——删掉、退掉、说出口，别给它复辟的机会。' },
    16: { up: '高塔轰然一响，从来不挑时辰。某个你以为稳固的东西，可能正在（或即将）露出裂缝——但记住：塌下来的都是假的，真的东西塌不了。这张牌最狠也最慈悲：它拆掉你将就住着的危房，逼你盖真的。',
          rv: '逆位高塔是「憋着的地震」：你已经感觉到哪里不对，但还在加固表面。它给你两个选项——自己动手拆（主动摊牌、主动改变），或者等它自己塌。前者疼一下，后者疼很久。' },
    17: { up: '经历过前面的兵荒马乱，星星是那口终于喘上来的气。它不承诺立刻兑现什么，但它确认一件事：方向对了，希望是真的。伤口在愈合，你只需要继续做眼下在做的事，并且相信慢一点没关系。',
          rv: '逆位星星不是没有希望，是你暂时看不见它——连续的失望让你把期待调成了静音。别急着重新振作，先做一件纯粹让自己舒服的小事。星光一直在，是云的问题，不是天的问题。' },
    18: { up: '月亮底下，路还是那条路，但影子会骗人。你此刻的不安，一部分是真实的预警，一部分是想象放大的。这张牌不催你行动，它让你等天亮——信息不全的时候按兵不动，本身就是高级操作。',
          rv: '逆位月亮是雾要散的前奏：一件让你疑神疑鬼的事即将露出真相，或者你终于愿意面对那个其实早就知道的答案。真相可能不完美，但一定比猜测省力。' },
    19: { up: '整副牌里最不用解释的一张：成了，行了，放心笑吧。你问的那件事有阳光直射——不是「可能还行」，是明确的好。唯一的建议：别因为太顺利就心虚，你值得这个结果。',
          rv: '逆位太阳不是乌云，是「拉上百叶窗的晴天」——好事就在那儿，你却提不起劲，或者不敢信。它未必是情绪出了问题，可能只是累过头了。给自己放一个真正的假，太阳就回来了。' },
    20: { up: '审判是一声喊你名字的号角：某件「旧事」在要求一个了断——旧梦想、旧遗憾、一通拖了很久的电话。它给你一次改判的机会：过去定义不了你，但你得亲自去把案子翻过来。',
          rv: '逆位审判是「号角响了装没听见」：你其实知道自己该做那个决定了，只是一直按着。也可能是自我审判过了头——旧账翻到不敢动。宽恕别人难，宽恕自己更难，但这就是这张牌留的作业。' },
    21: { up: '一个圆满画上的句号。某件折腾了很久的事正在完成——而且是好的完成。允许自己庆祝，别急着问「然后呢」。把这一章好好合上，下一章会自己翻开。',
          rv: '逆位世界是「差一步的圆」：事情完成了九成五，卡在最后那口气——差个收尾、差句道别、差一次交付。它不是失败，是提醒：回头把那一小步补上，你会轻松得超乎想象。' },
  };

  const SUIT_CTX = {
    wands:     { field: '行动与热情', thing: '你正在推进（或一直想做）的那件事' },
    cups:      { field: '感情与关系', thing: '那段让你心里有波动的关系' },
    swords:    { field: '思绪与沟通', thing: '那件在你脑子里转个不停的事' },
    pentacles: { field: '现实层面——钱、工作或身体', thing: '那件关于钱、工作或健康的实际事务' },
  };

  const NUM_TALK = {
    1:  { up: (s) => `王牌是一颗刚破土的种子，落在${s.field}的土里：一个新的开始正送到你手上——新念头、新邀请、新的心动。种子不问收成，只问你种不种。这几天出现的「第一次」，认真对待。`,
          rv: (s) => `逆位的王牌：种子攥在手里，还没落地。可能是时机未到，更可能是你怕种下去会失望。它不催你，只提醒一句——种子一直不种，也是会过期的。` },
    2:  { up: (s) => `二是权衡的数字：${s.thing}正走到一个「选 A 还是选 B」的路口。别急着拍板，但也给自己一个期限——权衡是准备动作，不该变成生活方式。`,
          rv: (s) => `逆位的二：你在两个选项之间站得太久，脚都站麻了。假装没有路口，不会让路口消失。先划掉那个你其实从没真正考虑过的选项，事情立刻简单一半。` },
    3:  { up: (s) => `三是初见成效：${s.thing}冒出了第一批看得见的苗。它还不算收成，但它证明了方向没错。此刻最好的策略是「再推一程」，别在刚发芽的时候换地。`,
          rv: (s) => `逆位的三：预期中的进展迟到了，或者合作里有人掉了链子。先别急着推翻整个计划——延误和失败是两回事。查一查是哪个环节松了，拧紧比重来便宜得多。` },
    4:  { up: (s) => `四是地基的数字：${s.field}上，你正获得一段难得的稳定。享受它，但留一分清醒——稳定是用来休整和蓄力的驿站，不是终点站。`,
          rv: (s) => `逆位的四有两副面孔：要么稳过头变成了闷——守着安全区不敢动；要么是根基在松动，而你假装没看见。对照一下最近的自己：是该出门了，还是该补墙了。` },
    5:  { up: (s) => `五从来不是舒服的数字：${s.field}上正起摩擦——竞争、失落或冲突。但五也是转折位：它逼你确认什么才真的值得争。挑真正重要的仗打，其余的让出去不丢人。`,
          rv: (s) => `逆位的五：风波正在过去，或者你终于打算放下那口气了。和解——跟别人的，或跟自己的——已经在路上。你只需要别在最后关头，又把旧账翻出来。` },
    6:  { up: (s) => `六是流动与回甘：${s.field}上有好的能量在回流——认可、帮助、旧日的暖意。大方接住它。被帮助不是欠债，是流动的一环，下次轮到你给就是了。`,
          rv: (s) => `逆位的六提示一种不对等：给与受失衡了——可能你一直在付出没人接，也可能你欠着一句该说的感谢。还有一种读法：你在往回看，拿过去的好时光给现在打分。旧账该结，路要往前。` },
    7:  { up: (s) => `七是中场盘点：${s.thing}走到中段，最热的劲头过了，收成还没到。这不是放弃的信号，是筛选的信号——确认它仍然值得，然后守住。`,
          rv: (s) => `逆位的七：你可能在错的地方硬撑，或者被「都坚持这么久了」绑架——沉没成本从来不是继续的理由。诚实地算一笔账：如果今天从零开始，你还会选它吗？` },
    8:  { up: (s) => `八是提速的数字：${s.field}上，事情会动得很快——消息、进展、变化接连而来。提前把手头清一清，机会来的时候，你得腾得出手。`,
          rv: (s) => `逆位的八是「看起来很忙」：动作很多，位移很小；或者你被困在重复的日程里，忘了当初为什么出发。先停一个小时，把「必须做」和「惯性做」分开。` },
    9:  { up: (s) => `九是接近满格：${s.field}上，你已经攒下了实打实的东西，这份从容是你自己挣来的。但九也容易孤：成果可以独享，路别越走越窄——留一扇门给人进来。`,
          rv: (s) => `逆位的九：表面是「我一个人也挺好」，里面可能是「我不敢麻烦别人」。自给自足和自我隔离，只差一步。另一种读法：焦虑在夜里被放大了——你担心的那件事，白天看会小一半。` },
    10: { up: (s) => `十是句点：${s.thing}正走向一个完整的收尾——圆满，或者如释重负。把句号画得好看一点：该感谢的感谢，该复盘的复盘。腾空的手，才接得住下一程。`,
          rv: (s) => `逆位的十：一件早该收尾的事拖成了负担——你扛着的可能已经不是责任，是惯性。卸下一部分不等于失职。另一种含义：结局不如预期，但「结束」本身，就是它给你的礼物。` },
  };

  const COURT_TALK = {
    page: {
      frag: { wands: '一个刚被点燃的念头', cups: '一份刚冒头的心动或善意', swords: '一个不吐不快的问题', pentacles: '一门想学想试的新本事' },
      up: (f) => `侍从是送信的孩子：${f}正在靠近你。它现在还小、还嫩，别急着用「成不成熟」去掐它——好奇心本身就是这张牌送你的礼物，跟着它走两步看看。`,
      rv: (f) => `逆位侍从：那个刚起头的东西有点虚——消息可能不实，热情可能只有三分钟，承诺可能只是随口一说。不用戳破，也别押注，让时间替你验一验。`,
    },
    knight: {
      frag: { wands: '一股说走就走的冲劲', cups: '一段浪漫得有点上头的心绪', swords: '一句箭在弦上的话', pentacles: '一份慢但扎实的推进力' },
      up: (f) => `骑士上马就走：${f}正在主导你，或正朝你驶来。这股劲是真的，用它来破局正合适——只是骑士看路不看坑，冲出去之前，先扫一眼脚下。`,
      rv: (f) => `逆位骑士要么冲过了头，要么迟迟不肯动。检查一下：你最近是那个横冲直撞的人，还是那个「再等等」说了一个月的人？两种，都是同一匹马没骑好。`,
    },
    queen: {
      frag: { wands: '热烈而笃定', cups: '共情而温柔', swords: '清醒而直接', pentacles: '务实而周到' },
      rvFrag: { wands: '热情烧成了急躁', cups: '体贴泡成了讨好或情绪化', swords: '清醒冷成了刻薄', pentacles: '稳妥闷成了操劳和舍不得' },
      up: (f) => `王后向内掌管：这张牌请你用「${f}」的方式主事——不催、不吼、稳稳地在场。你此刻最大的力量不是做得更多，而是稳得住。`,
      rv: (f) => `逆位王后是能量向内拧了结：${f}。多半是因为你先亏待了自己——王后的解法从来只有一句：先把自己的杯子倒满。`,
    },
    king: {
      frag: { wands: '用愿景带人，而不是用蛮力推事', cups: '情绪再汹涌，你也稳得住场', swords: '讲原则、讲逻辑，一锤定音', pentacles: '把摊子看全，让每个人都有饭吃' },
      rvFrag: { wands: '说一不二变成了听不进话', cups: '成熟稳重变成了用情绪拿捏人', swords: '果断变成了冷硬武断', pentacles: '稳健变成了守财与固执' },
      up: (f) => `国王向外掌局：${f}。这张牌认定你已经有资格坐这个位置——别再用学徒的心态事事请示，拍板吧，这个责任你担得起。`,
      rv: (f) => `逆位国王是权柄用歪了：${f}。位置越高越要记得：权威是别人心服口服给的，不是椅子给的。`,
    },
  };

  function buildBody(posName, entry, seed) {
    const { card } = entry;
    const o = entry.reversed ? 'rv' : 'up';
    if (card.arcana === 'major') return MAJOR_TALK[card.number][o];
    if (card.number <= 10) return NUM_TALK[card.number][o](SUIT_CTX[card.suit]);
    const ct = COURT_TALK[card.rank];
    const frag = (o === 'rv' && ct.rvFrag) ? ct.rvFrag[card.suit] : ct.frag[card.suit];
    return ct[o](frag);
  }

  /* 行动低语：按花色给一个当天就能做的具体动作 */
  const ADVICE = {
    major: {
      up: [
        '大牌不考验技巧，考验诚实。今晚留十分钟独处，写下看到这张牌时第一个想起的人或事——那就是它对应的现场。',
        '这张牌的事急不来，但可以「接」：这一周，对跟它相关的机会和对话，保持一个来了就应的姿态。',
      ],
      rv: [
        '大牌逆位先别急着修，先承认：找一个信得过的人，把这件卡住的事原原本本讲一遍——讲清楚的那一刻，它就松了一半。',
        '接下来三天，留意这个主题在生活里的重播。它每出现一次，你就多一次改写的机会。',
      ],
    },
    wands: {
      up: ['今天就推进一小步：发出那条消息、报上那个名、把第一版做出来。火要趁热。',
           '把这股劲用在刀刃上——挑一件最重要的事全力推，其余的这周先放一放。'],
      rv: ['别硬点火。先做一件十五分钟内能完成的小事，让「完成感」把引擎重新带起来。',
           '写下你最初做这件事的理由。理由还在，就继续；早就没了，就允许自己换赛道。'],
    },
    cups: {
      up: ['给那个你想起来会心头一软的人发个消息吧，不需要理由。',
           '今天把一句一直没说出口的在乎说出去——发文字也算。这张牌的运气，走「表达」这条路。'],
      rv: ['情绪上头的时候不做决定：写下来，睡一觉，明早再看它还作不作数。',
           '这几天先别问「TA 是怎么想的」，先问「我到底想要什么」——顺序对了，事就顺了。'],
    },
    swords: {
      up: ['把纠结的事写成三行：事实一行，恐惧一行，下一步一行。写完，答案自己会浮上来。',
           '该说清楚的话，挑一个两人都冷静的时间当面说。真话不伤人，含糊才伤人。'],
      rv: ['脑子停不下来的时候，去做十五分钟纯体力的事——走路、洗碗、收拾桌面。身体一动，念头就松。',
           '给自己放一天「信息假」：那些让你反复咀嚼的对话和消息，静音二十四小时试试。'],
    },
    pentacles: {
      up: ['这张牌的好运走现实路线：查一眼账目、约一次体检、把那笔该谈的钱谈了。',
           '把大目标切成本周能完成的一小块，做完打个勾——所谓积累，就是这么长起来的。'],
      rv: ['花十分钟列张清单：现在手里有什么、缺什么、下一步先补哪样。慌，多半来自没盘点。',
           '这周对自己好一点，但别靠花钱——早睡一晚、好好吃两顿饭，身体稳了，判断才稳。'],
    },
  };

  function buildAdvice(entry, seed) {
    const bank = entry.card.arcana === 'major' ? ADVICE.major : ADVICE[entry.card.suit];
    return pick(entry.reversed ? bank.rv : bank.up, seed);
  }

  function appendInterpretation(index) {
    const pos = state.spread.positions[index];
    const entry = state.picked[index];
    const { card } = entry;
    const keywords = entry.reversed ? card.keywordsReversed : card.keywordsUpright;
    const orientTxt = entry.reversed ? '逆位' : '正位';
    const seed = card.number + index * 3 + (entry.reversed ? 7 : 0);

    const item = document.createElement('article');
    item.className = 'interp-card' + (entry.reversed ? ' is-reversed' : '');
    item.innerHTML = `
      <div class="interp-head">
        <span class="interp-pos">${index + 1} · ${pos.name}</span>
        <span class="interp-title">${card.nameZh}（${orientTxt}）</span>
        <span class="interp-en">${card.nameEn}</span>
      </div>
      <p class="interp-lead">${buildLead(pos.name, entry, seed)}</p>
      <div class="keywords">${keywords.map((k) => `<span class="kw">${k}</span>`).join('')}</div>
      <p class="interp-desc">${buildBody(pos.name, entry, seed)}</p>
      <p class="interp-advice">${buildAdvice(entry, seed)}</p>
    `;
    $('#interpretations').appendChild(item);
  }

  /* 整体启示：全部翻开后，把几张牌串成一条故事线 */
  const SUIT_FIELD = {
    wands: '行动与欲望', cups: '感受与关系', swords: '思绪与沟通', pentacles: '现实与钱、身体',
  };
  function buildSummary() {
    const picks = state.picked;
    const total = picks.length;
    const majors = picks.filter((p) => p.card.arcana === 'major').length;
    const reversedN = picks.filter((p) => p.reversed).length;
    const suitCount = {};
    picks.forEach((p) => { if (p.card.suit) suitCount[p.card.suit] = (suitCount[p.card.suit] || 0) + 1; });
    const domSuit = Object.entries(suitCount).sort((x, y) => y[1] - x[1])[0];
    const out = [];

    // 能量层级
    if (total > 1 && majors >= Math.ceil(total / 2)) {
      out.push(`这次抽出的牌里有 ${majors} 张大阿卡纳——这通常意味着你问的不是一件日常小事，它牵动的是更长线的人生课题，急不来，也躲不掉。`);
    } else if (total > 1 && majors === 0) {
      out.push(`全部是小阿卡纳：答案不在宏大的命运叙事里，而藏在日常的具体动作中——一次谈话、一个安排、一个小决定。`);
    }
    // 领域倾向
    if (domSuit && domSuit[1] >= 2) {
      out.push(`牌面明显偏向「${SUIT_FIELD[domSuit[0]]}」的领域——不管你问的是什么，真正该处理的战场在这里。`);
    }
    // 顺逆基调
    if (reversedN === 0) {
      out.push(`${total > 1 ? '所有牌' : '牌'}都以正位出现，通道是通的：此刻你更需要的是行动，而不是继续等一个「更好的时机」。`);
    } else if (reversedN === total) {
      out.push(`全部逆位——先停一停。眼下的关键词是「疏通」而不是「用力」，把卡住的部分一件件松开，局面自己会动。`);
    } else if (reversedN >= Math.ceil(total / 2)) {
      out.push(`逆位偏多：不是运气差，而是有几股能量在打结。顺序很重要——先处理逆位牌指出的堵点，正位的好牌才接得住你。`);
    } else if (reversedN > 0) {
      const revPos = picks.map((p, i) => (p.reversed ? state.spread.positions[i].name : null)).filter(Boolean).join('」「');
      out.push(`整体以正位为主，只有「${revPos}」带着逆位——它不是坏消息，而是一个精确的坐标：这次占卜真正的功课，就落在那一处。`);
    }
    // 牌阵专属故事线
    if (state.spread.id === 'three-card' && total === 3) {
      const [past, now, future] = picks;
      if (past.reversed && !future.reversed) {
        out.push(`最值得注意的是走向：过去的牌是逆位，未来的牌转为正位——你正在走出一段拧巴的时期，而且未来的牌已经伸手接住你了。别在快出隧道的地方回头。`);
      } else if (!past.reversed && future.reversed) {
        out.push(`一个提醒：过去顺、未来逆——现在的轨迹里埋着一个会翻转的变量，它大概率就是「现在」那张牌说的那件事。趁早正视它，剧本还来得及改。`);
      } else if (!past.reversed && !future.reversed && now.reversed) {
        out.push(`起点与去向都是正位，卡点只集中在「现在」——中间那张逆位牌就是你此刻要过的关。它不挡路，它就是路：过了这一处，前后自然连成顺途。`);
      } else if (!past.reversed && !future.reversed) {
        out.push(`三张牌一路正位，轨迹是延续向上的：你不需要改变方向，只需要别停。`);
      } else {
        out.push(`过去与未来都带着逆位——模式在重复。打破它的钥匙在中间那张「现在」的牌里：改变今天的应对方式，就是改写未来的方式。`);
      }
    }
    if (state.spread.id === 'relationship' && total === 5) {
      const [me, ta] = picks;
      if (me.card.suit && me.card.suit === ta.card.suit) {
        out.push(`你和 TA 的牌来自同一花色——你们其实在同一个频道上，只是表达方式不同。很多「不合」只是翻译问题。`);
      } else if (me.reversed && ta.reversed) {
        out.push(`你们两人的牌都是逆位：都带着各自卡住的能量进场。先各自松绑，再谈「我们」——顺序反了，谈什么都费劲。`);
      } else if (me.card.arcana === 'major' && ta.card.arcana !== 'major') {
        out.push(`你的牌是大阿卡纳而 TA 的不是——这段关系此刻对你的课题更重。它在塑造你，别只把注意力放在对方身上。`);
      } else if (ta.card.arcana === 'major' && me.card.arcana !== 'major') {
        out.push(`TA 的牌是大阿卡纳——这段关系正在深刻地搅动 TA。TA 的反复，也许不是针对你。`);
      }
    }
    if (state.spread.id === 'single') {
      out.push(`单张牌不解释一生，它只负责点亮今天。今晚睡前回看一眼：今天发生的哪件事，对上了这张牌？那一刻，就是牌想跟你说话的地方。`);
    }
    return out;
  }

  function renderSummary() {
    const paras = buildSummary();
    if (!paras.length) return;
    const item = document.createElement('article');
    item.className = 'interp-card summary-card';
    item.innerHTML = `
      <div class="summary-title">✦ 整体启示</div>
      <div class="summary-body">${paras.map((p) => `<p>${p}</p>`).join('')}</div>
    `;
    $('#interpretations').appendChild(item);
  }

  function flipAll() {
    const slots = document.querySelectorAll('#board .slot');
    let delay = 0;
    slots.forEach((slot) => {
      const btn = slot.querySelector('.flip-card');
      if (btn.classList.contains('flipped')) return;
      setTimeout(() => btn.click(), delay);
      delay += 280;
    });
  }

  /* ---------- 事件绑定 ---------- */

  $('#brand-btn').addEventListener('click', () => showView('home'));
  $('#btn-back-home').addEventListener('click', () => showView('home'));
  $('#btn-reshuffle').addEventListener('click', () => {
    state.picked = [];
    state.deck = freshShuffledDeck();
    car.rot = 0;
    car.vel = 0;
    car.inertia = false;
    car.locked = false;
    car.snapping = false;
    car.lastTouch = performance.now();
    buildCarousel(true);
    renderTray();
    updateDrawProgress();
  });
  $('#btn-flip-all').addEventListener('click', flipAll);
  $('#btn-restart').addEventListener('click', () => {
    showView('home');
  });

  renderSpreadGrid();
  renderHomeSky();
  setupHeroVideo();
  document.body.classList.add('on-home');
  setupCarouselInput();
})();
