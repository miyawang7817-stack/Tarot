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

  /* ---------- 抽牌页：命运轮盘（角色制轮换） ----------
     中间主牌 + 左右虚化小牌 + 背后一张；切换时位置 / 大小 / 模糊 / 透明度
     在 650ms 内同步过渡；空闲时自动轮换；点中间的牌抽取 */

  const STEP_MS = 650;                   // 一次轮换的过渡时长
  const AUTO_EVERY = 2600;               // 自动轮换间隔
  const IDLE_DELAY = 2200;               // 交互后多久恢复自动轮换
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const car = {
    active: 0,         // 当前主牌在牌堆中的下标
    animating: false,  // 轮换过渡期间锁定
    locked: false,     // 抽牌动画期间锁定
    lastTouch: 0,      // 最近一次用户交互
    lastAuto: 0,       // 最近一次自动轮换
    loop: null,
    cards: [],         // { entry, el }
  };

  function startDraw(spread) {
    state.spread = spread;
    state.picked = [];
    state.deck = freshShuffledDeck();
    car.active = 0;
    car.locked = false;
    car.animating = false;
    car.lastTouch = performance.now();
    car.lastAuto = performance.now();
    $('#draw-title').textContent = spread.nameZh;
    buildCarousel(true);
    renderTray();
    updateDrawProgress();
    showView('draw');
    startAutoLoop();
  }

  function buildCarousel(deal) {
    const stage = $('#ring-stage');
    stage.innerHTML = '';
    car.cards = state.deck.map((entry, i) => {
      const el = document.createElement('button');
      el.className = 'car-card pos-hidden';
      el.dataset.idx = i;
      el.setAttribute('aria-label', '轮盘中的牌');
      el.innerHTML = '<span class="card-back"></span><span class="card-shine"></span>';
      stage.appendChild(el);
      return { entry, el };
    });
    applyRoles();
    if (deal) {
      car.cards.forEach((c, i) => {
        if (!c.el.classList.contains('pos-hidden')) {
          c.el.classList.add('dealing');
          c.el.style.animationDelay = (i % 5) * 80 + 'ms';
        }
      });
      setTimeout(() => car.cards.forEach((c) => c.el.classList.remove('dealing')), 1200);
    }
  }

  function roleOf(rel) {
    if (rel === 0) return 'pos-center';
    if (rel === -1) return 'pos-left';
    if (rel === 1) return 'pos-right';
    if (rel === 2) return 'pos-back';
    return 'pos-hidden';
  }

  /* 按当前 active 给每张牌分配角色类，CSS 过渡自动完成动画 */
  function applyRoles() {
    const n = car.cards.length;
    if (!n) return;
    car.cards.forEach((c, i) => {
      let rel = (((i - car.active) % n) + n) % n;
      if (rel > n / 2) rel -= n;
      const role = roleOf(rel);
      if (c.role !== role) {
        c.role = role;
        const keepDealing = c.el.classList.contains('dealing');
        c.el.className = 'car-card ' + role + (keepDealing ? ' dealing' : '');
      }
    });
  }

  function navigate(dir, isAuto) {
    if (car.animating || car.locked) return;
    const n = car.cards.length;
    if (n < 2) return;
    car.animating = true;
    if (isAuto) car.lastAuto = performance.now();
    else car.lastTouch = performance.now();
    car.active = ((car.active + dir) % n + n) % n;
    applyRoles();
    setTimeout(() => { car.animating = false; }, STEP_MS);
  }

  /* 空闲时自动轮换 */
  function startAutoLoop() {
    if (car.loop) return;
    const frame = (now) => {
      if (views.draw.classList.contains('hidden')) { car.loop = null; return; }
      const idle = !REDUCED_MOTION && !car.locked && !car.animating
        && now - car.lastTouch > IDLE_DELAY
        && now - car.lastAuto > AUTO_EVERY;
      if (idle) navigate(1, true);
      car.loop = requestAnimationFrame(frame);
    };
    car.loop = requestAnimationFrame(frame);
  }

  /* 滑动切换 + 点击选卡 */
  function setupCarouselInput() {
    const area = $('#ring-area');
    let sx = 0, tracking = false, moved = 0;

    area.addEventListener('pointerdown', (e) => {
      if (car.locked) return;
      tracking = true;
      moved = 0;
      sx = e.clientX;
      car.lastTouch = performance.now();
    });
    area.addEventListener('pointermove', (e) => {
      if (!tracking) return;
      moved = Math.max(moved, Math.abs(e.clientX - sx));
    });
    const finish = (e) => {
      if (!tracking) return;
      tracking = false;
      car.lastTouch = performance.now();
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 56) {           // 滑动：换一张
        navigate(dx < 0 ? 1 : -1);
        return;
      }
      if (moved < 8) {                   // 轻点：中间抽牌，两侧换位
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const t = hit && hit.closest('.car-card');
        if (!t) return;
        if (t.classList.contains('pos-center')) drawCarCard(t);
        else if (t.classList.contains('pos-left')) navigate(-1);
        else navigate(1);
      }
    };
    area.addEventListener('pointerup', finish);
    area.addEventListener('pointercancel', () => { tracking = false; });

    $('#nav-prev').addEventListener('click', () => navigate(-1));
    $('#nav-next').addEventListener('click', () => navigate(1));

    // 键盘可达性
    area.tabIndex = 0;
    area.addEventListener('keydown', (e) => {
      if (car.locked) return;
      car.lastTouch = performance.now();
      if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); navigate(1); }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const c = car.cards[car.active];
        if (c) drawCarCard(c.el);
      }
    });
  }

  function drawCarCard(el) {
    if (car.locked || car.animating) return;
    if (state.picked.length >= state.spread.positions.length) return;
    car.locked = true;
    const idx = Number(el.dataset.idx);
    const cardObj = car.cards[idx];

    el.classList.add('rise');            // 主牌升起
    state.picked.push(cardObj.entry);
    state.deck.splice(idx, 1);
    car.cards.splice(idx, 1);
    car.cards.forEach((c, i) => { c.el.dataset.idx = i; });
    renderTray();
    updateDrawProgress();

    const finished = state.picked.length === state.spread.positions.length;

    // 主牌还在升起时，右侧牌就平滑滑入中间补位
    setTimeout(() => {
      if (!finished && car.cards.length) {
        car.active = idx % car.cards.length;
        applyRoles();
      }
    }, 180);

    setTimeout(() => {
      el.remove();
      if (finished) { startReading(); return; }
      car.locked = false;
      car.lastTouch = performance.now();
    }, 760);
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
    car.active = 0;
    car.locked = false;
    car.animating = false;
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
