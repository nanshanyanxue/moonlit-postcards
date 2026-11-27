/* A small, physical photo wardrobe. Works with illustrations and postcards. */
(() => {
  'use strict';
  const instances = new WeakMap();
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  window.renderWardrobe = function renderWardrobe({container, content, selectedId, onSelect, reduceMotion = false}) {
    if (!(container instanceof Element)) throw new TypeError('renderWardrobe needs a container element');
    instances.get(container)?.destroy();
    const items = (content?.dresses || []).filter(item => item?.id && item.imageSrc);
    const recipient = content?.recipient || '星禾';
    const reduced = () => reduceMotion && typeof reduceMotion === 'object' ? Boolean(reduceMotion.matches) : Boolean(reduceMotion);
    const root = make('section', 'wardrobe-studio');
    root.setAttribute('aria-label', '把喜欢的插画贴进生日收藏');
    const gallery = make('div', 'wardrobe-gallery');
    const instruction = make('p', 'wardrobe-instruction', '点选一张，或者轻轻拖到右页。');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    line.setAttribute('viewBox', '0 0 600 60');
    line.setAttribute('preserveAspectRatio', 'none');
    line.setAttribute('class', 'wardrobe-clothesline');
    line.setAttribute('aria-hidden', 'true');
    const cord = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    cord.setAttribute('d', 'M4 12Q300 68 596 12');
    line.append(cord);
    const rack = make('div', 'wardrobe-rack');
    gallery.append(instruction, line, rack);

    const collection = make('div', 'wardrobe-collection');
    collection.setAttribute('role', 'group');
    collection.setAttribute('aria-label', '生日收藏页，点击左侧照片也可以贴入');
    const collectionTitle = make('div', 'wardrobe-collection-title');
    collectionTitle.append(make('span', '', 'TODAY’S LITTLE COLLECTION'), make('h3', '', '今天喜欢的这一张'));
    const landing = make('div', 'wardrobe-landing');
    const dropHint = make('span', 'wardrobe-drop-hint', '放在这里，就收好啦');
    const status = make('p', 'wardrobe-selection-status');
    status.setAttribute('aria-live', 'polite');
    collection.append(collectionTitle, landing, dropHint, status);
    root.append(gallery, collection);
    container.append(root);

    let selected = null, activeDrag = null, destroyed = false, animation = null;
    const buttons = new Map();
    const suppress = new WeakMap();
    const cleanups = [];

    function insideCollection(x, y) {
      const box = collection.getBoundingClientRect();
      return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
    }

    function imageFor(item) {
      const image = make('img', 'wardrobe-artwork');
      image.src = item.imageSrc;
      image.alt = item.name || '手绘插画';
      image.decoding = 'async';
      image.draggable = false;
      image.addEventListener('error', () => {
        image.hidden = true;
        image.parentElement?.append(make('span', 'wardrobe-image-error', '这张照片暂时没打开'));
      }, {once:true});
      return image;
    }

    function select(id, {notify = true, animate = true, sourceRect = null} = {}) {
      const item = items.find(candidate => candidate.id === id);
      if (!item || destroyed) return false;
      selected = id;
      for (const [candidateId, button] of buttons) {
        const chosen = candidateId === id;
        button.setAttribute('aria-pressed', String(chosen));
        button.classList.toggle('is-selected', chosen);
        button.querySelector('.wardrobe-card-check').textContent = chosen ? '已经收藏' : '贴进右页 ↗';
      }
      animation?.cancel();
      const card = make('figure', 'wardrobe-kept-card');
      const frame = make('div', 'wardrobe-kept-image');
      frame.append(imageFor(item));
      const caption = make('figcaption', '', item.name);
      card.append(frame, caption);
      landing.replaceChildren(card);
      const stamp = make('span', 'wardrobe-kept-stamp', `${recipient}的生日收藏`);
      landing.append(stamp);
      status.textContent = `${item.name}，已经贴在这一页，也会留在纪念票根里。`;
      collection.classList.add('has-selection');
      if (animate && !reduced() && typeof card.animate === 'function') {
        const target = card.getBoundingClientRect();
        const origin = sourceRect || buttons.get(id)?.getBoundingClientRect();
        const dx = origin ? origin.left + origin.width / 2 - target.left - target.width / 2 : -90;
        const dy = origin ? origin.top + origin.height / 2 - target.top - target.height / 2 : -25;
        animation = card.animate([
          {transform:`translate(${dx}px,${dy}px) rotate(-9deg) scale(.68)`,opacity:.6},
          {transform:'translate(0,0) rotate(3deg) scale(1.035)',opacity:1,offset:.82},
          {transform:'translate(0,0) rotate(2deg) scale(1)',opacity:1}
        ], {duration:620,easing:'cubic-bezier(.2,.75,.2,1)'});
        stamp.animate([{opacity:0,transform:'rotate(-11deg) scale(1.6)'},{opacity:1,transform:'rotate(-11deg) scale(1)'}], {duration:280,delay:420,fill:'backwards',easing:'ease-out'});
      }
      if (notify && typeof onSelect === 'function') onSelect(id);
      return true;
    }

    function clearDrag() {
      if (!activeDrag) return;
      const drag = activeDrag;
      activeDrag = null;
      drag.ghost?.remove();
      drag.button.classList.remove('is-dragging');
      root.classList.remove('wardrobe-drag-active');
      collection.classList.remove('is-drop-ready');
      if (drag.button.hasPointerCapture(drag.pointerId)) drag.button.releasePointerCapture(drag.pointerId);
    }

    function wireCard(button, item) {
      const down = event => {
        if (event.button !== 0 || !event.isPrimary || activeDrag) return;
        const box = button.getBoundingClientRect();
        activeDrag = {button,item,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,offsetX:event.clientX-box.left,offsetY:event.clientY-box.top,box,moved:false,ghost:null};
        // Capture on the button itself immediately: a fast first move can
        // already be outside the photo. A stationary release still clicks it.
        button.setPointerCapture(event.pointerId);
      };
      const move = event => {
        const drag = activeDrag;
        if (!drag || drag.button !== button || drag.pointerId !== event.pointerId) return;
        if (!drag.moved && Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY) < 6) return;
        if (!drag.moved) {
          drag.moved = true;
          button.classList.add('is-dragging');
          root.classList.add('wardrobe-drag-active');
          drag.ghost = button.cloneNode(true);
          drag.ghost.className = 'wardrobe-photo-card wardrobe-drag-ghost';
          drag.ghost.setAttribute('aria-hidden', 'true');
          drag.ghost.setAttribute('tabindex', '-1');
          drag.ghost.disabled = true;
          drag.ghost.style.width = `${drag.box.width}px`;
          drag.ghost.style.height = `${drag.box.height}px`;
          // Keep the moving photograph in the dialog's top layer when this
          // chapter is opened with showModal(); a body portal would sit behind it.
          drag.ghostHost = root.closest('dialog[open]') || document.body;
          if (drag.ghostHost !== document.body) drag.ghost.style.setProperty('position','absolute','important');
          drag.ghostHost.append(drag.ghost);
        }
        const hostBox = drag.ghostHost === document.body ? {left:0,top:0} : drag.ghostHost.getBoundingClientRect();
        drag.ghost.style.left = `${event.clientX-drag.offsetX-hostBox.left}px`;
        drag.ghost.style.top = `${event.clientY-drag.offsetY-hostBox.top}px`;
        collection.classList.toggle('is-drop-ready', insideCollection(event.clientX,event.clientY));
      };
      const up = event => {
        const drag = activeDrag;
        if (!drag || drag.button !== button || drag.pointerId !== event.pointerId) return;
        if (drag.moved) {
          suppress.set(button, performance.now()+220);
          if (insideCollection(event.clientX,event.clientY)) select(item.id,{sourceRect:drag.ghost.getBoundingClientRect()});
        }
        clearDrag();
      };
      const cancel = () => { if (activeDrag?.button === button) clearDrag(); };
      const click = event => {
        if (event.detail !== 0 && performance.now() < (suppress.get(button)||0)) return;
        select(item.id);
      };
      for (const [type, listener] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['lostpointercapture',cancel],['click',click]]) {
        button.addEventListener(type,listener);
        cleanups.push(() => button.removeEventListener(type,listener));
      }
    }

    items.forEach((item,index) => {
      const hook = make('div', 'wardrobe-hanging-photo');
      hook.style.setProperty('--wardrobe-tilt', `${[-5,4,-3][index%3]}deg`);
      const pin = make('span', 'wardrobe-wooden-clip');
      pin.setAttribute('aria-hidden','true');
      const button = make('button', 'wardrobe-photo-card');
      button.type = 'button';
      button.dataset.dressId = item.id;
      button.setAttribute('aria-pressed','false');
      button.setAttribute('aria-label', `收藏${item.name}，也可以拖到右侧收藏页`);
      const frame = make('span', 'wardrobe-source-image');
      frame.append(imageFor(item));
      button.append(frame,make('span','wardrobe-card-name',item.name),make('span','wardrobe-card-check','贴进右页 ↗'));
      hook.append(pin,button);
      rack.append(hook);
      buttons.set(item.id,button);
      wireCard(button,item);
    });

    if (items.length) select(items.some(item=>item.id===selectedId) ? selectedId : (items.find(item=>item.id===content?.defaultDressId)?.id || items[0].id), {notify:false,animate:false});
    else {
      root.classList.add('wardrobe-is-empty');
      instruction.textContent = '这一页先留着，喜欢的插画可以慢慢收进来。';
      landing.append(make('p','wardrobe-empty-note','收藏页已经留好。'));
      dropHint.hidden = true;
    }

    const api = {
      select:id => select(id),
      getSelectedId:() => selected,
      destroy(){
        if (destroyed) return;
        destroyed = true;
        clearDrag();
        animation?.cancel();
        cleanups.forEach(cleanup=>cleanup());
        root.remove();
        if (instances.get(container) === api) instances.delete(container);
      }
    };
    instances.set(container,api);
    return api;
  };
})();
