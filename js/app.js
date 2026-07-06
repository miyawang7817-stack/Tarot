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
    question: '',      // 用户的问题
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
     牌沿星轨排成环，左右拖动旋转（带惯性吸附），点击中间的牌将其抽起 */

  const VISIBLE_STEPS = 3.6; // 两侧各可见约 3 张
  let ring = {
    rot: 0,          // 当前旋转量（单位：张）
    cards: [],       // { entry, el }
    locked: false,   // 抽牌动画期间锁定
    anim: null,      // 吸附动画的 rAF id
  };

  function startDraw(spread) {
    state.spread = spread;
    state.question = $('#question-input').value.trim();
    state.picked = [];
    state.deck = freshShuffledDeck();
    ring.rot = 0;
    ring.locked = false;
    $('#draw-title').textContent = spread.nameZh;
    buildRing(true);
    renderTray();
    updateDrawProgress();
    showView('draw');
  }

  function ringGeom() {
    const mobile = window.innerWidth < 720;
    return {
      spacing: mobile ? 96 : 150,   // 相邻牌横向间距
      depth: mobile ? 90 : 130,     // 每级纵深
      angle: mobile ? 30 : 27,      // 每级偏转角
    };
  }

  function buildRing(deal) {
    const stage = $('#ring-stage');
    stage.innerHTML = '';
    cancelAnimationFrame(ring.anim);
    ring.cards = state.deck.map((entry, i) => {
      const el = document.createElement('button');
      el.className = 'ring-card' + (deal ? ' dealing' : '');
      el.dataset.idx = i;
      if (deal) el.style.animationDelay = (Math.min(Math.abs(i), 5) * 90) + 'ms';
      el.setAttribute('aria-label', '牌环中的牌');
      el.innerHTML = '<span class="card-back"></span>';
      stage.appendChild(el);
      return { entry, el };
    });
    layoutRing();
  }

  /* 把每张牌摆到环上：中间的最大最亮，两侧向后透视排开 */
  function layoutRing() {
    const n = ring.cards.length;
    if (!n) return;
    const g = ringGeom();
    ring.cards.forEach((c, i) => {
      let steps = (((i - ring.rot) % n) + n) % n;
      if (steps > n / 2) steps -= n;
      const el = c.el;
      if (Math.abs(steps) > VISIBLE_STEPS) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        el.style.transform = 'translateX(' + (steps > 0 ? 1 : -1) * g.spacing * 4 + 'px) translateZ(-620px)';
        el.classList.remove('center');
        return;
      }
      const clamped = Math.max(-3, Math.min(3, steps));
      const x = clamped * g.spacing;
      const z = -Math.abs(clamped) * g.depth;
      const ry = -clamped * g.angle;
      el.style.opacity = String(1 - Math.abs(steps) * 0.13);
      el.style.pointerEvents = 'auto';
      el.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${ry}deg)`;
      el.style.zIndex = String(100 - Math.round(Math.abs(steps) * 10));
      el.style.filter = `brightness(${1 - Math.abs(steps) * 0.14})`;
      el.classList.toggle('center', Math.abs(steps) < 0.4);
    });
  }

  /* 吸附/转动到指定旋转量（缓动动画） */
  function animateRotTo(target, duration = 420, done) {
    cancelAnimationFrame(ring.anim);
    const from = ring.rot;
    const delta = target - from;
    if (Math.abs(delta) < 0.001) { ring.rot = target; layoutRing(); done && done(); return; }
    const t0 = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      ring.rot = from + delta * ease(t);
      layoutRing();
      if (t < 1) ring.anim = requestAnimationFrame(tick);
      else { done && done(); }
    };
    ring.anim = requestAnimationFrame(tick);
  }

  /* 拖拽旋转 + 惯性 + 轻点抽牌 */
  function setupRingInput() {
    const area = $('#ring-area');
    const g = () => ringGeom();
    let dragging = false, startX = 0, lastX = 0, lastT = 0, velocity = 0, startRot = 0, moved = 0;

    area.addEventListener('pointerdown', (e) => {
      if (ring.locked) return;
      dragging = true;
      moved = 0;
      startX = lastX = e.clientX;
      lastT = performance.now();
      velocity = 0;
      startRot = ring.rot;
      cancelAnimationFrame(ring.anim);
      area.classList.add('grabbing');
      area.setPointerCapture(e.pointerId);
    });

    area.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      velocity = dx / Math.max(1, now - lastT); // px/ms
      lastX = e.clientX;
      lastT = now;
      moved = Math.max(moved, Math.abs(e.clientX - startX));
      ring.rot = startRot - (e.clientX - startX) / g().spacing;
      layoutRing();
    });

    const finish = (e) => {
      if (!dragging) return;
      dragging = false;
      area.classList.remove('grabbing');

      if (moved < 8) { // 轻点：按坐标找被点的牌（pointer capture 会改写 e.target）
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const target = hit && hit.closest('.ring-card');
        if (target) handleRingTap(target);
        else animateRotTo(Math.round(ring.rot));
        return;
      }
      // 惯性：按松手速度多转几张，再吸附到整数位
      const fling = -velocity * 6;
      const target = Math.round(ring.rot + fling);
      animateRotTo(target, 520);
    };
    area.addEventListener('pointerup', finish);
    area.addEventListener('pointercancel', () => {
      dragging = false;
      area.classList.remove('grabbing');
      animateRotTo(Math.round(ring.rot));
    });

    // 键盘可达性：左右转动，回车抽中间的牌
    area.tabIndex = 0;
    area.addEventListener('keydown', (e) => {
      if (ring.locked) return;
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
    ring.cards.forEach((c) => {          // 其余的牌暂时隐去
      if (c !== card) c.el.classList.add('fade-away');
    });

    state.picked.push(card.entry);
    state.deck.splice(idx, 1);

    setTimeout(() => {
      renderTray();
      updateDrawProgress();
      if (state.picked.length === state.spread.positions.length) {
        setTimeout(startReading, 500);
        return;
      }
      // 抽走的是中间那张：让原本紧随其后的牌接到中间
      ring.rot = state.deck.length ? idx % state.deck.length : 0;
      buildRing(true);                   // 牌环重新聚拢
      ring.locked = false;
    }, 620);
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
    const q = $('#reading-question');
    q.textContent = state.question;
    q.classList.toggle('hidden', !state.question);
    $('#reading-hint').textContent = '点击卡牌，逐张翻开你的命运之牌';
    $('#btn-flip-all').disabled = false;
    $('#interpretations').innerHTML = '';
    renderBoard();
    showView('reading');
  }

  function renderBoard() {
    const board = $('#board');
    board.className = 'board';
    if (state.spread.layout === 'cross') board.classList.add('layout-cross');
    if (state.spread.layout === 'celtic') board.classList.add('layout-celtic');
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
    buildRing(true);
    renderTray();
    updateDrawProgress();
  });
  window.addEventListener('resize', () => {
    if (!views.draw.classList.contains('hidden')) layoutRing();
  });
  $('#btn-flip-all').addEventListener('click', flipAll);
  $('#btn-restart').addEventListener('click', () => {
    $('#question-input').value = '';
    showView('home');
  });

  renderSpreadGrid();
  setupRingInput();
})();
