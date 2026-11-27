/* Small physical movement: independent paper layers, shadows and lifted photos. */
(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const world=document.getElementById('world');
 const stage=document.createElement('div');stage.id='book-stage';
 const selectors=['.ribbon-tail','.book-base','#invitation','.memory-page','#opening-caption','#skip-opening','#exploration','.park-nav'];
 world.insertBefore(stage,document.querySelector('.ribbon-tail'));
 selectors.forEach(selector=>{const node=world.querySelector(selector);if(node)stage.append(node)});
 let frame=0,lastX=0,lastY=0;
 function update(){frame=0;const paused=reduce.matches||document.querySelector('#panel[open]')||document.body.classList.contains('celebrating');stage.style.setProperty('--book-rx',paused?'0deg':`${-lastY*1.7}deg`);stage.style.setProperty('--book-ry',paused?'0deg':`${lastX*2.1}deg`);stage.style.setProperty('--light-x',`${50+lastX*18}%`)}
 world.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;lastX=e.clientX/innerWidth-.5;lastY=e.clientY/innerHeight-.5;if(!frame)frame=requestAnimationFrame(update)});
 world.addEventListener('pointerleave',()=>{lastX=lastY=0;update()});
 document.addEventListener('postcards:panel',()=>{lastX=lastY=0;update()});
 document.addEventListener('pointermove',e=>{if(reduce.matches||e.pointerType==='touch')return;const card=e.target.closest('.scrapbook-card');if(!card||card.classList.contains('is-dragging'))return;const rect=card.getBoundingClientRect();card.style.setProperty('--card-rx',`${-(e.clientY-rect.top-rect.height/2)/rect.height*9}deg`);card.style.setProperty('--card-ry',`${(e.clientX-rect.left-rect.width/2)/rect.width*10}deg`);card.classList.add('paper-hover')});
 document.addEventListener('pointerout',e=>{const card=e.target.closest('.scrapbook-card');if(card&&!card.contains(e.relatedTarget)){card.style.setProperty('--card-rx','0deg');card.style.setProperty('--card-ry','0deg');card.classList.remove('paper-hover')}});
})();
