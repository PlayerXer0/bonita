/* =====================
   Carta animada — app.js
   ===================== */

// --- Personaliza aquí ---
const TO_NAME = "Mayerly ✨";        // Nombre de la persona
const FROM_NAME = "— De mí, para ti";  // Tu firma
const LETTER_TEXT = `
Intenté hacer esto JAJA, es muuuuy friki wn, pero igual, queria intentarlo, corto y preciso
te quiero mucho, conocerte fue lo mejor que me pasó, solo espero seguir así contigo
y tener un futuro a tu lado, perdón por la verguenza ajena wn, pero te doy por firmado
que soy la unica persona que te da una carta PROGRAMADA y subida a un repositorio de github,
quizas no entiendes nada, pero estoy igual, no entiendo como me gustas tanto en tan poco tiempo,
solo quiero que seas tu, un saludo y se despide la persona que te quiere y estará ahi para ti, 
para lo que sea, besitos hermosa.
`;

// Elementos del DOM
const starsBox   = document.getElementById('stars');
const heartsBox  = document.getElementById('hearts');
const confettiCv = document.getElementById('confetti');
const envelope   = document.getElementById('envelope');
const pulse      = document.getElementById('pulse');

const toName     = document.getElementById('toName');
const fromName   = document.getElementById('fromName');
const letterText = document.getElementById('letterText');
const dateText   = document.getElementById('dateText');

const btnConfetti = document.getElementById('btnConfetti');
const btnMusic    = document.getElementById('btnMusic');
const btnReplay   = document.getElementById('btnReplay');

// Setea contenidos dinámicos
(() => {
  toName.textContent = TO_NAME;
  fromName.textContent = FROM_NAME;
  letterText.textContent = LETTER_TEXT.trim();
  try{
    const now = new Date();
    dateText.textContent = now.toLocaleDateString('es-CL', { dateStyle: 'long' });
  }catch{ dateText.textContent = 'Hoy'; }
})();

// Utils
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));

/* =====================
   Estrellas parpadeando
   ===================== */
function createStars(count = 120) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.style.left = rand(0, 100) + 'vw';
    s.style.top  = rand(0, 100) + 'vh';
    s.style.animationDelay = rand(0, 5) + 's';
    s.style.opacity = rand(0.4, 1).toFixed(2);
    frag.appendChild(s);
  }
  starsBox.appendChild(frag);
}
createStars(150);

/* =====================
   Corazones flotantes
   ===================== */
let heartsTimer;
function spawnHeart() {
  const h = document.createElement('div');
  h.className = 'heart';
  const size = rand(10, 22);
  h.style.width = size + 'px';
  h.style.height = size + 'px';
  h.style.left = rand(0, 100) + 'vw';
  h.style.bottom = '-24px';
  h.style.setProperty('--dur', rand(7, 12) + 's');
  heartsBox.appendChild(h);
  setTimeout(() => h.remove(), 14000);
}
function startHearts() {
  stopHearts();
  heartsTimer = setInterval(spawnHeart, 260);
}
function stopHearts() { if (heartsTimer) clearInterval(heartsTimer); }

/* =====================
   Confeti con canvas
   ===================== */
const ctx = confettiCv.getContext('2d');
let confettiPieces = [];
let confettiRAF = null;
function resizeCanvas(){
  confettiCv.width = innerWidth * devicePixelRatio;
  confettiCv.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
addEventListener('resize', resizeCanvas);
resizeCanvas();

function makeConfettiBurst(amount = 180){
  for(let i=0;i<amount;i++){
    confettiPieces.push({
      x: innerWidth/2 + rand(-40,40),
      y: innerHeight/2 + rand(-30,30),
      vx: rand(-6,6),
      vy: rand(-10,-4),
      g: rand(0.12,0.28),
      w: rand(6,12),
      h: rand(8,16),
      a: rand(0, Math.PI*2),
      angV: rand(-0.25,0.25),
      life: rand(60, 140)
    });
  }
  if(!confettiRAF) confettiLoop();
}

function confettiLoop(){
  confettiRAF = requestAnimationFrame(confettiLoop);
  ctx.clearRect(0,0,innerWidth,innerHeight);
  for(let i=confettiPieces.length-1;i>=0;i--){
    const p = confettiPieces[i];
    p.vy += p.g; p.x += p.vx; p.y += p.vy; p.a += p.angV; p.life -= 1;
    // Dibujo: alterna “color” con alpha usando globalAlpha (sin setear colores en CSS)
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.a);
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life/120));
    ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
    ctx.restore();
    if(p.y>innerHeight+40 || p.life<=0) confettiPieces.splice(i,1);
  }
  if(confettiPieces.length===0){ cancelAnimationFrame(confettiRAF); confettiRAF=null; }
}

/* =====================
   Música con WebAudio (sin archivos)
   ===================== */
let audioCtx, musicPlaying=false, musicNodes=[]; 
function startMusic(){
  if(musicPlaying) return;
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const bpm = 78; const beat = 60/bpm; const now = audioCtx.currentTime + 0.05;
  const scale = [0,2,4,7,9]; // pentatónica mayor
  const root = 392; // G4 aprox
  function tone(t, semis, dur=beat*0.95, gain=0.07){
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const freq = root * Math.pow(2, semis/12);
    osc.type='sine'; osc.frequency.value=freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t+0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    osc.connect(g).connect(audioCtx.destination); osc.start(t); osc.stop(t+dur+0.02);
    musicNodes.push(osc, g);
  }
  // Programa 4 compases sencillos
  for(let bar=0; bar<4; bar++){
    const t0 = now + bar*4*beat;
    for(let s=0; s<4; s++){
      const step = scale[(bar*2 + s)%scale.length];
      tone(t0 + s*beat, step, beat*0.95, 0.06);
    }
    // Pad suave
    const pad = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    pad.type='triangle'; pad.frequency.value = root/2; // G3
    g.gain.value = 0.0001; g.gain.exponentialRampToValueAtTime(0.03, t0+0.2);
    g.gain.setValueAtTime(0.03, t0+3.5*beat);
    g.gain.exponentialRampToValueAtTime(0.0001, t0+4*beat);
    pad.connect(g).connect(audioCtx.destination); pad.start(t0); pad.stop(t0+4*beat);
    musicNodes.push(pad, g);
  }
  musicPlaying=true; btnMusic.textContent='⏸️ Pausar música';
  // auto stop al final
  setTimeout(()=>{ musicPlaying=false; btnMusic.textContent='🎵 Música'; }, (4*4*beat+0.5)*1000);
}
function stopMusic(){
  try{ musicNodes.forEach(n=>{ try{n.disconnect()}catch{} try{n.stop && n.stop()}catch{} }); }catch{}
  musicNodes=[]; musicPlaying=false; btnMusic.textContent='🎵 Música';
}

/* =====================
   Abrir sobre y controles
   ===================== */
let opened = false;
function openEnvelope(){
  if(opened) return; opened = true;
  envelope.classList.add('open');
  pulse.style.display = 'none';
  startHearts();
  makeConfettiBurst(200);
}
function resetEnvelope(){
  opened = false;
  envelope.classList.remove('open');
  pulse.style.display = '';
  stopHearts();
}

// Interacciones
envelope.addEventListener('click', openEnvelope);
btnReplay.addEventListener('click', resetEnvelope);
btnConfetti.addEventListener('click', ()=> makeConfettiBurst(200));
btnMusic.addEventListener('click', ()=> musicPlaying ? stopMusic() : startMusic());

// Acento: flotar ligeramente al pasar el mouse/touch
let hoverTimer=null;
envelope.addEventListener('pointerenter', ()=>{
  if(hoverTimer) return;
  let dir=1; hoverTimer = setInterval(()=>{
    envelope.style.transform = `translateY(${Math.sin(Date.now()/500)*2}px)`;
  }, 16);
});
envelope.addEventListener('pointerleave', ()=>{ clearInterval(hoverTimer); hoverTimer=null; envelope.style.transform=''; });

// Mensaje de ayuda pulsante (texto está en CSS ::after)
// ya se muestra por defecto; no requiere JS adicional.

// Lanzar algunos corazones iniciales sin abrir
for(let i=0;i<6;i++) setTimeout(spawnHeart, i*220);
