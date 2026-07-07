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

  /* ---------- 抽牌页：3D 命运牌环 ----------
     牌沿圆柱面排成立体转环：拖动 / 惯性 / 自动旋转，明暗与流光随角度变化，
     点击中间的牌将其抽起，点侧边的牌先转到中间 */

  const STEP_DEG = 22.5;                 // 相邻牌的圆周角
  const VIEW_DEG = 112;                  // 可见角度范围（±）
  const AUTO_SPEED = 0.0003;             // 自动旋转速度（张/毫秒，约 3.3 秒一张）
  const AUTO_RAMP = 1000;                // 自动旋转的启动渐入时长（毫秒）
  const IDLE_DELAY = 2000;               // 交互后多久恢复自动旋转
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let ring = {
    rot: 0,            // 当前旋转量（单位：张）
    cards: [],         // { entry, el, shine }
    locked: false,     // 抽牌动画期间锁定
    anim: null,        // 吸附动画的 rAF id
    loop: null,        // 自动旋转主循环的 rAF id
    dragging: false,
    snapping: false,
    lastTouch: 0,      // 最近一次交互时间
  };

  function startDraw(spread) {
    state.spread = spread;
    state.picked = [];
    state.deck = freshShuffledDeck();
    ring.rot = 0;
    ring.locked = false;
    // 入场发牌动画（约 0.9s）一结束就开始自动旋转，不用干等空闲判定
    ring.lastTouch = performance.now() - IDLE_DELAY + 900;
    $('#draw-title').textContent = spread.nameZh;
    buildRing(true);
    renderTray();
    updateDrawProgress();
    showView('draw');
    startRingLoop();
  }

  function ringGeom() {
    const mobile = window.innerWidth < 720;
    // 半径由弧长间距推出：R = spacing / stepRad（间距 > 牌宽，留出呼吸感）
    const spacing = mobile ? 136 : 218;
    return { R: spacing / (STEP_DEG * Math.PI / 180) };
  }

  function buildRing(deal) {
    const stage = $('#ring-stage');
    stage.innerHTML = '';
    cancelAnimationFrame(ring.anim);
    ring.snapping = false;
    ring.cards = state.deck.map((entry, i) => {
      const el = document.createElement('button');
      el.className = 'ring-card' + (deal ? ' dealing' : '');
      el.dataset.idx = i;
      if (deal) el.style.animationDelay = (Math.min(Math.abs(i), 5) * 90) + 'ms';
      el.setAttribute('aria-label', '牌环中的牌');
      el.innerHTML = '<span class="card-back"></span><span class="card-dim"></span><span class="card-shine"></span>';
      stage.appendChild(el);
      return { entry, el };
    });
    layoutRing();
  }

  /* 把每张牌摆到圆柱面上：θ 为该牌相对正前方的圆周角。
     位置 = 圆周坐标，姿态 = 沿切面朝外；明暗与流光随 θ 连续变化 */
  function layoutRing() {
    const n = ring.cards.length;
    if (!n) return;
    const { R } = ringGeom();
    const maxSteps = VIEW_DEG / STEP_DEG;
    ring.cards.forEach((c, i) => {
      let steps = (((i - ring.rot) % n) + n) % n;
      if (steps > n / 2) steps -= n;
      const el = c.el;
      if (Math.abs(steps) > maxSteps) {
        // 不可见的牌只在状态切换时写一次样式，并整体跳过渲染（78 张里通常 60+ 张）
        if (!c.hidden) {
          c.hidden = true;
          el.style.visibility = 'hidden';
          el.style.pointerEvents = 'none';
          el.classList.remove('center');
        }
        return;
      }
      if (c.hidden) {
        c.hidden = false;
        el.style.visibility = 'visible';
      }
      const theta = steps * STEP_DEG;
      const rad = theta * Math.PI / 180;
      const x = Math.sin(rad) * R;
      const z = (Math.cos(rad) - 1) * R;          // 正前方 z=0，绕向后方
      const edge = Math.abs(theta) / VIEW_DEG;    // 0 中间 → 1 边缘
      el.style.opacity = String(1 - Math.pow(edge, 2.2));
      el.style.pointerEvents = 'auto';
      // 前后遮挡由 preserve-3d 深度排序完成，无需 zIndex
      el.style.transform = `translateX(${x.toFixed(1)}px) translateZ(${z.toFixed(1)}px) rotateY(${theta.toFixed(2)}deg)`;
      // 光影：黑色遮罩的 opacity 表达明暗（合成器友好，替代 filter）
      el.style.setProperty('--dim', (0.48 * (1 - Math.cos(rad))).toFixed(3));
      // 流光：高光条随角度平移扫过卡面
      el.style.setProperty('--shine-t', (40 - theta * 2.7).toFixed(1) + '%');
      el.style.setProperty('--shine-o', String(Math.max(0, 1 - Math.abs(theta) / 70).toFixed(3)));
      el.classList.toggle('center', Math.abs(steps) < 0.4);
    });
  }

  /* 请求在下一帧重排牌环（所有旋转路径共用主循环渲染，避免一帧多次布局） */
  function requestLayout() {
    ring.dirty = true;
  }

  /* 吸附/转动到指定旋转量（立体缓动） */
  function animateRotTo(target, duration = 620, done) {
    cancelAnimationFrame(ring.anim);
    const from = ring.rot;
    const delta = target - from;
    if (Math.abs(delta) < 0.001) { ring.rot = target; ring.snapping = false; layoutRing(); done && done(); return; }
    ring.snapping = true;
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      ring.rot = from + delta * ease(t);
      requestLayout();
      if (t < 1) ring.anim = requestAnimationFrame(tick);
      else { ring.snapping = false; ring.lastTouch = performance.now(); done && done(); }
    };
    ring.anim = requestAnimationFrame(tick);
  }

  /* 主循环：空闲时自动缓慢旋转（渐入启动，避免突兀） */
  function startRingLoop() {
    if (ring.loop) return;
    let last = 0;
    let ramp = 0; // 0 → 1 的启动系数
    const frame = (now) => {
      if (views.draw.classList.contains('hidden')) { ring.loop = null; return; }
      const dt = last ? Math.min(50, now - last) : 0;
      last = now;
      const idle = !ring.dragging && !ring.snapping && !ring.locked
        && now - ring.lastTouch > IDLE_DELAY && !REDUCED_MOTION;
      if (idle && dt) {
        ramp = Math.min(1, ramp + dt / AUTO_RAMP);
        // ease-in-out 的渐入曲线，让转动从静止柔和加速
        const eased = ramp * ramp * (3 - 2 * ramp);
        ring.rot += dt * AUTO_SPEED * eased;
        ring.dirty = true;
      } else if (!idle) {
        ramp = 0;
      }
      if (ring.dirty) {
        ring.dirty = false;
        layoutRing();
      }
      ring.loop = requestAnimationFrame(frame);
    };
    ring.loop = requestAnimationFrame(frame);
  }

  /* 拖拽旋转 + 惯性 + 轻点抽牌 */
  function setupRingInput() {
    const area = $('#ring-area');
    // 每转过一张牌，手指对应滑过的像素数（= 圆周弧长间距）
    const pxPerStep = () => ringGeom().R * STEP_DEG * Math.PI / 180;
    let startX = 0, lastX = 0, lastT = 0, velocity = 0, startRot = 0, moved = 0;

    area.addEventListener('pointerdown', (e) => {
      if (ring.locked) return;
      ring.dragging = true;
      ring.lastTouch = performance.now();
      moved = 0;
      startX = lastX = e.clientX;
      lastT = performance.now();
      velocity = 0;
      startRot = ring.rot;
      cancelAnimationFrame(ring.anim);
      ring.snapping = false;
      area.classList.add('grabbing');
      area.setPointerCapture(e.pointerId);
    });

    area.addEventListener('pointermove', (e) => {
      if (!ring.dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      velocity = dx / Math.max(1, now - lastT); // px/ms
      lastX = e.clientX;
      lastT = now;
      moved = Math.max(moved, Math.abs(e.clientX - startX));
      ring.rot = startRot - (e.clientX - startX) / pxPerStep();
      ring.lastTouch = now;
      requestLayout(); // 由主循环在下一帧统一渲染，与事件频率解耦
    });

    const finish = (e) => {
      if (!ring.dragging) return;
      ring.dragging = false;
      ring.lastTouch = performance.now();
      area.classList.remove('grabbing');

      if (moved < 8) { // 轻点：按坐标找被点的牌（pointer capture 会改写 e.target）
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const target = hit && hit.closest('.ring-card');
        if (target) handleRingTap(target);
        else animateRotTo(Math.round(ring.rot));
        return;
      }
      // 惯性：按松手速度多转几张，再吸附到整数位（立体缓动）
      const fling = Math.max(-6, Math.min(6, -velocity * 4.5));
      const target = Math.round(ring.rot + fling);
      animateRotTo(target, 760);
    };
    area.addEventListener('pointerup', finish);
    area.addEventListener('pointercancel', () => {
      ring.dragging = false;
      area.classList.remove('grabbing');
      animateRotTo(Math.round(ring.rot));
    });

    // 键盘可达性：左右转动，回车抽中间的牌
    area.tabIndex = 0;
    area.addEventListener('keydown', (e) => {
      if (ring.locked) return;
      ring.lastTouch = performance.now();
      if (e.key === 'ArrowLeft') { e.preventDefault(); animateRotTo(Math.round(ring.rot) - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); animateRotTo(Math.round(ring.rot) + 1); }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const c = ring.cards[centerIndex()];
        if (c) drawRingCard(c);
      }
    });
  }

  function centerIndex() {
    const n = ring.cards.length;
    return ((Math.round(ring.rot) % n) + n) % n;
  }

  function handleRingTap(el) {
    const i = Number(el.dataset.idx);
    const n = ring.cards.length;
    let steps = (((i - ring.rot) % n) + n) % n;
    if (steps > n / 2) steps -= n;
    if (Math.abs(steps) < 0.4) {
      drawRingCard(ring.cards[i]);       // 点中间：抽这张
    } else {
      animateRotTo(ring.rot + steps);    // 点旁边：把它转到中间
    }
  }

  function drawRingCard(card) {
    if (ring.locked || state.picked.length >= state.spread.positions.length) return;
    ring.locked = true;
    const idx = Number(card.el.dataset.idx);

    card.el.classList.add('rise');       // 中间的牌升起
    state.picked.push(card.entry);
    state.deck.splice(idx, 1);
    ring.cards.splice(idx, 1);
    ring.cards.forEach((c, i) => { c.el.dataset.idx = i; });
    renderTray();
    updateDrawProgress();

    const finished = state.picked.length === state.spread.positions.length;

    // 牌还在升起时，其余的牌就平滑合拢补位（不重建 DOM，无顿挫）
    setTimeout(() => {
      if (!finished && ring.cards.length) {
        ring.cards.forEach((c) => { if (!c.hidden) c.el.classList.add('closing'); });
        ring.rot = idx % ring.cards.length;
        requestLayout();
      }
    }, 200);

    setTimeout(() => {
      card.el.remove();
      if (finished) { startReading(); return; }
      ring.cards.forEach((c) => c.el.classList.remove('closing'));
      ring.lastTouch = performance.now() - IDLE_DELAY + 900;
      ring.locked = false;
    }, 700);
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
      ? `已抽 <b>${n}</b> / ${total} 张 —— 凭直觉为「${next.name}」抽一张牌`
      : `已抽 <b>${n}</b> / ${total} 张，命运之牌已就位……`;
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
    ring.rot = 0;
    ring.locked = false;
    ring.lastTouch = performance.now();
    buildRing(true);
    renderTray();
    updateDrawProgress();
    startRingLoop();
  });
  window.addEventListener('resize', () => {
    if (!views.draw.classList.contains('hidden')) layoutRing();
  });
  $('#btn-flip-all').addEventListener('click', flipAll);
  $('#btn-restart').addEventListener('click', () => {
    showView('home');
  });

  renderSpreadGrid();
  setupRingInput();
})();
