/* ==========================================================
   Carta para Lucy — comportamiento
   Edita solo el bloque CONFIG para personalizar.
   ========================================================== */

const CONFIG = {
  // Archivo de música (ponlo en la misma carpeta que index.html)
  musica: "musica.mp3",
  volumen: 0.6,

  // Si la música no carga, la animación "Prometo" dura este tiempo (segundos)
  duracionRespaldo: 360
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

class Luz {
  constructor(inicial) { this.reiniciar(inicial); }
  reiniciar(inicial) {
    this.x = Math.random() * ancho;
    this.y = inicial ? Math.random() * alto : alto + 20;
    this.r = 1.5 + Math.random() * 2.5;
    this.vy = 0.25 + Math.random() * 0.55;
    this.fase = Math.random() * Math.PI * 2;
    this.corazon = Math.random() < 0.3;
  }
  actualizar(t) {
    this.y -= this.vy;
    this.x += Math.sin(t / 1400 + this.fase) * 0.35;
    if (this.y < -20) this.reiniciar(false);
  }
  dibujar(t) {
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.3 * Math.sin(t / 700 + this.fase);
    ctx.shadowColor = "#f4d58d";
    ctx.shadowBlur = 12;
    if (this.corazon) {
      ctx.fillStyle = "#f6a7bb";
      ctx.font = this.r * 6 + "px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("♥", this.x, this.y);
    } else {
      ctx.fillStyle = "#f4d58d";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

let luces = [];
function crearLuces() {
  if (reducirMovimiento) return;
  const n = Math.round(Math.min(Math.max(ancho / 40, 12), 30));
  luces = Array.from({ length: n }, () => new Luz(true));
  iniciarAnimacion();
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
  luces.forEach((l) => { l.actualizar(t); l.dibujar(t); });
  fiesta = fiesta.filter((c) => c.vida > 0 && c.y < alto + 60);
  fiesta.forEach((c) => { c.actualizar(); c.dibujar(); });
  if (petalos.length || fiesta.length || luces.length) {
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
let inicioCarta = performance.now();

function abrirSobre() {
  if (abierto) return;
  abierto = true;
  inicioCarta = performance.now();

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
      document.querySelector(".latido-fondo").classList.add("activo");
      crearLuces();
      window.scrollTo(0, 0);
      activarRevelado();
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
   Escena "Prometo": un corazón de estrellas que se dibuja
   al ritmo de la canción. Cada estrella es una promesa de
   la carta; al terminar la canción, el corazón queda completo.
   ========================================================== */
const PROMESAS = [
  "Honestidad",
  "Hechos, no solo palabras",
  "Demostrártelo con el tiempo",
  "Honrarte",
  "Cuidar tus vulnerabilidades",
  "Merecer tu confianza",
  "Una relación donde ambos nos sintamos seguros",
  "Ser de bien para Natán, Luciano y los que nos rodean"
];

const cielo = $("cielo");
const cc = cielo.getContext("2d");

let cw = 0;
let ch = 0;
let estrellasFondo = [];
let fugaces = [];
let proximaFugaz = 0;
let escenaVisible = false;
let escenaCorriendo = false;
let primerCuadro = true;
let progresoMax = 0;
const encendidaEn = new Array(PROMESAS.length).fill(null);

function ajustarCielo() {
  const d = Math.min(window.devicePixelRatio || 1, 2);
  cw = cielo.clientWidth;
  ch = cielo.clientHeight;
  cielo.width = cw * d;
  cielo.height = ch * d;
  cc.setTransform(d, 0, 0, d, 0, 0);
  const n = Math.round(Math.min(Math.max((cw * ch) / 9000, 60), 160));
  estrellasFondo = Array.from({ length: n }, () => ({
    x: Math.random() * cw,
    y: Math.random() * ch,
    r: Math.random() * 1.3 + 0.3,
    fase: Math.random() * 6.28,
    vel: 0.6 + Math.random() * 1.4
  }));
}

if ("ResizeObserver" in window) {
  new ResizeObserver(ajustarCielo).observe(cielo);
} else {
  window.addEventListener("resize", ajustarCielo);
}

// Avance de la animación (0 a 1) según lo que lleva sonando la canción
function progresoCancion() {
  let f;
  if (musicaDisponible && isFinite(audio.duration) && audio.duration > 0) {
    f = audio.currentTime / audio.duration;
  } else if (!musicaDisponible) {
    f = (performance.now() - inicioCarta) / 1000 / CONFIG.duracionRespaldo;
  } else {
    f = progresoMax;
  }
  progresoMax = Math.max(progresoMax, Math.min(f, 1));
  return progresoMax;
}

function puntoCorazon(theta, escala, ox, oy) {
  const x = 16 * Math.pow(Math.sin(theta), 3);
  const y = 13 * Math.cos(theta) - 5 * Math.cos(2 * theta) -
            2 * Math.cos(3 * theta) - Math.cos(4 * theta);
  return [ox + x * escala, oy - y * escala];
}

/* ==========================================================
   Pareja de caricatura dentro del corazón
   Hablan, bailan, ríen, juegan y se abrazan según avanza la canción.
   ========================================================== */
const TRAMOS = [0, 0.22, 0.44, 0.66, 0.88, 1];

function persona(x, g, u, o) {
  const c = cc, piel = "#f2c9a0", pelo = "#3a2418";
  c.save();
  c.fillStyle = "rgba(0,0,0,0.25)";
  c.beginPath(); c.ellipse(x, g, 2.4 * u, 0.5 * u, 0, 0, 6.283); c.fill();
  c.translate(x, g - (o.bob || 0) * u);
  c.rotate(o.incl || 0);
  c.scale(o.dir, 1);
  c.lineCap = "round";

  // piernas
  c.strokeStyle = o.chica ? piel : "#2f3b6b";
  c.lineWidth = 0.8 * u;
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 0.7 * u, -3.6 * u);
    c.lineTo(s * 0.7 * u + Math.sin((o.pierna || 0) + (s > 0 ? 3.14 : 0)) * 1.1 * u, -0.2 * u);
    c.stroke();
  }

  // cuerpo
  c.fillStyle = o.chica ? "#e07a98" : "#4f7fd1";
  c.beginPath();
  if (o.chica) {
    c.moveTo(-0.9 * u, -7.3 * u); c.lineTo(0.9 * u, -7.3 * u);
    c.lineTo(2 * u, -3.4 * u); c.lineTo(-2 * u, -3.4 * u);
  } else {
    c.rect(-1.4 * u, -7.4 * u, 2.8 * u, 3.9 * u);
  }
  c.closePath(); c.fill();

  // brazos (ángulo desde "colgando": 0 abajo, 3.14 arriba)
  c.strokeStyle = piel;
  c.lineWidth = 0.7 * u;
  [[1.2, o.bD], [-1.2, o.bI]].forEach(([sx, a]) => {
    c.beginPath();
    c.moveTo(sx * u, -6.8 * u);
    c.lineTo((sx + Math.sign(sx) * Math.sin(a) * 2.6) * u, (-6.8 + Math.cos(a) * 2.6) * u);
    c.stroke();
  });

  // cabeza y pelo
  const hy = -9.7 * u;
  c.fillStyle = pelo;
  if (o.chica) { c.beginPath(); c.ellipse(-0.3 * u, hy + 1.2 * u, 2.7 * u, 3.2 * u, 0, 0, 6.283); c.fill(); }
  c.fillStyle = piel;
  c.beginPath(); c.arc(0, hy, 2.2 * u, 0, 6.283); c.fill();
  c.fillStyle = pelo;
  c.beginPath(); c.arc(0, hy, 2.35 * u, 3.14, 6.283); c.fill();

  // cara
  c.fillStyle = c.strokeStyle = "#2a1a14";
  c.lineWidth = 0.28 * u;
  const ey = hy + 0.6 * u;
  for (const ex of [0.5 * u, 1.5 * u]) {
    c.beginPath();
    if (o.boca === 2) { c.arc(ex, ey + 0.1 * u, 0.3 * u, 3.14, 6.283); c.stroke(); }
    else { c.arc(ex, ey, 0.24 * u, 0, 6.283); c.fill(); }
  }
  c.fillStyle = "rgba(224,100,130,0.45)";
  c.beginPath(); c.arc(1.9 * u, hy + 1.2 * u, 0.4 * u, 0, 6.283); c.fill();
  const my = hy + 1.3 * u;
  if (o.boca === 2) {
    c.fillStyle = "#8a1630"; c.beginPath(); c.arc(1.0 * u, my - 0.1 * u, 0.8 * u, 0, 3.14); c.fill();
  } else if (o.boca === 1) {
    c.fillStyle = "#8a1630"; c.beginPath();
    c.ellipse(1.0 * u, my + 0.1 * u, 0.45 * u, (0.15 + 0.4 * (o.abre || 0)) * u, 0, 0, 6.283); c.fill();
  } else {
    c.beginPath(); c.arc(1.0 * u, my - 0.2 * u, 0.55 * u, 0.2, 2.94); c.stroke();
  }
  c.restore();
}

function textoFlotante(txt, x, y, tam, color, alfa) {
  cc.save();
  cc.globalAlpha = Math.max(0, alfa);
  cc.fillStyle = color;
  cc.font = "italic 600 " + tam + "px serif";
  cc.textAlign = "center";
  cc.textBaseline = "middle";
  cc.fillText(txt, x, y);
  cc.restore();
}

function burbuja(x, y, u, txt) {
  cc.save();
  cc.globalAlpha *= 0.92;
  cc.fillStyle = "#fbf4e9";
  cc.beginPath();
  cc.arc(x, y, 1.3 * u, 0, 6.283);
  cc.moveTo(x - 0.5 * u, y + 1.1 * u); cc.lineTo(x, y + 2 * u); cc.lineTo(x + 0.5 * u, y + 1.1 * u);
  cc.fill();
  cc.restore();
  textoFlotante(txt, x, y + 0.1 * u, 1.5 * u, "#c4476f", cc.globalAlpha);
}

function dibujarPareja(ahora, f, ox, cy, u) {
  let i = 0;
  while (i < 4 && f >= TRAMOS[i + 1]) i++;
  const s = (f - TRAMOS[i]) / (TRAMOS[i + 1] - TRAMOS[i]);
  const alfa = Math.max(0, Math.min(1, s * 40, i === 4 ? 1 : (1 - s) * 40));
  const T = reducirMovimiento ? 0 : ahora / 1000;
  const g = cy + 3.2 * u;
  const A = { dir: 1, bD: 0.3, bI: 0.3, boca: 0 };
  const B = { dir: -1, chica: true, bD: 0.3, bI: 0.3, boca: 0 };
  let d = 3.6;
  const pulso = Math.abs(Math.sin(T * 4));

  cc.save();
  cc.globalAlpha = alfa;

  if (i === 0) {                                   // hablan
    const aHabla = Math.sin(T * 1.4) > 0;
    const h = aHabla ? A : B, o = aHabla ? B : A;
    h.boca = 1; h.abre = Math.abs(Math.sin(T * 9));
    h.bD = 1.1 + 0.5 * Math.sin(T * 6);
    h.bob = 0.2 * h.abre;
    o.bob = 0.25 * Math.abs(Math.sin(T * 2));
    var simbolo = ["♥", "♪", "…", "♥"][Math.floor(T * 1.4) % 4];
    var xh = ox + (aHabla ? -d : d) * u;
  } else if (i === 1) {                            // bailan
    d = 3.2;
    for (const [o, ph] of [[A, 0], [B, 3.14]]) {
      o.incl = Math.sin(T * 3 + ph) * 0.12;
      o.bob = pulso * 0.6;
      o.bD = 2.2 + Math.sin(T * 4 + ph) * 0.5;
      o.bI = 2.2 + Math.cos(T * 4 + ph) * 0.5;
      o.pierna = T * 8;
    }
  } else if (i === 2) {                            // ríen
    for (const o of [A, B]) {
      o.boca = 2; o.bob = Math.abs(Math.sin(T * 9)) * 0.5;
      o.incl = Math.sin(T * 9) * 0.05;
      o.bD = 0.7; o.bI = 0.5 + 0.2 * Math.sin(T * 9);
    }
  } else if (i === 3) {                            // juegan a la pelota
    d = 5.2;
    for (const o of [A, B]) {
      o.bob = Math.abs(Math.sin(T * 3)) * 0.5;
      o.bD = o.bI = 2.6 + 0.2 * Math.sin(T * 3);
      o.pierna = T * 6;
    }
  } else {                                         // abrazo
    d = 2.4;
    A.incl = 0.06 + 0.02 * Math.sin(T * 2);
    B.incl = -A.incl;
    A.bD = B.bD = 1.9; A.bI = B.bI = 0.5;
    A.bob = B.bob = 0.15 * Math.abs(Math.sin(T * 2));
  }

  const xl = ox - d * u, xr = ox + d * u;
  persona(xl, g, u, A);
  persona(xr, g, u, B);

  if (i === 0) burbuja(xh, g - 13.7 * u, u, simbolo);

  if (i === 1) {                                   // notas musicales
    for (let n = 0; n < 3; n++) {
      const k = (T * 0.35 + n / 3) % 1;
      textoFlotante(n % 2 ? "♪" : "♫", ox + (n - 1) * 2.2 * u + Math.sin(T * 2 + n) * 0.6 * u,
        cy + u - k * 8 * u, 2 * u, n % 2 ? "#e9c98f" : "#f6cfd9", Math.sin(k * 3.14) * alfa);
    }
  }
  if (i === 2) {                                   // risas
    const v = alfa * (0.55 + 0.45 * Math.sin(T * 5));
    textoFlotante("ja!", xl, g - 13.4 * u, 1.8 * u, "#fbf4e9", v);
    textoFlotante("jaja!", xr, g - 13.4 * u, 1.8 * u, "#fbf4e9", alfa * (0.55 + 0.45 * Math.cos(T * 5)));
  }
  if (i === 3) {                                   // la pelota
    const p = (T * 0.5) % 2, q = p < 1 ? p : 2 - p;
    const bx = xl + 2.6 * u + (xr - xl - 5.2 * u) * q;
    const by = g - 8.6 * u - Math.sin(q * 3.14) * 1.2 * u;
    cc.fillStyle = "#e9c98f"; cc.strokeStyle = "#c4476f"; cc.lineWidth = 0.25 * u;
    cc.beginPath(); cc.arc(bx, by, 0.85 * u, 0, 6.283); cc.fill(); cc.stroke();
    cc.beginPath(); cc.arc(bx, by, 0.85 * u, 0.5, 2.6); cc.stroke();
  }
  if (i === 4) {                                   // corazones que suben
    for (let n = 0; n < 5; n++) {
      const k = (T * 0.3 + n / 5) % 1;
      textoFlotante("♥", ox + Math.sin(T + n * 2) * 2.5 * u, cy - 4 * u - k * 8 * u,
        1.6 * u, "#f1b6c6", Math.sin(k * 3.14));
    }
  }
  cc.restore();
}

function dibujarCielo(ahora) {
  if (!cw || !ch) ajustarCielo();
  const f = progresoCancion();
  const c = Math.min(f / 0.9, 1);       // el corazón se completa al 90 % de la canción
  const completo = c >= 1;

  cc.clearRect(0, 0, cw, ch);

  // Estrellas de fondo
  cc.fillStyle = "#fbf4e9";
  for (const e of estrellasFondo) {
    cc.globalAlpha = reducirMovimiento ? 0.5 : 0.35 + 0.35 * Math.sin((ahora / 1000) * e.vel + e.fase);
    cc.beginPath();
    cc.arc(e.x, e.y, e.r, 0, 6.283);
    cc.fill();
  }
  cc.globalAlpha = 1;

  // Estrellas fugaces
  if (!reducirMovimiento) {
    if (ahora > proximaFugaz) {
      fugaces.push({
        x: cw * 0.25 + Math.random() * cw * 0.75,
        y: Math.random() * ch * 0.35,
        vx: -(6 + Math.random() * 4),
        vy: 3 + Math.random() * 2,
        vida: 1
      });
      proximaFugaz = ahora + 4000 + Math.random() * 6000;
    }
    fugaces = fugaces.filter((s) => s.vida > 0);
    for (const s of fugaces) {
      s.x += s.vx;
      s.y += s.vy;
      s.vida -= 0.018;
      cc.strokeStyle = "rgba(251, 244, 233," + Math.max(s.vida, 0) * 0.8 + ")";
      cc.lineWidth = 1.6;
      cc.beginPath();
      cc.moveTo(s.x, s.y);
      cc.lineTo(s.x - s.vx * 7, s.y - s.vy * 7);
      cc.stroke();
    }
  }

  // Geometría del corazón
  const latido = completo && !reducirMovimiento
    ? 1 + 0.04 * Math.pow(Math.abs(Math.sin(ahora / 700)), 14)
    : 1;
  const escala = Math.min((cw * 0.62) / 32, (ch * 0.36) / 29) * latido;
  const ox = cw / 2;
  const oy = ch * 0.47 - 2.5 * escala;

  const N = 320;
  const puntos = [];
  for (let i = 0; i <= N; i++) {
    puntos.push(puntoCorazon(Math.PI + (i / N) * 2 * Math.PI, escala, ox, oy));
  }

  // Guía tenue del corazón completo
  cc.setLineDash([4, 9]);
  cc.strokeStyle = "rgba(246, 207, 217, 0.13)";
  cc.lineWidth = 1.5;
  cc.beginPath();
  puntos.forEach((p, i) => (i ? cc.lineTo(p[0], p[1]) : cc.moveTo(p[0], p[1])));
  cc.stroke();
  cc.setLineDash([]);

  // Relleno suave cuando el corazón está completo
  {
    cc.fillStyle = completo ? "rgba(229, 154, 176," + (0.16 + 0.06 * Math.sin(ahora / 500)) + ")" : "rgba(42, 13, 28, 0.4)";
    cc.beginPath();
    puntos.forEach((p, i) => (i ? cc.lineTo(p[0], p[1]) : cc.moveTo(p[0], p[1])));
    cc.closePath();
    cc.fill();
  }

  // Trazo que avanza con la canción
  const hasta = Math.floor(c * N);
  if (hasta > 0) {
    cc.shadowColor = "#e59ab0";
    cc.shadowBlur = 14;
    cc.strokeStyle = "#f6cfd9";
    cc.lineWidth = 2.6;
    cc.lineCap = "round";
    cc.beginPath();
    for (let i = 0; i <= hasta; i++) {
      i ? cc.lineTo(puntos[i][0], puntos[i][1]) : cc.moveTo(puntos[i][0], puntos[i][1]);
    }
    cc.stroke();
    cc.shadowBlur = 0;
  }

  // Punta brillante del trazo
  if (!completo) {
    const p = puntos[Math.min(hasta, N)];
    const r = 5 + (reducirMovimiento ? 0 : 2 * Math.sin(ahora / 180));
    const g = cc.createRadialGradient(p[0], p[1], 0, p[0], p[1], r * 3);
    g.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    g.addColorStop(1, "rgba(246, 207, 217, 0)");
    cc.fillStyle = g;
    cc.beginPath();
    cc.arc(p[0], p[1], r * 3, 0, 6.283);
    cc.fill();
  }

  // Pareja de caricatura dentro del corazón
  dibujarPareja(ahora, f, ox, oy + 2.5 * escala, escala);

  // Estrellas de las promesas
  const total = PROMESAS.length;
  for (let k = 0; k < total; k++) {
    const p = puntoCorazon(Math.PI + (k / total) * 2 * Math.PI, escala, ox, oy);
    const encendida = c >= k / total;

    if (encendida && encendidaEn[k] === null) encendidaEn[k] = primerCuadro ? -1e9 : ahora;
    if (!encendida) encendidaEn[k] = null;

    if (!encendida) {
      cc.fillStyle = "rgba(251, 244, 233, 0.3)";
      cc.beginPath();
      cc.arc(p[0], p[1], 3, 0, 6.283);
      cc.fill();
      continue;
    }

    const pulso = reducirMovimiento ? 0 : Math.max(0, 1 - (ahora - encendidaEn[k]) / 1400);
    const halo = 16 + 22 * pulso;
    const g = cc.createRadialGradient(p[0], p[1], 0, p[0], p[1], halo);
    g.addColorStop(0, "rgba(255, 244, 230, 0.95)");
    g.addColorStop(0.35, "rgba(233, 201, 143, 0.45)");
    g.addColorStop(1, "rgba(233, 201, 143, 0)");
    cc.fillStyle = g;
    cc.beginPath();
    cc.arc(p[0], p[1], halo, 0, 6.283);
    cc.fill();

    cc.fillStyle = "#fff8ea";
    cc.beginPath();
    cc.arc(p[0], p[1], 4.5, 0, 6.283);
    cc.fill();

    const brazo = 9 + 6 * pulso;
    cc.strokeStyle = "rgba(255, 248, 234, 0.8)";
    cc.lineWidth = 1.2;
    cc.beginPath();
    cc.moveTo(p[0] - brazo, p[1]);
    cc.lineTo(p[0] + brazo, p[1]);
    cc.moveTo(p[0], p[1] - brazo);
    cc.lineTo(p[0], p[1] + brazo);
    cc.stroke();
  }

  primerCuadro = false;
}

function bucleCielo(ahora) {
  if (!escenaVisible) {
    escenaCorriendo = false;
    return;
  }
  dibujarCielo(ahora);
  requestAnimationFrame(bucleCielo);
}

// Solo se anima cuando la escena está en pantalla (ahorra batería)
new IntersectionObserver(
  (entradas) => {
    escenaVisible = entradas[0].isIntersecting;
    if (escenaVisible && !escenaCorriendo) {
      escenaCorriendo = true;
      primerCuadro = true;
      requestAnimationFrame(bucleCielo);
    }
  },
  { threshold: 0.05 }
).observe($("promesas"));
