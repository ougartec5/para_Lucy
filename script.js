/* ==========================================================
   Carta para Lucy — comportamiento
   Edita solo el bloque CONFIG para personalizar.
   ========================================================== */

const CONFIG = {
  // Archivo de música (ponlo en la misma carpeta que index.html)
  musica: "musica.mp3",
  volumen: 0.6

};

/* ---------- Referencias ---------- */
const $ = (id) => document.getElementById(id);

const sobre = $("sobre");
const portada = $("portada");
const pista = $("pista");
const carta = $("carta");
const audio = $("musica");
const btnMusica = $("btnMusica");
const canvas = $("petalos");
const ctx = canvas.getContext("2d");

const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ==========================================================
   Pétalos y corazones (canvas)
   ========================================================== */
let ancho = 0;
let alto = 0;
let dpr = 1;

function ajustarCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  ancho = window.innerWidth;
  alto = window.innerHeight;
  canvas.width = ancho * dpr;
  canvas.height = alto * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

const COLORES_PETALO = ["#e59ab0", "#d6708f", "#f1b6c6", "#c4476f", "#f6cfd9"];

class Petalo {
  constructor(inicial = false) {
    this.reiniciar(inicial);
  }
  reiniciar(inicial) {
    this.x = Math.random() * ancho;
    this.y = inicial ? Math.random() * alto : -30;
    this.tam = 7 + Math.random() * 9;
    this.vy = 0.5 + Math.random() * 0.9;
    this.balanceo = 0.6 + Math.random() * 1.2;
    this.fase = Math.random() * Math.PI * 2;
    this.rot = Math.random() * Math.PI * 2;
    this.vrot = (Math.random() - 0.5) * 0.03;
    this.color = COLORES_PETALO[(Math.random() * COLORES_PETALO.length) | 0];
    this.alfa = 0.45 + Math.random() * 0.45;
  }
  actualizar(t) {
    this.y += this.vy;
    this.x += Math.sin(t / 900 + this.fase) * this.balanceo * 0.5;
    this.rot += this.vrot;
    if (this.y > alto + 30) this.reiniciar(false);
  }
  dibujar() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.globalAlpha = this.alfa;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -this.tam);
    ctx.bezierCurveTo(this.tam, -this.tam * 0.6, this.tam * 0.8, this.tam * 0.8, 0, this.tam);
    ctx.bezierCurveTo(-this.tam * 0.8, this.tam * 0.8, -this.tam, -this.tam * 0.6, 0, -this.tam);
    ctx.fill();
    ctx.restore();
  }
}

class CorazonFiesta {
  constructor() {
    this.x = ancho / 2 + (Math.random() - 0.5) * ancho * 0.3;
    this.y = alto * 0.75;
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
    const vel = 6 + Math.random() * 9;
    this.vx = Math.cos(ang) * vel;
    this.vy = Math.sin(ang) * vel;
    this.tam = 14 + Math.random() * 22;
    this.rot = (Math.random() - 0.5) * 0.8;
    this.vida = 1;
    this.color = COLORES_PETALO[(Math.random() * COLORES_PETALO.length) | 0];
  }
  actualizar() {
    this.vy += 0.18;
    this.vx *= 0.99;
    this.x += this.vx;
    this.y += this.vy;
    this.vida -= 0.0055;
  }
  dibujar() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.globalAlpha = Math.max(this.vida, 0);
    ctx.fillStyle = this.color;
    ctx.font = this.tam + "px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("♥", 0, 0);
    ctx.restore();
  }
}

let petalos = [];
let fiesta = [];
let animando = false;

function crearPetalos() {
  const cantidad = reducirMovimiento ? 0 : Math.round(Math.min(Math.max(ancho / 28, 18), 48));
  petalos = Array.from({ length: cantidad }, () => new Petalo(true));
}

function bucle(t) {
  ctx.clearRect(0, 0, ancho, alto);
  petalos.forEach((p) => { p.actualizar(t); p.dibujar(); });
  fiesta = fiesta.filter((c) => c.vida > 0 && c.y < alto + 60);
  fiesta.forEach((c) => { c.actualizar(); c.dibujar(); });
  if (petalos.length || fiesta.length) {
    requestAnimationFrame(bucle);
  } else {
    animando = false;
  }
}

function iniciarAnimacion() {
  if (animando) return;
  animando = true;
  requestAnimationFrame(bucle);
}

function lanzarCorazones() {
  const cantidad = reducirMovimiento ? 25 : 130;
  for (let i = 0; i < cantidad; i++) fiesta.push(new CorazonFiesta());
  iniciarAnimacion();
}

window.addEventListener("resize", () => {
  ajustarCanvas();
  crearPetalos();
  iniciarAnimacion();
});

ajustarCanvas();
crearPetalos();
iniciarAnimacion();

/* ==========================================================
   Música
   ========================================================== */
let musicaDisponible = true;

audio.src = CONFIG.musica;
audio.volume = CONFIG.volumen;
audio.addEventListener("error", () => {
  musicaDisponible = false;
  btnMusica.hidden = true;
});

function actualizarBotonMusica() {
  const sonando = !audio.paused;
  btnMusica.setAttribute("aria-pressed", String(sonando));
  btnMusica.setAttribute("aria-label", sonando ? "Pausar música" : "Reproducir música");
}

function reproducir() {
  if (!musicaDisponible) return;
  const intento = audio.play();
  if (intento && intento.catch) intento.catch(() => {});
}

btnMusica.addEventListener("click", () => {
  if (audio.paused) reproducir(); else audio.pause();
});
audio.addEventListener("play", actualizarBotonMusica);
audio.addEventListener("pause", actualizarBotonMusica);

/* ==========================================================
   Abrir el sobre
   ========================================================== */
let abierto = false;

function abrirSobre() {
  if (abierto) return;
  abierto = true;

  // La música se inicia aquí porque el navegador exige un toque del usuario
  reproducir();
  if (musicaDisponible) btnMusica.hidden = false;

  sobre.classList.add("abierto");
  sobre.setAttribute("aria-label", "Carta abierta");
  pista.classList.add("abierto-pista");

  const esperaSalida = reducirMovimiento ? 100 : 2700;
  const esperaCarta = reducirMovimiento ? 100 : 900;

  setTimeout(() => {
    portada.classList.add("sale");
    setTimeout(() => {
      portada.hidden = true;
      carta.hidden = false;
      window.scrollTo(0, 0);
      activarRevelado();
      iniciarCamino();
    }, esperaCarta);
  }, esperaSalida);
}

sobre.addEventListener("click", abrirSobre);

/* ==========================================================
   Aparición de párrafos al hacer scroll
   ========================================================== */
function activarRevelado() {
  const elementos = document.querySelectorAll(".revela");

  if (!("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -8% 0px" }
  );

  elementos.forEach((el) => observador.observe(el));
}

/* ==========================================================
   Franja "Dos caminos": dura lo mismo que la canción.
   Dos luces parten de lados opuestos, se acercan al ritmo de
   la música y se funden en un corazón al final.
   ========================================================== */
const LEYENDAS = [
  [0,    "Cada uno por su lado…"],
  [0.18, "Dos caminos que se buscan"],
  [0.42, "Con honestidad y con hechos"],
  [0.68, "Paso a paso, con confianza"],
  [0.90, "Y ahora, juntos ♥"]
];

const caminoCaja = $("caminoCaja");
const cv = $("camino");
const cx = cv.getContext("2d");
const leyenda = $("leyenda");
let cw = 0, ch = 0, prog = 0, inicioCamino = 0, idxLey = -1, motas = [];

function ajustarCamino() {
  cw = cv.clientWidth; ch = cv.clientHeight;
  cv.width = cw * dpr; cv.height = ch * dpr;
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", () => { if (!caminoCaja.hidden) ajustarCamino(); });

function iniciarCamino() {
  caminoCaja.hidden = false;
  ajustarCamino();
  inicioCamino = performance.now();
  requestAnimationFrame(dibujarCamino);
}

function dibujarCamino(t) {
  const dur = audio.duration;
  const objetivo = (dur && isFinite(dur) && !audio.error)
    ? audio.currentTime / dur
    : Math.min((t - inicioCamino) / 360000, 1);
  prog += (objetivo - prog) * 0.05;

  const m = Math.min(Math.max((prog - 0.9) / 0.1, 0), 1);   // fusión final
  const mid = ch * 0.55;
  const xL = cw * 0.08 + (cw * 0.5 - 12 - cw * 0.08) * prog + 12 * m;
  const xR = cw * 0.92 - (cw * 0.92 - cw * 0.5 - 12) * prog - 12 * m;
  const yL = mid + Math.sin(t / 650) * 7 * (1 - prog);
  const yR = mid + Math.sin(t / 650 + 2.4) * 7 * (1 - prog);

  cx.clearRect(0, 0, cw, ch);

  // hilo de luz entre ambos
  const g = cx.createLinearGradient(xL, 0, xR, 0);
  g.addColorStop(0, "#e59ab0"); g.addColorStop(1, "#e9c98f");
  cx.globalAlpha = (0.2 + 0.5 * prog) * (1 - m);
  cx.strokeStyle = g; cx.lineWidth = 2;
  cx.beginPath(); cx.moveTo(xL, yL);
  cx.quadraticCurveTo((xL + xR) / 2, mid + 14 * (1 - prog), xR, yR);
  cx.stroke();

  // estela de motas
  [[xL, yL, "#e59ab0"], [xR, yR, "#e9c98f"]].forEach(([x, y, c]) => {
    if (m < 1 && Math.random() < 0.5)
      motas.push({ x, y, vx: (Math.random() - .5) * .6, vy: -Math.random() * .6, v: 1, c });
  });
  motas = motas.filter(p => p.v > 0);
  motas.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.v -= 0.02;
    cx.globalAlpha = p.v * 0.7; cx.fillStyle = p.c;
    cx.beginPath(); cx.arc(p.x, p.y, 2, 0, 6.3); cx.fill();
  });

  // las dos luces
  [[xL, yL, "#f6cfd9", "#e59ab0"], [xR, yR, "#fff1d0", "#e9c98f"]].forEach(([x, y, c1, c2]) => {
    const r = 12 + 5 * Math.sin(t / 400);
    const rg = cx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, c1); rg.addColorStop(0.35, c2); rg.addColorStop(1, "rgba(229,154,176,0)");
    cx.globalAlpha = 1 - m; cx.fillStyle = rg;
    cx.beginPath(); cx.arc(x, y, r, 0, 6.3); cx.fill();
  });

  // corazón final
  if (m > 0) {
    cx.globalAlpha = m; cx.fillStyle = "#f1b6c6";
    cx.shadowColor = "#e59ab0"; cx.shadowBlur = 18;
    cx.font = (26 + 8 * m + 4 * Math.sin(t / 250)) + "px serif";
    cx.textAlign = "center"; cx.textBaseline = "middle";
    cx.fillText("♥", cw / 2, mid);
    cx.shadowBlur = 0;
  }
  cx.globalAlpha = 1;

  // leyenda según el avance de la canción
  let idx = 0;
  LEYENDAS.forEach(([umbral], i) => { if (prog >= umbral) idx = i; });
  if (idx !== idxLey) {
    idxLey = idx;
    leyenda.classList.remove("v");
    setTimeout(() => { leyenda.textContent = LEYENDAS[idx][1]; leyenda.classList.add("v"); }, 600);
  }

  requestAnimationFrame(dibujarCamino);
}

/* ==========================================================
   La respuesta
   ========================================================== */
$("btnSi").addEventListener("click", () => {
  lanzarCorazones();
  setTimeout(() => { $("celebracion").hidden = false; }, 900);
});
$("btnTiempo").addEventListener("click", () => {
  $("respuesta").textContent = "Lo entiendo. Tómate el tiempo que necesites; aquí estaré.";
});
$("btnVolver").addEventListener("click", () => { $("celebracion").hidden = true; });
