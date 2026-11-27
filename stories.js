/* Personal stories, folded notes and wishes. All private words come from content. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = String(text);
    return node;
  };
  const svgNode = (tag, attributes = {}) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  };
  function mark(kind = 'heart') {
    const svg = svgNode('svg', {viewBox:'0 0 64 64', class:'hs-mark', 'aria-hidden':'true'});
    const path = kind === 'crown'
      ? 'M12 45 7 21 22 30 32 13 42 30 57 21 52 45ZM16 51H48'
      : 'M32 51C24 45 8 33 8 21C8 8 25 6 32 19C39 6 56 8 56 21C56 33 40 45 32 51Z';
    svg.append(svgNode('path', {d:path, fill:'none', stroke:'currentColor', 'stroke-width':'1.5', 'stroke-linejoin':'round'}));
    return svg;
  }
  function prose(parent, value) {
    const parts = Array.isArray(value) ? value : String(value || '').split(/\n\s*\n/);
    parts.filter(text => String(text).trim()).forEach(text => parent.append(make('p', 'hs-prose', text)));
  }
  function action(label, handler, secondary = false) {
    const node = make('button', 'hs-button' + (secondary ? ' hs-button-secondary' : ''), label);
    node.type = 'button';
    node.addEventListener('click', handler);
    return node;
  }
  function mount(container, type) {
    container.querySelector(`.hs-${type}`)?.remove();
    const root = make('section', `hs-module hs-${type}`);
    container.append(root);
    return root;
  }
  function title(root, label, note) {
    const head = make('header', 'hs-heading');
    head.append(make('h3', 'hs-title', label));
    if (note) head.append(make('p', 'hs-intro', note));
    root.append(head);
  }
  function folded({title:label, cover, body}, index, type) {
    const details = make('details', `hs-fold hs-fold-${type}`);
    const summary = make('summary', 'hs-fold-cover');
    const ink = make('span', 'hs-cover-ink');
    ink.append(mark(index === 0 ? 'crown' : 'heart'), make('span', 'hs-fold-title', label || '写给你的一张纸条'));
    if (cover) ink.append(make('span', 'hs-fold-teaser', cover));
    ink.append(make('span', 'hs-fold-hint', '轻轻展开'));
    summary.append(ink);
    const inside = make('div', 'hs-fold-inside');
    prose(inside, body);
    details.append(summary, inside);
    details.addEventListener('toggle', () => {
      const hint = summary.querySelector('.hs-fold-hint');
      hint.textContent = details.open ? '收好这张纸条' : '轻轻展开';
    });
    return details;
  }
  function scene(kind) {
    const svg = svgNode('svg', {viewBox:'0 0 360 150', class:`hs-scene hs-scene-${kind}`, 'aria-hidden':'true'});
    svg.append(svgNode('rect', {width:360, height:150, rx:2, fill:'#ece8e3'}));
    if (kind === 'wedding') {
      svg.append(svgNode('path', {d:'M0 125Q100 98 180 124T360 120V150H0Z', fill:'#dfd8d2'}));
      const letter = svgNode('g', {class:'hs-scene-invitation'});
      letter.append(svgNode('rect', {x:116,y:25,width:128,height:104,rx:2,fill:'#f8f4ee',stroke:'#c9b6b6'}));
      letter.append(svgNode('path', {d:'M129 38H231V116H129Z',fill:'none',stroke:'#dacbca'}));
      letter.append(svgNode('path', {d:'M180 64C163 45 146 62 180 86C214 62 197 45 180 64Z',fill:'#c69aa8'}));
      letter.append(svgNode('path', {d:'M151 100H209M161 107H199',stroke:'#bcb8ad','stroke-width':2}));
      svg.append(letter);
      svg.append(svgNode('path', {d:'M104 106Q145 79 180 107Q215 79 256 106L247 130Q213 104 180 119Q147 104 113 130Z',fill:'#d1adb8'}));
      svg.append(svgNode('path', {d:'M180 109Q139 80 133 99Q132 117 180 109Q221 80 227 99Q228 117 180 109M177 112L164 142M183 112L198 142',fill:'none',stroke:'#a67d8c','stroke-width':3,'stroke-linecap':'round'}));
    } else {
      const sunrise = kind === 'sunrise';
      svg.append(svgNode('circle', {cx:sunrise?188:265,cy:sunrise?66:65,r:27,fill:sunrise?'#dbb7ac':'#d2aa9c',class:'hs-scene-sun'}));
      svg.append(svgNode('path', {d:'M0 69Q52 63 102 69T210 69T360 68',stroke:'#f8f4ee',fill:'none','stroke-width':2}));
      if (sunrise) {
        svg.append(svgNode('path', {d:'M0 91Q85 83 170 91T360 90V150H0Z',fill:'#b9c7c8'}));
        svg.append(svgNode('path', {d:'M0 117Q86 103 180 118T360 115V150H0Z',fill:'#a4b8ba'}));
        svg.append(svgNode('path', {d:'M157 103H219M171 112H204M147 124H225M177 133H201',stroke:'#f0e3d9','stroke-width':2,'stroke-linecap':'round',fill:'none',class:'hs-scene-reflection'}));
        svg.append(svgNode('path', {d:'M0 145Q90 125 148 150H0Z',fill:'#ddd2c6'}));
      } else {
        svg.append(svgNode('path', {d:'M0 106Q85 63 186 96T360 86V150H0Z',fill:'#b9c0ad'}));
        svg.append(svgNode('path', {d:'M0 131Q96 92 203 123T360 106V150H0Z',fill:'#9eac95'}));
        const grass = svgNode('g', {class:'hs-scene-grass',stroke:'#778d75','stroke-width':'1.5',fill:'none','stroke-linecap':'round'});
        grass.append(svgNode('path', {d:'M45 150Q47 128 39 112M45 143Q34 129 29 130M46 136Q55 121 62 122M77 150Q76 132 81 119M77 143Q88 132 92 133M302 150Q299 130 307 113M301 141Q288 131 284 132M302 133Q314 125 320 126'}));
        svg.append(grass);
      }
    }
    return svg;
  }

  function renderPhotos(container, C, {showPhoto, openPanel} = {}) {
    const photos = Array.isArray(C?.photos) ? C.photos : [];
    const stories = (Array.isArray(C?.photoStories) ? C.photoStories : []).map(item => ({...item, photo:photos.find(photo => photo.id === item.photoId)})).filter(item => item.photo?.src);
    if (!stories.length) return null;
    const featuredId = C.letterPhoto?.id || 'memory-09';
    const first = stories.findIndex(item => item.photoId === featuredId);
    let index = first >= 0 ? first : 0;
    const root = mount(container, 'photos');
    title(root, '照片里，还有想说的话', '翻到这一张，读一读旁边的小纸条。');
    const spread = make('div', 'hs-photo-spread');
    const frame = action('', () => {
      if (typeof showPhoto === 'function') showPhoto(stories[index].photo, frame);
      else if (typeof openPanel === 'function') openPanel('photos');
    });
    frame.className = 'hs-story-photo';
    frame.setAttribute('aria-label', '放大这张照片');
    const image = make('img'); image.decoding = 'async'; image.loading = 'lazy';
    const photoLabel = make('span', 'hs-photo-label');
    frame.append(image, photoLabel);
    const writing = make('div', 'hs-story-writing');
    spread.append(frame, writing);
    const nav = make('nav', 'hs-story-nav'); nav.setAttribute('aria-label', '切换照片故事');
    const previous = action('上一张', () => draw(index - 1), true);
    const next = action('下一张', () => draw(index + 1), true);
    const counter = make('span', 'hs-story-count'); counter.setAttribute('aria-live','polite'); counter.setAttribute('aria-atomic','true');
    nav.append(previous, counter, next);
    root.append(spread, nav);
    image.addEventListener('error', () => {image.hidden = true;photoLabel.textContent = '照片暂时没打开，旁边的故事还在。'});
    function draw(position) {
      index = (position + stories.length) % stories.length;
      const story = stories[index];
      image.hidden = false;
      image.src = story.photo.src;
      image.alt = story.photo.alt || story.title || '珍藏的照片';
      photoLabel.textContent = story.photoId === featuredId ? '我很喜欢的那张' : '把这一刻，留在这里';
      root.classList.toggle('hs-has-featured', story.photoId === featuredId);
      const note = folded({title:story.title,cover:story.teaser,body:story.body}, 1, 'story');
      writing.replaceChildren(make('p', 'hs-note-label', '照片旁边的小纸条'), note);
      counter.textContent = `${index + 1} / ${stories.length}`;
      previous.disabled = next.disabled = stories.length < 2;
    }
    draw(index);
    return root;
  }

  function renderPortrait(container, C, {openPanel} = {}) {
    const notes = (Array.isArray(C?.portraitNotes) ? C.portraitNotes : []).filter(note => note && (note.title || note.body));
    if (!notes.length) return null;
    const root = mount(container, 'portrait');
    root.append(make('p', 'hs-intro hs-section-intro', '有些喜欢，想认真写下来。'));
    const row = make('div', 'hs-note-row');
    notes.forEach((note, index) => row.append(folded(note, index, 'portrait')));
    root.append(row);
    if (typeof openPanel === 'function') {
      const footer = make('div', 'hs-footer');
      footer.append(action('以后，和你一起', () => openPanel('future'), true));
      root.append(footer);
    }
    return root;
  }

  function renderFuture(container, C, {openPanel} = {}) {
    const wishes = (Array.isArray(C?.futureWishes) ? C.futureWishes : []).filter(item => item && (item.title || item.body));
    const root = mount(container, 'future');
    root.append(make('p', 'hs-intro hs-section-intro', '不着急，想和你慢慢走到这些风景里。'));
    if (wishes.length) {
      const stack = make('div', 'hs-postcards');
      wishes.forEach((wish, index) => {
        const details = make('details', 'hs-postcard');
        const summary = make('summary', 'hs-postcard-cover');
        const kind = ['sunrise','wedding','sunset'].includes(wish.id) ? wish.id : ['sunrise','wedding','sunset'][index % 3];
        summary.append(scene(kind));
        const label = make('span', 'hs-postcard-label');
        label.append(make('span', 'hs-postcard-to', '想和你一起'), make('span', 'hs-postcard-title', wish.title || '一个关于以后的愿望'), make('span', 'hs-postcard-hint', '展开这张明信片'));
        summary.append(label);
        const inside = make('div', 'hs-postcard-inside');
        prose(inside, wish.body);
        details.append(summary, inside);
        details.addEventListener('toggle', () => {label.querySelector('.hs-postcard-hint').textContent = details.open ? '把心愿好好收着' : '展开这张明信片'});
        stack.append(details);
      });
      root.append(stack);
    } else {
      const empty = make('div', 'hs-unwritten');
      empty.append(mark(), make('p', '', '这一页，留给以后的我们。'), make('p', 'hs-intro', '可以慢慢想，也可以先给新的一岁许一个愿。'));
      root.append(empty);
    }
    if (typeof openPanel === 'function') {
      const footer = make('div', 'hs-footer');
      footer.append(action('给新的一岁许个愿', () => openPanel('cake')), action('读最后的信', () => openPanel('letter'), true));
      root.append(footer);
    }
    return root;
  }
  window.HandbookStories = {renderPhotos, renderPortrait, renderFuture};
})();
