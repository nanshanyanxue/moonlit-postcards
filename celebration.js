/* Original paper hearts and a layered birthday ceremony. No emoji assets. */
(() => {
 'use strict';
 const NS='http://www.w3.org/2000/svg';
 function paperHeart(color='#c18d9a') {
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 120 110');svg.setAttribute('aria-hidden','true');
  const shapes=[['M60 100 C49 90 8 64 8 34 C8 3 46 -3 60 24 C74 -3 112 3 112 34 C112 64 71 90 60 100 Z',color],['M60 24 C74 -3 112 3 112 34 C112 64 71 90 60 100 Z','#00000014'],['M60 25 C47 0 13 8 12 33 C11 52 24 67 42 82 C27 61 22 44 25 29 C29 12 47 13 60 25 Z','#ffffff38']];
  shapes.forEach(([d,fill])=>{const path=document.createElementNS(NS,'path');path.setAttribute('d',d);path.setAttribute('fill',fill);svg.append(path)});
  const fold=document.createElementNS(NS,'path');fold.setAttribute('d','M60 25 L60 99');fold.setAttribute('stroke','#ffffff50');fold.setAttribute('stroke-width','1');svg.append(fold);return svg;
 }
 function tinyBurst(x,y,count=7) {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  for(let i=0;i<count;i++){const el=document.createElement('span');el.className='little-paper-heart';el.append(paperHeart(['#c9a1ad','#b3bf9f','#e0c9ab'][i%3]));el.style.cssText=`left:${x}px;top:${y}px;--heart-x:${(Math.random()-.5)*160}px;--heart-y:${-55-Math.random()*110}px;--heart-r:${(Math.random()-.5)*80}deg;--heart-delay:${i*35}ms;`;document.body.append(el);let cleanupTimer;const clean=()=>{clearTimeout(cleanupTimer);el.remove()};el.addEventListener('animationend',clean,{once:true});el.addEventListener('animationcancel',clean,{once:true});cleanupTimer=setTimeout(clean,2400)}
 }
 function play({recipient='星禾',age=19,reduced=false}={}) {
  return new Promise(resolve=>{
   const stage=document.createElement('section');stage.id='celebration-stage';stage.setAttribute('role','dialog');stage.setAttribute('aria-modal','true');stage.setAttribute('aria-label',`${recipient}，${age}岁生日快乐`);stage.tabIndex=-1;
   const glow=document.createElement('div');glow.className='birthday-halo';stage.append(glow);
   const paper=document.createElement('div');paper.className='birthday-dedication';
   const kicker=document.createElement('p');kicker.className='birthday-kicker';kicker.textContent='今天所有的喜欢，都给你。';
   const years=document.createElement('div');years.className='birthday-years';years.textContent=String(age);const badge=document.createElement('span');badge.className='birthday-heart-badge';badge.append(paperHeart('#b87894'));years.append(badge);
   const heading=document.createElement('h2');heading.textContent=`${recipient}，生日快乐`;const note=document.createElement('p');note.className='birthday-wish';note.textContent='愿这一岁，开心的事多一点，喜欢的事慢慢实现。';
   const button=document.createElement('button');button.className='primary birthday-continue';button.textContent='把祝福收进手账';paper.append(kicker,years,heading,note,button);stage.append(paper);
   const colors=['#c486a0','#e4b8cb','#f1d9e3','#d1c5d3'];
   if(!reduced){
    for(let i=0;i<26;i++){const heart=document.createElement('span');heart.className='birthday-paper-heart';heart.append(paperHeart(colors[i%colors.length]));const side=i%2?-1:1;heart.style.cssText=`--x:${side*(220+Math.random()*innerWidth*.36)}px;--y:${-innerHeight*(.12+Math.random()*.7)}px;--rot:${(Math.random()-.5)*160}deg;--size:${30+Math.random()*65}px;--delay:${Math.random()*.8}s;--fall:${innerHeight*.8}px;`;stage.append(heart)}
    for(let i=0;i<80;i++){const ribbon=document.createElement('i');ribbon.className='birthday-confetti';ribbon.style.cssText=`left:${Math.random()*100}%;--delay:${Math.random()*3}s;--drift:${(Math.random()-.5)*350}px;--spin:${(Math.random()-.5)*1400}deg;background:${colors[i%colors.length]};width:${4+Math.random()*7}px;height:${12+Math.random()*22}px;`;stage.append(ribbon)}
    for(let i=0;i<16;i++){const star=document.createElement('span');star.className='birthday-sparkle';star.innerHTML='<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 0Q21 19 40 20Q21 21 20 40Q19 21 0 20Q19 19 20 0" fill="currentColor"/></svg>';star.style.cssText=`left:${10+Math.random()*80}%;top:${10+Math.random()*70}%;--delay:${Math.random()*2}s;--size:${12+Math.random()*25}px`;stage.append(star)}
   }
   const previous=document.activeElement;document.body.append(stage);stage.focus({preventScroll:true});
   let done=false;const finish=()=>{if(done)return;done=true;clearTimeout(timer);stage.classList.add('closing');setTimeout(()=>{stage.remove();if(previous?.isConnected)previous.focus({preventScroll:true});resolve()},reduced?0:650)};
   const timer=setTimeout(finish,reduced?3500:10500);button.addEventListener('click',finish);stage.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();finish()}if(e.key==='Tab'){e.preventDefault();button.focus()}});
  });
 }
 document.addEventListener('click',event=>{const target=event.target.closest('.scrapbook-flipper,.scrapbook-card-actions button');if(!target)return;if(event.target.closest('.scrapbook-card-actions')&&target.textContent.includes('放大'))return;const box=target.getBoundingClientRect();tinyBurst(box.right-20,box.top+25,5)});
 window.BirthdayEffects={play,paperHeart,tinyBurst};
 const foot=document.querySelector('.page-footnote>span');if(foot){foot.replaceChildren(paperHeart('#c6a0ab'));foot.style.cssText='display:block;width:25px;height:25px'}
})();
