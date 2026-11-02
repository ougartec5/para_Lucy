/* ==========================================================
   Carta para Lucy — comportamiento
   Edita solo el bloque CONFIG para personalizar.
   ========================================================== */

const CONFIG = {
  // Archivo de música (ponlo en la misma carpeta que index.html)
  musica: "musica.mp3",
  volumen: 0.6
  momentos: [
    { tiempo: 2, texto: "A veces las palabras no alcanzan..." },
    { tiempo: 14, texto: "Y los recuerdos pesan más de lo que imaginamos." },
    { tiempo: 28, texto: "Pero si de algo estoy seguro..." },
    { tiempo: 42, texto: "Es de que eres mi refugio." },
    { tiempo: 56, texto: "Por eso, antes de que sigas escuchando..." },
    { tiempo: 72, texto: "Tengo algo importante que decirte." },
    { tiempo: 85, mostrarCarta: true } // Aquí aparece tu carta mientras la canción sigue sonando
  ]
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
const pelicula = $("pelicula");
const textoCine = $("texto-cine");

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
   Abrir el sobre y Sincronización
   ========================================================== */
let abierto = false;

function abrirSobre() {
  if (abierto) return;
  abierto = true;

  reproducir();
  if (musicaDisponible) btnMusica.hidden = false;

  sobre.classList.add("abierto");
  sobre.setAttribute("aria-label", "Carta abierta");
  pista.classList.add("abierto-pista");

  const esperaSalida = reducirMovimiento ? 100 : 2700;

  setTimeout(() => {
    portada.classList.add("sale");
    setTimeout(() => {
      portada.hidden = true;
      pelicula.hidden = false; // Muestra la animación en lugar de la carta
      iniciarSincronizacion();
    }, 900);
  }, esperaSalida);
}

sobre.addEventListener("click", abrirSobre);

function iniciarSincronizacion() {
  let momentoActual = 0;
  
  audio.addEventListener("timeupdate", () => {
    if (momentoActual >= CONFIG.momentos.length) return;

    const tiempoCancion = audio.currentTime;
    const momento = CONFIG.momentos[momentoActual];
    
    if (tiempoCancion >= momento.tiempo) {
      if (momento.mostrarCarta) {
        // Oculta la frase final y muestra tu carta original intacta
        textoCine.classList.remove("visible");
        setTimeout(() => {
          pelicula.hidden = true;
          carta.hidden = false;
          window.scrollTo({ top: 0, behavior: "smooth" });
          activarRevelado();
        }, 1500);
      } else {
        // Intercala las frases
        textoCine.classList.remove("visible");
        setTimeout(() => {
          textoCine.textContent = momento.texto;
          textoCine.classList.add("visible");
        }, 1000); // 1 segundo en negro entre cada frase
      }
      momentoActual++;
    }
  });
}

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
