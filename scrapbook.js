/* Independent paper-memory interaction. No uploads, no invented memories. */
(() => {
  'use strict';
  if (window.Scrapbook) return;

  const fallbackNotes = [
    '最喜欢星禾这件事，我承认。',
    '星禾，生日快乐。给你准备了个地方，想带你逛逛。',
    '逛累了就回来坐坐，这里一直给你留着位置。'
  ];
  const slots = [[0.08, 0.08, -7], [0.82, 0.30, 6], [0.38, 0.86, -3]];
  let desk, drawButton, status, photos = [], cursor = 0, topLayer = 3;
  let cards = [], turnTimer, observer;

  function installStyles() {
    if (document.getElementById('scrapbook-module-styles')) return;
    const style = document.createElement('style');
    style.id = 'scrapbook-module-styles';
    style.textContent = `
      #memory-desk{position:relative;min-height:340px;isolation:isolate;overflow:hidden;}
      .scrapbook-card{position:absolute;box-sizing:border-box;width:clamp(136px,43%,208px);padding:10px 10px 8px;background:#fcf8ef;color:#484b46;border:1px solid #d8cebf;box-shadow:2px 7px 14px #5b4d392b;transform:rotate(var(--paper-angle,0deg));transform-origin:center;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;will-change:transform;}
      .scrapbook-card::before{content:'';position:absolute;z-index:3;pointer-events:none;top:-13px;left:28%;width:44%;height:26px;background:url('assets/scrapbook/washi-rose.svg') center/100% 100% no-repeat;transform:rotate(-4deg);opacity:.85;}
      .scrapbook-card.is-dragging{cursor:grabbing;box-shadow:4px 14px 20px #5b4d3940;}
      .scrapbook-card.is-arriving{animation:scrapbook-draw .65s cubic-bezier(.22,.8,.24,1) both;}
      .scrapbook-flipper{position:relative;display:block;width:100%;aspect-ratio:4/4.2;padding:0;border:0;background:transparent;color:inherit;font:inherit;cursor:inherit;perspective:900px;touch-action:none;}
      .scrapbook-card-inner{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .5s cubic-bezier(.2,.7,.2,1);}
      .scrapbook-card.is-flipped .scrapbook-card-inner{transform:rotateY(180deg);}
      .scrapbook-face{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;}
      .scrapbook-front{background:#eee8dc;}
      .scrapbook-front img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;-webkit-user-drag:none;}
      .scrapbook-back{box-sizing:border-box;transform:rotateY(180deg);background:repeating-linear-gradient(#f7f1e6 0 26px,#d9d0c066 27px,#f7f1e6 28px);padding:13px 10px;flex-direction:column;font-size:15px;line-height:1.8;white-space:pre-wrap;text-align:left;}
      .scrapbook-back-note{margin:0;max-height:100%;overflow:auto;user-select:text;}
      .scrapbook-card-label{display:flex;justify-content:space-between;gap:5px;align-items:center;font-size:11px;letter-spacing:.04em;color:#777164;margin:8px 0 3px;}
      .scrapbook-card-actions{display:flex;justify-content:space-between;gap:4px;}
      .scrapbook-card-actions button{min-height:36px;padding:5px 7px;border:0;background:transparent;color:#725568;font:inherit;font-size:12px;cursor:pointer;text-underline-offset:4px;}
      .scrapbook-card-actions button:hover{text-decoration:underline;}
      .scrapbook-card button:focus-visible{outline:2px solid #896779;outline-offset:3px;}
      .scrapbook-sr-status{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}
      #panel .panel-shell.scrapbook-page-turn{transform-origin:8% 50%;animation:scrapbook-turn .46s cubic-bezier(.2,.7,.25,1) both;}
      @keyframes scrapbook-draw{from{opacity:0;transform:translate(-65px,65px) rotate(-18deg);clip-path:inset(0 0 55% 0);}to{opacity:1;transform:translate(0,0) rotate(var(--paper-angle,0deg));clip-path:inset(0);}}
      @keyframes scrapbook-turn{from{opacity:.25;transform:perspective(1400px) rotateY(-9deg) translateX(12px);}to{opacity:1;transform:perspective(1400px) rotateY(0deg) translateX(0);}}
      @media(max-width:600px){#memory-desk{min-height:345px}.scrapbook-card-actions button{min-height:44px;padding:5px 4px}.scrapbook-back{font-size:14px;line-height:1.7}}
      @media(prefers-reduced-motion:reduce){.scrapbook-card.is-arriving,#panel .panel-shell.scrapbook-page-turn{animation:none}.scrapbook-card-inner{transition:none}}
    `;
    document.head.append(style);
  }

  function make(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function limits(card) {
    // The rotation-safe padding keeps photographs inside the right-hand page.
    const pad = Math.min(15, desk.clientWidth * 0.035);
    return {
      minX: pad, minY: pad,
      maxX: Math.max(pad, desk.clientWidth - card.node.offsetWidth - pad),
      maxY: Math.max(pad, desk.clientHeight - card.node.offsetHeight - pad)
    };
  }

  function place(card) {
    const bound = limits(card);
    card.x = bound.minX + card.rx * (bound.maxX - bound.minX);
    card.y = bound.minY + card.ry * (bound.maxY - bound.minY);
    card.node.style.left = `${card.x}px`;
    card.node.style.top = `${card.y}px`;
  }

  function flip(card) {
    card.flipped = !card.flipped;
    card.node.classList.toggle('is-flipped', card.flipped);
    card.flipButton.setAttribute('aria-pressed', String(card.flipped));
    card.surface.setAttribute('aria-pressed', String(card.flipped));
    card.flipButton.textContent = card.flipped ? '看照片' : '翻到背面';
    card.front.setAttribute('aria-hidden', String(card.flipped));
    card.back.setAttribute('aria-hidden', String(!card.flipped));
    card.surface.setAttribute('aria-label', card.flipped
      ? `${card.note}，点击看照片`
      : `${card.photo.alt || '留在这里的照片'}，点击翻到背面`);
    card.node.style.zIndex = String(++topLayer);
  }

  function attachDragging(card) {
    let drag = null;
    card.node.addEventListener('pointerdown', event => {
      if (event.button !== 0 || event.target.closest('.scrapbook-card-actions')) return;
      if (event.target.closest('.scrapbook-back-note') && card.flipped) return;
      card.node.classList.remove('is-arriving');
      drag = {id:event.pointerId, startX:event.clientX, startY:event.clientY, x:card.x, y:card.y, moved:false};
      card.node.style.zIndex = String(++topLayer);
    });
    card.node.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;
      if (Math.hypot(dx, dy) > 5) drag.moved = true;
      if (!drag.moved) return;
      if (!card.node.hasPointerCapture(event.pointerId)) card.node.setPointerCapture(event.pointerId);
      card.node.classList.add('is-dragging');
      const bound = limits(card);
      card.x = Math.max(bound.minX, Math.min(bound.maxX, drag.x + dx));
      card.y = Math.max(bound.minY, Math.min(bound.maxY, drag.y + dy));
      card.rx = (card.x - bound.minX) / Math.max(1, bound.maxX - bound.minX);
      card.ry = (card.y - bound.minY) / Math.max(1, bound.maxY - bound.minY);
      card.node.style.left = `${card.x}px`;
      card.node.style.top = `${card.y}px`;
    });
    function stop(event) {
      if (!drag || drag.id !== event.pointerId) return;
      if (drag.moved) card.suppressClickUntil = performance.now() + 180;
      if (card.node.hasPointerCapture(event.pointerId)) card.node.releasePointerCapture(event.pointerId);
      card.node.classList.remove('is-dragging');
      drag = null;
    }
    card.node.addEventListener('pointerup', stop);
    card.node.addEventListener('pointercancel', stop);
    card.node.addEventListener('lostpointercapture', () => {
      drag = null;
      card.node.classList.remove('is-dragging');
    });
  }

  function draw(animate = true) {
    if (!desk || !photos.length) return null;
    if (cards.length >= 3) {
      const oldest = cards.shift();
      if (oldest.node.contains(document.activeElement)) drawButton.focus({preventScroll:true});
      oldest.node.remove();
    }
    const index = cursor++ % photos.length;
    const photo = photos[index];
    const slot = slots[(cursor - 1) % slots.length];
    const card = {photo, note:photo.caption || fallbackNotes[index % fallbackNotes.length], rx:slot[0], ry:slot[1], flipped:false, suppressClickUntil:0};
    card.node = make('article', 'scrapbook-card' + (animate ? ' is-arriving' : ''));
    card.node.dataset.photoId = photo.id || String(index);
    card.node.style.setProperty('--paper-angle', `${slot[2]}deg`);
    card.node.style.zIndex = String(++topLayer);
    card.surface = make('button', 'scrapbook-flipper');
    card.surface.type = 'button';
    card.surface.setAttribute('aria-pressed', 'false');
    card.surface.setAttribute('aria-label', `${photo.alt || '留在这里的照片'}，点击翻到背面`);
    const inner = make('span', 'scrapbook-card-inner');
    card.front = make('span', 'scrapbook-face scrapbook-front');
    const image = make('img');
    image.src = photo.thumbSrc || photo.src;
    image.alt = photo.alt || '留在这里的照片';
    image.decoding = 'async';
    image.draggable = false;
    image.addEventListener('error', () => {
      image.hidden = true;
      card.front.append(make('span', '', '照片暂时没打开'));
    }, {once:true});
    card.front.append(image);
    card.back = make('span', 'scrapbook-face scrapbook-back');
    card.back.setAttribute('aria-hidden', 'true');
    card.back.append(make('span', 'scrapbook-back-note', card.note));
    inner.append(card.front, card.back);
    card.surface.append(inner);
    card.surface.addEventListener('click', event => {
      if (performance.now() < card.suppressClickUntil && event.detail !== 0) return;
      flip(card);
    });
    const label = make('div', 'scrapbook-card-label');
    label.append(make('span', '', '留在这一页'), make('span', '', photo.dateLabel || `${String(index + 1).padStart(2,'0')} / ${String(photos.length).padStart(2,'0')}`));
    const actions = make('div', 'scrapbook-card-actions');
    card.flipButton = make('button', '', '翻到背面');
    card.flipButton.type = 'button';
    card.flipButton.setAttribute('aria-pressed', 'false');
    card.flipButton.addEventListener('click', () => flip(card));
    const zoom = make('button', '', '放大看');
    zoom.type = 'button';
    zoom.setAttribute('aria-label', `放大查看${photo.alt || '照片'}`);
    zoom.addEventListener('click', () => {
      if (window.Postcards && typeof window.Postcards.openPanel === 'function') window.Postcards.openPanel('photos', zoom);
      else window.open(photo.src, '_blank', 'noopener');
    });
    actions.append(card.flipButton, zoom);
    card.node.append(card.surface, label, actions);
    desk.append(card.node);
    cards.push(card);
    place(card);
    attachDragging(card);
    card.node.addEventListener('animationend', () => card.node.classList.remove('is-arriving'), {once:true});
    if (animate && status) status.textContent = `抽出了第${index + 1}张照片，可以拖动摆放或翻到背面。`;
    return card.node;
  }

  function init() {
    const target = document.getElementById('memory-desk');
    const trigger = document.getElementById('draw-memory');
    if (!target || !trigger || target.dataset.scrapbookReady === 'true') return false;
    desk = target;
    drawButton = trigger;
    photos = (window.POSTCARDS_CONTENT?.photos || []).filter(photo => photo && photo.src);
    desk.dataset.scrapbookReady = 'true';
    installStyles();
    status = make('span', 'scrapbook-sr-status');
    status.setAttribute('aria-live', 'polite');
    desk.append(status);
    if (!photos.length) {
      drawButton.hidden = true;
      const placeholder=make('div','scrapbook-empty-frame');
      placeholder.append(make('span','','这一页，'),make('p','','给喜欢的瞬间留着。'));
      desk.append(placeholder);
      const footnote=document.querySelector('.page-footnote');
      if(footnote)footnote.firstChild.textContent='慢慢收藏，不着急。';
      return true;
    }
    drawButton.addEventListener('click', () => draw(true));
    draw(false);
    if (photos.length > 1) draw(false);
    if (window.ResizeObserver) {
      observer = new ResizeObserver(() => cards.forEach(place));
      observer.observe(desk);
    } else window.addEventListener('resize', () => cards.forEach(place));
    return true;
  }

  document.addEventListener('postcards:panel', event => {
    const shell = document.querySelector('#panel .panel-shell');
    if (!shell) return;
    installStyles();
    clearTimeout(turnTimer);
    shell.classList.remove('scrapbook-page-turn');
    shell.dataset.scrapbookChapter = String(event.detail?.id || '');
    void shell.offsetWidth;
    shell.classList.add('scrapbook-page-turn');
    turnTimer = setTimeout(() => shell.classList.remove('scrapbook-page-turn'), 520);
  });

  window.Scrapbook = {init, draw:() => draw(true), getState:() => ({nextIndex:photos.length ? cursor % photos.length : 0, count:cards.length, photoIds:cards.map(card => card.photo.id)})};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
