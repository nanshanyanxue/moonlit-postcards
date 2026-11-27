window.renderTicket=async function({recipient,age,date,dress,blessing}){
 const name=String(recipient),dateLabel=String(date).replaceAll('-','.');
 const message=String(blessing||'把喜欢的这一页，\n好好收藏。');
 await document.fonts.load('40px Kuaile',`${name}${dress.name}${message}生日收藏岁`);
 await document.fonts.ready;
 const img=new Image();img.src=dress.imageSrc;await img.decode();
 if(!img.naturalWidth||!img.naturalHeight)throw new Error('Clothing photo unavailable');
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1800;
 const ctx=canvas.getContext('2d');
 const colors={paper:'#F7F1E6',grey:'#DCD6CB',pink:'#D8BDC9',ink:'#484B46',green:'#77846c'};
 const rng=seed=>{const n=Math.sin(seed*127.1+311.7)*43758.5453;return n-Math.floor(n)};
 const text=(value,x,y,size,maxWidth,color=colors.ink)=>{
  let fontSize=size;ctx.fillStyle=color;ctx.textAlign='center';
  do{ctx.font=`${fontSize}px Kuaile, sans-serif`;if(ctx.measureText(value).width<=maxWidth)break;fontSize-=1}while(fontSize>16);
  ctx.fillText(value,x,y);
 };
 const tape=(x,y,width,angle,color)=>{
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;ctx.globalAlpha=.72;
  ctx.beginPath();ctx.moveTo(-width/2,-25);ctx.lineTo(width/2-4,-28);ctx.lineTo(width/2,24);ctx.lineTo(-width/2+3,28);ctx.closePath();ctx.fill();
  ctx.globalAlpha=.16;ctx.strokeStyle='#fff';ctx.lineWidth=1;
  for(let i=-width/2+12;i<width/2;i+=15){ctx.beginPath();ctx.moveTo(i,-22);ctx.lineTo(i+4,23);ctx.stroke()}
  ctx.restore();
 };
 const sprig=(x,y,angle,scale)=>{
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scale,scale);ctx.strokeStyle=colors.green;ctx.fillStyle=colors.green;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(0,78);ctx.bezierCurveTo(9,30,8,-20,0,-75);ctx.stroke();
  for(let i=0;i<5;i++){const y=48-i*25,side=i%2?1:-1;ctx.globalAlpha=.52+i*.06;ctx.beginPath();ctx.ellipse(side*12,y-8,7,20,side*.7,0,Math.PI*2);ctx.fill()}
  ctx.restore();
 };
 ctx.fillStyle=colors.grey;ctx.fillRect(0,0,1200,1800);
 ctx.save();ctx.shadowColor='#484b4625';ctx.shadowBlur=18;ctx.shadowOffsetY=7;ctx.fillStyle=colors.paper;ctx.fillRect(35,28,1130,1744);ctx.restore();
 // Fine paper fibres, deliberately restrained so the photo and handwriting remain clear.
 for(let i=0;i<9500;i++){
  ctx.fillStyle=i%2?'rgba(119,132,108,.032)':'rgba(72,75,70,.022)';
  ctx.fillRect(40+rng(i+200)*1120,33+rng(i+400)*1734,1+rng(i+600)*5,.55+rng(i+800));
 }
 ctx.strokeStyle='#77846c36';ctx.lineWidth=1;ctx.strokeRect(65,60,1070,1680);
 ctx.save();ctx.translate(150,118);ctx.rotate(-.07);ctx.fillStyle=colors.pink;ctx.fillRect(-67,-31,175,60);ctx.restore();
 text('生日收藏',171,127,30,170);
 text(dateLabel,964,125,29,230,colors.green);
 text(`${name}的${age}岁`,600,258,88,940);
 text('把这一刻，留在手账里。',600,324,31,920,colors.green);
 ctx.strokeStyle='#DCD6CB';ctx.beginPath();ctx.moveTo(150,363);ctx.lineTo(1050,363);ctx.stroke();
 sprig(1008,304,.5,.68);
 const scale=Math.min(704/img.naturalWidth,895/img.naturalHeight),w=img.naturalWidth*scale,h=img.naturalHeight*scale;
 ctx.save();ctx.translate(600,845);ctx.rotate(-.018);ctx.shadowColor='#484b4624';ctx.shadowBlur=22;ctx.shadowOffsetY=12;
 ctx.drawImage(img,-w/2,-h/2,w,h);ctx.restore();
 tape(392,416,218,-.12,colors.pink);tape(828,431,174,.15,colors.grey);
 sprig(205,1224,-.48,1.05);
 text(dress.name,600,1376,39,910);
 ctx.strokeStyle='#77846c78';ctx.lineWidth=1.5;ctx.setLineDash([3,10]);ctx.beginPath();ctx.moveTo(134,1440);ctx.lineTo(1066,1440);ctx.stroke();ctx.setLineDash([]);
 // Wrap by measured characters rather than compressing the text horizontally.
 const lines=[];ctx.font='35px Kuaile, sans-serif';
 for(const paragraph of message.split('\n')){
  let line='';for(const character of paragraph){if(line&&ctx.measureText(line+character).width>920){lines.push(line);line=character}else line+=character}lines.push(line);
 }
 const spacing=Math.min(49,128/Math.max(1,lines.length));
 lines.forEach((line,i)=>text(line,600,1515+i*spacing,lines.length>3?29:35,940));
 text(dateLabel,600,1658,31,600,colors.green);
 text('为你留着，随时翻开。',600,1710,25,900);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG export unavailable')),'image/png'));
};
