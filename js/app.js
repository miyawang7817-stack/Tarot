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
    window.scrollTo({ top: 0 });
  }

  /* ---------- 首页：牌阵选择 ---------- */

  function renderSpreadGrid() {
    const grid = $('#spread-grid');
    grid.innerHTML = '';
    SPREADS.forEach((spread) => {
      const btn = document.createElement('button');
      btn.className = 'spread-card';
      btn.innerHTML = `
        <span class="spread-icon">${spread.icon}</span>
        <div class="spread-name">${spread.nameZh}</div>
        <div class="spread-desc">${spread.descriptionZh}</div>
        <div class="spread-count">✦ ${spread.positions.length} 张牌 · ${spread.positions
          .map((p) => p.name)
          .join(' / ')}</div>
      `;
      btn.addEventListener('click', () => startDraw(spread));
      grid.appendChild(btn);
    });
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
    blobs[0].style.backgroundColor = `hsl(${h} 62% 52% / 0.42)`;
    blobs[1].style.backgroundColor = `hsl(${(h + 24) % 360} 55% 50% / 0.34)`;
    blobs[2].style.backgroundColor = `hsl(${(h + 336) % 360} 55% 46% / 0.30)`;
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

    el.classList.add('rise');            // 主牌升起
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
    $('#reading-hint').textContent = '点击卡牌，逐张翻开你的命运之牌';
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
      slot.className = `slot slot-${i + 1}`;
      slot.innerHTML = `
        <div class="slot-label"><span class="slot-order">${i + 1}</span><b>${pos.name}</b></div>
        <button class="flip-card" aria-label="翻开「${pos.name}」位置的牌">
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
    });
  }

  function flipCard(index, slot, flipBtn) {
    if (flipBtn.classList.contains('flipped')) return;
    flipBtn.classList.add('flipped');
    slot.classList.add('revealed');

    const entry = state.picked[index];
    const orientCls = entry.reversed ? 'reversed' : 'upright';
    const orientTxt = entry.reversed ? '逆位' : '正位';
    slot.querySelector('.slot-name').innerHTML =
      `${entry.card.nameZh}<span class="orient-tag ${orientCls}">${orientTxt}</span>`;

    appendInterpretation(index);

    state.flippedCount++;
    if (state.flippedCount === state.spread.positions.length) {
      $('#reading-hint').textContent = '所有牌已翻开 —— 静心体会牌面给你的启示';
      $('#btn-flip-all').disabled = true;
    }
  }

  function appendInterpretation(index) {
    const pos = state.spread.positions[index];
    const entry = state.picked[index];
    const { card } = entry;
    const keywords = entry.reversed ? card.keywordsReversed : card.keywordsUpright;
    const orientTxt = entry.reversed ? '逆位' : '正位';

    const item = document.createElement('article');
    item.className = 'interp-card' + (entry.reversed ? ' is-reversed' : '');
    item.innerHTML = `
      <div class="interp-head">
        <span class="interp-pos">${index + 1} · ${pos.name}</span>
        <span class="interp-title">${card.nameZh}（${orientTxt}）</span>
        <span class="interp-en">${card.nameEn}</span>
      </div>
      <p class="interp-pos-meaning">${pos.meaning}</p>
      <div class="keywords">${keywords.map((k) => `<span class="kw">${k}</span>`).join('')}</div>
      <p class="interp-desc">${card.descriptionZh}</p>
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
  setupCarouselInput();
})();
