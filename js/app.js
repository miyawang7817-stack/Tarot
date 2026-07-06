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

  /* ---------- 抽牌页：3D 牌堆 + 拖拽交互 ---------- */

  const STACK_DEPTH = 7;   // 牌堆可见层数
  let drawLocked = false;  // 飞出动画期间锁定操作

  function startDraw(spread) {
    state.spread = spread;
    state.question = $('#question-input').value.trim();
    state.picked = [];
    state.deck = freshShuffledDeck();
    drawLocked = false;
    $('#draw-title').textContent = spread.nameZh;
    renderStack(true);
    renderTray();
    updateDrawProgress();
    showView('draw');
  }

  function renderStack(withShuffleAnim) {
    const stack = $('#stack');
    stack.innerHTML = '';
    const visible = Math.min(state.deck.length, STACK_DEPTH);
    for (let i = visible - 1; i >= 0; i--) {
      const el = document.createElement('button');
      el.className = 'stack-card' + (i === 0 ? ' top' : '') + (withShuffleAnim ? ' shuffling' : '');
      el.style.setProperty('--i', i);
      el.style.zIndex = STACK_DEPTH - i;
      if (withShuffleAnim) el.style.animationDelay = (i * 70) + 'ms';
      el.setAttribute('aria-label', i === 0 ? '牌堆顶：点击或上滑抽牌' : '牌堆中的牌');
      el.innerHTML = '<span class="card-back"></span>';
      stack.appendChild(el);
    }
    attachDrag(stack.querySelector('.stack-card.top'));
  }

  /* 顶层卡片：跟手拖拽。上滑 = 抽牌；左右滑 = 跳过；轻点 = 抽牌 */
  function attachDrag(card) {
    if (!card) return;
    let startX = 0, startY = 0, dx = 0, dy = 0, tracking = false;

    card.addEventListener('pointerdown', (e) => {
      if (drawLocked) return;
      tracking = true;
      startX = e.clientX;
      startY = e.clientY;
      dx = dy = 0;
      card.setPointerCapture(e.pointerId);
      card.classList.add('dragging');
    });

    card.addEventListener('pointermove', (e) => {
      if (!tracking) return;
      dx = e.clientX - startX;
      dy = e.clientY - startY;
      const rot = dx * 0.07;
      card.style.transform =
        `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
    });

    const finish = () => {
      if (!tracking) return;
      tracking = false;
      card.classList.remove('dragging');
      const dist = Math.hypot(dx, dy);
      if (dist < 8) {                    // 轻点：抽牌
        drawTop(card);
      } else if (dy < -90 && Math.abs(dy) > Math.abs(dx)) {  // 上滑：抽牌
        drawTop(card);
      } else if (Math.abs(dx) > 110) {   // 左右滑：跳过这张
        skipTop(card, dx > 0 ? 1 : -1);
      } else {                           // 回弹
        card.style.transform = '';
      }
    };
    card.addEventListener('pointerup', finish);
    card.addEventListener('pointercancel', finish);
  }

  function drawTop(card) {
    if (drawLocked || state.picked.length >= state.spread.positions.length) return;
    drawLocked = true;
    card.style.transform = '';
    card.classList.add('fly-up');
    const entry = state.deck.shift();
    state.picked.push(entry);
    setTimeout(() => {
      renderStack(false);
      renderTray();
      updateDrawProgress();
      drawLocked = false;
      if (state.picked.length === state.spread.positions.length) {
        setTimeout(startReading, 700);
      }
    }, 380);
  }

  function skipTop(card, dir) {
    if (drawLocked) return;
    drawLocked = true;
    card.style.transform = '';
    card.style.setProperty('--fly-x', (dir * 72) + 'vw');
    card.style.setProperty('--fly-rot', (dir * 24) + 'deg');
    card.classList.add('fly-side');
    state.deck.push(state.deck.shift()); // 放回牌堆底部
    setTimeout(() => {
      renderStack(false);
      drawLocked = false;
    }, 320);
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
    drawLocked = false;
    renderStack(true);
    renderTray();
    updateDrawProgress();
  });
  $('#btn-flip-all').addEventListener('click', flipAll);
  $('#btn-restart').addEventListener('click', () => {
    $('#question-input').value = '';
    showView('home');
  });

  renderSpreadGrid();
})();
