(() => {
  let enabled=false, context=null, loop=null;
  const notes=[261.63,329.63,392,440,392,329.63,293.66,261.63]; let step=0;
  function tone(frequency,delay=0,duration=1.7,gain=.025){
    context??=new(window.AudioContext||window.webkitAudioContext)();context.resume();
    const oscillator=context.createOscillator(),volume=context.createGain(),t=context.currentTime+delay;
    oscillator.type='sine';oscillator.frequency.value=frequency;volume.gain.setValueAtTime(0,t);volume.gain.linearRampToValueAtTime(gain,t+.03);volume.gain.exponentialRampToValueAtTime(.0001,t+duration);oscillator.connect(volume);volume.connect(context.destination);oscillator.start(t);oscillator.stop(t+duration+.1);
  }
  window.MoonAudio={
    async setEnabled(value){enabled=value;clearInterval(loop);loop=null;if(value){try{tone(notes[step++%notes.length]);loop=setInterval(()=>tone(notes[step++%notes.length]),1100)}catch{enabled=false;return false}}return true},
    async playVoice(){return false},stopVoice(){},
    chime(){if(!enabled)return;try{[523.25,783.99,1046.5].forEach((f,i)=>tone(f,i*.1,1.2,.025))}catch{}}
  };
  addEventListener('pagehide',()=>{clearInterval(loop);context?.close()});
})();
