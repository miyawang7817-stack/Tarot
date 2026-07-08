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
    for (let i = 0; i < 26; i++) {
      const s = document.createElement('span');
      s.className = 'tw';
      const size = rand(1.5, 3).toFixed(1);
      s.style.left = rand(2, 98).toFixed(1) + '%';
      s.style.top = rand(3, 60).toFixed(1) + '%';
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.setProperty('--d', rand(2.5, 6).toFixed(1) + 's');
      s.style.setProperty('--dl', rand(0, 5).toFixed(1) + 's');
      sky.appendChild(s);
    }
  }

  /* 首页背景：Canvas 穿越星空（太空旅行感）。
     星星从深处向镜头缓缓飞来、拖出光迹；替代无法外链的设计稿视频 */
  function setupSpaceTravel() {
    const cv = $('#hero-canvas');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const DPR = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0;
    const resize = () => {
      W = cv.width = cv.offsetWidth * DPR;
      H = cv.height = cv.offsetHeight * DPR;
    };
    window.addEventListener('resize', resize);
    resize();

    const N = 240;
    const spawn = (s) => {
      s.x = (Math.random() - 0.5) * 1.6;
      s.y = (Math.random() - 0.5) * 1.6;
      s.z = 1;
      s.pz = 1;
      s.hue = Math.random() < 0.12 ? 46 : (Math.random() < 0.1 ? 265 : 0); // 少量金/紫星
      return s;
    };
    const stars = Array.from({ length: N }, () => {
      const s = spawn({});
      s.z = 0.05 + Math.random() * 0.95;
      s.pz = s.z;
      return s;
    });

    if (REDUCED_MOTION) {           // 静态星空
      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        stars.forEach((s) => {
          const f = Math.min(W, H);
          ctx.fillRect(W / 2 + (s.x / s.z) * f * 0.5, H * 0.42 + (s.y / s.z) * f * 0.5, DPR, DPR);
        });
      };
      draw();
      window.addEventListener('resize', draw);
      return;
    }

    const SPEED = 0.000085;          // 缓慢梦幻的巡航速度
    let last = 0;
    const frame = (now) => {
      requestAnimationFrame(frame);
      if (views.home.classList.contains('hidden') || document.hidden) { last = now; return; }
      const dt = Math.min(50, now - (last || now));
      last = now;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H * 0.42, f = Math.min(W, H);
      for (const s of stars) {
        s.pz = s.z;
        s.z -= SPEED * dt * (0.6 + (1 - s.z) * 0.9);   // 越近越快，透视加速感
        if (s.z <= 0.03) { spawn(s); continue; }
        const sx = cx + (s.x / s.z) * f * 0.5;
        const sy = cy + (s.y / s.z) * f * 0.5;
        if (sx < -40 || sx > W + 40 || sy < -40 || sy > H + 40) { spawn(s); continue; }
        const px = cx + (s.x / s.pz) * f * 0.5;
        const py = cy + (s.y / s.pz) * f * 0.5;
        const t = 1 - s.z;
        const alpha = 0.12 + 0.78 * t * t;
        ctx.strokeStyle = s.hue
          ? `hsla(${s.hue} 80% 78% / ${alpha.toFixed(3)})`
          : `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.lineWidth = Math.max(0.5, 2 * t) * DPR;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
    };
    requestAnimationFrame(frame);
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

  function buildBody(posName, entry, seed) {
    const { card } = entry;
    const up = card.keywordsUpright;
    const rv = card.keywordsReversed;
    if (!entry.reversed) {
      const flow = pick([
        `此刻它的能量是顺向的：「${up[0]}」与「${up[1] || up[0]}」正在（或即将）在你的处境里显形。`,
        `牌面向上，通道是通的——「${up[0]}」不是等来的运气，是你已经具备、只差承认的东西。`,
        `正位意味着这股力量站在你这边：越主动使用「${up[0]}」，它回馈得越快。`,
      ], seed);
      return `${card.descriptionZh}${flow}`;
    }
    const r0 = rv[0] || '停滞';
    const r1 = rv[1] || r0;
    const r2 = rv[2] || r1;
    const block = pick([
      `但它以逆位出现——同一股能量此刻被卡住、转了向，或用力过了头。你可能正体验到：${r0}、${r1}，甚至${r2}。`,
      `逆位翻转了它的表达：本该流动的部分淤住了。对照看看，最近是否有「${r0}」或「${r1}」的影子？`,
      `牌面倒转不是凶兆，它是一面提醒镜：${r0}的背后，往往藏着没被承认的需要。`,
    ], seed);
    const heal = pick([
      `逆位的功课只有一个——先承认它在，再给它一个出口，而不是压下去。`,
      `处理逆位能量最忌硬推：先松，后通，再走。`,
      `当你能对人说出「我最近有点${r0}」时，这张牌就开始转正了。`,
    ], seed + 1);
    return `${card.descriptionZh}${block}${heal}`;
  }

  function buildAdvice(entry, seed) {
    const { card } = entry;
    if (!entry.reversed) {
      const kw = pick(card.keywordsUpright, seed);
      return pick([
        `把「${kw}」带进今天的一个具体决定里，哪怕很小。`,
        `接下来三天，允许自己更「${kw}」一点——观察发生了什么。`,
        `今晚睡前回看：今天哪一刻，你已经在「${kw}」了？`,
      ], seed);
    }
    const rkw = pick(card.keywordsReversed, seed);
    return pick([
      `当你又想「${rkw}」时，停三秒，问问自己此刻在怕什么。`,
      `本周试着做一件与「${rkw}」相反的小事，不求彻底，只求松动。`,
      `把「${rkw}」写下来放在看得见的地方——被看见的情绪，杀伤力减半。`,
    ], seed);
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
  setupSpaceTravel();
  document.body.classList.add('on-home');
  setupCarouselInput();
})();
