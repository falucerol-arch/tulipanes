import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX, Sparkles, Heart, Flower2, X } from 'lucide-react';
import './style.css';

const notes = ['Eres mi lugar favorito. 🌷', 'Qué suerte la mía de coincidir contigo. 💗', 'Tu sonrisa hace florecer mis días.'];
const loveLines = [
  'Si pudiera regalarte una flor por cada vez que pienso en ti, tendrías un jardín infinito. 🌷',
  'Estos tulipanes son para ti, porque mereces todas las cosas bonitas de este mundo. 💕',
  'Te elegiría a ti, una y mil veces más. ❤️'
];

function Tulip({ index, onTap }) {
  const heights = [168, 218, 286, 238, 324, 198, 272, 222, 300];
  const colors = ['#e990ad', '#f4a6bb', '#d981a0', '#f2b2c1', '#df89a7'];
  const h = heights[index % heights.length];
  const color = colors[index % colors.length];
  return <motion.button aria-label="Toca este tulipán" className={`tulip tulip-${index % 3}`} onClick={onTap} initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ duration: 1.15, delay: index * .13, ease: [0.22, 1, .36, 1] }} style={{ height: h, '--bloom': color, '--delay': `${index * .13}s`, '--sway': `${(index % 2 ? -1 : 1) * (3 + index % 4)}deg` }}>
    <svg viewBox="0 0 92 310" className="flower-svg" aria-hidden="true">
      <defs><linearGradient id={`petal${index}`} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#ffd1d9"/><stop offset=".42" stopColor={color}/><stop offset="1" stopColor="#bf6387"/></linearGradient></defs>
      <path className="stem" d="M46 111 C43 163 49 222 45 306" />
      <path className="leaf leaf-left" d="M44 227 C17 202 6 214 23 242 C31 253 41 250 46 259Z" />
      <path className="leaf leaf-right" d="M47 265 C67 230 82 242 71 269 C65 279 53 277 46 290Z" />
      <g className="bloom">
        <path fill={`url(#petal${index})`} d="M46 111 C23 100 18 74 27 45 C31 28 40 18 46 15 C50 40 51 79 46 111Z" />
        <path fill={`url(#petal${index})`} d="M45 111 C22 102 4 81 11 58 C17 38 31 33 39 44 C44 58 46 82 45 111Z" />
        <path fill={`url(#petal${index})`} d="M47 111 C71 101 88 81 81 57 C75 37 61 32 53 44 C48 58 46 82 47 111Z" />
        <path fill={color} opacity=".9" d="M45 109 C39 86 43 57 47 32 C54 52 56 84 49 110Z" />
        <path fill="#fff4f1" opacity=".34" d="M27 52 C21 69 29 82 36 87 C30 72 32 58 33 45Z" />
      </g>
    </svg>
  </motion.button>;
}

function App() {
  const [started, setStarted] = useState(false);
  const [flowers, setFlowers] = useState(9);
  const [note, setNote] = useState('');
  const [letter, setLetter] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [music, setMusic] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const audioRef = useRef(null);
  useEffect(() => {
    if (!music) { audioRef.current?.oscillators.forEach(o => { try { o.stop(); } catch {} }); audioRef.current?.context.close(); audioRef.current = null; return; }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) { setMusic(false); return; }
    const context = new AudioContext();
    const master = context.createGain(); master.gain.value = .025; master.connect(context.destination);
    const oscillators = [];
    // A quiet, original three note chime loop generated locally; it needs the button tap to start.
    [[261.63, 329.63, 392], [220, 293.66, 349.23], [246.94, 329.63, 392], [196, 261.63, 329.63]].forEach((chord, bar) => chord.forEach((hz, n) => {
      const oscillator = context.createOscillator(), gain = context.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = hz;
      const startAt = context.currentTime + bar * 2.4 + n * .035;
      gain.gain.setValueAtTime(0, startAt); gain.gain.linearRampToValueAtTime(.38, startAt + .3); gain.gain.exponentialRampToValueAtTime(.001, startAt + 2.2);
      oscillator.connect(gain); gain.connect(master); oscillator.start(startAt); oscillator.stop(startAt + 2.25); oscillators.push(oscillator);
    }));
    audioRef.current = { context, oscillators };
    const loop = setInterval(() => {
      if (context.state !== 'closed') {
        const chord = [[261.63,329.63,392],[220,293.66,349.23],[246.94,329.63,392],[196,261.63,329.63]][Math.floor(Math.random()*4)];
        chord.forEach((hz,n) => { const o=context.createOscillator(),g=context.createGain(),t=context.currentTime+n*.035;o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.009,t+.3);g.gain.exponentialRampToValueAtTime(.0001,t+2.2);o.connect(g);g.connect(master);o.start(t);o.stop(t+2.25); });
      }
    }, 9600);
    return () => { clearInterval(loop); oscillators.forEach(o => { try { o.stop(); } catch {} }); context.close(); audioRef.current = null; };
  }, [music]);
  const heartAt = (e) => { const id = Date.now() + Math.random(); setHearts(v => [...v, { id, x: e.clientX, y: e.clientY }]); setTimeout(() => setHearts(v => v.filter(h => h.id !== id)), 1200); };
  const start = () => { setStarted(true); setTimeout(() => document.getElementById('garden')?.scrollIntoView({ behavior: 'smooth' }), 150); };
  const addFlowers = () => { setFlowers(v => Math.min(v + 3, 21)); setLineIndex(v => Math.min(v + 1, loveLines.length - 1)); };
  return <main onPointerDown={heartAt}>
    <div className="ambient" aria-hidden="true"><span/><span/><span/><span/><span/></div>
    <div className="petal-rain" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ '--i': i, '--x': `${(i * 37) % 100}%`, '--fall': `${8 + (i % 7)}s`, '--wait': `${(i % 8) * -1.4}s` }}/>)}</div>
    <AnimatePresence mode="wait">
      {!started ? <motion.section className="welcome" key="welcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04 }}>
        <div className="welcome-flower">🌷</div><p className="eyebrow">UN PEQUEÑO DETALLE PARA TI</p>
        <h1>Hay flores que son bonitas,<br/><em>pero ninguna tanto como tú.</em> <span>🌷❤️</span></h1>
        <p className="welcome-copy">Preparé este rinconcito pensando en ti.</p>
        <button className="primary" onClick={start}>Presiona aquí, mi amor <Heart size={17} fill="currentColor"/></button>
        <div className="scroll-hint">hecho con mucho cariño <span>✦</span></div>
      </motion.section> : <motion.div key="experience" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="experience">
        <header><a className="wordmark" href="#top"><Flower2 size={18}/> para ti</a><button className="sound" onClick={() => setMusic(!music)} title={music ? 'Desactivar música' : 'Activar música'}>{music ? <Volume2/> : <VolumeX/>}<span>{music ? 'Música activada' : 'Activar música'}</span></button></header>
        <section className="garden-section" id="garden">
          <div className="section-title"><span className="eyebrow">CULTIVADO CON AMOR</span><h2>Un jardín <em>para ti</em></h2><p>Cada flor guarda un pedacito de lo que siento.</p></div>
          <div className="garden" aria-label="Jardín de tulipanes rosados"><div className="glow-orb"/><div className="bouquet">{Array.from({ length: flowers }, (_, i) => <Tulip key={i} index={i} onTap={() => setNote(notes[i % notes.length])}/>)}</div><div className="ground"/><div className="garden-label">✦ para la persona más especial ✦</div></div>
          <AnimatePresence mode="wait"><motion.p className="love-line" key={lineIndex} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>{loveLines[lineIndex]}</motion.p></AnimatePresence>
          <div className="actions"><button className="secondary" onClick={addFlowers}><Sparkles size={17}/> Más flores para ti 🌷</button><button className="text-button" onClick={() => setLetter(true)}>Tengo algo más que decirte <Heart size={16}/></button></div>
        </section>
        <footer>con amor, hoy y siempre <span>♡</span></footer>
      </motion.div>}
    </AnimatePresence>
    {hearts.map(h => <motion.span key={h.id} className="tap-heart" style={{ left: h.x, top: h.y }} initial={{ opacity: 1, scale: .4 }} animate={{ opacity: 0, y: -75, scale: 1.4 }} transition={{ duration: 1.1 }}>♥</motion.span>)}
    <AnimatePresence>{note && <motion.div className="note-toast" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} onClick={() => setNote('')}>{note}<button aria-label="Cerrar"><X size={15}/></button></motion.div>}</AnimatePresence>
    <AnimatePresence>{letter && <motion.div className="modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLetter(false)}><motion.article className="letter" onClick={e => e.stopPropagation()} initial={{ y: 40, scale: .93 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: .96 }} transition={{ type: 'spring', damping: 22 }}><button className="close" onClick={() => setLetter(false)} aria-label="Cerrar carta"><X/></button><div className="letter-stamp">🌷</div><p>Mi amor:</p><p>Quise regalarte algo diferente, algo que pudieras guardar y volver a ver cuando quisieras.</p><p>Tal vez estas flores no puedas sostenerlas entre tus manos, pero están hechas con mucho cariño para ti.</p><p>Espero que cada vez que veas estos tulipanes recuerdes lo especial que eres para mí.</p><p>Te quiero muchísimo. ❤️🌷</p><div className="signature">Con todo mi cariño</div></motion.article></motion.div>}</AnimatePresence>
    <AnimatePresence>{started && letter && <motion.div className="petal-finale" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden="true">{Array.from({ length: 32 }, (_, i) => <i key={i} style={{ '--i': i }}/>)}</motion.div>}</AnimatePresence>
  </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
